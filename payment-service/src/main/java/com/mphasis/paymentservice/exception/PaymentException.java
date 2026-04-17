package com.mphasis.paymentservice.exception;

public class PaymentException extends BaseException {
    public PaymentException(String message) {
        super(message, "PAYMENT_ERROR", 400);
    }
}
