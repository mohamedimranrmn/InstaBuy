package com.mphasis.paymentservice.service;

import com.mphasis.paymentservice.model.*;
import com.mphasis.paymentservice.dao.PaymentRepository;
import com.mphasis.paymentservice.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository repo;

    public PaymentService(PaymentRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        System.out.println("PAYMENT SERVICE HIT");
        var existing = repo.findByOrderId(request.getOrderId());
        if (existing.isPresent()) {
            Payment p = existing.get();
            return new PaymentResponse(
                    p.getStatus().name(),
                    p.getTransactionId(),
                    "Already processed"
            );
        }

        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setCreatedAt(LocalDateTime.now());

        repo.save(payment);

        try {
            boolean success = simulatePayment();

            if (!success) {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Payment gateway failure");

                return new PaymentResponse(
                        "FAILED",
                        null,
                        "Payment gateway failure"
                );
            }

            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(UUID.randomUUID().toString());

            return new PaymentResponse(
                    "SUCCESS",
                    payment.getTransactionId(),
                    "Payment successful"
            );

        } catch (Exception e) {

            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Internal payment error");

            return new PaymentResponse(
                    "FAILED",
                    null,
                    "Internal payment error"
            );
        }
    }

    private boolean simulatePayment() {
        return true;
    }

    public void reversePayment(Long orderId) {
        Payment payment = repo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.REVERSED);
    }
}