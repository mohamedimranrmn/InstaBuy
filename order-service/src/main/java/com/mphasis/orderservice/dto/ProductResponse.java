package com.mphasis.orderservice.dto;

public class ProductResponse {

    private Long productId;
    private String productName;
    private double price;
    private int availableQuantity;

    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public double getPrice() { return price; }
    public int getAvailableQuantity() { return availableQuantity; }

    public void setProductId(Long productId) { this.productId = productId; }
    public void setProductName(String productName) { this.productName = productName; }
    public void setPrice(double price) { this.price = price; }
    public void setAvailableQuantity(int availableQuantity) { this.availableQuantity = availableQuantity; }
}