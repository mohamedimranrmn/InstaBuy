package com.mphasis.paymentservice.exception;

public class InvalidSignatureException extends BaseException {
    public InvalidSignatureException() {
        super("Invalid payment signature", "INVALID_SIGNATURE", 401);
    }
}
