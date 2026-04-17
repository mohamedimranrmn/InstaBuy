package com.mphasis.paymentservice.exception;

public class InvalidPaymentStateException extends BaseException {
    public InvalidPaymentStateException(String message) {
        super(message, "INVALID_PAYMENT_STATE", 400);
    }
}