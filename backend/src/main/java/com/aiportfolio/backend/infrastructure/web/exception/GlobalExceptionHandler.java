package com.aiportfolio.backend.infrastructure.web.exception;

import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * 전역 예외 처리기
 * Main 앱 전역에서 발생하는 예외를 처리합니다.
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
        
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error(
                        WebApiResponseMessages.FILE_SIZE_EXCEEDED_DETAIL,
                        WebApiResponseMessages.LABEL_PAYLOAD_TOO_LARGE));
    }

    /**
     * 잘못된 인자 예외 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException exception) {
        log.warn("Illegal argument: {}", exception.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(exception.getMessage(), WebApiResponseMessages.LABEL_BAD_REQUEST));
    }

    /**
     * 잘못된 상태 예외 처리
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalState(IllegalStateException exception) {
        log.error("Illegal state: {}", exception.getMessage(), exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(exception.getMessage(), WebApiResponseMessages.LABEL_ILLEGAL_STATE));
    }

    /**
     * 예상치 못한 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception exception) {
        log.error("Unexpected error", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        WebApiResponseMessages.GENERIC_REQUEST_FAILED,
                        WebApiResponseMessages.LABEL_SERVER_ERROR));
    }
}

