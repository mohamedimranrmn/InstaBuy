package com.mphasis.orderservice.service;

import com.mphasis.orderservice.client.InventoryClient;
import com.mphasis.orderservice.client.UserClient;
import com.mphasis.orderservice.dto.*;
import com.mphasis.orderservice.exception.*;
import com.mphasis.orderservice.model.*;
import com.mphasis.orderservice.dao.OrderRepository;
import com.mphasis.orderservice.saga.OrderStateMachine;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Value("${internal.api-key}")
    private String internalApiKey;

    private final OrderRepository repo;
    private final InventoryClient inventory;
    private final OrderStateMachine stateMachine;
    private final UserClient userClient;

    public OrderService(OrderRepository repo,
                        InventoryClient inventory,
                        OrderStateMachine stateMachine,
                        UserClient userClient) {
        this.repo = repo;
        this.inventory = inventory;
        this.stateMachine = stateMachine;
        this.userClient = userClient;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        Long userId = getUserIdFromToken();

        Order order = new Order();
        order.setUserId(userId);
        order.setStatus(OrderStatus.CREATED);
        order.setCreatedAt(LocalDateTime.now());

        List<OrderItem> items = buildOrderItems(request, order);

        order.setItems(items);
        order.setTotalAmount(calculateTotal(items));

        repo.save(order);

        List<OrderItem> reservedItems = new ArrayList<>();

        try {
            for (OrderItem item : items) {
                callInventory(item);
                reservedItems.add(item);
            }

            transition(order, OrderStatus.INVENTORY_RESERVED);
            transition(order, OrderStatus.PAYMENT_PENDING);

            log.info("Order {} is now PAYMENT_PENDING. Awaiting payment.", order.getOrderId());

        } catch (Exception e) {
            log.error("Order failed for orderId={} reason={}", order.getOrderId(), e.getMessage());

            rollbackInventory(reservedItems);

            order.setFailureReason(e.getMessage());
            transition(order, OrderStatus.FAILED);
        }

        return mapToResponse(repo.save(order));
    }

    // 🔥 NEW METHOD — called after payment confirmation
    @Transactional
    public void confirmOrderPayment(Long orderId) {

        Order order = repo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() != OrderStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Invalid state for payment confirmation");
        }

        transition(order, OrderStatus.COMPLETED);
        repo.save(order);

        log.info("Order {} marked COMPLETED after payment", orderId);
    }

    @Retry(name = "inventoryRetry")
    @CircuitBreaker(name = "inventoryCB", fallbackMethod = "inventoryFallback")
    public void callInventory(OrderItem item) {
        inventory.reduceStock(
                internalApiKey,
                item.getProductId(),
                new InventoryClient.StockRequest(item.getQuantity())
        );
    }

    public void inventoryFallback(OrderItem item, Throwable t) {
        log.error("Inventory fallback for product {}: {}", item.getProductId(), t.getMessage());
        throw new InventoryException("Inventory service unavailable");
    }

    private void rollbackInventory(List<OrderItem> items) {
        for (OrderItem item : items) {
            try {
                inventory.increaseStock(
                        internalApiKey,
                        item.getProductId(),
                        new InventoryClient.StockRequest(item.getQuantity())
                );
            } catch (Exception ex) {
                log.error("CRITICAL: Inventory rollback failed for product {}",
                        item.getProductId(), ex);
            }
        }
    }

    private List<OrderItem> buildOrderItems(OrderRequest request, Order order) {
        List<OrderItem> items = new ArrayList<>();
        for (var i : request.getItems()) {
            var product = inventory.getProduct(i.getProductId());
            if (product.getAvailableQuantity() < i.getQuantity()) {
                throw new InventoryException("Insufficient stock for product " + i.getProductId());
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProductId(i.getProductId());
            item.setQuantity(i.getQuantity());
            item.setPrice(product.getPrice());

            items.add(item);
        }
        return items;
    }

    private double calculateTotal(List<OrderItem> items) {
        return items.stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();
    }

    private Long getUserIdFromToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        String email = auth.getName();
        return userClient.getUserByEmail(email).getId();
    }

    private void transition(Order order, OrderStatus next) {
        stateMachine.validate(order.getStatus(), next);
        order.setStatus(next);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getProductId(),
                        i.getQuantity(),
                        i.getPrice()
                ))
                .toList();

        return new OrderResponse(
                order.getOrderId(),
                order.getUserId(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getFailureReason(),
                items
        );
    }

    public List<OrderResponse> getAllOrdersResponse() {
        return repo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OrderResponse getOrderResponseById(Long id) {
        return mapToResponse(
                repo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Order not found"))
        );
    }

    @Transactional
    public void failOrderPayment(Long orderId) {

        Order order = repo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Invalid state for failure");
        }
        rollbackInventory(order.getItems());

        order.setFailureReason("Payment failed");
        transition(order, OrderStatus.FAILED);

        repo.save(order);

        log.info("Order {} marked FAILED and inventory rolled back", orderId);
    }
}