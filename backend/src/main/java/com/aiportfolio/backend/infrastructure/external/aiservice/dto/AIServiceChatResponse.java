package com.aiportfolio.backend.infrastructure.external.aiservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * AI-Service 채팅 응답 DTO
 */
@Data
public class AIServiceChatResponse {
    
    @JsonProperty("answer")
    private String answer;
    
    @JsonProperty("confidence") 
    private double confidence;
    
    @JsonProperty("processing_time")
    private double processingTime;
    
    @JsonProperty("question_type")
    private String questionType;
    
    @JsonProperty("sources")
    private List<String> sources;
    
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
}