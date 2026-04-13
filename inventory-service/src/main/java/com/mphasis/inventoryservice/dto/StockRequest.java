package com.mphasis.inventoryservice.dto;

import jakarta.validation.constraints.Min;

public class StockRequest {

    @Min(1)
    private int quantity;

    public StockRequest() {}

    public StockRequest(int quantity) {
        this.quantity = quantity;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}