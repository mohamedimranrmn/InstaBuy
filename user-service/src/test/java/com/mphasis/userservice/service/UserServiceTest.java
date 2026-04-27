package com.mphasis.userservice.service;

import com.mphasis.userservice.dao.UserRepository;
import com.mphasis.userservice.model.Role;
import com.mphasis.userservice.model.User;
import com.mphasis.userservice.util.LogClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    private UserService userService;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {

        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        LogClient logClient = mock(LogClient.class);

        userService = new UserService(userRepository, passwordEncoder, logClient);
    }

    @Test
    void shouldReturnAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(new User(), new User()));

        List<User> users = userService.getAllUsers();

        assertEquals(2, users.size());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void shouldCreateCustomerWithEncodedPasswordAndRole() {
        User user = new User();
        user.setPassword("plain");

        when(passwordEncoder.encode("plain")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User saved = userService.createCustomer(user);

        assertEquals("encoded", saved.getPassword());
        assertEquals(Role.CUSTOMER, saved.getRole());
        verify(userRepository).save(user);
    }

    @Test
    void shouldCreateAdminWithAdminRole() {
        User user = new User();
        user.setPassword("admin123");

        when(passwordEncoder.encode("admin123")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User saved = userService.createAdmin(user);

        assertEquals("encoded", saved.getPassword());
        assertEquals(Role.ADMIN, saved.getRole());
    }

    @Test
    void shouldReturnUserByEmail() {
        User user = new User();
        user.setEmail("test@test.com");

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        User result = userService.getUserByEmail("test@test.com");

        assertEquals("test@test.com", result.getEmail());
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        when(userRepository.findByEmail("missing@test.com"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                userService.getUserByEmail("missing@test.com"));
    }

    @Test
    void shouldThrowExceptionWhenEmailIsNull() {
        when(userRepository.findByEmail(null))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                userService.getUserByEmail(null));
    }
}