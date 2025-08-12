package com.aiportfolio.backend.domain.chat;

import com.aiportfolio.backend.domain.portfolio.ProjectRepository;
import com.aiportfolio.backend.model.Project;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 채팅 도메인의 핵심 비즈니스 로직
 * 의존성 역전을 통해 포트 인터페이스에만 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final LLMPort llmPort;
    private final PromptPort promptPort;
    private final QuestionAnalysisPort questionAnalysisPort;
    private final ProjectRepository projectRepository;
    
    /**
     * 사용자 질문에 대한 챗봇 응답을 생성합니다
     * 
     * @param question 사용자 질문
     * @param selectedProject 선택된 프로젝트 (옵션)
     * @return 챗봇 응답
     */
    public String getChatbotResponse(String question, String selectedProject) {
        log.info("채팅 요청 - 질문: '{}', 선택 프로젝트: '{}'", question, selectedProject);
        
        // 1. LLM 사용 가능 여부 확인
        if (!llmPort.isAvailable()) {
            log.warn("LLM을 사용할 수 없습니다");
            return createUnavailableResponse();
        }
        
        try {
            // 2. 질문 분석
            QuestionAnalysisPort.AnalysisResult analysis = questionAnalysisPort.analyzeQuestion(question);
            log.debug("질문 분석 결과: 타입={}, AI 사용={}", analysis.getType(), analysis.shouldUseAI());
            
            // 3. 즉시 응답이 있는 경우
            if (analysis.getImmediateResponse() != null) {
                return analysis.getImmediateResponse();
            }
            
            // 4. AI 응답이 필요하지 않은 경우
            if (!analysis.shouldUseAI()) {
                return createStandardResponse(analysis.getType());
            }
            
            // 5. 프로젝트 컨텍스트 생성
            String projectContext = generateProjectContext(selectedProject);
            
            // 6. 시스템 프롬프트 및 사용자 메시지 준비
            String systemPrompt = promptPort.getSystemPrompt();
            String userMessage = generateContextualPrompt(question, projectContext);
            
            // 7. LLM 호출 및 응답
            String response = llmPort.chat(systemPrompt, userMessage);
            
            log.info("챗봇 응답 생성 완료 (길이: {})", response.length());
            return response;
            
        } catch (LLMPort.LLMException e) {
            log.error("LLM 호출 중 오류 발생", e);
            return createErrorResponse();
        } catch (Exception e) {
            log.error("챗봇 응답 생성 중 예상치 못한 오류", e);
            return createErrorResponse();
        }
    }
    
    /**
     * 프로젝트 컨텍스트를 생성합니다
     */
    private String generateProjectContext(String selectedProject) {
        if (selectedProject == null || selectedProject.trim().isEmpty()) {
            return generateAllProjectsContext();
        }
        
        return generateSpecificProjectContext(selectedProject);
    }
    
    /**
     * 모든 프로젝트에 대한 컨텍스트를 생성합니다
     */
    private String generateAllProjectsContext() {
        List<Project> projects = projectRepository.findAllProjects();
        
        Map<String, String> variables = new HashMap<>();
        variables.put("projects", projects.stream()
                .map(this::formatProjectForContext)
                .collect(Collectors.joining("\\n\\n")));
        
        String template = promptPort.getPromptTemplate("all_projects_context");
        return promptPort.renderPrompt(template, variables);
    }
    
    /**
     * 특정 프로젝트에 대한 컨텍스트를 생성합니다
     */
    private String generateSpecificProjectContext(String projectTitle) {
        Project project = projectRepository.findProjectByTitle(projectTitle)
                .orElse(null);
        
        if (project == null) {
            log.warn("선택된 프로젝트를 찾을 수 없음: {}", projectTitle);
            return generateAllProjectsContext();
        }
        
        Map<String, String> variables = new HashMap<>();
        variables.put("project", formatProjectForContext(project));
        
        String template = promptPort.getPromptTemplate("specific_project_context");
        return promptPort.renderPrompt(template, variables);
    }
    
    /**
     * 컨텍스트용 프롬프트를 생성합니다
     */
    private String generateContextualPrompt(String question, String context) {
        Map<String, String> variables = new HashMap<>();
        variables.put("question", question);
        variables.put("context", context);
        
        String template = promptPort.getPromptTemplate("contextual_prompt");
        return promptPort.renderPrompt(template, variables);
    }
    
    /**
     * 프로젝트 정보를 컨텍스트 형식으로 포맷합니다
     */
    private String formatProjectForContext(Project project) {
        StringBuilder formatted = new StringBuilder();
        formatted.append("제목: ").append(project.getTitle()).append("\\n");
        formatted.append("설명: ").append(project.getDescription()).append("\\n");
        formatted.append("기술스택: ").append(String.join(", ", project.getTechnologies())).append("\\n");
        
        if (project.isTeam() && project.getMyContributions() != null) {
            formatted.append("팀 프로젝트 - 내 기여: ").append(String.join(", ", project.getMyContributions())).append("\\n");
        }
        
        if (project.getGithubUrl() != null) {
            formatted.append("GitHub: ").append(project.getGithubUrl()).append("\\n");
        }
        
        return formatted.toString();
    }
    
    // === 응답 생성 헬퍼 메서드들 ===
    
    private String createUnavailableResponse() {
        return "죄송합니다. 현재 AI 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.";
    }
    
    private String createErrorResponse() {
        return "죄송합니다. 응답 생성 중 오류가 발생했습니다. 다시 질문해주시면 도움을 드리겠습니다.";
    }
    
    private String createStandardResponse(QuestionAnalysisPort.QuestionType type) {
        return switch (type) {
            case PERSONAL_INFO -> "개인정보는 직접 문의해주세요. 우측 하단의 '문의하기' 버튼을 이용해주세요.";
            default -> "해당 질문에 대한 표준 응답을 준비 중입니다.";
        };
    }
}