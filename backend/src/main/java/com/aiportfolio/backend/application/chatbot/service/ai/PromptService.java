package com.aiportfolio.backend.application.chatbot.service.ai;

import com.aiportfolio.backend.domain.chatbot.port.out.PromptPort;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/**
 * JSON 파일 기반 프롬프트 서비스
 * 헥사고날 아키텍처의 Application Service - PromptPort 구현체
 */
@Slf4j
@Service
public class PromptService implements PromptPort {
    
    private JsonNode prompts;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private boolean loaded = false;
    
    @PostConstruct
    public void init() {
        reloadPrompts();
    }
    
    @Override
    public String getSystemPrompt() {
        if (!isLoaded()) {
            log.warn("프롬프트가 로드되지 않음 - 기본 시스템 프롬프트 반환");
            return getDefaultSystemPrompt();
        }
        
        try {
            JsonNode systemPromptNode = prompts.path("system_prompt");
            if (systemPromptNode.isMissingNode()) {
                log.warn("system_prompt 키를 찾을 수 없음 - 기본 프롬프트 사용");
                return getDefaultSystemPrompt();
            }
            
            return systemPromptNode.asText();
            
        } catch (Exception e) {
            log.error("시스템 프롬프트 로드 중 오류", e);
            return getDefaultSystemPrompt();
        }
    }
    
    @Override
    public String getPromptTemplate(String key) {
        if (!isLoaded()) {
            log.warn("프롬프트가 로드되지 않음 - 빈 템플릿 반환");
            return "";
        }
        
        try {
            JsonNode templateNode = prompts.path("templates").path(key);
            if (templateNode.isMissingNode()) {
                log.warn("프롬프트 템플릿 키 '{}' 을 찾을 수 없음", key);
                return "";
            }
            
            return templateNode.asText();
            
        } catch (Exception e) {
            log.error("프롬프트 템플릿 '{}' 로드 중 오류", key, e);
            return "";
        }
    }
    
    @Override
    public String renderPrompt(String template, Map<String, String> variables) {
        if (template == null || template.isEmpty()) {
            return "";
        }
        
        String rendered = template;
        
        // 간단한 변수 치환 ({{variable}} 형식)
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue() : "";
            rendered = rendered.replace(placeholder, value);
        }
        
        return rendered;
    }
    
    @Override
    public void reloadPrompts() {
        try {
            log.info("프롬프트 데이터 로드 시작");
            ClassPathResource resource = new ClassPathResource("prompts/chatbot-prompts.json");
            
            try (InputStream inputStream = resource.getInputStream()) {
                this.prompts = objectMapper.readTree(inputStream);
                this.loaded = true;
                log.info("프롬프트 데이터 로드 완료");
            }
            
        } catch (IOException e) {
            log.error("프롬프트 파일 로드 실패", e);
            this.loaded = false;
        }
    }
    
    @Override
    public boolean isLoaded() {
        return loaded && prompts != null;
    }
    
    /**
     * 기본 시스템 프롬프트 (fallback)
     */
    private String getDefaultSystemPrompt() {
        return "당신은 개발자 포트폴리오를 소개하는 AI 어시스턴트입니다. " +
               "프로젝트에 대해 친근하고 전문적으로 답변해주세요.";
    }
}