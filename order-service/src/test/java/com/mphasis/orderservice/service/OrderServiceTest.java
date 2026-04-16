package com.mphasis.orderservice.service;

import com.mphasis.orderservice.client.InventoryClient;
import com.mphasis.orderservice.client.UserClient;
import com.mphasis.orderservice.dto.*;
import com.mphasis.orderservice.exception.InventoryException;
import com.mphasis.orderservice.exception.OrderNotFoundException;
import com.mphasis.orderservice.model.Order;
import com.mphasis.orderservice.model.OrderItem;
import com.mphasis.orderservice.model.OrderStatus;
import com.mphasis.orderservice.dao.OrderRepository;
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

    @Mock
    private OrderRepository repo;
    @Mock
    private InventoryClient inventory;
    @Mock
    private OrderStateMachine stateMachine;
    @Mock
    private UserClient userClient;

    @InjectMocks
    private OrderService service;

    private OrderRequest request;
    private ProductResponse product;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        ReflectionTestUtils.setField(service, "internalApiKey", "0aK4VOyO5dOwBEBjJG6+cbio1ENbTNYVqi0elOkWnvo=");

        var auth = new UsernamePasswordAuthenticationToken("test@mail.com", null, List.of());
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

    @Test
    void shouldCreateOrderSuccessfully() {
        when(inventory.getProduct(1L)).thenReturn(product);

        OrderResponse response = service.createOrder(request);

        assertEquals("PAYMENT_PENDING", response.getStatus());
        verify(inventory).reduceStock(any(), eq(1L), any());
    }

    @Test
    void shouldFailIfItemsIsNull() {
        request.setItems(null);

        assertThrows(NullPointerException.class,
                () -> service.createOrder(request));
    }

    @Test
    void shouldFailIfInsufficientStock() {
        product.setAvailableQuantity(1);
        when(inventory.getProduct(1L)).thenReturn(product);

        assertThrows(InventoryException.class,
                () -> service.createOrder(request));
    }

    @Test
    void shouldFailWithoutRollbackIfFirstInventoryCallFails() {
        when(inventory.getProduct(1L)).thenReturn(product);

        doThrow(new RuntimeException())
                .when(inventory).reduceStock(any(), anyLong(), any());

        OrderResponse response = service.createOrder(request);

        assertEquals("FAILED", response.getStatus());

        verify(inventory, never()).increaseStock(any(), anyLong(), any());
    }

    @Test
    void shouldHandleInventoryFallbackFailure() {
        when(inventory.getProduct(1L)).thenReturn(product);

        doThrow(new InventoryException("fallback"))
                .when(inventory).reduceStock(any(), anyLong(), any());

        OrderResponse response = service.createOrder(request);

        assertEquals("FAILED", response.getStatus());
    }

    @Test
    void shouldFailIfUserNotAuthenticated() {
        SecurityContextHolder.clearContext();

        assertThrows(RuntimeException.class,
                () -> service.createOrder(request));
    }

    @Test
    void shouldFailIfUserClientFails() {
        when(userClient.getUserByEmail(any()))
                .thenThrow(new RuntimeException());

        assertThrows(RuntimeException.class,
                () -> service.createOrder(request));
    }

    @Test
    void shouldFailIfProductIsNull() {
        when(inventory.getProduct(1L)).thenReturn(null);

        assertThrows(NullPointerException.class,
                () -> service.createOrder(request));
    }

    @Test
    void shouldHandleEmptyOrderItems() {
        request.setItems(Collections.emptyList());

        OrderResponse response = service.createOrder(request);

        assertEquals(0.0, response.getTotalAmount());
    }

    @Test
    void shouldValidateStateTransitions() {
        when(inventory.getProduct(1L)).thenReturn(product);

        service.createOrder(request);

        verify(stateMachine, atLeastOnce()).validate(any(), any());
    }

    @Test
    void shouldConfirmPaymentSuccessfully() {
        Order order = new Order();
        order.setStatus(OrderStatus.PAYMENT_PENDING);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        service.confirmOrderPayment(1L);

        assertEquals(OrderStatus.COMPLETED, order.getStatus());
        verify(repo).save(order);
    }

    @Test
    void shouldThrowIfOrderNotFoundOnConfirm() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(OrderNotFoundException.class,
                () -> service.confirmOrderPayment(1L));
    }

    @Test
    void shouldThrowIfInvalidStateOnConfirm() {
        Order order = new Order();
        order.setStatus(OrderStatus.CREATED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> service.confirmOrderPayment(1L));
    }

    @Test
    void shouldFailOrderPaymentSuccessfully() {
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
    void shouldThrowIfOrderNotFoundOnFailPayment() {
        when(repo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> service.failOrderPayment(1L));
    }

    @Test
    void shouldThrowIfInvalidStateOnFailPayment() {
        Order order = new Order();
        order.setStatus(OrderStatus.CREATED);

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(RuntimeException.class,
                () -> service.failOrderPayment(1L));
    }

    @Test
    void shouldGetOrderById() {
        Order order = new Order();
        order.setOrderId(1L);
        order.setStatus(OrderStatus.CREATED); // ✅ FIX

        when(repo.findById(1L)).thenReturn(Optional.of(order));

        OrderResponse response = service.getOrderResponseById(1L);

        assertEquals(1L, response.getOrderId());
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
        order.setStatus(OrderStatus.CREATED); // ✅ FIX

        when(repo.findAll()).thenReturn(List.of(order));

        List<OrderResponse> responses = service.getAllOrdersResponse();

        assertEquals(1, responses.size());
    }
}