package com.mphasis.orderservice.saga;

import com.mphasis.orderservice.exception.InvalidStateTransitionException;
import com.mphasis.orderservice.model.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class OrderStateMachine {

    private static final Map<OrderStatus, Set<OrderStatus>> transitions = Map.of(

            OrderStatus.CREATED,
            Set.of(OrderStatus.INVENTORY_RESERVED, OrderStatus.FAILED),

            OrderStatus.INVENTORY_RESERVED,
            Set.of(OrderStatus.PAYMENT_PENDING, OrderStatus.FAILED),

            OrderStatus.PAYMENT_PENDING,
            Set.of(OrderStatus.COMPLETED, OrderStatus.FAILED, OrderStatus.CANCELLED),

            OrderStatus.COMPLETED,
            Set.of(OrderStatus.CANCEL_REQUESTED),

            OrderStatus.CANCEL_REQUESTED,
            Set.of(OrderStatus.REFUND_PENDING, OrderStatus.REFUND_REJECTED),

            OrderStatus.REFUND_PENDING,
            Set.of(OrderStatus.REFUNDED),

            OrderStatus.REFUND_REJECTED,
            Set.of(OrderStatus.COMPLETED)
    );

    public void validate(OrderStatus current, OrderStatus next) {
        if (current == OrderStatus.FAILED ||
                current == OrderStatus.CANCELLED ||
                current == OrderStatus.REFUNDED) {

            throw new InvalidStateTransitionException(
                    "No transitions allowed from terminal state: " + current
            );
        }

        if (!transitions.containsKey(current) ||
                !transitions.get(current).contains(next)) {

            throw new InvalidStateTransitionException(
                    "Invalid transition: " + current + " → " + next
            );
        }
    }
}