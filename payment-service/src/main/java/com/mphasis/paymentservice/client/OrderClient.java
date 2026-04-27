package com.mphasis.paymentservice.client;

import com.mphasis.paymentservice.dto.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "order-service",
        configuration = com.mphasis.paymentservice.config.FeignConfig.class
)
public interface OrderClient {

    @GetMapping("/orders/{orderId}")
    OrderResponse getOrder(@PathVariable("orderId") Long orderId);

    @PostMapping("/orders/confirm/{orderId}")
    void confirmOrder(@PathVariable("orderId") Long orderId);

    @PostMapping("/orders/fail/{orderId}")
    void failOrder(@PathVariable("orderId") Long orderId);
}