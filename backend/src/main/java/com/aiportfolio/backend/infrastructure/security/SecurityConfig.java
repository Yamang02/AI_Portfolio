package com.aiportfolio.backend.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.aiportfolio.backend.infrastructure.security.provider.AdminAuthenticationProvider;

import java.util.Arrays;

/**
 * Spring Security 설정 클래스
 * Admin Dashboard 인증 및 보안 설정을 담당합니다.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final AdminAuthenticationProvider adminAuthenticationProvider;

    public SecurityConfig(AdminAuthenticationProvider adminAuthenticationProvider) {
        this.adminAuthenticationProvider = adminAuthenticationProvider;
    }

    /**
     * 보안 필터 체인을 구성합니다.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 인증 요구사항 설정
            .authorizeHttpRequests(auth -> auth
                // Admin 인증 API는 누구나 접근 가능 (로그인, 로그아웃, 세션 체크)
                .requestMatchers("/api/admin/auth/**").permitAll()
                // Admin 관리 API는 인증 필요 (캐시, 프로젝트 관리 등)
                .requestMatchers("/api/admin/**").authenticated()
                // Public API
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/data/**", "/api/chat/**", "/api/github/**", "/api/tech-stack/**").permitAll()
                // 나머지는 모두 허용
                .anyRequest().permitAll()
            )

            // 폼 로그인 비활성화
            .formLogin(form -> form.disable())

            // HTTP Basic 인증 비활성화
            .httpBasic(basic -> basic.disable())

            // CSRF 비활성화
            .csrf(csrf -> csrf.disable())

            // SecurityContext를 세션에 저장하도록 명시적으로 설정
            .securityContext(context -> context
                .requireExplicitSave(false)  // SecurityContext 자동 저장 활성화
            )

            // 세션 관리 설정 - 항상 세션 생성
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
                .maximumSessions(1) // 동시 세션 1개로 제한
                .maxSessionsPreventsLogin(false) // 새 로그인 시 이전 세션 무효화
            );

        return http.build();
    }

    /**
     * CORS 설정을 구성합니다.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * AuthenticationManager 빈을 생성합니다.
     * AdminAuthenticationProvider를 사용합니다.
     */
    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(adminAuthenticationProvider);
    }
}