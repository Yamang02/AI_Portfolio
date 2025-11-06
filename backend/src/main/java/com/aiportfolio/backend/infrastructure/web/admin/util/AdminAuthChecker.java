package com.aiportfolio.backend.infrastructure.web.admin.util;

import com.aiportfolio.backend.application.admin.exception.AdminAuthenticationException;
import com.aiportfolio.backend.infrastructure.web.admin.session.AdminSessionManager;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * HttpSession 기반 인증 검증을 담당하는 유틸리티.
 * 기존 컨트롤러에서 사용하던 API를 유지하면서 내부적으로 AdminSessionManager를 사용한다.
 */
@Component
@RequiredArgsConstructor
public class AdminAuthChecker {

    private final AdminSessionManager adminSessionManager;

    public boolean isAuthenticated(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return adminSessionManager.resolveCurrentUser(session).isPresent();
    }

    public void requireAuthentication(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (adminSessionManager.resolveCurrentUser(session).isEmpty()) {
            throw new AdminAuthenticationException("인증이 필요합니다.");
        }
    }
}

