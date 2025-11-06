package com.aiportfolio.backend.application.admin;

import com.aiportfolio.backend.application.admin.exception.AdminAuthenticationException;
import com.aiportfolio.backend.domain.admin.model.AdminUser;
import com.aiportfolio.backend.domain.admin.model.dto.AdminUserInfo;
import com.aiportfolio.backend.domain.admin.port.out.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 세션 기반 인증 서비스
 * Spring Security 없이 HttpSession을 직접 사용합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final AdminUserRepository adminUserRepository;

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;

    /**
     * 로그인 처리 (사용자명 또는 이메일로 로그인 가능)
     */
    public AdminUserInfo login(String usernameOrEmail, String password) {
        log.debug("Login attempt for user: {}", usernameOrEmail);

        // 사용자 조회 (사용자명 또는 이메일로)
        AdminUser adminUser = adminUserRepository.findByUsername(usernameOrEmail)
            .or(() -> adminUserRepository.findByEmail(usernameOrEmail))
            .orElseThrow(() -> {
                log.warn("Login failed: User not found - {}", usernameOrEmail);
                return new AdminAuthenticationException("사용자명 또는 비밀번호가 올바르지 않습니다.");
            });

        // 계정 잠금 확인
        if (adminUser.isLocked()) {
            log.warn("Login failed: Account locked - {}", usernameOrEmail);
            throw new AdminAuthenticationException("계정이 잠겨있습니다. 잠시 후 다시 시도해주세요.");
        }

        // 비밀번호 검증
        if (!BCrypt.checkpw(password, adminUser.getPassword())) {
            handleFailedLogin(adminUser);
            log.warn("Login failed: Invalid password - {}", usernameOrEmail);
            throw new AdminAuthenticationException("사용자명 또는 비밀번호가 올바르지 않습니다.");
        }

        // 성공적인 로그인 처리
        handleSuccessfulLogin(adminUser);

        AdminUserInfo userInfo = AdminUserInfo.builder()
                .username(adminUser.getUsername())
                .email(adminUser.getEmail())
                .authProvider(adminUser.getAuthProvider())
                .role(adminUser.getRole())
                .lastLogin(adminUser.getLastLogin())
                .build();

        log.info("Login successful for user: {}", usernameOrEmail);
        return userInfo;
    }

    /**
     * 로그인 실패 처리
     */
    private void handleFailedLogin(AdminUser adminUser) {
        adminUser.incrementLoginAttempts();
        
        if (adminUser.getLoginAttempts() >= MAX_LOGIN_ATTEMPTS) {
            adminUser.lockAccount(LOCK_DURATION_MINUTES);
            log.warn("Account locked due to too many failed attempts: {}", adminUser.getUsername());
        }
        
        adminUserRepository.save(adminUser);
    }

    /**
     * 성공적인 로그인 처리
     */
    private void handleSuccessfulLogin(AdminUser adminUser) {
        adminUser.onSuccessfulLogin();
        adminUserRepository.save(adminUser);
    }

    /**
     * 비밀번호 해싱 (관리자 계정 생성 시 사용)
     */
    public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
}