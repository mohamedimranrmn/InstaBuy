package com.mphasis.inventoryservice.exception;

public class InsufficientStockException extends BaseException {
    public InsufficientStockException(String message) {
        super(message, "INSUFFICIENT_STOCK", 400);
    }
}