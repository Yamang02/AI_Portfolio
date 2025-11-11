package com.aiportfolio.backend.infrastructure.web.exception;

import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * 전역 예외 처리기
 * 애플리케이션 전역에서 발생하는 예외를 처리합니다.
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 파일 업로드 크기 제한 초과 예외 처리
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleMaxUploadSizeExceeded(
            MaxUploadSizeExceededException e) {
        log.warn("File upload size exceeded: {}", e.getMessage());
        
        String message = "파일 크기가 너무 큽니다. 최대 업로드 크기를 초과했습니다.";
        
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error(message, "파일 크기 제한 초과"));
    }
}

