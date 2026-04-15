package com.mphasis.paymentservice.dto;

import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long orderId;
    private Long userId;
    private String status;
    private double totalAmount;
    private LocalDateTime createdAt;
    private String failureReason;
    private List<Object> items;

    public Long getOrderId() { return orderId; }
    public Long getUserId() { return userId; }
    public String getStatus() { return status; }
    public double getTotalAmount() { return totalAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getFailureReason() { return failureReason; }

    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setStatus(String status) { this.status = status; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
}
