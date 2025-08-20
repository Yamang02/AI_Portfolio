package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.chat.ChatRequestDto;
import com.aiportfolio.backend.infrastructure.web.dto.chat.ChatResponseDto;
import com.aiportfolio.backend.domain.chatbot.port.in.ChatUseCase;
import com.aiportfolio.backend.domain.chatbot.model.enums.ChatResponseType;
import com.aiportfolio.backend.application.chatbot.service.analysis.QuestionAnalysisService;
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
    private final QuestionAnalysisService questionAnalysisService;
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
                        .message("입력 검증 실패")
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
                        .message("요청 제한")
                        .data(rateLimitResponse)
                        .build());
            }

            // 3. ChatUseCase를 통한 비즈니스 로직 처리 (헥사고날 아키텍처)
            ChatRequest chatRequest = new ChatRequest(request.getQuestion(), request.getSelectedProject());
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

            return ResponseEntity.ok(ApiResponse.success(chatResponseDto, "챗봇 응답 성공"));

        } catch (Exception e) {
            log.error("Error processing chat request", e);

            ChatResponseDto errorResponse = ChatResponseDto.builder()
                    .response("죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.")
                    .success(false)
                    .responseType(ChatResponseType.SYSTEM_ERROR)
                    .error("Internal server error")
                    .showEmailButton(true)
                    .build();

            // 시스템 오류는 500 Internal Server Error로 반환
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<ChatResponseDto>builder()
                            .success(false)
                            .message("챗봇 응답 실패")
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
        return ResponseEntity.ok(ApiResponse.success(status, "챗봇 서비스 상태 확인"));
    }

    @GetMapping("/status")
    @Operation(summary = "사용량 제한 상태 확인", description = "현재 사용자의 챗봇 사용량 제한 상태를 확인합니다.")
    public ResponseEntity<ApiResponse<Object>> getUsageStatus(HttpServletRequest httpRequest) {
        try {
            String clientId = getClientId(httpRequest);
            
            // 스팸 보호 상태와 채팅 사용량 상태 모두 반환
            var spamStatus = spamProtectionService.getSubmissionStatus(clientId);
            Object chatStatus = chatUseCase.getChatUsageStatus();
            
            // 종합 상태 응답 생성
            return ResponseEntity.ok(ApiResponse.success(spamStatus, "사용량 제한 상태 조회 성공"));
            
        } catch (Exception e) {
            log.error("Error getting usage status", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("사용량 제한 상태 조회 실패", e.getMessage()));
        }
    }
}