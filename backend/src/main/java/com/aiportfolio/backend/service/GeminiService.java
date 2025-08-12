package com.aiportfolio.backend.service;

import com.aiportfolio.backend.domain.chat.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Gemini 서비스 (레거시 호환성을 위한 Facade)
 * 실제 로직은 ChatService로 위임
 * 
 * @deprecated 새로운 코드에서는 ChatService를 직접 사용하세요
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Deprecated
public class GeminiService {
    
    private final ChatService chatService;
    
    /**
     * 챗봇 응답 생성 (ChatService로 위임)
     * 
     * @param question 사용자 질문
     * @param selectedProject 선택된 프로젝트
     * @return 챗봇 응답
     */
    public String getChatbotResponse(String question, String selectedProject) {
        log.debug("GeminiService를 통한 챗봇 요청 (ChatService로 위임)");
        return chatService.getChatbotResponse(question, selectedProject);
    }
} 