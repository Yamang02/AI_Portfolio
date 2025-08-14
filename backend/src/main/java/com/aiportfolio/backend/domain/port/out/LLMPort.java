package com.aiportfolio.backend.domain.port.out;

/**
 * LLM(Large Language Model) 추상화 인터페이스
 * 헥사고날 아키텍처의 포트(Port) - 다양한 LLM 모델 지원 가능
 */
public interface LLMPort {
    
    /**
     * LLM 모델에 채팅 요청을 보내고 응답을 받습니다
     * 
     * @param systemPrompt 시스템 프롬프트
     * @param userMessage 사용자 메시지
     * @return LLM 응답
     * @throws LLMException LLM 호출 실패 시
     */
    String chat(String systemPrompt, String userMessage) throws LLMException;
    
    /**
     * LLM 모델이 사용 가능한지 확인합니다
     * 
     * @return 사용 가능 여부
     */
    boolean isAvailable();
    
    /**
     * 현재 사용 중인 LLM 모델 이름을 반환합니다
     * 
     * @return 모델명
     */
    String getModelName();
    
    /**
     * LLM 관련 예외 클래스
     */
    class LLMException extends Exception {
        public LLMException(String message) {
            super(message);
        }
        
        public LLMException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}