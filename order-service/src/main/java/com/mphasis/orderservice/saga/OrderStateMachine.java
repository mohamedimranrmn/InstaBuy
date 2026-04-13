package com.mphasis.orderservice.saga;

import com.mphasis.orderservice.model.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class OrderStateMachine {

    private static final Map<OrderStatus, Set<OrderStatus>> transitions = Map.of(
            OrderStatus.CREATED, Set.of(OrderStatus.INVENTORY_RESERVED, OrderStatus.FAILED),

            OrderStatus.INVENTORY_RESERVED,
            Set.of(OrderStatus.PAYMENT_PENDING, OrderStatus.FAILED),

            OrderStatus.PAYMENT_PENDING,
            Set.of(OrderStatus.COMPLETED, OrderStatus.FAILED),

            OrderStatus.FAILED,
            Set.of(OrderStatus.CANCELLED)
    );

    public void validate(OrderStatus current, OrderStatus next) {
        if (!transitions.getOrDefault(current, Set.of()).contains(next)) {
            throw new IllegalStateException("Invalid transition: " + current + " → " + next);
        }
    }
}