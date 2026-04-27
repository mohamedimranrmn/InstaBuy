package com.mphasis.orderservice.dao;

import com.mphasis.orderservice.model.OrderItem;
import com.mphasis.orderservice.model.OrderStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
    SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END
    FROM OrderItem oi
    JOIN oi.order o
    WHERE oi.productId = :productId
    AND o.status IN :statuses
""")
    boolean existsByProductIdAndOrderStatusIn(
            @Param("productId") Long productId,
            @Param("statuses") List<OrderStatus> statuses
    );
}