package com.aiportfolio.backend.infrastructure.external.aiservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.Map;

/**
 * AI-Service 헬스 체크 응답 DTO
 */
@Data
public class AIServiceHealthResponse {
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("database")
    private String database;
    
    @JsonProperty("services")
    private Map<String, String> services;
}