package com.mphasis.inventoryservice.exception;

public class UnauthorizedException extends BaseException {
    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED", 401);
    }
}
