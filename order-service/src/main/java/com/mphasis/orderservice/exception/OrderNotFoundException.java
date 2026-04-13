package com.mphasis.orderservice.exception;

public class OrderNotFoundException extends OrderException {
    public OrderNotFoundException(Long id) {
        super("Order not found with id: " + id);
    }
}