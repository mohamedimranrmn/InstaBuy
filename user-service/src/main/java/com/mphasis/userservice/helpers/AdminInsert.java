package com.mphasis.userservice.helpers;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class AdminInsert {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("admin@123"));
    }
}
