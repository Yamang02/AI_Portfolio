package com.aiportfolio.backend.infrastructure.ai;

import com.aiportfolio.backend.config.AppConfig;
import com.aiportfolio.backend.domain.chat.LLMPort;
import com.aiportfolio.backend.domain.port.out.AIServicePort;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Google Gemini LLM 어댑터
 * 헥사고날 아키텍처의 어댑터(Adapter) - LLMPort 구현체
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiLLMAdapter implements LLMPort, AIServicePort {
    
    private final AppConfig appConfig;
    
    @Value("${app.gemini.api-key}")
    private String apiKey;
    
    private GoogleAiGeminiChatModel geminiModel;
    
    @PostConstruct
    public void init() {
        try {
            log.info("Gemini LLM 어댑터 초기화 - 모델: {}", appConfig.getGemini().getModelName());
            
            this.geminiModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(appConfig.getGemini().getModelName())
                .build();
                
            log.info("Gemini LLM 어댑터 초기화 완료");
            
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
        return appConfig.getGemini().getModelName();
    }
    
    // === AIServicePort 구현 ===
    
    @Override
    public String generateResponse(String question, String context) {
        if (!isAvailable()) {
            throw new RuntimeException("Gemini AI 서비스를 사용할 수 없습니다");
        }
        
        try {
            String prompt = buildPrompt(question, context);
            return geminiModel.chat(prompt);
        } catch (Exception e) {
            log.error("Gemini AI 응답 생성 중 오류 발생", e);
            throw new RuntimeException("AI 응답 생성 실패", e);
        }
    }
    
    private String buildPrompt(String question, String context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("다음은 개발자 포트폴리오에 대한 정보입니다:\n\n");
        prompt.append(context);
        prompt.append("\n\n사용자 질문: ").append(question);
        prompt.append("\n\n위 포트폴리오 정보를 바탕으로 친근하고 전문적인 답변을 해주세요.");
        return prompt.toString();
    }
}