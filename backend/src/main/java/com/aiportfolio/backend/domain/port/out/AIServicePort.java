package com.aiportfolio.backend.domain.port.out;

/**
 * AI 서비스 접근을 위한 Port
 * Secondary Port (아웃바운드 포트)
 */
public interface AIServicePort {
    
    /**
     * AI 모델에게 질문하고 응답을 받습니다
     */
    String generateResponse(String question, String context);
    
    /**
     * AI 서비스가 사용 가능한지 확인합니다
     */
    boolean isAvailable();
}