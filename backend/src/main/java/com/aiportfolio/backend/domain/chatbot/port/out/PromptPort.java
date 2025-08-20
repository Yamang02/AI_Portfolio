package com.aiportfolio.backend.domain.chatbot.port.out;

import java.util.Map;

/**
 * 프롬프트 관리 추상화 인터페이스
 * 헥사고날 아키텍처의 포트(Port) - 다양한 프롬프트 소스 지원 가능
 */
public interface PromptPort {
    
    /**
     * 시스템 프롬프트를 가져옵니다
     * 
     * @return 시스템 프롬프트 텍스트
     */
    String getSystemPrompt();
    
    /**
     * 특정 키에 해당하는 프롬프트 템플릿을 가져옵니다
     * 
     * @param key 프롬프트 키
     * @return 프롬프트 템플릿
     */
    String getPromptTemplate(String key);
    
    /**
     * 프롬프트 템플릿에 변수를 치환합니다
     * 
     * @param template 프롬프트 템플릿
     * @param variables 치환할 변수 맵
     * @return 변수가 치환된 프롬프트
     */
    String renderPrompt(String template, Map<String, String> variables);
    
    /**
     * 프롬프트 데이터를 다시 로드합니다
     * 캐시 무효화 및 새로운 프롬프트 파일 반영
     */
    void reloadPrompts();
    
    /**
     * 프롬프트가 로드되었는지 확인합니다
     * 
     * @return 로드 여부
     */
    boolean isLoaded();
}