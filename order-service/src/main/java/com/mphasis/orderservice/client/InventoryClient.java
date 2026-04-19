package com.mphasis.orderservice.client;

import com.mphasis.orderservice.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "inventory-service",
        configuration = {
                com.mphasis.orderservice.config.FeignConfig.class,
        }
)
public interface InventoryClient {

    @GetMapping("/products/{id}")
    ProductResponse getProduct(
            @RequestHeader("X-Internal-Key") String key,
            @PathVariable("id") Long productId
    );

    @DeleteMapping("/products/{id}")
    void deleteProduct(
            @RequestHeader("X-Internal-Key") String key,
            @PathVariable("id") Long productId
    );

    @PatchMapping("/products/{id}/increase")
    void increaseStock(
            @RequestHeader("X-Internal-Key") String key,
            @PathVariable("id") Long productId,
            @RequestBody StockRequest request
    );

    @PatchMapping("/products/{id}/reduce")
    void reduceStock(
            @RequestHeader("X-Internal-Key") String key,
            @PathVariable("id") Long productId,
            @RequestBody StockRequest request
    );

    class StockRequest {
        private int quantity;

        public StockRequest() {}

        public StockRequest(int quantity) {
            this.quantity = quantity;
        }

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }
}