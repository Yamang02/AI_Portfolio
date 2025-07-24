package com.aiportfolio.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class PromptService {
    
    private JsonNode prompts;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @PostConstruct
    public void init() {
        loadPrompts();
    }
    
    private void loadPrompts() {
        try {
            ClassPathResource resource = new ClassPathResource("prompts/chatbot-prompts.json");
            InputStream inputStream = resource.getInputStream();
            this.prompts = objectMapper.readTree(inputStream);
            log.info("프롬프트 로드 완료");
        } catch (IOException e) {
            log.error("프롬프트 파일 로드 실패", e);
            throw new RuntimeException("프롬프트 파일을 로드할 수 없습니다.", e);
        }
    }
    
    public String getSystemPrompt() {
        return prompts.get("system").get("main").asText();
    }
    
    public String getContextualPrompt(String type, Map<String, String> variables) {
        String promptTemplate = prompts.get("contextual").get(type).asText();
        return replaceVariables(promptTemplate, variables);
    }
    
    public List<String> getGeneralSkillPatterns() {
        JsonNode patterns = prompts.get("patterns").get("general_skill");
        return objectMapper.convertValue(patterns, List.class);
    }
    
    public List<String> getSpecificProjectPatterns() {
        JsonNode patterns = prompts.get("patterns").get("specific_project");
        return objectMapper.convertValue(patterns, List.class);
    }
    
    private String replaceVariables(String template, Map<String, String> variables) {
        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            result = result.replace("{" + entry.getKey() + "}", entry.getValue());
        }
        return result;
    }
    
    public void reloadPrompts() {
        loadPrompts();
        log.info("프롬프트 재로드 완료");
    }
} 