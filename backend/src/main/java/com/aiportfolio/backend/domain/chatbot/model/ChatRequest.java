package com.aiportfolio.backend.domain.chatbot.model;

/**
 * 채팅 요청 도메인 모델
 */
public class ChatRequest {
    private final String question;
    private final String userContext;
    private final String sessionId;
    
    public ChatRequest(String question, String userContext) {
        this.question = question;
        this.userContext = userContext;
        this.sessionId = null;
    }
    
    public ChatRequest(String question, String userContext, String sessionId) {
        this.question = question;
        this.userContext = userContext;
        this.sessionId = sessionId;
    }
    
    public String getQuestion() {
        return question;
    }
    
    public String getUserContext() {
        return userContext;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public boolean hasContext() {
        return userContext != null && !userContext.trim().isEmpty();
    }
    
    public boolean hasSession() {
        return sessionId != null && !sessionId.trim().isEmpty();
    }
}