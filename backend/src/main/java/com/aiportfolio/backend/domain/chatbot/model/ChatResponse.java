package com.aiportfolio.backend.domain.chatbot.model;

import com.aiportfolio.backend.domain.chatbot.model.enums.ChatResponseType;

import java.time.LocalDateTime;

/**
 * 채팅 응답 도메인 모델
 */
public class ChatResponse {
    private final String response;
    private final ChatResponseType type;
    private final String context;
    private final LocalDateTime timestamp;
    private final boolean success;
    private final String errorMessage;
    
    private ChatResponse(Builder builder) {
        this.response = builder.response;
        this.type = builder.type;
        this.context = builder.context;
        this.timestamp = builder.timestamp != null ? builder.timestamp : LocalDateTime.now();
        this.success = builder.success;
        this.errorMessage = builder.errorMessage;
    }
    
    public static Builder success(String response, ChatResponseType type) {
        return new Builder()
                .response(response)
                .type(type)
                .success(true);
    }
    
    public static Builder error(String errorMessage) {
        return new Builder()
                .response("죄송합니다. 일시적인 오류가 발생했습니다.")
                .type(ChatResponseType.ERROR)
                .success(false)
                .errorMessage(errorMessage);
    }
    
    public String getResponse() {
        return response;
    }
    
    public ChatResponseType getType() {
        return type;
    }
    
    public String getContext() {
        return context;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public static class Builder {
        private String response;
        private ChatResponseType type;
        private String context;
        private LocalDateTime timestamp;
        private boolean success;
        private String errorMessage;
        
        public Builder response(String response) {
            this.response = response;
            return this;
        }
        
        public Builder type(ChatResponseType type) {
            this.type = type;
            return this;
        }
        
        public Builder context(String context) {
            this.context = context;
            return this;
        }
        
        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }
        
        public Builder success(boolean success) {
            this.success = success;
            return this;
        }
        
        public Builder errorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
            return this;
        }
        
        public ChatResponse build() {
            return new ChatResponse(this);
        }
    }
}