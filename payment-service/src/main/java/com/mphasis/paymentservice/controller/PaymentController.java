package com.mphasis.paymentservice.controller;

import com.mphasis.paymentservice.dto.PaymentRequest;
import com.mphasis.paymentservice.dto.PaymentResponse;
import com.mphasis.paymentservice.model.Payment;
import com.mphasis.paymentservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @PostMapping(consumes = "application/json",produces = "application/json")
    public ResponseEntity<PaymentResponse> pay(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(service.processPayment(request));
    }

    @PostMapping("/reverse/{orderId}")
    public ResponseEntity<Void> reverse(@PathVariable Long orderId) {
        service.reversePayment(orderId);
        return ResponseEntity.ok().build();
    }
}