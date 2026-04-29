package com.mphasis.orderservice.service;

import com.mphasis.orderservice.client.InventoryClient;
import com.mphasis.orderservice.client.PaymentClient;
import com.mphasis.orderservice.client.UserClient;
import com.mphasis.orderservice.dao.OrderItemRepository;
import com.mphasis.orderservice.dao.OrderRepository;
import com.mphasis.orderservice.dto.*;
import com.mphasis.orderservice.exception.*;
import com.mphasis.orderservice.model.*;
import com.mphasis.orderservice.saga.OrderStateMachine;

import com.mphasis.orderservice.util.LogClient;
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
    private final OrderItemRepository orderItemRepo;
    private final LogClient logClient;

    public OrderService(OrderRepository repo,
                        InventoryClient inventory,
                        PaymentClient paymentClient,
                        UserClient userClient,
                        OrderItemRepository orderItemRepo,
                        OrderStateMachine stateMachine,
                        LogClient logClient) {
        this.repo = repo;
        this.inventory = inventory;
        this.paymentClient = paymentClient;
        this.userClient = userClient;
        this.stateMachine = stateMachine;
        this.orderItemRepo = orderItemRepo;
        this.logClient = logClient;
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
        logClient.sendLog(new ActivityLog(
                "order-service",
                "ORDER_CREATED",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                "ORDER",
                order.getOrderId(),
                "Order created successfully"
        ));

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
        logClient.sendLog(new ActivityLog(
                "order-service",
                "PAYMENT_SUCCESS",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                "ORDER",
                orderId,
                "Payment completed"
        ));

        log.info("Order is {} → COMPLETED", orderId);
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

        logClient.sendLog(new ActivityLog(
                "order-service",
                "PAYMENT_FAILED",
                SecurityContextHolder.getContext().getAuthentication().getName(),
                "ORDER",
                orderId,
                "Payment failed → order cancelled & stock restored"
        ));

        log.info("Order {} → CANCELLED (auto rollback)", orderId);
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
            logClient.sendLog(new ActivityLog(
                    "order-service",
                    "ORDER_CANCELLED",
                    SecurityContextHolder.getContext().getAuthentication().getName(),
                    "ORDER",
                    orderId,
                    "Order cancelled before payment"
            ));

            log.info("Order {} cancelled before payment", orderId);
            return;
        }

        if (order.getStatus() == OrderStatus.COMPLETED) {
            validateRefundWindow(order);
            transition(order, OrderStatus.CANCEL_REQUESTED);
            repo.save(order);
            logClient.sendLog(new ActivityLog(
                    "order-service",
                    "CANCEL_REQUESTED",
                    SecurityContextHolder.getContext().getAuthentication().getName(),
                    "ORDER",
                    orderId,
                    "Cancel requested"
            ));

            log.info("Order {} → CANCEL_REQUESTED", orderId);
            return;
        }

        throw new InvalidStateTransitionException("Cannot cancel order in state: " + order.getStatus());
    }

    private void validateRefundWindow(Order order) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime orderTime = order.getCreatedAt();

        long days = java.time.Duration.between(orderTime, now).toDays();

        if (days > 5) {
            throw new RefundException("Refund period expired (5 days only)");
        }
    }

    @Transactional
    public void processRefundDecision(Long orderId, boolean approve) {

        Order order = repo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() != OrderStatus.CANCEL_REQUESTED) {
            throw new InvalidStateTransitionException("Refund decision already processed or invalid state");
        }

        if (approve) {
            validateRefundWindow(order);
            transition(order, OrderStatus.REFUND_PENDING);
            repo.save(order);

            try {
                paymentClient.refund(orderId);
                rollbackInventory(order.getItems());
                transition(order, OrderStatus.REFUNDED);
                logClient.sendLog(new ActivityLog(
                        "order-service",
                        "REFUND_COMPLETED",
                        SecurityContextHolder.getContext().getAuthentication().getName(),
                        "ORDER",
                        orderId,
                        "Refund successful"
                ));
                log.info("Order {} → REFUNDED", orderId);

            } catch (Exception e) {
                log.error("Refund failed for order {}", orderId, e);
                order.setFailureReason("Refund failed");
                transition(order, OrderStatus.FAILED);

                repo.save(order);
                logClient.sendLog(new ActivityLog(
                        "order-service",
                        "REFUND_FAILED",
                        SecurityContextHolder.getContext().getAuthentication().getName(),
                        "ORDER",
                        orderId,
                        "Refund failed"
                ));

                throw new RefundException("Refund failed");
            }

        } else {

            transition(order, OrderStatus.REFUND_REJECTED);
            order.setFailureReason("Refund rejected by admin");

            transition(order, OrderStatus.COMPLETED);
            log.info("Order {} → REFUND_REJECTED → COMPLETED", orderId);
            logClient.sendLog(new ActivityLog(
                    "order-service",
                    "REFUND_REJECTED",
                    SecurityContextHolder.getContext().getAuthentication().getName(),
                    "ORDER",
                    orderId,
                    "Refund rejected by admin"
            ));
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

    @Transactional
    public void deleteProduct(Long productId) {

        boolean exists = orderItemRepo.existsByProductIdAndOrderStatusIn(
                productId,
                List.of(
                        OrderStatus.CREATED,
                        OrderStatus.INVENTORY_RESERVED,
                        OrderStatus.PAYMENT_PENDING,
                        OrderStatus.COMPLETED
                )
        );

        if (exists) {
            throw new InvalidProductException("Product is used in active or completed orders");
        }

        inventory.deleteProduct(internalApiKey, productId);

        log.info("Deleting product {} via inventory-service", productId);
        try {
            logClient.sendLog(new ActivityLog(
                    "order-service",
                    "PRODUCT_DELETED",
                    "SYSTEM",
                    "PRODUCT",
                    productId,
                    "Product deleted via order-service"
            ));
        } catch (Exception ex) {
            log.error("Logging failed for product {}", productId, ex);
        }

        log.info("Product {} deleted successfully", productId);
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

    public List<OrderResponse> getOrdersForCurrentUser() {

        Long userId = getUserIdFromToken();

        return repo.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
}
