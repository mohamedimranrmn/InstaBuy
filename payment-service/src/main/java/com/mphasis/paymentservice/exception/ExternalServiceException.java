package com.mphasis.paymentservice.exception;

public class ExternalServiceException extends BaseException {
    public ExternalServiceException(String message) {
        super(message, "EXTERNAL_SERVICE_ERROR", 503);
    }
}