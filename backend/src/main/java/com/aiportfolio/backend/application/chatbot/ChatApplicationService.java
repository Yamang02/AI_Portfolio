package com.aiportfolio.backend.application.chatbot;

import com.aiportfolio.backend.domain.chatbot.port.in.ChatUseCase;
import com.aiportfolio.backend.domain.chatbot.port.out.LLMPort;
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
 * LLMPort를 통한 헥사고날 아키텍처로 AI 기능 처리 (운영 환경 즉시 사용 가능)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatApplicationService implements ChatUseCase {
    
    private final LLMPort llmPort;
    
    @Override
    public ChatResponse processQuestion(ChatRequest request) {
        String question = request.getQuestion();
        String userContext = request.getUserContext();
        String sessionId = request.getSessionId();
        
        log.info("채팅 요청 처리 - LLM 포트를 통한 처리: 질문='{}', 컨텍스트='{}', 세션='{}'", question, userContext, sessionId);
        
        try {
            // LLM 사용 가능 여부 확인
            if (!llmPort.isAvailable()) {
                log.warn("LLM을 사용할 수 없습니다");
                return createUnavailableResponse();
            }
            
            // 시스템 프롬프트 생성
            String systemPrompt = buildSystemPrompt();
            String userMessage = buildUserMessage(question, userContext);
            
            // LLM 호출
            String aiResponse = llmPort.chat(systemPrompt, userMessage);
            
            log.info("LLM 응답 수신 - 응답 길이: {} 문자", aiResponse.length());
            
            return ChatResponse.success(aiResponse, ChatResponseType.SUCCESS).build();
            
        } catch (LLMPort.LLMException e) {
            log.error("LLM 호출 중 오류 발생", e);
            return ChatResponse.error("죄송합니다. 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.").build();
        } catch (Exception e) {
            log.error("예상치 못한 오류 발생", e);
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
            if (llmPort.isAvailable()) {
                return "OK";
            } else {
                return "LLM_UNAVAILABLE";
            }
        } catch (Exception e) {
            log.error("LLM 헬스 체크 실패", e);
            return "LLM_ERROR";
        }
    }
    
    private ChatResponse createUnavailableResponse() {
        return ChatResponse.success(
            "죄송합니다. 현재 AI 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.",
            ChatResponseType.SUCCESS
        ).build();
    }
    
    /**
     * 시스템 프롬프트를 생성합니다
     */
    private String buildSystemPrompt() {
        return "당신은 개발자 포트폴리오 AI 어시스턴트입니다. " +
               "사용자의 질문에 대해 정확하고 도움이 되는 답변을 제공해주세요. " +
               "개발자의 프로젝트, 기술 스택, 경험에 대해 자세히 설명할 수 있어야 합니다.";
    }
    
    /**
     * 사용자 메시지를 생성합니다
     */
    private String buildUserMessage(String question, String context) {
        StringBuilder message = new StringBuilder();
        
        // 컨텍스트가 있는 경우 추가
        if (context != null && !context.trim().isEmpty()) {
            message.append("관련 프로젝트 정보:\n");
            message.append(context).append("\n\n");
        }
        
        // 사용자 질문
        message.append("질문: ").append(question);
        
        return message.toString();
    }
}