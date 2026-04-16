package com.mphasis.orderservice.client;

import com.mphasis.orderservice.dto.PaymentRequest;
import com.mphasis.orderservice.dto.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "payment-service",
        url = "http://localhost:8083",
        configuration = {
                com.mphasis.orderservice.config.FeignConfig.class,
                com.mphasis.orderservice.config.FeignHttpClientConfig.class
        }
)
public interface PaymentClient {

    @PostMapping("/payments")
    PaymentResponse processPayment(@RequestBody PaymentRequest request);

    @PostMapping("/payments/reverse/{orderId}")
    void reversePayment(@PathVariable("orderId") Long orderId);

    @PostMapping("/payments/refund/{orderId}")
    void refund(@PathVariable("orderId") Long orderId);
}
