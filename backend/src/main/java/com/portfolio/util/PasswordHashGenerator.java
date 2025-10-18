package com.portfolio.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "admin123";
        String hashedPassword = encoder.encode(password);

        System.out.println("Original Password: " + password);
        System.out.println("BCrypt Hash: " + hashedPassword);
        System.out.println("\nSQL INSERT Statement:");
        System.out.println("INSERT INTO admin_users (username, password, role) VALUES");
        System.out.println("('admin', '" + hashedPassword + "', 'ROLE_ADMIN')");
        System.out.println("ON CONFLICT (username) DO NOTHING;");
    }
}
