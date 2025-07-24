package com.aiportfolio.backend.controller;

import com.aiportfolio.backend.model.ApiResponse;
import com.aiportfolio.backend.model.ChatRequest;
import com.aiportfolio.backend.model.ChatResponse;
import com.aiportfolio.backend.service.GeminiService;
import com.aiportfolio.backend.service.SpamProtectionService;
import com.aiportfolio.backend.service.QuestionAnalysisService;
import com.aiportfolio.backend.service.InputValidationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "AI 챗봇 API")
public class ChatController {
    
    private final GeminiService geminiService;
    private final SpamProtectionService spamProtectionService;
    private final QuestionAnalysisService questionAnalysisService;
    private final InputValidationService inputValidationService;
    
    @PostMapping("/message")
    @Operation(summary = "챗봇 메시지 전송", description = "AI 챗봇에게 메시지를 보내고 응답을 받습니다.")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(@RequestBody ChatRequest request, HttpServletRequest httpRequest) {
        try {
            log.info("Received chat request: {}", request.getQuestion());
            
            // 1. 입력 검증
            InputValidationService.ValidationResult validation = inputValidationService.validateInput(request.getQuestion());
            if (!validation.isValid()) {
                ChatResponse invalidResponse = ChatResponse.builder()
                        .response(validation.getReason())
                        .success(false)
                        .responseType(validation.getResponseType())
                        .reason(validation.getReason())
                        .showEmailButton(validation.getResponseType() == ChatResponse.ResponseType.SPAM_DETECTED)
                        .build();
                
                // 비즈니스 로직 오류는 200 OK로 반환
                return ResponseEntity.ok(ApiResponse.<ChatResponse>builder()
                        .success(false)
                        .message("입력 검증 실패")
                        .data(invalidResponse)
                        .build());
            }
            
            // 2. 스팸 방지 검사
            String clientId = getClientId(httpRequest);
            SpamProtectionService.SpamProtectionResult spamResult = spamProtectionService.checkSpamProtection(clientId);
            
            if (!spamResult.isAllowed()) {
                ChatResponse rateLimitResponse = ChatResponse.builder()
                        .response("⚠️ " + spamResult.getMessage())
                        .success(false)
                        .responseType(ChatResponse.ResponseType.RATE_LIMITED)
                        .reason(spamResult.getMessage())
                        .showEmailButton(true)
                        .build();
                
                // 비즈니스 로직 오류는 200 OK로 반환
                return ResponseEntity.ok(ApiResponse.<ChatResponse>builder()
                        .success(false)
                        .message("요청 제한")
                        .data(rateLimitResponse)
                        .build());
            }
            
            // 3. 질문 분석
            QuestionAnalysisService.QuestionAnalysisResult analysis = questionAnalysisService.analyzeQuestion(request.getQuestion());
            
            String response;
            boolean showEmailButton = analysis.isShouldShowEmailButton();
            ChatResponse.ResponseType responseType = ChatResponse.ResponseType.SUCCESS;
            
            // 4. 응답 생성
            if (analysis.getImmediateResponse() != null) {
                // 즉시 응답이 있는 경우
                response = analysis.getImmediateResponse();
                responseType = analysis.getType() == QuestionAnalysisService.QuestionType.PERSONAL_INFO 
                    ? ChatResponse.ResponseType.PERSONAL_INFO 
                    : ChatResponse.ResponseType.SUCCESS;
            } else if (analysis.isShouldUseAI()) {
                // AI 처리가 필요한 경우
                response = geminiService.getChatbotResponse(
                    request.getQuestion(), 
                    request.getSelectedProject()
                );
                
                // AI가 답변할 수 없는 경우
                if (response == null || response.trim().isEmpty()) {
                    response = "죄송합니다. 해당 질문에 대한 답변을 제공할 수 없습니다. 다른 질문을 해보시거나 프로젝트를 선택해보세요.";
                    responseType = ChatResponse.ResponseType.CANNOT_ANSWER;
                    showEmailButton = true;
                }
            } else {
                // 기본 응답
                response = "죄송합니다. 해당 질문에 대한 답변을 제공할 수 없습니다.";
                responseType = ChatResponse.ResponseType.CANNOT_ANSWER;
                showEmailButton = true;
            }
            
            // 5. 성공적인 요청 기록
            spamProtectionService.recordSubmission(clientId);
            
            ChatResponse chatResponse = ChatResponse.builder()
                    .response(response)
                    .success(true)
                    .responseType(responseType)
                    .showEmailButton(showEmailButton)
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success(chatResponse, "챗봇 응답 성공"));
            
        } catch (Exception e) {
            log.error("Error processing chat request", e);
            
            ChatResponse errorResponse = ChatResponse.builder()
                    .response("죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.")
                    .success(false)
                    .responseType(ChatResponse.ResponseType.SYSTEM_ERROR)
                    .error("Internal server error")
                    .showEmailButton(true)
                    .build();
            
            // 시스템 오류는 500 Internal Server Error로 반환
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.<ChatResponse>builder()
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
        return ResponseEntity.ok(ApiResponse.success("Chat service is running", "챗봇 서비스 정상 작동"));
    }
    
    @GetMapping("/status")
    @Operation(summary = "사용량 제한 상태 확인", description = "현재 사용자의 챗봇 사용량 제한 상태를 확인합니다.")
    public ResponseEntity<ApiResponse<SpamProtectionService.SubmissionStatus>> getUsageStatus(HttpServletRequest httpRequest) {
        try {
            String clientId = getClientId(httpRequest);
            SpamProtectionService.SubmissionStatus status = spamProtectionService.getSubmissionStatus(clientId);
            return ResponseEntity.ok(ApiResponse.success(status, "사용량 제한 상태 조회 성공"));
        } catch (Exception e) {
            log.error("Error getting usage status", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("사용량 제한 상태 조회 실패", e.getMessage()));
        }
    }
} 