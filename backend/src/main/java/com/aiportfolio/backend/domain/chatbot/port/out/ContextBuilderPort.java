package com.aiportfolio.backend.domain.chatbot.port.out;

/**
 * 포트폴리오 컨텍스트 생성을 위한 Port
 * Secondary Port (아웃바운드 포트)
 * 
 * Chatbot 도메인이 Portfolio 도메인의 데이터를 컨텍스트로 변환할 때 사용
 * 도메인 간 격리를 위해 문자열 형태의 컨텍스트만 주고받음
 */
public interface ContextBuilderPort {
    
    /**
     * 모든 포트폴리오 데이터를 컨텍스트 문자열로 변환합니다
     * 
     * @return 포트폴리오 전체 정보가 포함된 컨텍스트 문자열
     */
    String buildFullPortfolioContext();
    
    /**
     * 특정 프로젝트에 대한 컨텍스트 문자열을 생성합니다
     * 
     * @param projectTitle 프로젝트 제목
     * @return 특정 프로젝트 정보가 포함된 컨텍스트 문자열, 프로젝트가 없으면 전체 컨텍스트
     */
    String buildProjectContext(String projectTitle);
    
    /**
     * 컨텍스트 빌더 서비스가 사용 가능한지 확인합니다
     * 
     * @return 사용 가능 여부
     */
    boolean isAvailable();
}