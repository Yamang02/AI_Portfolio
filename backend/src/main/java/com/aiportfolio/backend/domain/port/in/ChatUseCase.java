package com.aiportfolio.backend.domain.port.in;

import com.aiportfolio.backend.model.ChatRequest;
import com.aiportfolio.backend.model.ChatResponse;

/**
 * 채팅 관련 Use Case
 * Primary Port (인바운드 포트)
 */
public interface ChatUseCase {
    
    /**
     * 사용자의 질문에 대한 AI 응답을 생성합니다
     */
    ChatResponse processQuestion(ChatRequest request);
    
    /**
     * 채팅 사용량 상태를 확인합니다
     */
    Object getChatUsageStatus();
    
    /**
     * 헬스 체크를 수행합니다
     */
    String healthCheck();
}