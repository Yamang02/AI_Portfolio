package com.aiportfolio.backend.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Service
public class QuestionAnalysisService {
    
    public enum QuestionType {
        PERSONAL_INFO,    // 개인정보 요청
        TECHNICAL,        // 기술 관련
        PROJECT,          // 프로젝트 관련
        GENERAL_SKILL,    // 전반적인 기술 스택
        OVERVIEW,         // 개요/소개
        COMPARISON,       // 비교 분석
        CHALLENGE,        // 도전과제
        GENERAL           // 일반 질문
    }
    
    public static class QuestionAnalysisResult {
        private final QuestionType type;
        private final boolean shouldShowEmailButton;
        private final String immediateResponse;
        private final boolean shouldUseAI;
        
        public QuestionAnalysisResult(QuestionType type, boolean shouldShowEmailButton, 
                                    String immediateResponse, boolean shouldUseAI) {
            this.type = type;
            this.shouldShowEmailButton = shouldShowEmailButton;
            this.immediateResponse = immediateResponse;
            this.shouldUseAI = shouldUseAI;
        }
        
        // Getters
        public QuestionType getType() { return type; }
        public boolean isShouldShowEmailButton() { return shouldShowEmailButton; }
        public String getImmediateResponse() { return immediateResponse; }
        public boolean isShouldUseAI() { return shouldUseAI; }
    }
    
    /**
     * 질문 분석 및 분류
     */
    public QuestionAnalysisResult analyzeQuestion(String question) {
        String lowerQuestion = question.toLowerCase();
        
        // 1. 개인정보 요청 감지 (민감한 로직 - 백엔드에서 처리)
        if (isPersonalInfoRequest(lowerQuestion)) {
            return new QuestionAnalysisResult(
                QuestionType.PERSONAL_INFO,
                true,
                "개인정보나 연락처는 보안상 직접 문의해주시기 바랍니다. 아래 버튼을 통해 안전하게 연락하실 수 있습니다.",
                false
            );
        }
        
        // 2. 전반적인 기술 스택 질문 감지
        if (isGeneralSkillQuestion(lowerQuestion)) {
            return new QuestionAnalysisResult(
                QuestionType.GENERAL_SKILL,
                false,
                null,
                true
            );
        }
        
        // 3. 기술적 세부사항 질문 감지
        if (isTechnicalQuestion(lowerQuestion)) {
            return new QuestionAnalysisResult(
                QuestionType.TECHNICAL,
                false,
                null,
                true
            );
        }
        
        // 4. 프로젝트 관련 질문 감지
        if (isProjectQuestion(lowerQuestion)) {
            return new QuestionAnalysisResult(
                QuestionType.PROJECT,
                false,
                null,
                true
            );
        }
        
        // 5. 비교 분석 질문 감지
        if (isComparisonQuestion(lowerQuestion)) {
            return new QuestionAnalysisResult(
                QuestionType.COMPARISON,
                false,
                null,
                true
            );
        }
        
        // 6. 도전과제 질문 감지
        if (isChallengeQuestion(lowerQuestion)) {
            return new QuestionAnalysisResult(
                QuestionType.CHALLENGE,
                false,
                null,
                true
            );
        }
        
        // 7. 개요/소개 질문 감지
        if (isOverviewQuestion(lowerQuestion)) {
            return new QuestionAnalysisResult(
                QuestionType.OVERVIEW,
                false,
                null,
                true
            );
        }
        
        // 8. 일반 질문 (기본값)
        return new QuestionAnalysisResult(
            QuestionType.GENERAL,
            false,
            null,
            true
        );
    }
    
    /**
     * 개인정보 요청 감지 (강화된 버전)
     */
    private boolean isPersonalInfoRequest(String lowerQuestion) {
        List<String> personalInfoPatterns = Arrays.asList(
            // 기본 연락처 관련
            "이메일", "메일", "연락처", "전화번호", "휴대폰", "개인정보",
            "개발자 연락", "개발자에게 연락", "연락 방법", "연락처 알려줘",
            "개인 연락처", "개발자 정보", "개발자 소개", "개발자 프로필",
            
            // 추가 개인정보 관련
            "개발자 연봉", "연봉", "급여", "월급", "연봉이", "급여가",
            "개발자 나이", "나이", "생년월일", "생일", "나이가",
            "개발자 주소", "주소", "사는 곳", "거주지", "주소가",
            "개발자 학교", "학교", "대학교", "학력", "졸업",
            "개발자 회사", "회사", "직장", "근무지", "회사가",
            
            // 영어 패턴
            "email", "contact", "phone", "personal", "developer contact",
            "reach developer", "how to contact", "contact info", "personal info",
            "salary", "age", "address", "school", "company", "work"
        );
        
        return personalInfoPatterns.stream()
            .anyMatch(pattern -> lowerQuestion.contains(pattern.toLowerCase()));
    }
    
