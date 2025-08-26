package com.aiportfolio.backend.application.chatbot;

import com.aiportfolio.backend.domain.chatbot.port.in.ChatUseCase;
import com.aiportfolio.backend.domain.chatbot.model.ChatRequest;
import com.aiportfolio.backend.domain.chatbot.model.ChatResponse;
import com.aiportfolio.backend.domain.chatbot.model.enums.ChatResponseType;
import com.aiportfolio.backend.infrastructure.external.aiservice.AIServiceClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 채팅 관련 Application Service
 * AI-Service로 모든 AI 기능을 위임하는 프록시 역할
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatApplicationService implements ChatUseCase {
    
    private final AIServiceClient aiServiceClient;
    
    @Override
    public ChatResponse processQuestion(ChatRequest request) {
        String question = request.getQuestion();
        String userContext = request.getUserContext();
        String userId = request.getUserId();
        
        log.info("채팅 요청 처리 - AI Service로 전달: 질문='{}', 컨텍스트='{}'", question, userContext);
        
        try {
            // AI-Service 사용 가능 여부 확인
            if (!aiServiceClient.isHealthy()) {
                log.warn("AI-Service를 사용할 수 없습니다");
                return createUnavailableResponse();
            }
            
            // AI-Service에 요청 전달
            var aiResponse = aiServiceClient.askQuestion(question, userContext, userId);
            
            log.info("AI-Service 응답 수신 - 응답 길이: {} 문자, 신뢰도: {}", 
                    aiResponse.getAnswer().length(), aiResponse.getConfidence());
            
            return ChatResponse.success(aiResponse.getAnswer(), ChatResponseType.SUCCESS).build();
            
        } catch (Exception e) {
            log.error("AI-Service 호출 중 오류 발생", e);
            return ChatResponse.error("죄송합니다. 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.").build();
        }
    }
    
    @Override
    public Object getChatUsageStatus() {
        // 사용량 상태 조회 (추후 AI-Service에서 제공 예정)
        Map<String, Object> status = new HashMap<>();
        status.put("dailyCount", 0);
        status.put("hourlyCount", 0);
        status.put("timeUntilReset", 0);
        status.put("isBlocked", false);
        return status;
    }
    
    @Override
    public String healthCheck() {
        try {
            if (aiServiceClient.isHealthy()) {
                return "OK";
            } else {
                return "AI_SERVICE_UNAVAILABLE";
            }
        } catch (Exception e) {
            log.error("AI-Service 헬스 체크 실패", e);
            return "AI_SERVICE_ERROR";
        }
    }
    
    private ChatResponse createUnavailableResponse() {
        return ChatResponse.success(
            "죄송합니다. 현재 AI 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.",
            ChatResponseType.SUCCESS
        ).build();
    }
}