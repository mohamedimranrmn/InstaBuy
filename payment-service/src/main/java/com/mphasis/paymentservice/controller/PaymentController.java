package com.mphasis.paymentservice.controller;

import com.mphasis.paymentservice.dto.ConfirmRequest;
import com.mphasis.paymentservice.dto.PaymentRequest;
import com.mphasis.paymentservice.dto.PaymentResponse;
import com.mphasis.paymentservice.service.PaymentService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping("/create-order")
    public ResponseEntity<PaymentResponse> createOrder(@RequestBody PaymentRequest request) {

        log.info("Create order request received for orderId={}", request.getOrderId());

        return ResponseEntity.ok(service.createRazorpayOrder(request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<String> confirmPayment(@RequestBody ConfirmRequest request) {

        log.info("Payment confirmation received for orderId={}", request.getOrderId());

        service.confirmPayment(request);

        return ResponseEntity.ok("Payment confirmed");
    }

    @PostMapping("/fail")
    public ResponseEntity<Void> failPayment(@RequestBody PaymentRequest request) {

        service.handlePaymentFailure(request.getOrderId());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/reverse/{orderId}")
    public ResponseEntity<Void> reverse(@PathVariable Long orderId) {

        log.info("Reverse payment request for orderId={}", orderId);

        service.reversePayment(orderId);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/refund/{orderId}")
    public ResponseEntity<Void> refund(@PathVariable Long orderId) {
        service.refund(orderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<PaymentResponse> getPayment(@RequestParam Long orderId) {
        return ResponseEntity.ok(service.getPaymentByOrderId(orderId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(service.getAllPayments());
    }
}