package com.mphasis.inventoryservice.service;

import com.mphasis.inventoryservice.dao.ProductRepository;
import com.mphasis.inventoryservice.exception.InsufficientStockException;
import com.mphasis.inventoryservice.exception.ProductNotFoundException;
import com.mphasis.inventoryservice.model.Product;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.domain.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    @Mock
    private ProductRepository repo;

    @InjectMocks
    private ProductService service;

    private Product product;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        product = new Product();
        product.setProductId(1L);
        product.setProductName("Laptop");
        product.setPrice(50000);
        product.setAvailableQuantity(10);
    }

    @Test
    void shouldAddProduct() {
        when(repo.save(product)).thenReturn(product);

        Product result = service.addProduct(product);

        assertNotNull(result);
        assertEquals("Laptop", result.getProductName());
        verify(repo, times(1)).save(product);
    }

    @Test
    void shouldDeleteProduct() {
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        service.deleteProduct(1L);

        verify(repo).delete(product);
    }

    @Test
    void shouldThrowWhenDeletingNonExistingProduct() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class,
                () -> service.deleteProduct(1L));

        verify(repo, never()).delete(any());
    }

    @Test
    void shouldUpdateProduct() {
        Product updated = new Product();
        updated.setProductName("Phone");
        updated.setPrice(20000);
        updated.setAvailableQuantity(5);

        when(repo.findById(1L)).thenReturn(Optional.of(product));
        when(repo.save(any(Product.class))).thenReturn(product);

        Product result = service.updateProduct(1L, updated);

        assertEquals("Phone", product.getProductName());
        assertEquals(20000, product.getPrice());
        assertEquals(5, product.getAvailableQuantity());

        verify(repo).save(product);
    }

    @Test
    void shouldThrowWhenUpdatingNonExistingProduct() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        Product updated = new Product();

        assertThrows(ProductNotFoundException.class,
                () -> service.updateProduct(1L, updated));
    }

    @Test
    void shouldIncreaseStock() {
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        service.increaseStock(1L, 5);

        assertEquals(15, product.getAvailableQuantity());
        verify(repo).save(product);
    }

    @Test
    void shouldThrowWhenIncreasingStockForNonExistingProduct() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.increaseStock(1L, 5));
    }

    @Test
    void shouldReduceStock() {
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        service.reduceStock(1L, 5);

        assertEquals(5, product.getAvailableQuantity());
        verify(repo).save(product);
    }

    @Test
    void shouldThrowIfQuantityIsZeroOrNegative() {
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(IllegalArgumentException.class,
                () -> service.reduceStock(1L, 0));

        assertThrows(IllegalArgumentException.class,
                () -> service.reduceStock(1L, -3));
    }

    @Test
    void shouldThrowIfInsufficientStock() {
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(InsufficientStockException.class,
                () -> service.reduceStock(1L, 50));
    }

    @Test
    void shouldThrowWhenReducingStockForNonExistingProduct() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class,
                () -> service.reduceStock(1L, 5));
    }

    @Test
    void shouldReturnProductById() {
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        Product result = service.getProductById(1L);

        assertEquals(1L, result.getProductId());
    }

    @Test
    void shouldThrowIfProductNotFound() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class,
                () -> service.getProductById(1L));
    }

    @Test
    void shouldReduceStockToZero() {
        product.setAvailableQuantity(5);

        when(repo.findById(1L)).thenReturn(Optional.of(product));

        service.reduceStock(1L, 5);

        assertEquals(0, product.getAvailableQuantity());
    }

    @Test
    void shouldThrowIfIncreaseStockIsInvalid() {
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(IllegalArgumentException.class,
                () -> service.increaseStock(1L, -10));
    }

    @Test
    void shouldHandleRepositoryFailure() {
        when(repo.save(any())).thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class,
                () -> service.addProduct(product));
    }

    @Test
    void shouldNotCallSaveWhenReduceFails() {
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(InsufficientStockException.class,
                () -> service.reduceStock(1L, 50));

        verify(repo, never()).save(any());
    }

    @Test
    void shouldNotModifyOtherFieldsWhenReducingStock() {
        when(repo.findById(1L)).thenReturn(Optional.of(product));

        service.reduceStock(1L, 5);

        assertEquals("Laptop", product.getProductName());
        assertEquals(50000, product.getPrice());
    }

    @Test
    void shouldReturnPagedProducts() {
        Page<Product> page = new PageImpl<>(List.of(product));

        when(repo.findAll(any(Pageable.class))).thenReturn(page);

        Page<Product> result = service.getAllProducts(PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }
}