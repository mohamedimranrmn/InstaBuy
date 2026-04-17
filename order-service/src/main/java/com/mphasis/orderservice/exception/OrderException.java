package com.mphasis.orderservice.exception;

public class OrderException extends BaseException {
    public OrderException(String message) {
        super(message, "ORDER_ERROR", 400);
    }
}
