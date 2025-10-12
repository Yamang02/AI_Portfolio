package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.application.admin.AdminAuthService;
import com.aiportfolio.backend.domain.admin.model.AdminUser;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.admin.AdminLoginRequest;
import com.aiportfolio.backend.infrastructure.web.dto.admin.AdminLoginResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 인증 컨트롤러
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
    public ResponseEntity<ApiResponse<AdminLoginResponse>> login(@Valid @RequestBody AdminLoginRequest request) {
        log.info("Admin login attempt: {}", request.getUsername());
        
        AdminLoginResponse response = adminAuthService.login(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(response, "로그인 성공"));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error(response.getMessage()));
        }
    }

    /**
     * 관리자 로그아웃
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        adminAuthService.logout();
        return ResponseEntity.ok(ApiResponse.success(null, "로그아웃 성공"));
    }

    /**
     * 세션 상태 확인
     */
    @GetMapping("/session")
    public ResponseEntity<ApiResponse<SessionInfo>> getSession() {
        AdminUser currentAdmin = adminAuthService.getCurrentAdmin();
        
        if (currentAdmin != null) {
            SessionInfo sessionInfo = SessionInfo.builder()
                    .authenticated(true)
                    .username(currentAdmin.getUsername())
                    .role(currentAdmin.getRole())
                    .lastLogin(currentAdmin.getLastLogin())
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success(sessionInfo, "세션 정보 조회 성공"));
        } else {
            SessionInfo sessionInfo = SessionInfo.builder()
                    .authenticated(false)
                    .build();
            
            return ResponseEntity.ok(ApiResponse.success(sessionInfo, "인증되지 않은 사용자"));
        }
    }

    /**
     * 세션 정보 DTO
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SessionInfo {
        private boolean authenticated;
        private String username;
        private String role;
        private java.time.LocalDateTime lastLogin;
    }
}

