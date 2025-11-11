package com.aiportfolio.backend.infrastructure.web.admin.interceptor;

import com.aiportfolio.backend.application.admin.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Admin API 세션 인증 인터셉터
 * /api/admin/** 경로에 대한 세션 검증을 수행합니다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();

        log.debug("AdminAuthInterceptor - URI: {}, Method: {}", requestURI, method);

        // 인증이 필요 없는 경로
        if (isPublicPath(requestURI)) {
            log.debug("Public path, allowing access: {}", requestURI);
            return true;
        }

        // OPTIONS 요청은 CORS preflight이므로 통과
        if ("OPTIONS".equalsIgnoreCase(method)) {
            log.debug("OPTIONS request, allowing access");
            return true;
        }

        // 세션 검증
        HttpSession session = request.getSession(false);
        if (session == null || !authService.isValidSession(session)) {
            log.warn("Unauthorized access attempt to: {}", requestURI);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            try {
                response.getWriter().write("{\"success\":false,\"message\":\"인증되지 않은 사용자입니다.\",\"errorCode\":\"UNAUTHORIZED\"}");
            } catch (Exception e) {
                log.error("Failed to write error response", e);
            }

            return false;
        }

        log.debug("Session valid, allowing access to: {}", requestURI);
        return true;
    }

    /**
     * 인증이 필요 없는 공개 경로인지 확인
     */
    private boolean isPublicPath(String requestURI) {
        return requestURI.equals("/api/admin/auth/login")
            || requestURI.equals("/api/admin/auth/session")
            || requestURI.equals("/api/admin/auth/logout");
    }
}
