package com.mphasis.paymentservice.service;

import com.mphasis.paymentservice.client.OrderClient;
import com.mphasis.paymentservice.dao.PaymentRepository;
import com.mphasis.paymentservice.dto.*;
import com.mphasis.paymentservice.model.Payment;
import com.mphasis.paymentservice.model.PaymentStatus;

import com.razorpay.RazorpayClient;
import com.razorpay.Order;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    @Mock private PaymentRepository repo;
    @Mock private RazorpayClient razorpayClient;

    @Mock private com.razorpay.OrderClient razorpayOrderClient;

    @Mock private OrderClient orderClient;

    @InjectMocks
    private PaymentService service;

    private PaymentRequest request;
    private OrderResponse orderResponse;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        ReflectionTestUtils.setField(service, "razorpaySecret", "si8yQ4F4NjToqhYSQB5dtYLy");

        ReflectionTestUtils.setField(razorpayClient, "orders", razorpayOrderClient);

        request = new PaymentRequest();
        request.setOrderId(1L);

        orderResponse = new OrderResponse();
        orderResponse.setOrderId(1L);
        orderResponse.setUserId(10L);
        orderResponse.setStatus("PAYMENT_PENDING");
        orderResponse.setTotalAmount(100.0);

        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void shouldCreatePaymentSuccessfully() throws Exception {
        when(orderClient.getOrder(1L)).thenReturn(orderResponse);
        when(repo.findByOrderId(1L)).thenReturn(Optional.empty());

        Order razorOrder = mock(Order.class);
        when(razorOrder.get("id")).thenReturn("razor_123");

        when(razorpayOrderClient.create(any(org.json.JSONObject.class)))
                .thenReturn(razorOrder);

        PaymentResponse response = service.createRazorpayOrder(request);

        assertEquals("PENDING", response.getStatus());
        assertEquals("razor_123", response.getTransactionId());
    }

    @Test
    void shouldFailIfOrderNotPaymentPending() {
        orderResponse.setStatus("COMPLETED");
        when(orderClient.getOrder(1L)).thenReturn(orderResponse);

        assertThrows(RuntimeException.class,
                () -> service.createRazorpayOrder(request));
    }

    @Test
    void shouldReuseExistingSuccessfulPayment() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.SUCCESS);

        when(orderClient.getOrder(1L)).thenReturn(orderResponse);
        when(repo.findByOrderId(1L)).thenReturn(Optional.of(payment));

        PaymentResponse response = service.createRazorpayOrder(request);

        assertEquals("SUCCESS", response.getStatus());
    }

    @Test
    void shouldReuseExistingPendingPayment() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.INITIATED);

        when(orderClient.getOrder(1L)).thenReturn(orderResponse);
        when(repo.findByOrderId(1L)).thenReturn(Optional.of(payment));

        PaymentResponse response = service.createRazorpayOrder(request);

        assertEquals("PENDING", response.getStatus());
    }

    @Test
    void shouldFailIfRazorpayFails() throws Exception {
        when(orderClient.getOrder(1L)).thenReturn(orderResponse);
        when(repo.findByOrderId(1L)).thenReturn(Optional.empty());

        when(razorpayOrderClient.create(any(org.json.JSONObject.class)))
                .thenThrow(new RuntimeException("razorpay down"));

        assertThrows(RuntimeException.class,
                () -> service.createRazorpayOrder(request));
    }

    @Test
    void shouldConfirmPaymentSuccessfully() throws Exception {
        Payment payment = new Payment();
        payment.setOrderId(1L);
        payment.setStatus(PaymentStatus.INITIATED);

        when(repo.findByOrderId(1L)).thenReturn(Optional.of(payment));

        ConfirmRequest confirm = new ConfirmRequest();
        confirm.setOrderId(1L);
        confirm.setRazorpayOrderId("order1");
        confirm.setRazorpayPaymentId("pay1");

        String data = confirm.getRazorpayOrderId() + "|" + confirm.getRazorpayPaymentId();

        String signature = (String) ReflectionTestUtils.invokeMethod(
                service, "hmacSHA256", data, "si8yQ4F4NjToqhYSQB5dtYLy");

        confirm.setRazorpaySignature(signature);

        service.confirmPayment(confirm);

        assertEquals(PaymentStatus.SUCCESS, payment.getStatus());
        verify(orderClient).confirmOrder(1L);
    }

    @Test
    void shouldFailIfInvalidSignature() {
        Payment payment = new Payment();
        payment.setOrderId(1L);

        when(repo.findByOrderId(1L)).thenReturn(Optional.of(payment));

        ConfirmRequest confirm = new ConfirmRequest();
        confirm.setOrderId(1L);
        confirm.setRazorpaySignature("wrong");

        assertThrows(RuntimeException.class,
                () -> service.confirmPayment(confirm));

        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        verify(orderClient).failOrder(1L);
    }

    @Test
    void shouldHandlePaymentFailure() {
        Payment payment = new Payment();
        payment.setOrderId(1L);

        when(repo.findByOrderId(1L)).thenReturn(Optional.of(payment));

        service.handlePaymentFailure(1L);

        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        verify(orderClient).failOrder(1L);
    }

    @Test
    void shouldReversePaymentSuccessfully() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.SUCCESS);

        when(repo.findByOrderId(1L)).thenReturn(Optional.of(payment));

        service.reversePayment(1L);

        assertEquals(PaymentStatus.REVERSED, payment.getStatus());
    }

    @Test
    void shouldFailIfReverseInvalidState() {
        Payment payment = new Payment();
        payment.setStatus(PaymentStatus.FAILED);

        when(repo.findByOrderId(1L)).thenReturn(Optional.of(payment));

        assertThrows(RuntimeException.class,
                () -> service.reversePayment(1L));
    }
}