    /**
     * 전반적인 기술 스택 질문 감지
     */
    private boolean isGeneralSkillQuestion(String lowerQuestion) {
        List<String> generalSkillPatterns = Arrays.asList(
            "다룰 수 있는", "할 수 있는", "사용할 수 있는", "알고 있는",
            "스택", "기술", "언어", "프레임워크", "도구",
            "전반적인", "전체적인", "모든", "어떤",
            "개발자로서", "개발 능력", "기술력", "실력",
            "주요", "주로", "보통", "일반적으로"
        );
        
        List<String> specificProjectPatterns = Arrays.asList(
            "이 프로젝트", "해당 프로젝트", "특정 프로젝트",
            "프로젝트에서", "프로젝트의", "프로젝트에",
            "이 앱", "이 서비스", "이 시스템",
            "이것", "그것", "저것"
        );
        
        // 특정 프로젝트에 대한 질문이면 false 반환
        boolean isSpecificProject = specificProjectPatterns.stream()
            .anyMatch(pattern -> lowerQuestion.contains(pattern.toLowerCase()));
        
        if (isSpecificProject) {
            return false;
        }
        
        // 전반적인 스택 질문 패턴이 있으면 true 반환
        return generalSkillPatterns.stream()
            .anyMatch(pattern -> lowerQuestion.contains(pattern.toLowerCase()));
    }
    
    /**
     * 기술적 세부사항 질문 감지
     */
    private boolean isTechnicalQuestion(String lowerQuestion) {
        List<String> technicalPatterns = Arrays.asList(
            "기술", "tech", "언어", "프레임워크", "라이브러리", "도구",
            "구현", "개발", "코딩", "프로그래밍", "알고리즘",
            "아키텍처", "설계", "패턴", "방법론",
            "technical", "implementation", "development", "coding",
            "architecture", "design", "pattern", "methodology"
        );
        
        return technicalPatterns.stream()
            .anyMatch(pattern -> lowerQuestion.contains(pattern.toLowerCase()));
    }
    
    /**
     * 프로젝트 관련 질문 감지
     */
    private boolean isProjectQuestion(String lowerQuestion) {
        List<String> projectPatterns = Arrays.asList(
            "프로젝트", "project", "작업", "work", "개발", "development",
            "앱", "app", "서비스", "service", "시스템", "system",
            "웹사이트", "website", "애플리케이션", "application"
        );
        
        return projectPatterns.stream()
            .anyMatch(pattern -> lowerQuestion.contains(pattern.toLowerCase()));
    }
    
    /**
     * 비교 분석 질문 감지
     */
    private boolean isComparisonQuestion(String lowerQuestion) {
        List<String> comparisonPatterns = Arrays.asList(
            "비교", "차이", "장단점", "vs", "versus", "대비",
            "어떤 게", "어떤 것이", "더 나은", "더 좋은",
            "comparison", "difference", "pros and cons", "better",
            "which is", "what's the difference"
        );
        
        return comparisonPatterns.stream()
            .anyMatch(pattern -> lowerQuestion.contains(pattern.toLowerCase()));
    }
    
    /**
     * 도전과제 질문 감지
     */
    private boolean isChallengeQuestion(String lowerQuestion) {
        List<String> challengePatterns = Arrays.asList(
            "어려움", "문제", "도전", "해결", "개선", "트러블",
            "이슈", "버그", "오류", "실패", "성공",
            "challenge", "difficulty", "problem", "issue", "bug",
            "error", "failure", "success", "solution"
        );
        
        return challengePatterns.stream()
            .anyMatch(pattern -> lowerQuestion.contains(pattern.toLowerCase()));
    }
    
    /**
     * 개요/소개 질문 감지
     */
    private boolean isOverviewQuestion(String lowerQuestion) {
        List<String> overviewPatterns = Arrays.asList(
            "개요", "소개", "설명", "뭐", "무엇", "어떤",
            "overview", "introduction", "explain", "what", "what is",
            "tell me about", "describe", "summary"
        );
        
        return overviewPatterns.stream()
            .anyMatch(pattern -> lowerQuestion.contains(pattern.toLowerCase()));
    }
} 