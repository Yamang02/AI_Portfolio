package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.chat.ChatRequestDto;
import com.aiportfolio.backend.infrastructure.web.dto.chat.ChatResponseDto;
import com.aiportfolio.backend.domain.chatbot.port.in.ChatUseCase;
import com.aiportfolio.backend.domain.chatbot.model.enums.ChatResponseType;

import com.aiportfolio.backend.application.chatbot.validation.InputValidationService;
import com.aiportfolio.backend.domain.chatbot.model.ChatRequest;
import com.aiportfolio.backend.domain.chatbot.model.ChatResponse;
import com.aiportfolio.backend.application.chatbot.validation.SpamProtectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 채팅 웹 컨트롤러 (헥사고날 아키텍처 Infrastructure/Web Layer)
 * ChatUseCase를 직접 사용하는 헥사고날 아키텍처 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "AI 챗봇 API")
public class ChatController {

    private final ChatUseCase chatUseCase;
    private final SpamProtectionService spamProtectionService;
    private final InputValidationService inputValidationService;

    @PostMapping("/message")
    @Operation(summary = "챗봇 메시지 전송", description = "AI 챗봇에게 메시지를 보내고 응답을 받습니다.")
    public ResponseEntity<ApiResponse<ChatResponseDto>> sendMessage(@RequestBody ChatRequestDto request,
            HttpServletRequest httpRequest) {
        try {
            log.info("Received chat request: {}", request.getQuestion());

            // 1. 입력 검증
            InputValidationService.ValidationResult validation = inputValidationService
                    .validateInput(request.getQuestion());
            if (!validation.isValid()) {
                ChatResponseDto invalidResponse = ChatResponseDto.builder()
                        .response(validation.getReason())
                        .success(false)
                        .responseType(validation.getResponseType())
                        .reason(validation.getReason())
                        .showEmailButton(validation.getResponseType() == ChatResponseType.SPAM_DETECTED)
                        .build();

                // 비즈니스 로직 오류는 200 OK로 반환
                return ResponseEntity.ok(ApiResponse.<ChatResponseDto>builder()
                        .success(false)
                        .message(WebApiResponseMessages.CHAT_INPUT_VALIDATION_FAILED)
                        .data(invalidResponse)
                        .build());
            }

            // 2. 스팸 방지 검사
            String clientId = getClientId(httpRequest);
            var spamResult = spamProtectionService.checkSpamProtection(clientId);

            if (!spamResult.isAllowed()) {
                ChatResponseDto rateLimitResponse = ChatResponseDto.builder()
                        .response("⚠️ " + spamResult.getMessage())
                        .success(false)
                        .responseType(ChatResponseType.RATE_LIMITED)
                        .reason(spamResult.getMessage())
                        .showEmailButton(true)
                        .build();

                // 비즈니스 로직 오류는 200 OK로 반환
                return ResponseEntity.ok(ApiResponse.<ChatResponseDto>builder()
                        .success(false)
                        .message(WebApiResponseMessages.CHAT_RATE_LIMIT_MESSAGE)
                        .data(rateLimitResponse)
                        .build());
            }

            // 3. ChatUseCase를 통한 비즈니스 로직 처리 (헥사고날 아키텍처)
            String sessionId = getClientId(httpRequest); // clientId를 sessionId로 사용
            ChatRequest chatRequest = new ChatRequest(request.getQuestion(), request.getSelectedProject(), sessionId);
            ChatResponse chatResponse = chatUseCase.processQuestion(chatRequest);
            
            // Convert domain model to DTO for API response
            ChatResponseDto chatResponseDto = ChatResponseDto.builder()
                    .response(chatResponse.getResponse())
                    .success(chatResponse.isSuccess())
                    .responseType(chatResponse.getType())
                    .showEmailButton(false)
                    .build();

            // 4. 성공적인 요청 기록
            spamProtectionService.recordSubmission(clientId);

            return ResponseEntity.ok(ApiResponse.success(chatResponseDto, WebApiResponseMessages.CHAT_RESPONSE_SUCCESS));

        } catch (Exception e) {
            log.error("Error processing chat request", e);

            ChatResponseDto errorResponse = ChatResponseDto.builder()
                    .response(WebApiResponseMessages.CHAT_SYSTEM_ERROR_USER_MESSAGE)
                    .success(false)
                    .responseType(ChatResponseType.SYSTEM_ERROR)
                    .error("Internal server error")
                    .showEmailButton(true)
                    .build();

            // 시스템 오류는 500 Internal Server Error로 반환
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<ChatResponseDto>builder()
                            .success(false)
                            .message(WebApiResponseMessages.CHAT_RESPONSE_FAILED)
                            .data(errorResponse)
                            .build());
        }
    }

    private String getClientId(HttpServletRequest request) {
        // IP 주소와 User-Agent를 조합하여 클라이언트 ID 생성
        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        return ipAddress + ":" + (userAgent != null ? userAgent.hashCode() : "unknown");
    }

    @GetMapping("/health")
    @Operation(summary = "챗봇 서비스 상태 확인", description = "챗봇 서비스가 정상적으로 작동하는지 확인합니다.")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        String status = chatUseCase.healthCheck();
        return ResponseEntity.ok(ApiResponse.success(status, WebApiResponseMessages.CHAT_HEALTH_CHECK_MESSAGE));
    }

    @GetMapping("/status")
    @Operation(summary = "사용량 제한 상태 확인", description = "현재 사용자의 챗봇 사용량 제한 상태를 확인합니다.")
    public ResponseEntity<ApiResponse<Object>> getUsageStatus(HttpServletRequest httpRequest) {
        try {
            String clientId = getClientId(httpRequest);
            
            // 스팸 보호 상태 조회
            var spamStatus = spamProtectionService.getSubmissionStatus(clientId);
            
            // 종합 상태 응답 생성
            return ResponseEntity.ok(ApiResponse.success(spamStatus, WebApiResponseMessages.CHAT_USAGE_STATUS_SUCCESS));
            
        } catch (Exception e) {
            log.error("Error getting usage status", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(WebApiResponseMessages.CHAT_USAGE_STATUS_FAILED, e.getMessage()));
        }
    }
}