package com.aiportfolio.backend.util;

import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;

@Slf4j
public class PasswordHashGenerator {
    public static void main(String[] args) {
        String password = args.length > 0 ? args[0] : "test1234";
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

        log.info("Original Password: {}", password);
        log.info("BCrypt Hash: {}", hashedPassword);
        log.info("\nSQL INSERT Statement:");
        log.info("INSERT INTO admin_users (username, password, role) VALUES");
        log.info("('admin', '{}', 'ROLE_ADMIN')", hashedPassword);
        log.info("ON CONFLICT (username) DO NOTHING;");
    }
}
