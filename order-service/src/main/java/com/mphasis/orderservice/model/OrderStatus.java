package com.mphasis.orderservice.model;

public enum OrderStatus {
    CREATED,
    INVENTORY_RESERVED,
    PAYMENT_PENDING,
    COMPLETED,
    FAILED,
    CANCEL_REQUESTED,
    CANCELLED,
    REFUND_PENDING,
    REFUND_REJECTED,
    REFUNDED
}
