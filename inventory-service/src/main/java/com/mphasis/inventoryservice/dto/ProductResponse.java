package com.mphasis.inventoryservice.dto;

public class ProductResponse {

    private Long productId;
    private String productName;
    private double price;
    private int availableQuantity;

    public ProductResponse(Long productId, String productName,
                              double price, int availableQuantity) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.availableQuantity = availableQuantity;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public double getPrice() {
        return price;
    }

    public int getAvailableQuantity() {
        return availableQuantity;
    }
}