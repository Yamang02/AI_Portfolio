package com.aiportfolio.backend.domain.chatbot.port.out;

/**
 * 질문 분석 추상화 인터페이스
 * 헥사고날 아키텍처의 포트(Port) - 다양한 분석 엔진 지원 가능
 */
public interface QuestionAnalysisPort {
    
    /**
     * 질문 유형 열거형
     */
    enum QuestionType {
        PERSONAL_INFO,    // 개인정보 요청
        TECHNICAL,        // 기술 관련
        PROJECT,          // 프로젝트 관련
        GENERAL_SKILL,    // 전반적인 기술 스택
        OVERVIEW,         // 개요/소개
        COMPARISON,       // 비교 분석
        CHALLENGE,        // 도전과제
        GENERAL           // 일반 질문
    }
    
    /**
     * 질문 분석 결과
     */
    class AnalysisResult {
        private final QuestionType type;
        private final boolean shouldShowEmailButton;
        private final String immediateResponse;
        private final boolean shouldUseAI;
        private final double confidence;
        
        public AnalysisResult(QuestionType type, boolean shouldShowEmailButton, 
                            String immediateResponse, boolean shouldUseAI, double confidence) {
            this.type = type;
            this.shouldShowEmailButton = shouldShowEmailButton;
            this.immediateResponse = immediateResponse;
            this.shouldUseAI = shouldUseAI;
            this.confidence = confidence;
        }
        
        // Getters
        public QuestionType getType() { return type; }
        public boolean shouldShowEmailButton() { return shouldShowEmailButton; }
        public String getImmediateResponse() { return immediateResponse; }
        public boolean shouldUseAI() { return shouldUseAI; }
        public double getConfidence() { return confidence; }
    }
    
    /**
     * 질문을 분석하고 타입을 결정합니다
     * 
     * @param question 사용자 질문
     * @return 분석 결과
     */
    AnalysisResult analyzeQuestion(String question);
    
    /**
     * 질문이 개인정보를 요청하는지 확인합니다
     * 
     * @param question 사용자 질문
     * @return 개인정보 요청 여부
     */
    boolean isPersonalInfoRequest(String question);
    
    /**
     * 질문이 AI 응답이 필요한지 확인합니다
     * 
     * @param question 사용자 질문
     * @return AI 응답 필요 여부
     */
    boolean requiresAIResponse(String question);
}