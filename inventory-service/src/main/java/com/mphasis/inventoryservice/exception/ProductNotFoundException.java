package com.mphasis.inventoryservice.exception;

public class ProductNotFoundException extends BaseException {

    public ProductNotFoundException(String message) {
        super(message, "PRODUCT_NOT_FOUND", 404);
    }
}