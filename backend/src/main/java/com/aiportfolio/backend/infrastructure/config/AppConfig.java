package com.aiportfolio.backend.infrastructure.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfig {
    private AiService aiService = new AiService();
    private GitHub github = new GitHub();
    private Contact contact = new Contact();
    private Security security = new Security();
    
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(clientHttpRequestFactory());
        return restTemplate;
    }
    
    @Bean
    public ClientHttpRequestFactory clientHttpRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30000); // 30초
        factory.setReadTimeout(60000);    // 60초
        return factory;
    }

    // 명시적 getter 메서드들
    public AiService getAiService() {
        return aiService;
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
    public static class AiService {
        private String url = "http://localhost:8081";
        private int timeout = 30000;
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