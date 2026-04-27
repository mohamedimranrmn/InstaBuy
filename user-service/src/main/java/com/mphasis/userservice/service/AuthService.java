package com.mphasis.userservice.service;

import com.mphasis.userservice.exception.ConflictException;
import com.mphasis.userservice.exception.ResourceNotFoundException;
import com.mphasis.userservice.exception.UnauthorizedException;
import com.mphasis.userservice.util.LogClient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mphasis.userservice.dao.UserRepository;
import com.mphasis.userservice.dto.LoginRequest;
import com.mphasis.userservice.dto.RegisterRequest;
import com.mphasis.userservice.model.Role;
import com.mphasis.userservice.model.User;
import com.mphasis.userservice.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LogClient logClient;

    public String register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("User already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);

        User saved = userRepository.save(user);

        logClient.sendLog(
                "USER_REGISTERED",
                saved.getEmail(),
                "USER",
                saved.getId(),
                "New user registered"
        );

        return jwtUtil.generateToken(saved.getEmail(), saved.getRole().name());
    }

    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.isDeleted()) {
            throw new UnauthorizedException("Your account is deactivated. Contact admin.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        logClient.sendLog(
                "USER_LOGIN",
                user.getEmail(),
                "USER",
                user.getId(),
                "User logged in"
        );

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }
}