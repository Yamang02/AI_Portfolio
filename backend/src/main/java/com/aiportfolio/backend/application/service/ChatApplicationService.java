package com.aiportfolio.backend.application.service;

import com.aiportfolio.backend.domain.port.in.ChatUseCase;
import com.aiportfolio.backend.domain.port.out.ProjectRepositoryPort;
import com.aiportfolio.backend.domain.port.out.AIServicePort;
import com.aiportfolio.backend.domain.port.out.LLMPort;
import com.aiportfolio.backend.domain.port.out.PromptPort;
import com.aiportfolio.backend.domain.port.out.QuestionAnalysisPort;
import com.aiportfolio.backend.infrastructure.web.dto.chat.ChatRequestDto;
import com.aiportfolio.backend.infrastructure.web.dto.chat.ChatResponseDto;
import com.aiportfolio.backend.domain.model.Project;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 채팅 관련 Application Service
 * ChatUseCase를 구현하는 헥사고날 아키텍처의 Application Layer
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatApplicationService implements ChatUseCase {
    
    private final AIServicePort aiServicePort;
    private final QuestionAnalysisPort questionAnalysisPort;
    private final ProjectRepositoryPort projectRepositoryPort;
    
    @Override
    public ChatResponseDto processQuestion(ChatRequestDto request) {
        String question = request.getQuestion();
        String selectedProject = request.getSelectedProject();
        
        log.info("채팅 요청 처리 - 질문: '{}', 선택 프로젝트: '{}'", question, selectedProject);
        
        // 1. AI 서비스 사용 가능 여부 확인
        if (!aiServicePort.isAvailable()) {
            log.warn("AI 서비스를 사용할 수 없습니다");
            return createUnavailableResponse();
        }
        
        try {
            // 2. 질문 분석
            QuestionAnalysisPort.AnalysisResult analysis = questionAnalysisPort.analyzeQuestion(question);
            log.debug("질문 분석 결과: 타입={}, AI 사용={}", analysis.getType(), analysis.shouldUseAI());
            
            // 3. 즉시 응답이 있는 경우
            if (analysis.getImmediateResponse() != null) {
                log.debug("즉시 응답 반환: {}", analysis.getImmediateResponse());
                return createSuccessResponse(analysis.getImmediateResponse());
            }
            
            // 4. AI를 사용하지 않는 경우
            if (!analysis.shouldUseAI()) {
                log.debug("AI 사용 안함 - 표준 응답 반환");
                return createSuccessResponse("해당 질문에 대한 표준 응답을 준비 중입니다.");
            }
            
            // 5. 컨텍스트 생성
            String context = buildContext(selectedProject);
            
            // 6. AI 서비스 호출
            String response = aiServicePort.generateResponse(question, context);
            log.info("AI 응답 생성 완료 - 응답 길이: {} 문자", response.length());
            
            return createSuccessResponse(response);
            
        } catch (Exception e) {
            log.error("채팅 처리 중 오류 발생", e);
            return createErrorResponse("죄송합니다. 처리 중 오류가 발생했습니다.");
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
            List<Project> projects = projectRepositoryPort.findAllProjects();
            
            if (selectedProject != null && !selectedProject.trim().isEmpty()) {
                // 특정 프로젝트가 선택된 경우
                return projects.stream()
                        .filter(p -> p.getTitle().equals(selectedProject))
                        .findFirst()
                        .map(this::formatProjectForContext)
                        .orElse(formatAllProjectsForContext(projects));
            } else {
                // 모든 프로젝트 컨텍스트
                return formatAllProjectsForContext(projects);
            }
        } catch (Exception e) {
            log.error("컨텍스트 생성 중 오류 발생", e);
            return "포트폴리오 정보를 불러올 수 없습니다.";
        }
    }
    
    private String formatProjectForContext(Project project) {
        StringBuilder sb = new StringBuilder();
        sb.append("프로젝트: ").append(project.getTitle()).append("\n");
        sb.append("설명: ").append(project.getDescription()).append("\n");
        sb.append("기술스택: ").append(String.join(", ", project.getTechnologies())).append("\n");
        if (project.getMyContributions() != null && !project.getMyContributions().isEmpty()) {
            sb.append("주요 기여: ").append(String.join(", ", project.getMyContributions())).append("\n");
        }
        return sb.toString();
    }
    
    private String formatAllProjectsForContext(List<Project> projects) {
        return projects.stream()
                .map(this::formatProjectForContext)
                .collect(Collectors.joining("\n---\n"));
    }
    
    private ChatResponseDto createUnavailableResponse() {
        return ChatResponseDto.builder()
                .response("죄송합니다. 현재 AI 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.")
                .success(true)
                .showEmailButton(false)
                .responseType(ChatResponseDto.ResponseType.SUCCESS)
                .build();
    }
    
    private ChatResponseDto createSuccessResponse(String message) {
        return ChatResponseDto.builder()
                .response(message)
                .success(true)
                .showEmailButton(false)
                .responseType(ChatResponseDto.ResponseType.SUCCESS)
                .build();
    }
    
    private ChatResponseDto createErrorResponse(String message) {
        return ChatResponseDto.builder()
                .response(message)
                .success(false)
                .showEmailButton(false)
                .responseType(ChatResponseDto.ResponseType.SYSTEM_ERROR)
                .build();
    }
}