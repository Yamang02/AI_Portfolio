package com.aiportfolio.backend.infrastructure.web.admin.exception;

import com.aiportfolio.backend.application.admin.exception.AdminAuthenticationException;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 관리자 API 전용 예외 처리기.
 */
@Slf4j
@RestControllerAdvice(basePackages = "com.aiportfolio.backend.infrastructure.web.admin")
public class AdminApiExceptionHandler {

    @ExceptionHandler(AdminAuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AdminAuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(exception.getMessage(), "인증 필요"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(exception.getMessage(), "잘못된 요청"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception exception) {
        log.error("Unexpected admin API error", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("관리자 API 처리 중 오류가 발생했습니다.", "서버 오류"));
    }
}

