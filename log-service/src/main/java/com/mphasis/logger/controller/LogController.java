package com.mphasis.logger.controller;

import com.mphasis.logger.model.ActivityLog;
import com.mphasis.logger.service.ActivityLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/logs")
public class LogController {

    private final ActivityLogService service;

    public LogController(ActivityLogService service) {
        this.service = service;
    }

    @PostMapping
    public ActivityLog createLog(@RequestBody ActivityLog log) {
        return service.save(log);
    }

    @GetMapping
    public List<ActivityLog> getLogs() {
        return service.getAll();
    }
}