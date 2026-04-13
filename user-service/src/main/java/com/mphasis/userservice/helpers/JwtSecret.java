package com.mphasis.userservice.helpers;

import java.security.SecureRandom;
import java.util.Base64;

public class JwtSecret {
    public static void main(String[] args) {
        SecureRandom secureRandom = new SecureRandom();
        byte[] key = new byte[32];

        secureRandom.nextBytes(key);

        String encodedKey = Base64.getEncoder().encodeToString(key);
        System.out.println("JWT Secret Key:");
        System.out.println(encodedKey);
    }
}
