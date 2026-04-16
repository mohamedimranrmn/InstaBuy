package com.mphasis.orderservice.model;

public enum OrderStatus {
    CREATED,
    INVENTORY_RESERVED,
    PAYMENT_PENDING,
    COMPLETED,
    FAILED,
    CANCELLED,
    REFUND_PENDING,
    REFUNDED
}
