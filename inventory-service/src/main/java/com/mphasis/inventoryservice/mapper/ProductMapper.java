package com.mphasis.inventoryservice.mapper;

import com.mphasis.inventoryservice.model.Product;
import com.mphasis.inventoryservice.dto.*;

public class ProductMapper {

    public static Product toEntity(ProductRequest dto) {
        Product p = new Product();
        p.setProductName(dto.getProductName());
        p.setPrice(dto.getPrice());
        p.setAvailableQuantity(dto.getAvailableQuantity());
        p.setDeleted(false);
        return p;
    }

    public static ProductResponse toDTO(Product p) {
        return new ProductResponse(
                p.getProductId(),
                p.getProductName(),
                p.getPrice(),
                p.getAvailableQuantity(),
                p.isDeleted()
        );
    }
}