package com.mphasis.paymentservice.exception;

public class PaymentNotFoundException extends BaseException {
    public PaymentNotFoundException(Long orderId) {
        super("Payment not found for order: " + orderId, "PAYMENT_NOT_FOUND", 404);
    }
}
