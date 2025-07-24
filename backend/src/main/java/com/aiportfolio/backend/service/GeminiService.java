package com.aiportfolio.backend.service;

import com.aiportfolio.backend.config.AppConfig;
import com.aiportfolio.backend.model.Project;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {
    
    private final AppConfig appConfig;
    private final ProjectService projectService;
    private final PromptService promptService;
    private final QuestionAnalysisService questionAnalysisService;
    @Value("${app.gemini.api-key}")
    private String apiKey;
    private GoogleAiGeminiChatModel geminiModel;

    @PostConstruct
    public void init() {

        log.info("Gemini Model Name: {}", appConfig.getGemini().getModelName());
        this.geminiModel = GoogleAiGeminiChatModel.builder()
            .apiKey(apiKey)
            .modelName(appConfig.getGemini().getModelName())
            .build();
    }
    
    
    public String getChatbotResponse(String question, String selectedProject) {
        if (appConfig.getGemini().getApiKey() == null || appConfig.getGemini().getApiKey().isEmpty()) {
            log.warn("GEMINI_API_KEY not configured");
            return "I_CANNOT_ANSWER";
        }
        
        try {
            String projectContext = generateProjectContext(selectedProject);
            String systemPrompt = promptService.getSystemPrompt();
            String contextualPrompt = generateContextualPrompt(question, projectContext);
            
            // 질문 타입에 따라 컨텍스트 정보 추가
            QuestionAnalysisService.QuestionAnalysisResult analysis = questionAnalysisService.analyzeQuestion(question);
            String questionType = mapQuestionTypeToPromptType(analysis.getType());
            String contextInfo = "";
            
            if (selectedProject != null && !selectedProject.isEmpty()) {
                contextInfo = "\n\n현재 선택된 프로젝트: " + selectedProject;
            }
            
            String fullPrompt = contextualPrompt + contextInfo + "\n\n사용자 질문: \"" + question + "\"";
            
            String prompt = systemPrompt + "\n\n--- 프로젝트 컨텍스트 시작 ---\n\n" + projectContext + "\n\n--- 프로젝트 컨텍스트 끝 ---\n\n" + fullPrompt;
            String answer = geminiModel.chat(prompt);
            return (answer != null && !answer.trim().isEmpty()) ? answer : null;
            
        } catch (Exception e) {
            log.error("Error in getChatbotResponse", e);
            return null;
        }
    }
    
    private String generateProjectContext(String selectedProject) {
        List<Project> projects = projectService.getAllProjects();
        
        if (selectedProject != null && !selectedProject.isEmpty()) {
            return projects.stream()
                    .filter(p -> p.getTitle().equals(selectedProject))
                    .findFirst()
                    .map(this::formatProjectContext)
                    .orElse(generateAllProjectsContext(projects));
        }
        
        return generateAllProjectsContext(projects);
    }
    
    private String generateAllProjectsContext(List<Project> projects) {
        return projects.stream()
                .map(this::formatProjectContext)
                .collect(Collectors.joining("\n\n"));
    }
    
    private String formatProjectContext(Project project) {
        StringBuilder context = new StringBuilder();
        context.append("프로젝트명: ").append(project.getTitle()).append("\n");
        context.append("설명: ").append(project.getDescription()).append("\n");
        context.append("팀 프로젝트: ").append(project.isTeam() ? "예" : "아니오").append("\n");
        
        if (project.isTeam()) {
            context.append("내 기여: 팀 프로젝트 참여\n");
        } else {
            context.append("내 기여: 전체 기획/개발\n");
        }
        
        context.append("사용 기술: ").append(String.join(", ", project.getTechnologies())).append("\n");
        
        if (project.getGithubUrl() != null) {
            context.append("GitHub 주소: ").append(project.getGithubUrl()).append("\n");
        }
        
        if (project.getLiveUrl() != null) {
            context.append("라이브 데모 주소: ").append(project.getLiveUrl()).append("\n");
        }
        
        if (project.getReadme() != null && !project.getReadme().trim().isEmpty()) {
            context.append("상세 정보:\n").append(project.getReadme()).append("\n");
        }
        
        return context.toString();
    }
    

    
    private String generateContextualPrompt(String question, String projectContext) {
        // QuestionAnalysisService를 사용하여 질문 타입 분석
        QuestionAnalysisService.QuestionAnalysisResult analysis = questionAnalysisService.analyzeQuestion(question);
        String questionType = mapQuestionTypeToPromptType(analysis.getType());
        
        Map<String, String> variables = Map.of(
            "question", question,
            "projectContext", projectContext
        );
        
        return promptService.getContextualPrompt(questionType, variables);
    }
    
    private String mapQuestionTypeToPromptType(QuestionAnalysisService.QuestionType type) {
        return switch (type) {
            case GENERAL_SKILL -> "general_skill";
            case TECHNICAL -> "technical";
            case OVERVIEW -> "overview";
            case COMPARISON -> "comparison";
            case CHALLENGE -> "challenge";
            case PROJECT -> "project";
            default -> "general";
        };
    }
    

    
    // Request/Response DTOs
    // WebClient, GeminiRequest, GeminiResponse 관련 코드 및 필드 제거
} 