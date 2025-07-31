package com.aiportfolio.backend.controller;

import com.aiportfolio.backend.shared.model.ApiResponse;
import com.aiportfolio.backend.service.PromptService;
import com.aiportfolio.backend.util.PromptConverter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/prompts")
@RequiredArgsConstructor
@Tag(name = "Prompts", description = "프롬프트 관리 API")
public class PromptController {
    
    private final PromptService promptService;
    private final PromptConverter promptConverter;
    
    @PostMapping("/reload")
    @Operation(summary = "프롬프트 재로드", description = "프롬프트 파일을 다시 로드합니다.")
    public ResponseEntity<ApiResponse<String>> reloadPrompts() {
        try {
            promptService.reloadPrompts();
            return ResponseEntity.ok(ApiResponse.success("프롬프트 재로드 완료", "프롬프트가 성공적으로 재로드되었습니다."));
        } catch (Exception e) {
            log.error("프롬프트 재로드 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("프롬프트 재로드 실패", e.getMessage()));
        }
    }
    
    @PostMapping("/convert")
    @Operation(summary = "Markdown을 JSON으로 변환", description = "Markdown 파일을 JSON으로 변환합니다.")
    public ResponseEntity<ApiResponse<String>> convertMarkdownToJson() {
        try {
            promptConverter.convertMarkdownToJson();
            return ResponseEntity.ok(ApiResponse.success("변환 완료", "Markdown이 성공적으로 JSON으로 변환되었습니다."));
        } catch (Exception e) {
            log.error("Markdown 변환 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Markdown 변환 실패", e.getMessage()));
        }
    }
    
    @GetMapping("/system")
    @Operation(summary = "시스템 프롬프트 조회", description = "현재 사용 중인 시스템 프롬프트를 조회합니다.")
    public ResponseEntity<ApiResponse<String>> getSystemPrompt() {
        try {
            String systemPrompt = promptService.getSystemPrompt();
            return ResponseEntity.ok(ApiResponse.success(systemPrompt, "시스템 프롬프트 조회 성공"));
        } catch (Exception e) {
            log.error("시스템 프롬프트 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("시스템 프롬프트 조회 실패", e.getMessage()));
        }
    }
    
    @GetMapping("/patterns")
    @Operation(summary = "패턴 조회", description = "질문 분석에 사용되는 패턴들을 조회합니다.")
    public ResponseEntity<ApiResponse<Object>> getPatterns() {
        try {
            var patterns = Map.of(
                "generalSkill", promptService.getGeneralSkillPatterns(),
                "specificProject", promptService.getSpecificProjectPatterns()
            );
            return ResponseEntity.ok(ApiResponse.success(patterns, "패턴 조회 성공"));
        } catch (Exception e) {
            log.error("패턴 조회 실패", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("패턴 조회 실패", e.getMessage()));
        }
    }
} 