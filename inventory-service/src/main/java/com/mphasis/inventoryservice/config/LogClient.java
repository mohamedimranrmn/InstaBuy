package com.mphasis.inventoryservice.config;

import com.mphasis.inventoryservice.dto.ActivityLog;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "LOG-SERVICE")
public interface LogClient {

    @PostMapping("/logs")
    ActivityLog sendLog(ActivityLog log);
}