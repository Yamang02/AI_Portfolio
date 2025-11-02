package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.application.admin.AuthService;
import com.aiportfolio.backend.domain.admin.model.dto.AdminLoginRequest;
import com.aiportfolio.backend.domain.admin.model.dto.AdminUserInfo;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 인증 컨트롤러
 * 단순한 세션 기반 인증을 사용합니다.
 */
@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
@Slf4j
public class AdminAuthController {

    private final AuthService authService;

    /**
     * 관리자 로그인
     * 단순한 세션 기반 인증을 사용합니다.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AdminUserInfo>> login(
            @Valid @RequestBody AdminLoginRequest request,
            HttpServletRequest httpRequest) {
        log.debug("Login request received for user: {}", request.getUsername());

        try {
            HttpSession session = httpRequest.getSession(true);
            AdminUserInfo userInfo = authService.login(
                request.getUsername(), 
                request.getPassword(), 
                session
            );

            log.info("Login successful for user: {}", request.getUsername());
            return ResponseEntity.ok(ApiResponse.success(userInfo, "로그인 성공"));
        } catch (IllegalArgumentException e) {
            log.warn("Login failed for user: {} - {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증 실패"));
        } catch (Exception e) {
            log.error("Login error for user: {}", request.getUsername(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("로그인 처리 중 오류가 발생했습니다.", "서버 오류"));
        }
    }

    /**
     * 관리자 로그아웃
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest httpRequest) {
        log.debug("Logout request received");
        try {
            HttpSession session = httpRequest.getSession(false);
            authService.logout(session);
            
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
    public ResponseEntity<ApiResponse<AdminUserInfo>> checkSession(HttpServletRequest httpRequest) {
        log.debug("=== Session check request received ===");

        // 디버깅을 위한 상세 로그 추가
        HttpSession session = httpRequest.getSession(false);
        log.debug("Session exists: {}", session != null);
        if (session != null) {
            log.debug("Session ID: {}", session.getId());
            log.debug("Session creation time: {}", session.getCreationTime());
            log.debug("Session last accessed time: {}", session.getLastAccessedTime());
            log.debug("Session max inactive interval: {}", session.getMaxInactiveInterval());
        }

        // 쿠키 확인
        if (httpRequest.getCookies() != null) {
            for (var cookie : httpRequest.getCookies()) {
                log.debug("Cookie: name={}, value={}, path={}, maxAge={}",
                    cookie.getName(), cookie.getValue(), cookie.getPath(), cookie.getMaxAge());
            }
        } else {
            log.warn("No cookies found in request");
        }

        try {
            AdminUserInfo userInfo = authService.getCurrentUser(session);
            log.info("Session check successful for user: {}", userInfo.getUsername());
            return ResponseEntity.ok(ApiResponse.success(userInfo, "세션이 유효합니다"));
        } catch (IllegalArgumentException e) {
            log.warn("Session check failed: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(ApiResponse.error(e.getMessage(), "인증되지 않음"));
        }
    }
}
