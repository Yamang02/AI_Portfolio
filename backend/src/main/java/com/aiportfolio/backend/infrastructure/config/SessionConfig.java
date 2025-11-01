package com.aiportfolio.backend.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

/**
 * Spring Session 쿠키 구성
 * 브라우저 새로고침 후에도 세션이 유지되도록 쿠키 설정을 명시적으로 구성합니다.
 */
@Configuration
public class SessionConfig {

    @Value("${app.session.cookie.secure:false}")
    private boolean cookieSecure;

    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();

        // 쿠키 이름 설정 (기본값: SESSION)
        serializer.setCookieName("SESSION");

        // 쿠키 경로 설정 - 모든 경로에서 쿠키 전송
        serializer.setCookiePath("/");

        // HttpOnly 설정 - XSS 공격 방지
        serializer.setUseHttpOnlyCookie(true);

        // SameSite 설정 - CSRF 공격 방지하면서도 same-origin 요청 허용
        // Lax: GET 요청과 top-level navigation에서 쿠키 전송
        serializer.setSameSite("Lax");

        // Secure 설정 - application.yml의 app.session.cookie.secure 값 사용
        // 로컬: false (http 허용)
        // 스테이징/프로덕션: true (https만 허용)
        serializer.setUseSecureCookie(cookieSecure);

        // 쿠키 Max-Age 설정 (-1은 브라우저 세션 쿠키로 동작)
        // 브라우저를 닫으면 삭제되지만, 새로고침에는 유지됨
        serializer.setCookieMaxAge(-1);

        return serializer;
    }
}
