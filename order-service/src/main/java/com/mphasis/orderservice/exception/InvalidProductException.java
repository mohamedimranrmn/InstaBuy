package com.mphasis.orderservice.exception;

public class InvalidProductException extends BaseException {

    public InvalidProductException(String message) {
        super(message, "INVALID_PRODUCT", 400);
    }
}
