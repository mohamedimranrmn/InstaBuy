package com.mphasis.inventoryservice.dto;

public class ProductResponse {

    private Long productId;
    private String productName;
    private double price;
    private int availableQuantity;
    private boolean deleted;
    private String imageUrl;

    public ProductResponse(Long productId, String productName,
                           double price, int availableQuantity,
                           boolean deleted,
                           String imageUrl) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.availableQuantity = availableQuantity;
        this.deleted = deleted;
        this.imageUrl = imageUrl;
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

    public boolean isDeleted() {
        return deleted;
    }

    public String getImageUrl() { return imageUrl;}
}