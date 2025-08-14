package com.aiportfolio.backend.domain.chatbot.model;

/**
 * 채팅 요청 도메인 모델
 */
public class ChatRequest {
    private final String question;
    private final String userContext;
    
    public ChatRequest(String question, String userContext) {
        this.question = question;
        this.userContext = userContext;
    }
    
    public String getQuestion() {
        return question;
    }
    
    public String getUserContext() {
        return userContext;
    }
    
    public boolean hasContext() {
        return userContext != null && !userContext.trim().isEmpty();
    }
}