package com.aiportfolio.backend.application.common;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class PromptConverter {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Markdown 파일을 JSON으로 변환
     */
    public void convertMarkdownToJson() {
        try {
            String mdContent = readMarkdownFile();
            Map<String, Object> jsonData = parseMarkdown(mdContent);
            writeJsonFile(jsonData);
            log.info("Markdown을 JSON으로 변환 완료");
        } catch (Exception e) {
            log.error("Markdown 변환 중 오류 발생", e);
            throw new RuntimeException("Markdown 변환 실패", e);
        }
    }
    
    /**
     * Markdown 파일 읽기
     */
    private String readMarkdownFile() throws IOException {
        ClassPathResource resource = new ClassPathResource("prompts/chatbot-prompts.md");
        return new String(Files.readAllBytes(resource.getFile().toPath()), "UTF-8");
    }
    
    /**
     * Markdown 파싱
     */
    private Map<String, Object> parseMarkdown(String mdContent) {
        ObjectNode jsonData = objectMapper.createObjectNode();
        
        // 시스템 프롬프트 추출
        String systemPrompt = extractSystemPrompt(mdContent);
        ObjectNode systemNode = objectMapper.createObjectNode();
        systemNode.put("main", systemPrompt);
        jsonData.set("system", systemNode);
        
        // 컨텍스트 프롬프트 추출
        ObjectNode contextualNode = objectMapper.createObjectNode();
        Map<String, String> contextualPrompts = extractContextualPrompts(mdContent);
        for (Map.Entry<String, String> entry : contextualPrompts.entrySet()) {
            contextualNode.put(entry.getKey(), entry.getValue());
        }
        jsonData.set("contextual", contextualNode);
        
        // 패턴 추출
        ObjectNode patternsNode = objectMapper.createObjectNode();
        Map<String, List<String>> patterns = extractPatterns(mdContent);
        for (Map.Entry<String, List<String>> entry : patterns.entrySet()) {
            patternsNode.set(entry.getKey(), objectMapper.valueToTree(entry.getValue()));
        }
        jsonData.set("patterns", patternsNode);
        
        return objectMapper.convertValue(jsonData, Map.class);
    }
    
    /**
     * 시스템 프롬프트 추출
     */
    private String extractSystemPrompt(String mdContent) {
        Pattern pattern = Pattern.compile(
            "## 🎯 시스템 프롬프트\\s*\\n\\n(.*?)(?=\\n---\\n|## 💬 컨텍스트 프롬프트)",
            Pattern.DOTALL
        );
        
        Matcher matcher = pattern.matcher(mdContent);
        if (!matcher.find()) {
            return "";
        }
        
        String content = matcher.group(1);
        List<String> sections = new ArrayList<>();
        
        // 각 섹션 추출
        extractSection(content, "### 기본 역할 및 성격", sections);
        extractSection(content, "### 응답 규칙", sections);
        extractSection(content, "### 답변 상세도 조절 가이드", sections);
        extractSection(content, "### 응답 형식", sections);
        extractSection(content, "### 금지사항", sections);
        
        return String.join("\n\n", sections);
    }
    
    /**
     * 섹션 추출 헬퍼 메서드
     */
    private void extractSection(String content, String sectionName, List<String> sections) {
        Pattern pattern = Pattern.compile(
            sectionName + "\\s*\\n(.*?)(?=\\n### |$)",
            Pattern.DOTALL
        );
        
        Matcher matcher = pattern.matcher(content);
        if (matcher.find()) {
            sections.add(matcher.group(1).trim());
        }
    }
    
    /**
     * 컨텍스트 프롬프트 추출
     */
    private Map<String, String> extractContextualPrompts(String mdContent) {
        Map<String, String> prompts = new java.util.HashMap<>();
        
        // 각 컨텍스트 프롬프트 섹션 찾기
        Pattern pattern = Pattern.compile(
            "### ([🔧⚙️📋⚖️🎯🌟]+\\s+[^(]+)\\s*\\(([^)]+)\\)\\s*\\n\\n\\*\\*사용 시기\\*\\*: ([^\\n]+)\\s*\\n\\n\\*\\*프롬프트\\*\\*:\\s*\\n```\\s*\\n(.*?)\\s*\\n```",
            Pattern.DOTALL
        );
        
        Matcher matcher = pattern.matcher(mdContent);
        while (matcher.find()) {
            String iconAndName = matcher.group(1);
            String koreanName = matcher.group(2);
            String usage = matcher.group(3);
            String prompt = matcher.group(4);
            
            String promptType = determinePromptType(iconAndName, koreanName);
            if (promptType != null) {
                prompts.put(promptType, prompt.trim());
            }
        }
        
        return prompts;
    }
    
    /**
     * 프롬프트 타입 결정
     */
    private String determinePromptType(String iconAndName, String koreanName) {
        if (iconAndName.contains("General Skill") || koreanName.contains("전반적인 기술 스택")) {
            return "general_skill";
        } else if (iconAndName.contains("Technical") || koreanName.contains("기술적 세부사항")) {
            return "technical";
        } else if (iconAndName.contains("Overview") || koreanName.contains("프로젝트 개요")) {
            return "overview";
        } else if (iconAndName.contains("Comparison") || koreanName.contains("비교 분석")) {
            return "comparison";
        } else if (iconAndName.contains("Challenge") || koreanName.contains("도전과제")) {
            return "challenge";
        } else if (iconAndName.contains("General") || koreanName.contains("일반 질문")) {
            return "general";
        }
        return null;
    }
    
    /**
     * 패턴 추출
     */
    private Map<String, List<String>> extractPatterns(String mdContent) {
        Map<String, List<String>> patterns = new java.util.HashMap<>();
        
        // General Skill 패턴
        Pattern generalSkillPattern = Pattern.compile(
            "### General Skill 패턴\\s*\\n전반적인 기술 스택 질문을 감지하는 패턴들:\\s*\\n\\n```\\s*\\n(.*?)\\s*\\n```",
            Pattern.DOTALL
        );
        
        Matcher generalSkillMatcher = generalSkillPattern.matcher(mdContent);
        if (generalSkillMatcher.find()) {
            List<String> generalSkillPatterns = new ArrayList<>();
            String[] patternsArray = generalSkillMatcher.group(1).split(",");
            for (String pattern : patternsArray) {
                generalSkillPatterns.add(pattern.trim());
            }
            patterns.put("general_skill", generalSkillPatterns);
        }
        
        // Specific Project 패턴
        Pattern specificProjectPattern = Pattern.compile(
            "### Specific Project 패턴\\s*\\n특정 프로젝트에 대한 질문을 감지하는 패턴들:\\s*\\n\\n```\\s*\\n(.*?)\\s*\\n```",
            Pattern.DOTALL
        );
        
        Matcher specificProjectMatcher = specificProjectPattern.matcher(mdContent);
        if (specificProjectMatcher.find()) {
            List<String> specificProjectPatterns = new ArrayList<>();
            String[] patternsArray = specificProjectMatcher.group(1).split(",");
            for (String pattern : patternsArray) {
                specificProjectPatterns.add(pattern.trim());
            }
            patterns.put("specific_project", specificProjectPatterns);
        }
        
        return patterns;
    }
    
    /**
     * JSON 파일 쓰기
     */
    private void writeJsonFile(Map<String, Object> jsonData) throws IOException {
        ClassPathResource resource = new ClassPathResource("prompts/chatbot-prompts.json");
        Path jsonPath = Paths.get(resource.getFile().getAbsolutePath());
        
        String jsonString = objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(jsonData);
        
        Files.write(jsonPath, jsonString.getBytes("UTF-8"));
    }
} 