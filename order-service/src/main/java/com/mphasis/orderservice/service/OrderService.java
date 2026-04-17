package com.mphasis.orderservice.service;

import com.mphasis.orderservice.client.InventoryClient;
import com.mphasis.orderservice.client.PaymentClient;
import com.mphasis.orderservice.client.UserClient;
import com.mphasis.orderservice.dao.OrderRepository;
import com.mphasis.orderservice.dto.*;
import com.mphasis.orderservice.exception.*;
import com.mphasis.orderservice.model.*;
import com.mphasis.orderservice.saga.OrderStateMachine;

import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Value("${internal.api-key}")
    private String internalApiKey;

    private final OrderRepository repo;
    private final InventoryClient inventory;
    private final PaymentClient paymentClient;
    private final UserClient userClient;
    private final OrderStateMachine stateMachine;

    public OrderService(OrderRepository repo,
                        InventoryClient inventory,
                        PaymentClient paymentClient,
                        UserClient userClient,
                        OrderStateMachine stateMachine) {
        this.repo = repo;
        this.inventory = inventory;
        this.paymentClient = paymentClient;
        this.userClient = userClient;
        this.stateMachine = stateMachine;
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

            log.info("Order {} → PAYMENT_PENDING", order.getOrderId());

        }
        catch (InventoryException | PaymentException e) {

            log.error("Order failed {} reason={}", order.getOrderId(), e.getMessage());

            rollbackInventory(reservedItems);

            order.setFailureReason(e.getMessage());
            transition(order, OrderStatus.FAILED);

            repo.save(order);

            log.error("Order processing failed", e);
            throw new OrderException("Order processing failed");
        }
        return mapToResponse(order);
    }


    @Transactional
    public void confirmOrderPayment(Long orderId) {

        Order order = repo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() != OrderStatus.PAYMENT_PENDING) {
            throw new InvalidStateTransitionException("Invalid state for payment confirmation");
        }

        transition(order, OrderStatus.COMPLETED);
        repo.save(order);

        log.info("Order {} → COMPLETED", orderId);
    }


    @Transactional
    public void failOrderPayment(Long orderId) {

        Order order = repo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() != OrderStatus.PAYMENT_PENDING) {
            throw new InvalidStateTransitionException("Invalid state for failure");
        }

        rollbackInventory(order.getItems());

        order.setFailureReason("Payment failed");
        transition(order, OrderStatus.FAILED);

        repo.save(order);

        log.info("Order {} → FAILED", orderId);
    }


    @Transactional
    public void cancelOrder(Long orderId) {

        Order order = repo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            log.info("Order already cancelled {}", orderId);
            return;
        }

        if (order.getStatus() == OrderStatus.CREATED ||
                order.getStatus() == OrderStatus.INVENTORY_RESERVED ||
                order.getStatus() == OrderStatus.PAYMENT_PENDING) {

            rollbackInventory(order.getItems());

            transition(order, OrderStatus.CANCELLED);
            repo.save(order);

            log.info("Order {} cancelled before payment", orderId);
            return;
        }

        if (order.getStatus() == OrderStatus.COMPLETED) {

            transition(order, OrderStatus.CANCEL_REQUESTED);
            repo.save(order);

            log.info("Order {} → CANCEL_REQUESTED", orderId);
            return;
        }

        throw new InvalidStateTransitionException("Cannot cancel order in state: " + order.getStatus());
    }

    @Transactional
    public void processRefundDecision(Long orderId, boolean approve) {

        Order order = repo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() != OrderStatus.CANCEL_REQUESTED) {
            throw new InvalidStateTransitionException("Invalid state for refund decision");
        }

        if (approve) {

            transition(order, OrderStatus.REFUND_PENDING);
            repo.save(order);

            rollbackInventory(order.getItems());

            if (order.getStatus() == OrderStatus.REFUND_PENDING) {
                paymentClient.refund(orderId);
            }

            transition(order, OrderStatus.REFUNDED);
            transition(order, OrderStatus.CANCELLED);

            log.info("Order {} → REFUNDED → CANCELLED", orderId);

        } else {

            transition(order, OrderStatus.CANCELLED);
            order.setFailureReason("Refund rejected by admin");

            log.info("Order {} refund rejected", orderId);
        }

        repo.save(order);
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
        log.error("Inventory fallback for product {}", item.getProductId(), t);
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
                log.error("Inventory rollback failed for product {}", item.getProductId(), ex);
            }
        }
    }


    private List<OrderItem> buildOrderItems(OrderRequest request, Order order) {

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must contain at least one item");
        }

        List<OrderItem> items = new ArrayList<>();

        for (var i : request.getItems()) {

            try {
                var product = inventory.getProduct(internalApiKey, i.getProductId());

                if (product.getAvailableQuantity() < i.getQuantity()) {
                    throw new InventoryException(
                            "Insufficient stock for product " + i.getProductId()
                    );
                }

                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProductId(i.getProductId());
                item.setQuantity(i.getQuantity());
                item.setPrice(product.getPrice());

                items.add(item);

            } catch (InventoryException ex) {
                throw ex;

            } catch (Exception ex) {
                throw new InventoryException(
                        "Failed to fetch product details for product " + i.getProductId()
                );
            }
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
            throw new UnauthorizedException("User not authenticated");
        }

        String email = auth.getName();
        try {
            return userClient.getUserByEmail(email).getId();
        } catch (Exception e) {
            throw new UnauthorizedException("Failed to fetch user details");
        }
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
                        .orElseThrow(() -> new OrderNotFoundException(id))
        );
    }

    public List<OrderResponse> getByStatus(String status) {

        OrderStatus orderStatus;

        try {
            orderStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + status);
        }

        return repo.findByStatus(orderStatus)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}