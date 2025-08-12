package com.aiportfolio.backend.infrastructure.ai;

import com.aiportfolio.backend.domain.chat.QuestionAnalysisPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * 규칙 기반 질문 분석 어댑터
 * 헥사고날 아키텍처의 어댑터(Adapter) - QuestionAnalysisPort 구현체
 */
@Slf4j
@Component
public class RuleBasedQuestionAnalysisAdapter implements QuestionAnalysisPort {
    
    // 개인정보 관련 키워드 패턴
    private static final List<Pattern> PERSONAL_INFO_PATTERNS = Arrays.asList(
        Pattern.compile("연락처|전화번호|이메일|주소|나이|생년월일", Pattern.CASE_INSENSITIVE),
        Pattern.compile("contact|phone|email|address|age", Pattern.CASE_INSENSITIVE),
        Pattern.compile("어떻게\\s*연락|연락\\s*방법", Pattern.CASE_INSENSITIVE)
    );
    
    // 기술 관련 키워드
    private static final List<String> TECH_KEYWORDS = Arrays.asList(
        "java", "spring", "react", "javascript", "python", "database", "api", 
        "프레임워크", "라이브러리", "기술스택", "개발환경", "도구"
    );
    
    // 프로젝트 관련 키워드  
    private static final List<String> PROJECT_KEYWORDS = Arrays.asList(
        "프로젝트", "project", "개발", "만들", "구현", "기능", "시스템"
    );
    
    // 비교 관련 키워드
    private static final List<String> COMPARISON_KEYWORDS = Arrays.asList(
        "vs", "비교", "차이", "다른점", "어떤게", "무엇이 더"
    );
    
    // 도전과제 관련 키워드
    private static final List<String> CHALLENGE_KEYWORDS = Arrays.asList(
        "어려웠", "힘들었", "도전", "문제", "해결", "극복", "struggle", "challenge"
    );
    
    @Override
    public AnalysisResult analyzeQuestion(String question) {
        if (question == null || question.trim().isEmpty()) {
            return createResult(QuestionType.GENERAL, false, null, false, 0.0);
        }
        
        String normalizedQuestion = question.toLowerCase().trim();
        log.debug("질문 분석 시작: '{}'", question);
        
        // 1. 개인정보 요청 체크
        if (isPersonalInfoRequest(question)) {
            String immediateResponse = "개인정보는 직접 문의해주세요. 우측 하단의 '문의하기' 버튼을 이용해주세요.";
            return createResult(QuestionType.PERSONAL_INFO, true, immediateResponse, false, 0.9);
        }
        
        // 2. 질문 타입 분류
        QuestionType type = classifyQuestionType(normalizedQuestion);
        boolean shouldUseAI = requiresAIResponse(question);
        double confidence = calculateConfidence(normalizedQuestion, type);
        
        log.debug("분석 결과: 타입={}, AI 사용={}, 신뢰도={}", type, shouldUseAI, confidence);
        
        return createResult(type, false, null, shouldUseAI, confidence);
    }
    
    @Override
    public boolean isPersonalInfoRequest(String question) {
        return PERSONAL_INFO_PATTERNS.stream()
                .anyMatch(pattern -> pattern.matcher(question).find());
    }
    
    @Override
    public boolean requiresAIResponse(String question) {
        // 개인정보 요청은 AI 응답 불필요
        if (isPersonalInfoRequest(question)) {
            return false;
        }
        
        // 너무 짧은 질문은 AI 응답 불필요 
        if (question.trim().length() < 5) {
            return false;
        }
        
        // 인사말이나 간단한 질문
        String normalized = question.toLowerCase().trim();
        List<String> simplePatterns = Arrays.asList(
            "안녕", "hello", "hi", "고마워", "감사", "thank"
        );
        
        if (simplePatterns.stream().anyMatch(normalized::contains)) {
            return false;
        }
        
        return true; // 기본적으로 AI 응답 사용
    }
    
    /**
     * 질문 타입을 분류합니다
     */
    private QuestionType classifyQuestionType(String question) {
        // 기술 관련
        if (TECH_KEYWORDS.stream().anyMatch(question::contains)) {
            return QuestionType.TECHNICAL;
        }
        
        // 프로젝트 관련
        if (PROJECT_KEYWORDS.stream().anyMatch(question::contains)) {
            return QuestionType.PROJECT;
        }
        
        // 비교 관련
        if (COMPARISON_KEYWORDS.stream().anyMatch(question::contains)) {
            return QuestionType.COMPARISON;
        }
        
        // 도전과제 관련
        if (CHALLENGE_KEYWORDS.stream().anyMatch(question::contains)) {
            return QuestionType.CHALLENGE;
        }
        
        // 개요/소개 관련
        if (question.contains("소개") || question.contains("개요") || 
            question.contains("어떤") || question.contains("무엇")) {
            return QuestionType.OVERVIEW;
        }
        
        // 전반적인 기술 스택
        if (question.contains("기술") && (question.contains("전체") || question.contains("모든"))) {
            return QuestionType.GENERAL_SKILL;
        }
        
        return QuestionType.GENERAL;
    }
    
    /**
     * 신뢰도를 계산합니다
     */
    private double calculateConfidence(String question, QuestionType type) {
        int matchCount = 0;
        int totalKeywords = 0;
        
        List<String> relevantKeywords = switch (type) {
            case TECHNICAL -> TECH_KEYWORDS;
            case PROJECT -> PROJECT_KEYWORDS;
            case COMPARISON -> COMPARISON_KEYWORDS;
            case CHALLENGE -> CHALLENGE_KEYWORDS;
            default -> Arrays.asList();
        };
        
        for (String keyword : relevantKeywords) {
            totalKeywords++;
            if (question.contains(keyword)) {
                matchCount++;
            }
        }
        
        if (totalKeywords == 0) return 0.5; // 기본 신뢰도
        
        double confidence = (double) matchCount / totalKeywords;
        return Math.min(Math.max(confidence, 0.1), 0.95); // 0.1 ~ 0.95 범위로 제한
    }
    
    /**
     * AnalysisResult 헬퍼 메서드
     */
    private AnalysisResult createResult(QuestionType type, boolean showEmailButton, 
                                      String immediateResponse, boolean useAI, double confidence) {
        return new AnalysisResult(type, showEmailButton, immediateResponse, useAI, confidence);
    }
}