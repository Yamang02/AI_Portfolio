package com.aiportfolio.backend.application.admin.exception;

/**
 * 관리자 세션 기반 인증 과정에서 발생하는 예외입니다.
 */
public class AdminAuthenticationException extends RuntimeException {

    public AdminAuthenticationException(String message) {
        super(message);
    }

    public AdminAuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}

