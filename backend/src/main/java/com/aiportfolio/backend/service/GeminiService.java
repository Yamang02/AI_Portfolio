package com.aiportfolio.backend.service;

import com.aiportfolio.backend.config.AppConfig;
import com.aiportfolio.backend.model.Project;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {
    
    private final AppConfig appConfig;
    private final ProjectService projectService;
    private final WebClient.Builder webClientBuilder;
    
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";
    
    public String getChatbotResponse(String question, String selectedProject) {
        if (appConfig.getGemini().getApiKey() == null || appConfig.getGemini().getApiKey().isEmpty()) {
            log.warn("GEMINI_API_KEY not configured");
            return "I_CANNOT_ANSWER";
        }
        
        try {
            String projectContext = generateProjectContext(selectedProject);
            String systemPrompt = generateSystemPrompt(projectContext);
            String contextualPrompt = generateContextualPrompt(question, projectContext);
            
            String fullPrompt = contextualPrompt + "\n\n사용자 질문: \"" + question + "\"";
            
            GeminiRequest request = GeminiRequest.builder()
                    .contents(List.of(GeminiRequest.Content.builder()
                            .parts(List.of(GeminiRequest.Part.builder()
                                    .text(fullPrompt)
                                    .build()))
                            .build()))
                    .systemInstruction(systemPrompt + "\n\n--- 프로젝트 컨텍스트 시작 ---\n\n" + projectContext + "\n\n--- 프로젝트 컨텍스트 끝 ---")
                    .build();
            
            return callGeminiAPI(request);
            
        } catch (Exception e) {
            log.error("Error in getChatbotResponse", e);
            return "I_CANNOT_ANSWER";
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
    
    private String generateSystemPrompt(String projectContext) {
        return "당신은 AI 포트폴리오 웹사이트의 AI 어시스턴트입니다. " +
               "사용자의 질문에 대해 친근하고 전문적으로 답변해주세요. " +
               "프로젝트 정보를 바탕으로 정확하고 유용한 정보를 제공하세요.";
    }
    
    private String generateContextualPrompt(String question, String projectContext) {
        return "다음 프로젝트 정보를 바탕으로 사용자의 질문에 답변해주세요:\n\n" + projectContext;
    }
    
    private String callGeminiAPI(GeminiRequest request) {
        try {
            GeminiResponse response = webClientBuilder.build()
                    .post()
                    .uri(GEMINI_API_URL + "?key=" + appConfig.getGemini().getApiKey())
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GeminiResponse.class)
                    .timeout(java.time.Duration.ofSeconds(30))
                    .block();
            
            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                String text = response.getCandidates().get(0).getContent().getParts().get(0).getText();
                if (text != null && text.trim().length() >= 10) {
                    return text;
                }
            }
            
            log.error("Invalid response from Gemini API");
            return "I_CANNOT_ANSWER";
            
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "I_CANNOT_ANSWER";
        }
    }
    
    // Request/Response DTOs
    @lombok.Data
    @lombok.Builder
    public static class GeminiRequest {
        private List<Content> contents;
        private String systemInstruction;
        
        @lombok.Data
        @lombok.Builder
        public static class Content {
            private List<Part> parts;
        }
        
        @lombok.Data
        @lombok.Builder
        public static class Part {
            private String text;
        }
    }
    
    @lombok.Data
    public static class GeminiResponse {
        private List<Candidate> candidates;
        
        @lombok.Data
        public static class Candidate {
            private Content content;
        }
        
        @lombok.Data
        public static class Content {
            private List<Part> parts;
        }
        
        @lombok.Data
        public static class Part {
            private String text;
        }
    }
} 