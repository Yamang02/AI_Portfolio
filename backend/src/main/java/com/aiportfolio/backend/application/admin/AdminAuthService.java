package com.aiportfolio.backend.application.admin;

import com.aiportfolio.backend.domain.admin.model.AdminUser;
import com.aiportfolio.backend.domain.admin.model.dto.AdminUserInfo;
import com.aiportfolio.backend.domain.admin.port.out.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자 인증 서비스
 * 비즈니스 로직만 담당 (인증은 Spring Security가 처리)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;

    /**
     * 현재 인증된 사용자 정보를 반환합니다.
     * Spring Security의 SecurityContext에서 정보를 가져옵니다.
     */
    @Transactional(readOnly = true)
    public AdminUserInfo getCurrentUserInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("인증되지 않은 사용자입니다.");
        }

        String username = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority())
                .orElse("ROLE_ADMIN");

        // DB에서 추가 정보 조회 (선택적)
        AdminUser adminUser = adminUserRepository.findByUsername(username).orElse(null);
        
        return AdminUserInfo.builder()
                .username(username)
                .role(role)
                .lastLogin(adminUser != null ? adminUser.getLastLogin() : null)
                .build();
    }

    /**
     * 로그아웃 처리 (비즈니스 로직만)
     */
    public void logout() {
        log.info("Logout request received");
        // Spring Security가 자동으로 SecurityContext를 정리함
        SecurityContextHolder.clearContext();
        log.info("SecurityContext cleared successfully");
    }
}