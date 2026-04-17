package com.mphasis.inventoryservice.service;

import com.mphasis.inventoryservice.exception.*;
import com.mphasis.inventoryservice.exception.InsufficientStockException;
import com.mphasis.inventoryservice.exception.ProductNotFoundException;
import com.mphasis.inventoryservice.model.Product;
import com.mphasis.inventoryservice.dao.ProductRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Product addProduct(Product product) {
        return repo.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        repo.delete(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product updated) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        product.setProductName(updated.getProductName());
        product.setPrice(updated.getPrice());
        product.setAvailableQuantity(updated.getAvailableQuantity());

        return repo.save(product);
    }

    public void increaseStock(Long productId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        Product product = repo.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));

        product.setAvailableQuantity(product.getAvailableQuantity() + quantity);
        repo.save(product);
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

        product.setAvailableQuantity(
                product.getAvailableQuantity() - quantity
        );

        repo.save(product);
    }

    public Page<Product> getAllProducts(Pageable pageable) {
        return repo.findAll(pageable);
    }

    public Product getProductById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found"));
    }
}