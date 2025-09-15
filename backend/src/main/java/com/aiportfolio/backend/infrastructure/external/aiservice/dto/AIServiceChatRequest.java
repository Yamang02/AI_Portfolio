package com.aiportfolio.backend.infrastructure.external.aiservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * AI-Service 채팅 요청 DTO
 */
@Data
public class AIServiceChatRequest {
    
    @JsonProperty("question")
    private String question;
    
    @JsonProperty("user_context") 
    private String userContext;
    
    @JsonProperty("user_id")
    private String userId;
}