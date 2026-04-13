package com.mphasis.orderservice.dto;

public class UserResponse {
    private Long id;
    private String email;

    public void setId(Long id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
}
