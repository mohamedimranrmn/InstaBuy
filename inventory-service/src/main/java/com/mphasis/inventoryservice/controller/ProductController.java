package com.mphasis.inventoryservice.controller;

import com.mphasis.inventoryservice.dto.*;
import com.mphasis.inventoryservice.exception.*;
import com.mphasis.inventoryservice.mapper.ProductMapper;
import com.mphasis.inventoryservice.model.Product;
import com.mphasis.inventoryservice.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Value("${internal.api-key}")
    private String internalKey;

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    private void validateInternalKey(String key) {
        if (!internalKey.equals(key)) {
            throw new UnauthorizedException("Invalid internal API key");
        }
    }

    @PostMapping
    public ResponseEntity<ProductResponse> addProduct(@RequestBody ProductRequest dto) {
        return ResponseEntity.ok(
                ProductMapper.toDTO(service.addProduct(ProductMapper.toEntity(dto)))
        );
    }

    @PatchMapping("/{id}/reduce")
    public ResponseEntity<String> reduceStock(
            @RequestHeader("X-Internal-Key") String key,
            @PathVariable Long id,
            @Valid @RequestBody StockRequest request) {

        validateInternalKey(key);
        service.reduceStock(id, request.getQuantity());

        return ResponseEntity.ok("Stock reduced successfully");
    }

    @PatchMapping("/{id}/increase")
    public ResponseEntity<String> increaseStock(
            @RequestHeader("X-Internal-Key") String key,
            @PathVariable Long id,
            @Valid @RequestBody StockRequest request) {

        validateInternalKey(key);
        service.increaseStock(id, request.getQuantity());

        return ResponseEntity.ok("Stock increased successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(
            @RequestHeader("X-Internal-Key") String key,
            @PathVariable Long id) {

        validateInternalKey(key);

        Product product = service.getProductById(id);
        return ResponseEntity.ok(ProductMapper.toDTO(product));
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(Pageable pageable) {
        return ResponseEntity.ok(
                service.getAllProducts(pageable).map(ProductMapper::toDTO)
        );
    }
}