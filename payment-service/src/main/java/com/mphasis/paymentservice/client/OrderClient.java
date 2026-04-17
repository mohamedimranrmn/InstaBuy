package com.mphasis.paymentservice.client;

import com.mphasis.paymentservice.dto.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "order-service",
        /*url = "http://localhost:8082",*/
        configuration = com.mphasis.paymentservice.config.FeignConfig.class
)
public interface OrderClient {

    @GetMapping("/orders/{id}")
    OrderResponse getOrder(@PathVariable("id") Long id);

    @PostMapping("/orders/confirm/{id}")
    void confirmOrder(@PathVariable("id") Long id);

    @PostMapping("/orders/fail/{orderId}")
    void failOrder(@PathVariable Long orderId);
}