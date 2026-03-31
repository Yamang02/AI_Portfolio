package com.aiportfolio.backend.infrastructure.web.admin.exception;

import com.aiportfolio.backend.application.admin.exception.AdminAuthenticationException;
import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 관리자 API 전용 예외 처리기.
 */
@Slf4j
@RestControllerAdvice(basePackages = "com.aiportfolio.backend.infrastructure.web.admin")
public class AdminApiExceptionHandler {

    @ExceptionHandler(AdminAuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AdminAuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(exception.getMessage(), WebApiResponseMessages.LABEL_AUTH_REQUIRED));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();
        exception.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        String errorMessage = errors.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining(", "));
        
        log.warn("Validation error: {}", errorMessage);
        
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(
                        WebApiResponseMessages.validationFailedDetail(errorMessage),
                        WebApiResponseMessages.LABEL_VALIDATION_ERROR));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(exception.getMessage(), WebApiResponseMessages.LABEL_BAD_REQUEST));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalState(IllegalStateException exception) {
        log.error("Illegal state in admin API: {}", exception.getMessage(), exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(exception.getMessage(), WebApiResponseMessages.LABEL_ILLEGAL_STATE));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception exception) {
        log.error("Unexpected admin API error", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        WebApiResponseMessages.ADMIN_API_UNEXPECTED,
                        WebApiResponseMessages.LABEL_SERVER_ERROR));
    }
}

