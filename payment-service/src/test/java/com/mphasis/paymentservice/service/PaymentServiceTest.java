/*
package com.mphasis.paymentservice.service;

import com.mphasis.paymentservice.dto.*;
import com.mphasis.paymentservice.model.*;
import com.mphasis.paymentservice.dao.PaymentRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    private PaymentRepository repo;
    private PaymentService service;

    @BeforeEach
    void setUp() {
        repo = mock(PaymentRepository.class);
        service = new PaymentService(repo);
    }

    @Test
    void shouldProcessPaymentSuccessfully() {
        PaymentRequest request = new PaymentRequest();
        request.setOrderId(1L);
        request.setUserId(1L);
        request.setAmount(100);

        when(repo.findByOrderId(1L)).thenReturn(Optional.empty());
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        PaymentResponse response = service.processPayment(request);

        assertEquals("SUCCESS", response.getStatus());
    }

    @Test
    void shouldFailPaymentWhenGatewayFails() {
        PaymentService spyService = spy(service);

        doReturn(false).when(spyService).simulatePayment();

        PaymentRequest request = new PaymentRequest();
        request.setOrderId(1L);
        request.setUserId(1L);
        request.setAmount(100);

        when(repo.findByOrderId(1L)).thenReturn(Optional.empty());
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        assertThrows(RuntimeException.class,
                () -> spyService.processPayment(request));
    }

    @Test
    void shouldBeIdempotentForSameOrder() {
        Payment existing = new Payment();
        existing.setStatus(PaymentStatus.SUCCESS);
        existing.setTransactionId("tx-123");

        when(repo.findByOrderId(1L)).thenReturn(Optional.of(existing));

        PaymentRequest request = new PaymentRequest();
        request.setOrderId(1L);

        PaymentResponse response = service.processPayment(request);

        assertEquals("SUCCESS", response.getStatus());
        assertEquals("tx-123", response.getTransactionId());
    }

    @Test
    void shouldReversePayment() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.SUCCESS);

        when(repo.findByOrderId(1L)).thenReturn(Optional.of(payment));

        service.reversePayment(1L);

        assertEquals(PaymentStatus.REVERSED, payment.getStatus());
    }
}*/
