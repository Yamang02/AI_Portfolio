package com.aiportfolio.backend.infrastructure.web.admin.util;

import com.aiportfolio.backend.application.admin.AuthService;
import com.aiportfolio.backend.domain.admin.model.dto.AdminUserInfo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Admin 인증 체크 유틸리티
 */
@Component
@RequiredArgsConstructor
public class AdminAuthChecker {

    private final AuthService authService;

    /**
     * 현재 요청이 인증된 관리자 요청인지 확인
     */
    public boolean isAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return authService.isValidSession(session);
    }

    /**
     * 현재 요청의 관리자 정보를 반환
     */
    public AdminUserInfo getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return authService.getCurrentUser(session);
    }

    /**
     * 인증되지 않은 경우 예외 발생
     */
    public void requireAuthentication(HttpServletRequest request) {
        if (!isAuthenticated(request)) {
            throw new IllegalArgumentException("인증이 필요합니다.");
        }
    }
}
