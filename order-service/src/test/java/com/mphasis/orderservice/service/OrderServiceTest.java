package com.mphasis.orderservice.service;

import com.mphasis.orderservice.client.*;
import com.mphasis.orderservice.dto.*;
import com.mphasis.orderservice.model.*;
import com.mphasis.orderservice.dao.OrderRepository;
import com.mphasis.orderservice.saga.OrderStateMachine;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    private OrderRepository repo;
    private InventoryClient inventory;
    private OrderStateMachine stateMachine;
    private UserClient userClient;
    private PaymentClient paymentClient;

    private OrderService service;

    @BeforeEach
    void setUp() {
        repo = mock(OrderRepository.class);
        inventory = mock(InventoryClient.class);
        stateMachine = mock(OrderStateMachine.class);
        userClient = mock(UserClient.class);
        paymentClient = mock(PaymentClient.class);

        service = new OrderService(repo, inventory, stateMachine, userClient, paymentClient);
    }

    private void mockAuth() {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("test@test.com");

        MockedStatic<SecurityContextHolder> mockedStatic = mockStatic(SecurityContextHolder.class);
        var securityContext = mock(org.springframework.security.core.context.SecurityContext.class);

        mockedStatic.when(SecurityContextHolder::getContext).thenReturn(securityContext);
        when(securityContext.getAuthentication()).thenReturn(auth);
    }

    private OrderRequest buildRequest() {
        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(2);

        OrderRequest request = new OrderRequest();
        request.setItems(List.of(item));
        return request;
    }

    @Test
    void shouldCompleteOrderSuccessfully() {
        mockAuth();

        UserResponse user = new UserResponse();
        user.setId(1L);
        when(userClient.getUserByEmail(any())).thenReturn(user);

        ProductResponse product = new ProductResponse();
        product.setPrice(100);
        product.setAvailableQuantity(10);
        when(inventory.getProduct(1L)).thenReturn(product);

        PaymentResponse paymentResponse = new PaymentResponse();
        paymentResponse.setStatus("SUCCESS");
        when(paymentClient.processPayment(any())).thenReturn(paymentResponse);

        when(repo.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse response = service.createOrder(buildRequest());

        assertEquals("COMPLETED", response.getStatus());

        verify(paymentClient).processPayment(any());
        verify(inventory, never()).increaseStock(anyLong(), any());
    }

    @Test
    void shouldFailAndRollbackWhenPaymentFails() {
        mockAuth();

        UserResponse user = new UserResponse();
        user.setId(1L);
        when(userClient.getUserByEmail(any())).thenReturn(user);

        ProductResponse product = new ProductResponse();
        product.setPrice(100);
        product.setAvailableQuantity(10);
        when(inventory.getProduct(anyLong())).thenReturn(product);

        PaymentResponse paymentResponse = new PaymentResponse();
        paymentResponse.setStatus("FAILED");
        when(paymentClient.processPayment(any())).thenReturn(paymentResponse);

        when(repo.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse response = service.createOrder(buildRequest());

        assertEquals("FAILED", response.getStatus());

        verify(inventory).increaseStock(eq(1L), any()); // rollback
    }

    @Test
    void shouldRollbackAndReversePaymentOnException() {
        mockAuth();

        UserResponse user = new UserResponse();
        user.setId(1L);
        when(userClient.getUserByEmail(any())).thenReturn(user);

        ProductResponse product = new ProductResponse();
        product.setPrice(100);
        product.setAvailableQuantity(10);
        when(inventory.getProduct(anyLong())).thenReturn(product);

        when(paymentClient.processPayment(any()))
                .thenThrow(new RuntimeException("Payment service down"));

        when(repo.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderResponse response = service.createOrder(buildRequest());

        assertEquals("FAILED", response.getStatus());

        verify(inventory).increaseStock(eq(1L), any());
    }
}