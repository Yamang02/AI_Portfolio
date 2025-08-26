package com.aiportfolio.backend.infrastructure.external.aiservice;

import com.aiportfolio.backend.infrastructure.external.aiservice.dto.AIServiceChatRequest;
import com.aiportfolio.backend.infrastructure.external.aiservice.dto.AIServiceChatResponse;
import com.aiportfolio.backend.infrastructure.external.aiservice.dto.AIServiceHealthResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

/**
 * AI-Service와의 통신을 담당하는 클라이언트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AIServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${app.ai-service.url:http://localhost:8081}")
    private String aiServiceUrl;
    
    @Value("${app.ai-service.timeout:30000}")
    private int timeout;
    
    /**
     * AI-Service에 질문을 전달하고 응답을 받습니다
     */
    public AIServiceChatResponse askQuestion(String question, String userContext, String userId) {
        try {
            String url = aiServiceUrl + "/api/v1/chat/ask";
            
            AIServiceChatRequest request = new AIServiceChatRequest();
            request.setQuestion(question);
            request.setUserContext(userContext);
            request.setUserId(userId);
            
            log.debug("AI-Service 요청 전송: {} - 질문: '{}'", url, question);
            
            AIServiceChatResponse response = restTemplate.postForObject(url, request, AIServiceChatResponse.class);
            
            if (response != null) {
                log.debug("AI-Service 응답 수신: 타입={}, 신뢰도={}", response.getQuestionType(), response.getConfidence());
                return response;
            } else {
                throw new RuntimeException("AI-Service로부터 응답을 받지 못했습니다");
            }
            
        } catch (ResourceAccessException e) {
            log.error("AI-Service 연결 실패: {}", e.getMessage());
            throw new RuntimeException("AI-Service에 연결할 수 없습니다", e);
        } catch (Exception e) {
            log.error("AI-Service 호출 중 오류 발생", e);
            throw new RuntimeException("AI-Service 호출 실패", e);
        }
    }
    
    /**
     * AI-Service의 상태를 확인합니다
     */
    public boolean isHealthy() {
        try {
            String url = aiServiceUrl + "/api/v1/chat/health";
            
            AIServiceHealthResponse response = restTemplate.getForObject(url, AIServiceHealthResponse.class);
            
            if (response != null) {
                boolean isHealthy = "healthy".equals(response.getStatus());
                log.debug("AI-Service 헬스체크: {}", isHealthy ? "정상" : "비정상");
                return isHealthy;
            }
            
            return false;
            
        } catch (Exception e) {
            log.warn("AI-Service 헬스체크 실패: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 일반 서비스 헬스체크
     */
    public boolean isServiceAvailable() {
        try {
            String url = aiServiceUrl + "/health";
            
            var response = restTemplate.getForObject(url, Object.class);
            return response != null;
            
        } catch (Exception e) {
            log.warn("AI-Service 기본 헬스체크 실패: {}", e.getMessage());
            return false;
        }
    }
}