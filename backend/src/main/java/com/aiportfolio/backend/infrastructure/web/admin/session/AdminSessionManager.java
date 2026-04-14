package com.aiportfolio.backend.infrastructure.web.admin.session;

import com.aiportfolio.backend.application.admin.exception.AdminAuthenticationException;
import com.aiportfolio.backend.application.admin.dto.AdminUserInfo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.stereotype.Component;

/**
 * HttpSession 기반의 관리자 세션을 캡슐화한 관리 컴포넌트.
 * 웹 계층에서만 세션을 다루고 애플리케이션 서비스는 세션 구현에 의존하지 않도록 한다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSessionManager {

    private final CookieSerializer cookieSerializer;

    public static final String ADMIN_USER_KEY = "ADMIN_USER";
    private static final int DEFAULT_SESSION_TIMEOUT_SECONDS = 30 * 60;

    /**
     * 세션에 관리자 정보를 저장하고 타임아웃을 설정한다.
     */
    public void establishSession(HttpSession session, AdminUserInfo userInfo) {
        if (session == null) {
            throw new AdminAuthenticationException("세션을 초기화할 수 없습니다.");
        }

        session.setAttribute(ADMIN_USER_KEY, userInfo);
        session.setMaxInactiveInterval(DEFAULT_SESSION_TIMEOUT_SECONDS);
        log.debug("Admin session established for user: {}", userInfo.getUsername());
    }

    /**
     * 세션에서 현재 관리자 정보를 조회한다.
     */
    public Optional<AdminUserInfo> resolveCurrentUser(HttpSession session) {
        if (session == null) {
            return Optional.empty();
        }

        Object attribute = session.getAttribute(ADMIN_USER_KEY);
        if (attribute instanceof AdminUserInfo adminUserInfo) {
            return Optional.of(adminUserInfo);
        }

        return Optional.empty();
    }

    /**
     * 세션을 무효화하고, 브라우저의 세션 쿠키(SESSION)를 만료시킨다.
     * 서버 세션만 지우면 쿠키가 남아 클라이언트가 세션 API를 재호출할 수 있으므로 반드시 함께 처리한다.
     */
    public void clearSession(HttpSession session, HttpServletRequest request, HttpServletResponse response) {
        if (session != null) {
            String sessionId = session.getId();
            session.removeAttribute(ADMIN_USER_KEY);
            session.invalidate();
            log.debug("Admin session invalidated: {}", sessionId);
        }

        cookieSerializer.writeCookieValue(new CookieSerializer.CookieValue(request, response, ""));
    }
}
