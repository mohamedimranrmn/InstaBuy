package com.mphasis.orderservice.service;

import com.mphasis.orderservice.client.InventoryClient;
import com.mphasis.orderservice.client.PaymentClient;
import com.mphasis.orderservice.client.UserClient;
import com.mphasis.orderservice.dao.OrderRepository;
import com.mphasis.orderservice.dto.*;
import com.mphasis.orderservice.exception.*;
import com.mphasis.orderservice.model.*;
import com.mphasis.orderservice.saga.OrderStateMachine;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    @Mock private OrderRepository repo;
    @Mock private InventoryClient inventory;
    @Mock private PaymentClient paymentClient;
    @Mock private UserClient userClient;
    @Mock private OrderStateMachine stateMachine;

    @InjectMocks
    private OrderService service;

    private OrderRequest request;
    private ProductResponse product;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        ReflectionTestUtils.setField(service, "internalApiKey", "test-key");

        var auth = new UsernamePasswordAuthenticationToken("user@mail.com", null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserResponse user = new UserResponse();
        user.setId(1L);
        when(userClient.getUserByEmail(any())).thenReturn(user);

        product = new ProductResponse();
        product.setProductId(1L);
        product.setPrice(100.0);
        product.setAvailableQuantity(10);

        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(2);

        request = new OrderRequest();
        request.setItems(List.of(item));

        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));
    }

    // =========================
    // CREATE ORDER (SAGA START)
    // =========================

    @Test
    void shouldCreateOrderSuccessfully() {
        when(inventory.getProduct(any(), eq(1L))).thenReturn(product);

        OrderResponse res = service.createOrder(request);

        assertEquals("PAYMENT_PENDING", res.getStatus());
        verify(inventory).reduceStock(any(), eq(1L), any());
    }

    @Test
    void shouldFailIfInventoryInsufficient() {
        product.setAvailableQuantity(1);
        when(inventory.getProduct(any(), eq(1L))).thenReturn(product);

        assertThrows(InventoryException.class,
                () -> service.createOrder(request));
    }

    @Test
    void shouldRollbackIfInventoryFailsMidSaga() {
        when(inventory.getProduct(any(), eq(1L))).thenReturn(product);

        doThrow(new RuntimeException())
                .when(inventory).reduceStock(any(), anyLong(), any());

        OrderResponse res = service.createOrder(request);

        assertEquals("FAILED", res.getStatus());
    }

    @Test
    void shouldFailIfUserNotAuthenticated() {
        SecurityContextHolder.clearContext();

        assertThrows(RuntimeException.class,
                () -> service.createOrder(request));
    }

    // =========================
    // PAYMENT SUCCESS (SAGA END)
    // =========================

    @Test
    void shouldCompleteOrderAfterPayment() {
        Order order = new Order();
        order.setStatus(OrderStatus.PAYMENT_PENDING);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        service.confirmOrderPayment(1L);

        assertEquals(OrderStatus.COMPLETED, order.getStatus());
    }

    @Test
    void shouldFailIfInvalidPaymentState() {
        Order order = new Order();
        order.setStatus(OrderStatus.CREATED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> service.confirmOrderPayment(1L));
    }

    // =========================
    // PAYMENT FAILURE (COMPENSATION)
    // =========================

    @Test
    void shouldRollbackInventoryOnPaymentFailure() {
        Order order = new Order();
        order.setStatus(OrderStatus.PAYMENT_PENDING);

        OrderItem item = new OrderItem();
        item.setProductId(1L);
        item.setQuantity(2);
        order.setItems(List.of(item));

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        service.failOrderPayment(1L);

        assertEquals(OrderStatus.FAILED, order.getStatus());
        verify(inventory).increaseStock(any(), eq(1L), any());
    }

    @Test
    void shouldFailIfInvalidStateOnPaymentFailure() {
        Order order = new Order();
        order.setStatus(OrderStatus.CREATED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> service.failOrderPayment(1L));
    }

    // =========================
    // CANCEL BEFORE PAYMENT
    // =========================

    @Test
    void shouldCancelBeforePayment() {
        Order order = new Order();
        order.setStatus(OrderStatus.CREATED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        service.cancelOrder(1L);

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
    }

    @Test
    void shouldRollbackInventoryOnCancelBeforePayment() {
        Order order = new Order();
        order.setStatus(OrderStatus.PAYMENT_PENDING);

        OrderItem item = new OrderItem();
        item.setProductId(1L);
        item.setQuantity(2);
        order.setItems(List.of(item));

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        service.cancelOrder(1L);

        verify(inventory).increaseStock(any(), eq(1L), any());
    }

    @Test
    void shouldBeIdempotentWhenAlreadyCancelled() {
        Order order = new Order();
        order.setStatus(OrderStatus.CANCELLED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        service.cancelOrder(1L);

        verify(inventory, never()).increaseStock(any(), anyLong(), any());
    }

    // =========================
    // CANCEL AFTER PAYMENT (SAGA EXTENSION)
    // =========================

    @Test
    void shouldMoveToCancelRequestedAfterCompletion() {
        Order order = new Order();
        order.setStatus(OrderStatus.COMPLETED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        service.cancelOrder(1L);

        assertEquals(OrderStatus.CANCEL_REQUESTED, order.getStatus());
    }

    @Test
    void shouldThrowIfInvalidCancelState() {
        Order order = new Order();
        order.setStatus(OrderStatus.FAILED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> service.cancelOrder(1L));
    }

    // =========================
    // REFUND FLOW (SAGA COMPENSATION)
    // =========================

    @Test
    void shouldApproveRefundAndCompleteSaga() {
        Order order = new Order();
        order.setStatus(OrderStatus.CANCEL_REQUESTED);

        OrderItem item = new OrderItem();
        item.setProductId(1L);
        item.setQuantity(2);
        order.setItems(List.of(item));

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        service.processRefundDecision(1L, true);

        verify(paymentClient).refund(1L);
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
    }

    @Test
    void shouldRollbackInventoryDuringRefund() {
        Order order = new Order();
        order.setStatus(OrderStatus.CANCEL_REQUESTED);

        OrderItem item = new OrderItem();
        item.setProductId(1L);
        item.setQuantity(2);
        order.setItems(List.of(item));

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        service.processRefundDecision(1L, true);

        verify(inventory).increaseStock(any(), eq(1L), any());
    }

    @Test
    void shouldRejectRefund() {
        Order order = new Order();
        order.setStatus(OrderStatus.CANCEL_REQUESTED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        service.processRefundDecision(1L, false);

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        assertEquals("Refund rejected by admin", order.getFailureReason());
    }

    @Test
    void shouldFailIfInvalidRefundState() {
        Order order = new Order();
        order.setStatus(OrderStatus.CREATED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> service.processRefundDecision(1L, true));
    }

    // =========================
    // FETCH & EDGE CASES
    // =========================

    @Test
    void shouldGetOrderById() {
        Order order = new Order();
        order.setOrderId(1L);
        order.setStatus(OrderStatus.CREATED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        OrderResponse res = service.getOrderResponseById(1L);

        assertEquals(1L, res.getOrderId());
    }

    @Test
    void shouldThrowIfOrderNotFound() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.getOrderResponseById(1L));
    }

    @Test
    void shouldGetAllOrders() {
        Order order = new Order();
        order.setOrderId(1L);
        order.setStatus(OrderStatus.CREATED);

        when(repo.findAll()).thenReturn(List.of(order));

        assertEquals(1, service.getAllOrdersResponse().size());
    }

    @Test
    void shouldHandleEmptyItems() {
        request.setItems(Collections.emptyList());

        OrderResponse res = service.createOrder(request);

        assertEquals(0.0, res.getTotalAmount());
    }
}