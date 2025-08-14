package com.aiportfolio.backend.application.chatbot;

import com.aiportfolio.backend.domain.chatbot.port.in.ChatUseCase;
import com.aiportfolio.backend.domain.chatbot.port.out.AIServicePort;
import com.aiportfolio.backend.domain.chatbot.port.out.ContextBuilderPort;
import com.aiportfolio.backend.application.chatbot.service.analysis.QuestionAnalysisService;
import com.aiportfolio.backend.domain.chatbot.model.ChatRequest;
import com.aiportfolio.backend.domain.chatbot.model.ChatResponse;
import com.aiportfolio.backend.domain.chatbot.model.enums.ChatResponseType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 채팅 관련 Application Service
 * ChatUseCase를 구현하는 헥사고날 아키텍처의 Application Layer
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatApplicationService implements ChatUseCase {
    
    private final AIServicePort aiServicePort;
    private final QuestionAnalysisService questionAnalysisService;
    private final ContextBuilderPort contextBuilderPort;
    
    @Override
    public ChatResponse processQuestion(ChatRequest request) {
        String question = request.getQuestion();
        String selectedProject = request.getUserContext();
        
        log.info("채팅 요청 처리 - 질문: '{}', 선택 프로젝트: '{}'", question, selectedProject);
        
        // 1. AI 서비스 사용 가능 여부 확인
        if (!aiServicePort.isAvailable()) {
            log.warn("AI 서비스를 사용할 수 없습니다");
            return createUnavailableResponse();
        }
        
        try {
            // 2. 질문 분석
            var analysis = questionAnalysisService.analyzeQuestion(question);
            log.debug("질문 분석 결과: 타입={}, AI 사용={}", analysis.getType(), analysis.shouldUseAI());
            
            // 3. 즉시 응답이 있는 경우
            if (analysis.getImmediateResponse() != null) {
                log.debug("즉시 응답 반환: {}", analysis.getImmediateResponse());
                return ChatResponse.success(analysis.getImmediateResponse(), ChatResponseType.SUCCESS).build();
            }
            
            // 4. AI를 사용하지 않는 경우
            if (!analysis.shouldUseAI()) {
                log.debug("AI 사용 안함 - 표준 응답 반환");
                return ChatResponse.success("해당 질문에 대한 표준 응답을 준비 중입니다.", ChatResponseType.SUCCESS).build();
            }
            
            // 5. 컨텍스트 생성
            String context = buildContext(selectedProject);
            
            // 6. AI 서비스 호출
            String response = aiServicePort.generateResponse(question, context);
            log.info("AI 응답 생성 완료 - 응답 길이: {} 문자", response.length());
            
            return ChatResponse.success(response, ChatResponseType.SUCCESS).build();
            
        } catch (Exception e) {
            log.error("채팅 처리 중 오류 발생", e);
            return ChatResponse.error("죄송합니다. 처리 중 오류가 발생했습니다.").build();
        }
    }
    
    @Override
    public Object getChatUsageStatus() {
        // 사용량 상태 조회 로직 (추후 구현)
        Map<String, Object> status = new HashMap<>();
        status.put("dailyCount", 0);
        status.put("hourlyCount", 0);
        status.put("timeUntilReset", 0);
        status.put("isBlocked", false);
        return status;
    }
    
    @Override
    public String healthCheck() {
        if (aiServicePort.isAvailable()) {
            return "OK";
        } else {
            return "AI_SERVICE_UNAVAILABLE";
        }
    }
    
    // === Private Helper Methods ===
    
    private String buildContext(String selectedProject) {
        try {
            if (!contextBuilderPort.isAvailable()) {
                log.warn("컨텍스트 빌더를 사용할 수 없습니다");
                return "포트폴리오 정보를 불러올 수 없습니다.";
            }
            
            if (selectedProject != null && !selectedProject.trim().isEmpty()) {
                // 특정 프로젝트가 선택된 경우
                return contextBuilderPort.buildProjectContext(selectedProject);
            } else {
                // 전체 포트폴리오 컨텍스트
                return contextBuilderPort.buildFullPortfolioContext();
            }
        } catch (Exception e) {
            log.error("컨텍스트 생성 중 오류 발생", e);
            return "포트폴리오 정보를 불러올 수 없습니다.";
        }
    }
    
    private ChatResponse createUnavailableResponse() {
        return ChatResponse.success(
            "죄송합니다. 현재 AI 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.",
            ChatResponseType.SUCCESS
        ).build();
    }
}