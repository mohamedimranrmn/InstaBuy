package com.mphasis.orderservice.dao;

import com.mphasis.orderservice.model.OrderItem;
import com.mphasis.orderservice.model.OrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
        SELECT COUNT(oi) > 0
        FROM OrderItem oi
        WHERE oi.productId = :productId
        AND oi.order.status IN :statuses
    """)
    boolean existsByProductIdAndOrderStatusIn(
            @Param("productId") Long productId,
            @Param("statuses") List<OrderStatus> statuses
    );
}