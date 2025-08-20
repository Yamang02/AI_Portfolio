package com.aiportfolio.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Slf4j
@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    @Primary
    @ConditionalOnProperty(name = "DATABASE_URL")
    public DataSource railwayDataSource() {
        log.info("Configuring Railway PostgreSQL DataSource");
        
        try {
            // Railway URL을 JDBC URL로 변환
            String jdbcUrl = convertRailwayUrlToJdbc(databaseUrl);
            URI uri = new URI(databaseUrl);
            
            String username = null;
            String password = null;
            
            if (uri.getUserInfo() != null) {
                String[] userInfo = uri.getUserInfo().split(":");
                username = userInfo[0];
                password = userInfo.length > 1 ? userInfo[1] : null;
            }
            
            log.info("Connecting to database at: {}:{}", uri.getHost(), uri.getPort());
            
            return DataSourceBuilder.create()
                    .driverClassName("org.postgresql.Driver")
                    .url(jdbcUrl)
                    .username(username)
                    .password(password)
                    .build();
                    
        } catch (URISyntaxException e) {
            log.error("Invalid DATABASE_URL format: {}", databaseUrl, e);
            throw new RuntimeException("Failed to parse DATABASE_URL", e);
        }
    }
    
    private String convertRailwayUrlToJdbc(String railwayUrl) throws URISyntaxException {
        if (railwayUrl == null || railwayUrl.isEmpty()) {
            throw new IllegalArgumentException("DATABASE_URL is empty");
        }
        
        // postgresql://user:pass@host:port/db -> jdbc:postgresql://host:port/db
        if (railwayUrl.startsWith("postgresql://")) {
            URI uri = new URI(railwayUrl);
            String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + uri.getPort() + uri.getPath();
            log.debug("Converted Railway URL to JDBC: {} -> {}", railwayUrl.replaceAll(":[^:@]*@", ":***@"), jdbcUrl);
            return jdbcUrl;
        }
        
        // 이미 jdbc:postgresql:// 형식이면 그대로 반환
        return railwayUrl;
    }
}