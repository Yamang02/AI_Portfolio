package com.aiportfolio.backend.domain.chatbot.model.enums;

/**
 * 채팅 응답 타입
 * 도메인 규칙을 정의하는 열거형
 */
public enum ChatResponseType {
    SUCCESS,           // 정상 응답
    RATE_LIMITED,      // 사용량 제한
    CANNOT_ANSWER,     // 답변 불가
    PERSONAL_INFO,     // 개인정보 요청
    INVALID_INPUT,     // 잘못된 입력
    SYSTEM_ERROR,      // 시스템 오류
    SPAM_DETECTED,     // 스팸 감지
    ERROR              // 일반 오류
}