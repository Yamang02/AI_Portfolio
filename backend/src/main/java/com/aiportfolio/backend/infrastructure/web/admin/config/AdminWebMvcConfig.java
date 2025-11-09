package com.aiportfolio.backend.infrastructure.web.admin.config;

import com.aiportfolio.backend.infrastructure.web.admin.interceptor.AdminSessionInterceptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 관리자 전용 웹 설정 - 세션 인터셉터 등록.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class AdminWebMvcConfig implements WebMvcConfigurer {

    private final AdminSessionInterceptor adminSessionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        log.info("Registering admin session interceptor for /api/admin/**");
        registry.addInterceptor(adminSessionInterceptor)
                .addPathPatterns("/api/admin/**")
                .excludePathPatterns(
                        "/api/admin/auth/login",
                        "/api/admin/auth/logout",
                        "/api/admin/auth/session"
                );
    }
}

