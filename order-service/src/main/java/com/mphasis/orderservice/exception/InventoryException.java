package com.mphasis.orderservice.exception;

public class InventoryException extends BaseException {
    public InventoryException(String message) {
        super(message, "INVENTORY_ERROR", 400);
    }
}