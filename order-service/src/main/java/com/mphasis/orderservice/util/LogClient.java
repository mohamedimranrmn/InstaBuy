package com.mphasis.orderservice.util;

import com.mphasis.orderservice.dto.ActivityLog;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "LOG-SERVICE")
public interface LogClient {

    @PostMapping("/logs")
    void sendLog(@RequestBody ActivityLog log);
}