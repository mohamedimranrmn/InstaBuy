package com.mphasis.userservice.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mphasis.userservice.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}