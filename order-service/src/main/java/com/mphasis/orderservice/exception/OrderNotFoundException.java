package com.mphasis.orderservice.exception;

public class OrderNotFoundException extends BaseException {
    public OrderNotFoundException(Long id) {
        super("Order not found with id: " + id, "ORDER_NOT_FOUND", 404);
    }
}