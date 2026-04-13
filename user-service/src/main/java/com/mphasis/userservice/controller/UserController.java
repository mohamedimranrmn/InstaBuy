package com.mphasis.userservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
}