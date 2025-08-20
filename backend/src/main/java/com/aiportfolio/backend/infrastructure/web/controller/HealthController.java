package com.aiportfolio.backend.infrastructure.web.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.debug("Health check endpoint called");
        
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "ai-portfolio-backend");
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        log.debug("Root endpoint called");
        
        Map<String, Object> info = new HashMap<>();
        info.put("service", "AI Portfolio Backend");
        info.put("status", "running");
        info.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(info);
    }
}