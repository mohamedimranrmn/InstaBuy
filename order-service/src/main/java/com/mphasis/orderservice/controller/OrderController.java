package com.mphasis.orderservice.controller;

import com.mphasis.orderservice.dto.OrderRequest;
import com.mphasis.orderservice.dto.OrderResponse;
import com.mphasis.orderservice.service.OrderService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {

        log.info("Creating order...");

        return ResponseEntity.ok(service.createOrder(request));
    }

    @PostMapping("/confirm/{orderId}")
    public ResponseEntity<String> confirmOrder(@PathVariable Long orderId) {

        log.info("Confirming order after payment: {}", orderId);

        service.confirmOrderPayment(orderId);

        return ResponseEntity.ok("Order marked as COMPLETED");
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        log.info("Fetching all orders");
        return ResponseEntity.ok(service.getAllOrdersResponse());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {

        log.info("Fetching order {}", id);

        return ResponseEntity.ok(service.getOrderResponseById(id));
    }

    @PostMapping("/fail/{orderId}")
    public ResponseEntity<Void> failOrder(@PathVariable Long orderId) {
        service.failOrderPayment(orderId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cancel/{orderId}")
    public ResponseEntity<String> cancelOrder(@PathVariable Long orderId) {
        service.cancelOrder(orderId);
        return ResponseEntity.ok("Order cancelled successfully");
    }

    @GetMapping("/cancel-requests")
    public ResponseEntity<List<OrderResponse>> getCancelRequests() {
        return ResponseEntity.ok(service.getByStatus("CANCEL_REQUESTED"));
    }

    @PostMapping("/refund-decision/{orderId}")
    public ResponseEntity<String> refundDecision(
            @PathVariable Long orderId,
            @RequestParam boolean approve) {

        service.processRefundDecision(orderId, approve);

        return ResponseEntity.ok("Decision processed");
    }
}