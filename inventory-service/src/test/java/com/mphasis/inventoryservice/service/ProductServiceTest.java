/*
package com.mphasis.inventoryservice.service;

import com.mphasis.inventoryservice.dao.ProductRepository;
import com.mphasis.inventoryservice.exception.InsufficientStockException;
import com.mphasis.inventoryservice.exception.ProductNotFoundException;
import com.mphasis.inventoryservice.model.Product;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    private ProductRepository repo;
    private ProductService service;

    @BeforeEach
    void setUp() {
        repo = mock(ProductRepository.class);
        service = new ProductService(repo);
    }

    @Test
    void shouldAddProduct() {
        Product product = new Product();
        product.setProductName("iPhone");

        when(repo.save(product)).thenReturn(product);

        Product saved = service.addProduct(product);

        assertEquals("iPhone", saved.getProductName());
        verify(repo).save(product);
    }

    @Test
    void shouldDeleteProduct() {
        Product product = new Product();

        when(repo.findById(1L)).thenReturn(Optional.of(product));

        service.deleteProduct(1L);

        verify(repo).delete(product);
    }

    @Test
    void shouldThrowWhenDeletingNonExistingProduct() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () ->
                service.deleteProduct(1L));
    }

    @Test
    void shouldUpdateProduct() {
        Product existing = new Product();
        existing.setProductName("Old");
        existing.setPrice(100);
        existing.setAvailableQuantity(10);

        Product updated = new Product();
        updated.setProductName("New");
        updated.setPrice(200);
        updated.setAvailableQuantity(20);

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(existing)).thenReturn(existing);

        Product result = service.updateProduct(1L, updated);

        assertEquals("New", result.getProductName());
        assertEquals(200, result.getPrice());
        assertEquals(20, result.getAvailableQuantity());
    }

    @Test
    void shouldThrowWhenUpdatingNonExistingProduct() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () ->
                service.updateProduct(1L, new Product()));
    }

    @Test
    void shouldIncreaseStock() {
        Product product = new Product();
        product.setAvailableQuantity(10);

        when(repo.findById(1L)).thenReturn(Optional.of(product));

        service.increaseStock(1L, 5);

        assertEquals(15, product.getAvailableQuantity());
        verify(repo).save(product);
    }

    @Test
    void shouldThrowWhenIncreasingStockForMissingProduct() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                service.increaseStock(1L, 5));
    }

    @Test
    void shouldReduceStock() {
        Product product = new Product();
        product.setAvailableQuantity(10);

        when(repo.findById(1L)).thenReturn(Optional.of(product));

        service.reduceStock(1L, 5);

        assertEquals(5, product.getAvailableQuantity());
        verify(repo).save(product);
    }

    @Test
    void shouldThrowWhenStockInsufficient() {
        Product product = new Product();
        product.setAvailableQuantity(3);

        when(repo.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(InsufficientStockException.class, () ->
                service.reduceStock(1L, 5));
    }

    @Test
    void shouldThrowWhenQuantityInvalid() {
        Product product = new Product();
        product.setAvailableQuantity(10);

        when(repo.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(IllegalArgumentException.class, () ->
                service.reduceStock(1L, 0));
    }

    @Test
    void shouldThrowWhenReducingStockForMissingProduct() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () ->
                service.reduceStock(1L, 5));
    }

    @Test
    void shouldReturnPagedProducts() {
        Pageable pageable = PageRequest.of(0, 2);
        Page<Product> page = new PageImpl<>(java.util.List.of(new Product(), new Product()));

        when(repo.findAll(pageable)).thenReturn(page);

        Page<Product> result = service.getAllProducts(pageable);

        assertEquals(2, result.getContent().size());
    }

    @Test
    void shouldReturnProductById() {
        Product product = new Product();

        when(repo.findById(1L)).thenReturn(Optional.of(product));

        Product result = service.getProductById(1L);

        assertNotNull(result);
    }

    @Test
    void shouldThrowWhenProductNotFound() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () ->
                service.getProductById(1L));
    }
}*/
