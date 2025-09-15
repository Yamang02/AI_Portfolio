package com.aiportfolio.backend.domain.chatbot.model.exception;

/**
 * LLM 관련 예외 클래스
 */
public class LLMException extends Exception {
    public LLMException(String message) {
        super(message);
    }
    
    public LLMException(String message, Throwable cause) {
        super(message, cause);
    }
}