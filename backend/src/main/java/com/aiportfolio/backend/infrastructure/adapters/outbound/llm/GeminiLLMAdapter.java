package com.aiportfolio.backend.infrastructure.adapters.outbound.llm;

import com.aiportfolio.backend.domain.chatbot.port.out.LLMPort;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Google Gemini LLM 어댑터
 * 헥사고날 아키텍처의 아웃바운드 어댑터(Outbound Adapter) - LLMPort 구현체
 */
@Slf4j
@Component
public class GeminiLLMAdapter implements LLMPort {
    
    @Value("${GEMINI_API_KEY:}")
    private String apiKey;
    
    private GoogleAiGeminiChatModel geminiModel;
    private static final String DEFAULT_MODEL_NAME = "gemini-2.0-flash-exp";
    
    @PostConstruct
    public void init() {
        try {
            log.info("Gemini LLM 어댑터 초기화 - 모델: {}", DEFAULT_MODEL_NAME);
            
            if (apiKey != null && !apiKey.trim().isEmpty()) {
                this.geminiModel = GoogleAiGeminiChatModel.builder()
                    .apiKey(apiKey)
                    .modelName(DEFAULT_MODEL_NAME)
                    .temperature(0.7)
                    .build();
                    
                log.info("Gemini LLM 어댑터 초기화 완료");
            } else {
                log.warn("GEMINI_API_KEY 환경변수가 설정되지 않았습니다");
            }
            
        } catch (Exception e) {
            log.error("Gemini LLM 어댑터 초기화 실패", e);
        }
    }
    
    @Override
    public String chat(String systemPrompt, String userMessage) throws LLMException {
        if (!isAvailable()) {
            throw new LLMException("Gemini LLM을 사용할 수 없습니다");
        }
        
        try {
            // 시스템 프롬프트와 사용자 메시지 결합
            String fullPrompt = systemPrompt + "\\n\\nUser: " + userMessage + "\\nAssistant:";
            
            log.debug("Gemini API 호출 시작 (메시지 길이: {})", fullPrompt.length());
            String response = geminiModel.chat(fullPrompt);
            log.debug("Gemini API 응답 수신 (응답 길이: {})", response.length());
            
            return response;
            
        } catch (Exception e) {
            String errorMessage = "Gemini API 호출 중 오류 발생: " + e.getMessage();
            log.error(errorMessage, e);
            throw new LLMException(errorMessage, e);
        }
    }
    
    @Override
    public boolean isAvailable() {
        return geminiModel != null 
               && apiKey != null 
               && !apiKey.trim().isEmpty()
               && !apiKey.equals("${GEMINI_API_KEY}"); // 환경변수 미설정 체크
    }
    
    @Override
    public String getModelName() {
        return DEFAULT_MODEL_NAME;
    }
}