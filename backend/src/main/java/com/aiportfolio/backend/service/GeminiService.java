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
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {
    
    private final AppConfig appConfig;
    private final ProjectService projectService;
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
            String systemPrompt = generateSystemPrompt(projectContext);
            String contextualPrompt = generateContextualPrompt(question, projectContext);
            
            String fullPrompt = contextualPrompt + "\n\n사용자 질문: \"" + question + "\"";
            
            String prompt = systemPrompt + "\n\n--- 프로젝트 컨텍스트 시작 ---\n\n" + projectContext + "\n\n--- 프로젝트 컨텍스트 끝 ---\n\n" + fullPrompt;
            String answer = geminiModel.chat(prompt);
            return (answer != null && !answer.trim().isEmpty()) ? answer : "I_CANNOT_ANSWER";
            
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
        return "당신은 개발자 포트폴리오를 위한 AI 비서입니다. 다음 지침을 엄격히 따라주세요:\n\n" +
               "## 역할 및 성격\n" +
               "- 친근하고 전문적인 톤을 유지하세요\n" +
               "- 개발자와 비개발자 모두가 이해할 수 있도록 설명하세요\n" +
               "- 기술적 세부사항과 비즈니스 가치를 균형있게 설명하세요\n" +
               "- 한국어로 응답하세요\n\n" +
               "## 응답 규칙\n" +
               "1. **프로젝트 범위 제한**: 제공된 프로젝트 정보에서만 응답하세요\n" +
               "2. **정보 출처**: 제공된 프로젝트 컨텍스트에서만 정보를 사용하세요\n" +
               "3. **추측 금지**: 확실하지 않은 정보는 언급하지 마세요\n" +
               "4. **보안**: 개인정보나 민감한 정보는 공유하지 마세요\n" +
               "5. **팀/개인 구분**: 프로젝트 설명 시 반드시 개인/팀 여부를 명확히 구분해서 안내하세요\n\n" +
               "## 응답 형식\n" +
               "- 간결하고 명확하게 답변하세요\n" +
               "- 필요시 불릿 포인트를 사용하세요\n" +
               "- 기술 스택, 기능, 결과를 포함하세요\n" +
               "- 반드시 팀/개인 구분 및 내 기여(팀 프로젝트의 경우)를 명시하세요\n" +
               "- 사용자가 추가 질문을 할 수 있도록 유도하세요\n\n" +
               "## 금지사항\n" +
               "- 개인정보나 민감한 정보 공유\n" +
               "- 추측이나 확실하지 않은 정보 제공\n" +
               "- 다른 개발자나 회사에 대한 부정적 언급";
    }
    
    private String generateContextualPrompt(String question, String projectContext) {
        String questionType = analyzeQuestionType(question);
        
        switch (questionType) {
            case "technical":
                return generateTechnicalPrompt(question, projectContext);
            case "overview":
                return generateOverviewPrompt(question, projectContext);
            case "comparison":
                return generateComparisonPrompt(question, projectContext);
            case "challenge":
                return generateChallengePrompt(question, projectContext);
            default:
                return generateGeneralPrompt(question, projectContext);
        }
    }
    
    private String analyzeQuestionType(String question) {
        String lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.contains("기술") || lowerQuestion.contains("tech") || 
            lowerQuestion.contains("언어") || lowerQuestion.contains("프레임워크") ||
            lowerQuestion.contains("라이브러리") || lowerQuestion.contains("도구")) {
            return "technical";
        }
        
        if (lowerQuestion.contains("개요") || lowerQuestion.contains("소개") || 
            lowerQuestion.contains("설명") || lowerQuestion.contains("뭐") ||
            lowerQuestion.contains("무엇")) {
            return "overview";
        }
        
        if (lowerQuestion.contains("비교") || lowerQuestion.contains("차이") || 
            lowerQuestion.contains("장단점") || lowerQuestion.contains("vs")) {
            return "comparison";
        }
        
        if (lowerQuestion.contains("어려움") || lowerQuestion.contains("문제") || 
            lowerQuestion.contains("도전") || lowerQuestion.contains("해결") ||
            lowerQuestion.contains("개선")) {
            return "challenge";
        }
        
        return "general";
    }
    
    private String generateTechnicalPrompt(String question, String projectContext) {
        return "다음 질문에 대해 기술적 세부사항을 중심으로 답변해주세요:\n\n" +
               "질문: \"" + question + "\"\n\n" +
               "프로젝트 정보:\n" + projectContext + "\n\n" +
               "답변 시 다음을 포함해주세요:\n" +
               "- 사용된 기술 스택의 구체적인 버전이나 특징\n" +
               "- 각 기술이 프로젝트에서 어떤 역할을 했는지\n" +
               "- 기술 선택의 이유나 장점\n" +
               "- 구현 과정에서의 기술적 고려사항";
    }
    
    private String generateOverviewPrompt(String question, String projectContext) {
        return "다음 질문에 대해 프로젝트의 전체적인 개요를 설명해주세요:\n\n" +
               "질문: \"" + question + "\"\n\n" +
               "프로젝트 정보:\n" + projectContext + "\n\n" +
               "답변 시 다음을 포함해주세요:\n" +
               "- 프로젝트의 목적과 배경\n" +
               "- 주요 기능과 특징\n" +
               "- 프로젝트의 규모와 기간\n" +
               "- 달성한 결과나 성과";
    }
    
    private String generateComparisonPrompt(String question, String projectContext) {
        return "다음 질문에 대해 비교 분석을 제공해주세요:\n\n" +
               "질문: \"" + question + "\"\n\n" +
               "프로젝트 정보:\n" + projectContext + "\n\n" +
               "답변 시 다음을 포함해주세요:\n" +
               "- 비교 대상과의 차이점\n" +
               "- 각각의 장단점\n" +
               "- 선택한 기술이나 방법의 이유\n" +
               "- 실제 적용 결과의 차이";
    }
    
    private String generateChallengePrompt(String question, String projectContext) {
        return "다음 질문에 대해 도전과제와 해결 과정을 설명해주세요:\n\n" +
               "질문: \"" + question + "\"\n\n" +
               "프로젝트 정보:\n" + projectContext + "\n\n" +
               "답변 시 다음을 포함해주세요:\n" +
               "- 직면한 주요 도전과제\n" +
               "- 문제 해결을 위한 접근 방법\n" +
               "- 시행착오와 학습 과정\n" +
               "- 최종 해결책과 그 효과";
    }
    
    private String generateGeneralPrompt(String question, String projectContext) {
        return "다음 질문에 대해 친근하고 이해하기 쉽게 답변해주세요:\n\n" +
               "질문: \"" + question + "\"\n\n" +
               "프로젝트 정보:\n" + projectContext + "\n\n" +
               "답변 시 다음을 고려해주세요:\n" +
               "- 질문의 의도를 정확히 파악\n" +
               "- 관련된 프로젝트 정보를 적절히 활용\n" +
               "- 명확하고 간결한 설명\n" +
               "- 추가 질문을 유도하는 친근한 톤";
    }
    
    // Request/Response DTOs
    // WebClient, GeminiRequest, GeminiResponse 관련 코드 및 필드 제거
} 