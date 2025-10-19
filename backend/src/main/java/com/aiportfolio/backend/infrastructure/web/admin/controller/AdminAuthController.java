package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.application.admin.AdminAuthService;
import com.aiportfolio.backend.domain.admin.model.dto.AdminLoginRequest;
import com.aiportfolio.backend.domain.admin.model.dto.AdminUserInfo;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 인증 컨트롤러
 * 로그인, 로그아웃, 세션 관리를 위한 REST API를 제공합니다.
 */
@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
@Slf4j
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    /**
     * 관리자 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminUserInfo>> login(
            @Valid @RequestBody AdminLoginRequest request,
            HttpSession session) {
        log.debug("Login request received for user: {}", request.getUsername());

        try {
            AdminUserInfo userInfo = adminAuthService.login(request.getUsername(), request.getPassword(), session);
            log.info("Login successful for user: {}", request.getUsername());
            return ResponseEntity.ok(ApiResponse.success(userInfo, "로그인 성공"));
        } catch (IllegalArgumentException e) {
            log.warn("Login failed for user: {}", request.getUsername());
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 실패"));
        }
    }

    /**
     * 관리자 로그아웃
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        log.debug("Logout request received");
        try {
            adminAuthService.logout(session);
            return ResponseEntity.ok(ApiResponse.success(null, "로그아웃 성공"));
        } catch (Exception e) {
            // 세션이 이미 무효화되어도 성공으로 처리
            return ResponseEntity.ok(ApiResponse.success(null, "로그아웃 성공"));
        }
    }

    /**
     * 세션 상태 확인
     */
    @GetMapping("/session")
    public ResponseEntity<ApiResponse<AdminUserInfo>> checkSession(HttpSession session) {
        log.debug("Session check request received");

        try {
            AdminUserInfo userInfo = adminAuthService.checkSession(session);
            return ResponseEntity.ok(ApiResponse.success(userInfo, "세션이 유효합니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증되지 않음"));
        }
    }
}
