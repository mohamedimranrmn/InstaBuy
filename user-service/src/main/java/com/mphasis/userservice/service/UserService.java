package com.mphasis.userservice.service;

import java.util.List;

import com.mphasis.userservice.util.LogClient;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.mphasis.userservice.dao.UserRepository;
import com.mphasis.userservice.model.Role;
import com.mphasis.userservice.model.User;
import com.mphasis.userservice.exception.*;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LogClient logClient;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       LogClient logClient) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.logClient = logClient;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createAdmin(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.ADMIN);

        User saved = userRepository.save(user);

        logClient.sendLog(
                "ADMIN_CREATED",
                saved.getEmail(),
                "USER",
                saved.getId(),
                "New admin created"
        );

        return saved;
    }

    public User createCustomer(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.CUSTOMER);

        User saved = userRepository.save(user);

        logClient.sendLog(
                "USER_CREATED",
                saved.getEmail(),
                "USER",
                saved.getId(),
                "New customer registered"
        );

        return saved;
    }

    public User getUserByEmail(String email) {
        if (email == null) {
            throw new BadRequestException("Email cannot be null");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public void deleteUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.deleteById(id);

        logClient.sendLog(
                "USER_DELETED",
                "ADMIN",
                "USER",
                id,
                "User deleted via deleteUserById"
        );
    }

    @Transactional
    public void softDeleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setDeleted(true);
        userRepository.save(user);

        logClient.sendLog(
                "USER_DEACTIVATED",
                "ADMIN",
                "USER",
                id,
                "User deactivated"
        );
    }

    @Transactional
    public void restoreUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setDeleted(false);
        userRepository.save(user);

        logClient.sendLog(
                "USER_RESTORED",
                "ADMIN",
                "USER",
                id,
                "User restored"
        );
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(user);

        logClient.sendLog(
                "USER_DELETED",
                "ADMIN",
                "USER",
                id,
                "User permanently deleted"
        );
    }
}