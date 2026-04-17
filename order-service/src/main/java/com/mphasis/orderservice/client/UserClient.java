package com.mphasis.orderservice.client;

import com.mphasis.orderservice.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "user-service"
)
public interface UserClient {

    @GetMapping("/users/email/{email}")
    UserResponse getUserByEmail(@PathVariable("email") String email);
}