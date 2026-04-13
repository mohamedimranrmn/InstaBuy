package com.mphasis.orderservice.exception;

public class InvalidStateTransitionException extends OrderException {
    public InvalidStateTransitionException(String message) {
        super(message);
    }
}