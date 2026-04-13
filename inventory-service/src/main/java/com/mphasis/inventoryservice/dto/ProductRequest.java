package com.mphasis.inventoryservice.dto;

import jakarta.validation.constraints.*;

public class ProductRequest {

    @NotBlank
    private String productName;

    @Positive
    private double price;

    @Min(0)
    private int availableQuantity;

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(int availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

}