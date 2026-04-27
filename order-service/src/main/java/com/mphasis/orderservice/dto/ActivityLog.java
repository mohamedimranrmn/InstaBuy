package com.mphasis.orderservice.dto;

import java.time.LocalDateTime;

public class ActivityLog {

    private String service;
    private String action;
    private String username;
    private String entity;
    private Long entityId;
    private String details;
    private LocalDateTime timestamp;

    public ActivityLog() {
        this.timestamp = LocalDateTime.now();
    }

    public ActivityLog(String service, String action, String username,
                       String entity, Long entityId, String details) {
        this.service = service;
        this.action = action;
        this.username = username;
        this.entity = entity;
        this.entityId = entityId;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEntity() {
        return entity;
    }

    public void setEntity(String entity) {
        this.entity = entity;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}