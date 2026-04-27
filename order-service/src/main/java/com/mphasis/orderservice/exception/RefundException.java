package com.mphasis.orderservice.exception;

public class RefundException extends BaseException {
    public RefundException(String message) {
        super(message, "REFUND_ERROR", 400);
    }
}