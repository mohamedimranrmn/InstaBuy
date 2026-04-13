package com.mphasis.userservice.service;

import com.mphasis.userservice.dao.UserRepository;
import com.mphasis.userservice.dto.LoginRequest;
import com.mphasis.userservice.dto.RegisterRequest;
import com.mphasis.userservice.model.Role;
import com.mphasis.userservice.model.User;
import com.mphasis.userservice.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private AuthService authService;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        authService = new AuthService();

        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        jwtUtil = mock(JwtUtil.class);

        ReflectionTestUtils.setField(authService, "userRepository", userRepository);
        ReflectionTestUtils.setField(authService, "passwordEncoder", passwordEncoder);
        ReflectionTestUtils.setField(authService, "jwtUtil", jwtUtil);
    }

    @Test
    void shouldRegisterUserAndReturnToken() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Imran");
        request.setEmail("test@test.com");
        request.setPassword("1234");

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("1234")).thenReturn("encoded");

        when(jwtUtil.generateToken("test@test.com", "CUSTOMER"))
                .thenReturn("token123");

        String token = authService.register(request);

        assertEquals("token123", token);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionIfUserAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@test.com");

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(new User()));

        assertThrows(RuntimeException.class, () ->
                authService.register(request));
    }

    @Test
    void shouldLoginAndReturnToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("1234");

        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("encoded");
        user.setRole(Role.CUSTOMER);

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("1234", "encoded"))
                .thenReturn(true);

        when(jwtUtil.generateToken("test@test.com", "CUSTOMER"))
                .thenReturn("token123");

        String token = authService.login(request);

        assertEquals("token123", token);
    }

    @Test
    void shouldThrowExceptionWhenUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@test.com");

        when(userRepository.findByEmail("missing@test.com"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                authService.login(request));
    }

    @Test
    void shouldThrowExceptionWhenPasswordIsInvalid() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("wrong");

        User user = new User();
        user.setEmail("test@test.com");
        user.setPassword("encoded");

        when(userRepository.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("wrong", "encoded"))
                .thenReturn(false);

        assertThrows(RuntimeException.class, () ->
                authService.login(request));
    }
}