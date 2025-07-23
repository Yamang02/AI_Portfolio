package com.aiportfolio.backend.controller;

import com.aiportfolio.backend.model.ChatRequest;
import com.aiportfolio.backend.model.ChatResponse;
import com.aiportfolio.backend.service.GeminiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "AI 챗봇 API")
public class ChatController {
    
    private final GeminiService geminiService;
    
    @PostMapping("/message")
    @Operation(summary = "챗봇 메시지 전송", description = "AI 챗봇에게 메시지를 보내고 응답을 받습니다.")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        try {
            log.info("Received chat request: {}", request.getQuestion());
            
            String response = geminiService.getChatbotResponse(
                request.getQuestion(), 
                request.getSelectedProject()
            );
            
            ChatResponse chatResponse = ChatResponse.builder()
                    .response(response)
                    .success(true)
                    .build();
            
            return ResponseEntity.ok(chatResponse);
            
        } catch (Exception e) {
            log.error("Error processing chat request", e);
            
            ChatResponse errorResponse = ChatResponse.builder()
                    .response("I_CANNOT_ANSWER")
                    .success(false)
                    .error("Internal server error")
                    .build();
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @GetMapping("/health")
    @Operation(summary = "챗봇 서비스 상태 확인", description = "챗봇 서비스가 정상적으로 작동하는지 확인합니다.")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Chat service is running");
    }
} 