package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.application.admin.AdminAuthService;
import com.aiportfolio.backend.domain.admin.model.dto.AdminLoginRequest;
import com.aiportfolio.backend.domain.admin.model.dto.AdminUserInfo;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 인증 컨트롤러
 * Spring Security 표준 방식을 사용합니다.
 */
@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
@Slf4j
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final AuthenticationManager authenticationManager;

    /**
     * 관리자 로그인
     * Spring Security의 AuthenticationManager를 사용합니다.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminUserInfo>> login(
            @Valid @RequestBody AdminLoginRequest request,
            HttpServletRequest httpRequest) {
        log.debug("Login request received for user: {}", request.getUsername());

        try {
            // Spring Security 인증 처리
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            // SecurityContext에 인증 정보 설정
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 세션 생성 (Spring Security가 자동으로 처리)
            HttpSession session = httpRequest.getSession(true);
            log.info("Session created: {}", session.getId());

            // 현재 사용자 정보 반환
            AdminUserInfo userInfo = adminAuthService.getCurrentUserInfo();
            log.info("Login successful for user: {}", request.getUsername());

            return ResponseEntity.ok(ApiResponse.success(userInfo, "로그인 성공"));
        } catch (Exception e) {
            log.warn("Login failed for user: {} - {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("사용자명 또는 비밀번호가 올바르지 않습니다.", "인증 실패"));
        }
    }

    /**
     * 관리자 로그아웃
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest httpRequest) {
        log.debug("Logout request received");
        try {
            adminAuthService.logout();
            
            // 세션 무효화
            HttpSession session = httpRequest.getSession(false);
            if (session != null) {
                session.invalidate();
                log.info("Session invalidated successfully");
            }
            
            return ResponseEntity.ok(ApiResponse.success(null, "로그아웃 성공"));
        } catch (Exception e) {
            log.error("Logout error", e);
            return ResponseEntity.ok(ApiResponse.success(null, "로그아웃 성공"));
        }
    }

    /**
     * 세션 상태 확인
     */
    @GetMapping("/session")
    public ResponseEntity<ApiResponse<AdminUserInfo>> checkSession() {
        log.debug("Session check request received");

        try {
            AdminUserInfo userInfo = adminAuthService.getCurrentUserInfo();
            return ResponseEntity.ok(ApiResponse.success(userInfo, "세션이 유효합니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증되지 않음"));
        }
    }
}
