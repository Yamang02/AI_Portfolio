package com.aiportfolio.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfig {
    private Gemini gemini = new Gemini();
    private GitHub github = new GitHub();
    private Contact contact = new Contact();
    private Security security = new Security();

    // 명시적 getter 메서드들
    public Gemini getGemini() {
        return gemini;
    }

    public GitHub getGitHub() {
        return github;
    }

    public Contact getContact() {
        return contact;
    }

    public Security getSecurity() {
        return security;
    }

    @Data
    public static class Gemini {
        private String apiKey;
    }

    @Data
    public static class GitHub {
        private String username;
    }

    @Data
    public static class Contact {
        private String email;
    }

    @Data
    public static class Security {
        private String allowedOrigins;
        private RateLimit rateLimit = new RateLimit();

        @Data
        public static class RateLimit {
            private long window = 60000;
            private int maxRequests = 100;
        }
    }
} 