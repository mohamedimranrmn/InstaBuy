package com.mphasis.userservice.controller;

import java.util.List;

import com.mphasis.userservice.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.mphasis.userservice.model.User;
import com.mphasis.userservice.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/ping")
    public String test() {
        return "User Service is working";
    }

    @GetMapping("/email/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create-admin")
    public User createAdmin(@RequestBody User user) {
        return userService.createAdmin(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create-customer")
    public User createCustomer(@RequestBody User user) {
        return userService.createCustomer(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getAll")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @Value("${internal.api-key}")
    private String internalKey;
    private void validateInternalKey(String key) {
        if (!internalKey.equals(key)) {
            throw new UnauthorizedException("Invalid internal API key");
        }
    }

    @PatchMapping("/{id}/soft-delete")
    public ResponseEntity<String> softDeleteUser(
            @RequestHeader("X-Internal-Key") String key,
            @PathVariable Long id) {

        validateInternalKey(key);
        userService.softDeleteUser(id);

        return ResponseEntity.ok("User soft deleted");
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<String> restoreUser(
            @RequestHeader("X-Internal-Key") String key,
            @PathVariable Long id) {

        validateInternalKey(key);
        userService.restoreUser(id);

        return ResponseEntity.ok("User restored");
    }
}