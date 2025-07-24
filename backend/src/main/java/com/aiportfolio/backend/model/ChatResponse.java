package com.aiportfolio.backend.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String response;
    private boolean success;
    private String error;
    private boolean showEmailButton;
    private ResponseType responseType;
    private String reason;
    
    public enum ResponseType {
        SUCCESS,           // 정상 응답
        RATE_LIMITED,      // 사용량 제한
        CANNOT_ANSWER,     // 답변 불가
        PERSONAL_INFO,     // 개인정보 요청
        INVALID_INPUT,     // 잘못된 입력
        SYSTEM_ERROR,      // 시스템 오류
        SPAM_DETECTED      // 스팸 감지
    }
} 