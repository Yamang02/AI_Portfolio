package com.aiportfolio.backend.application.admin;

import com.aiportfolio.backend.domain.admin.model.AdminUser;
import com.aiportfolio.backend.domain.admin.port.out.AdminUserRepository;
import com.aiportfolio.backend.infrastructure.web.dto.admin.AdminLoginRequest;
import com.aiportfolio.backend.infrastructure.web.dto.admin.AdminLoginResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자 인증 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminAuthService {

    private final AuthenticationManager authenticationManager;
    private final AdminUserRepository adminUserRepository;

    /**
     * 관리자 로그인
     */
    public AdminLoginResponse login(AdminLoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            AdminUser adminUser = (AdminUser) authentication.getPrincipal();

            log.info("Admin login successful: {}", adminUser.getUsername());
            return AdminLoginResponse.success(adminUser);

        } catch (BadCredentialsException e) {
            log.warn("Admin login failed - invalid credentials: {}", request.getUsername());
            return AdminLoginResponse.failure("사용자명 또는 비밀번호가 올바르지 않습니다");
        } catch (LockedException e) {
            log.warn("Admin login failed - account locked: {}", request.getUsername());
            return AdminLoginResponse.failure("계정이 잠겨있습니다. 30분 후 다시 시도해주세요");
        } catch (Exception e) {
            log.error("Admin login error: {}", e.getMessage(), e);
            return AdminLoginResponse.failure("로그인 중 오류가 발생했습니다");
        }
    }

    /**
     * 관리자 로그아웃
     */
    public void logout() {
        SecurityContextHolder.clearContext();
        log.info("Admin logout successful");
    }

    /**
     * 현재 인증된 관리자 정보 조회
     */
    @Transactional(readOnly = true)
    public AdminUser getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AdminUser) {
            return (AdminUser) authentication.getPrincipal();
        }
        return null;
    }

    /**
     * 세션 상태 확인
     */
    @Transactional(readOnly = true)
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated() && 
               !"anonymousUser".equals(authentication.getPrincipal());
    }
}

