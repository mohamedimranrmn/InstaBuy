package com.mphasis.inventoryservice.service;

import com.mphasis.inventoryservice.InventoryServiceApplication;
import com.mphasis.inventoryservice.exception.*;
import com.mphasis.inventoryservice.model.Product;
import com.mphasis.inventoryservice.dao.ProductRepository;
import com.mphasis.inventoryservice.config.LogClient;
import com.mphasis.inventoryservice.dto.ActivityLog;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class ProductService {

    private final ProductRepository repo;

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private final LogClient logClient;

    public ProductService(ProductRepository repo, LogClient logClient) {
        this.repo = repo;
        this.logClient = logClient;
    }

    @Transactional
    public Product addProduct(Product product) {

        if (product.getPrice() < 0) {
            throw new InvalidProductException("Price cannot be negative");
        }

        if (product.getAvailableQuantity() < 0) {
            throw new InvalidProductException("Quantity cannot be negative");
        }

        Product saved = repo.save(product);

        logClient.sendLog(new ActivityLog(
                "inventory-service",
                "PRODUCT_CREATED",
                "ADMIN",
                "PRODUCT",
                saved.getProductId(),
                "Product added: " + saved.getProductName()
        ));

        return saved;
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));
        repo.delete(product);
        try {
            logClient.sendLog(new ActivityLog(
                    "inventory-service",
                    "PRODUCT_DELETED",
                    "ADMIN",
                    "PRODUCT",
                    id,
                    "Product permanently deleted"
            ));
        } catch (Exception e) {
            log.error("Logging failed for product {}", id, e);
        }
    }

    @Transactional
    public void softDeleteProduct(Long id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        product.setDeleted(true);
        repo.save(product);

        logClient.sendLog(new ActivityLog(
                "inventory-service",
                "PRODUCT_DEACTIVATED",
                "ADMIN",
                "PRODUCT",
                id,
                "Product deactivated"
        ));
    }

    @Transactional
    public void restoreProduct(Long id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        product.setDeleted(false);
        repo.save(product);

        logClient.sendLog(new ActivityLog(
                "inventory-service",
                "PRODUCT_RESTORED",
                "ADMIN",
                "PRODUCT",
                id,
                "Product restored"
        ));
    }

    @Transactional
    public Product updateProduct(Long id, Product updated) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        if (updated.getPrice() < 0) {
            throw new InvalidProductException("Price cannot be negative");
        }

        if (updated.getAvailableQuantity() < 0) {
            throw new InvalidProductException("Quantity cannot be negative");
        }

        product.setProductName(updated.getProductName());
        product.setPrice(updated.getPrice());
        product.setAvailableQuantity(updated.getAvailableQuantity());
        product.setImageUrl(updated.getImageUrl());

        Product saved = repo.save(product);

        try {
            logClient.sendLog(new ActivityLog(
                    "inventory-service",
                    "PRODUCT_UPDATED",
                    "ADMIN",
                    "PRODUCT",
                    id,
                    "Product updated"
            ));
        } catch (Exception e) {
            log.error("Logging failed for product {}", id, e);
        }

        return saved;
    }

    public void increaseStock(Long productId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Product product = repo.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        product.setAvailableQuantity(product.getAvailableQuantity() + quantity);
        repo.save(product);

        logClient.sendLog(new ActivityLog(
                "inventory-service",
                "STOCK_INCREASED",
                "SYSTEM",
                "PRODUCT",
                productId,
                "Stock increased by " + quantity
        ));
    }

    @Transactional
    public void reduceStock(Long productId, int quantity) {

        Product product = repo.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        if (product.getAvailableQuantity() < quantity) {
            throw new InsufficientStockException("Insufficient stock");
        }

        product.setAvailableQuantity(product.getAvailableQuantity() - quantity);
        repo.save(product);

        logClient.sendLog(new ActivityLog(
                "inventory-service",
                "STOCK_REDUCED",
                "SYSTEM",
                "PRODUCT",
                productId,
                "Stock reduced by " + quantity
        ));
    }

    public Page<Product> getAllProducts(Pageable pageable) {
        return repo.findAll(pageable);
    }

    public Product getProductById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));
    }
}