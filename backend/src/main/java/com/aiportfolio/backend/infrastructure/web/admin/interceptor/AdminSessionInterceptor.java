package com.aiportfolio.backend.infrastructure.web.admin.interceptor;

import com.aiportfolio.backend.application.admin.exception.AdminAuthenticationException;
import com.aiportfolio.backend.infrastructure.web.admin.session.AdminSessionManager;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 관리자 API에 대한 세션 기반 인증을 보장하는 인터셉터.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSessionInterceptor implements HandlerInterceptor {

    private final AdminSessionManager adminSessionManager;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // CORS preflight 요청은 세션 검증 없이 통과시켜야 한다.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        HttpSession session = request.getSession(false);

        if (session == null) {
            log.debug("Rejected admin request without session: {} {}", request.getMethod(), request.getRequestURI());
            throw new AdminAuthenticationException("세션이 없습니다.");
        }

        if (adminSessionManager.resolveCurrentUser(session).isEmpty()) {
            log.debug("Rejected admin request with invalid session: {} {}", request.getMethod(), request.getRequestURI());
            throw new AdminAuthenticationException("인증이 필요합니다.");
        }

        return true;
    }
}

