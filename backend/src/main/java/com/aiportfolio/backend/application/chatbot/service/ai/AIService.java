package com.aiportfolio.backend.application.chatbot.service.ai;

import com.aiportfolio.backend.domain.chatbot.port.out.AIServicePort;
import com.aiportfolio.backend.domain.chatbot.port.out.LLMPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * AI 관련 비즈니스 로직 서비스
 * 헥사고날 아키텍처의 Application Service - AIServicePort 구현체
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIService implements AIServicePort {
    
    private final LLMPort llmPort;
    
    @Override
    public String generateResponse(String question, String context) {
        if (!isAvailable()) {
            throw new RuntimeException("AI 서비스를 사용할 수 없습니다");
        }
        
        try {
            String prompt = buildPrompt(question, context);
            return llmPort.chat("", prompt); // systemPrompt는 빈 문자열로 처리
        } catch (Exception e) {
            log.error("AI 응답 생성 중 오류 발생", e);
            throw new RuntimeException("AI 응답 생성 실패", e);
        }
    }
    
    @Override
    public boolean isAvailable() {
        return llmPort != null && llmPort.isAvailable();
    }
    
    /**
     * 프롬프트를 구성합니다
     */
    private String buildPrompt(String question, String context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("다음은 개발자 포트폴리오에 대한 정보입니다:\n\n");
        prompt.append(context);
        prompt.append("\n\n사용자 질문: ").append(question);
        prompt.append("\n\n위 포트폴리오 정보를 바탕으로 친근하고 전문적인 답변을 해주세요.");
        return prompt.toString();
    }
}