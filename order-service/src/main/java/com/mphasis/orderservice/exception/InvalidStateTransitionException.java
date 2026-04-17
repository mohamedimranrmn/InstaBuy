package com.mphasis.orderservice.exception;

public class InvalidStateTransitionException extends BaseException {
    public InvalidStateTransitionException(String message) {
        super(message, "INVALID_STATE", 400);
    }
}