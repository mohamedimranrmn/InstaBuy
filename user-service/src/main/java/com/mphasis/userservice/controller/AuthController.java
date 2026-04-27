package com.mphasis.userservice.controller;

import com.mphasis.userservice.util.LogClient;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mphasis.userservice.dto.*;
import com.mphasis.userservice.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private LogClient logClient;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return new AuthResponse(authService.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return new AuthResponse(authService.login(request));
    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {

        String email = request.getUserPrincipal().getName();

        logClient.sendLog(
                "USER_LOGOUT",
                email,
                "USER",
                null,
                "User logged out"
        );

        return ResponseEntity.ok("Logged out successfully");
    }
}