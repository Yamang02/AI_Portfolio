package com.aiportfolio.backend.util;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        String password = "admin123";
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

        System.out.println("Original Password: " + password);
        System.out.println("BCrypt Hash: " + hashedPassword);
        System.out.println("\nSQL INSERT Statement:");
        System.out.println("INSERT INTO admin_users (username, password, role) VALUES");
        System.out.println("('admin', '" + hashedPassword + "', 'ROLE_ADMIN')");
        System.out.println("ON CONFLICT (username) DO NOTHING;");
    }
}
