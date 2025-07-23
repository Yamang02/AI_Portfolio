package com.aiportfolio.backend.controller;

import com.aiportfolio.backend.model.ApiResponse;
import com.aiportfolio.backend.model.ChatRequest;
import com.aiportfolio.backend.model.ChatResponse;
import com.aiportfolio.backend.service.GeminiService;
import com.aiportfolio.backend.service.SpamProtectionService;
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
    
    @PostMapping("/message")
    @Operation(summary = "챗봇 메시지 전송", description = "AI 챗봇에게 메시지를 보내고 응답을 받습니다.")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(@RequestBody ChatRequest request, HttpServletRequest httpRequest) {
        try {
            log.info("Received chat request: {}", request.getQuestion());
            
            // 스팸 방지 검사
            String clientId = getClientId(httpRequest);
            SpamProtectionService.SpamProtectionResult spamResult = spamProtectionService.checkSpamProtection(clientId);
            
            if (!spamResult.isAllowed()) {
                return ResponseEntity.status(429)
                        .body(ApiResponse.error("요청이 너무 많습니다", spamResult.getMessage()));
            }
            
            String response = geminiService.getChatbotResponse(
                request.getQuestion(), 
                request.getSelectedProject()
            );
            
            // 성공적인 요청 기록
            spamProtectionService.recordSubmission(clientId);
            
            ChatResponse chatResponse = ChatResponse.builder()
                    .response(response)
                    .success(true)
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success(chatResponse, "챗봇 응답 성공"));
            
        } catch (Exception e) {
            log.error("Error processing chat request", e);
            
            ChatResponse errorResponse = ChatResponse.builder()
                    .response("I_CANNOT_ANSWER")
                    .success(false)
                    .error("Internal server error")
                    .build();
            
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("챗봇 응답 실패", e.getMessage()));
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
} 