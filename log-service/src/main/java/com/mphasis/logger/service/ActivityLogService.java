package com.mphasis.logger.service;

import com.mphasis.logger.dao.ActivityLogRepository;
import com.mphasis.logger.model.ActivityLog;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository repo;

    public ActivityLogService(ActivityLogRepository repo) {
        this.repo = repo;
    }

    public ActivityLog save(ActivityLog log) {
        log.setTimestamp(LocalDateTime.now());
        return repo.save(log);
    }

    public List<ActivityLog> getAll() {
        return repo.findAll();
    }
}