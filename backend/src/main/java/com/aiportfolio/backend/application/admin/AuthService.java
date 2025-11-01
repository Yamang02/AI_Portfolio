package com.aiportfolio.backend.application.admin;

import com.aiportfolio.backend.domain.admin.model.AdminUser;
import com.aiportfolio.backend.domain.admin.model.dto.AdminUserInfo;
import com.aiportfolio.backend.domain.admin.port.out.AdminUserRepository;
import jakarta.servlet.http.HttpSession;
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

    private static final String SESSION_USER_KEY = "ADMIN_USER";
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;

    /**
     * 로그인 처리 (사용자명 또는 이메일로 로그인 가능)
     */
    public AdminUserInfo login(String usernameOrEmail, String password, HttpSession session) {
        log.debug("Login attempt for user: {}", usernameOrEmail);

        // 사용자 조회 (사용자명 또는 이메일로)
        AdminUser adminUser = adminUserRepository.findByUsername(usernameOrEmail)
            .or(() -> adminUserRepository.findByEmail(usernameOrEmail))
            .orElseThrow(() -> {
                log.warn("Login failed: User not found - {}", usernameOrEmail);
                return new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다.");
            });

        // 계정 잠금 확인
        if (adminUser.isLocked()) {
            log.warn("Login failed: Account locked - {}", usernameOrEmail);
            throw new IllegalArgumentException("계정이 잠겨있습니다. 잠시 후 다시 시도해주세요.");
        }

        // 비밀번호 검증
        if (!BCrypt.checkpw(password, adminUser.getPassword())) {
            handleFailedLogin(adminUser);
            log.warn("Login failed: Invalid password - {}", usernameOrEmail);
            throw new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다.");
        }

        // 성공적인 로그인 처리
        handleSuccessfulLogin(adminUser);

        // 세션에 사용자 정보 저장
        AdminUserInfo userInfo = AdminUserInfo.builder()
                .username(adminUser.getUsername())
                .email(adminUser.getEmail())
                .authProvider(adminUser.getAuthProvider())
                .role(adminUser.getRole())
                .lastLogin(adminUser.getLastLogin())
                .build();

        session.setAttribute(SESSION_USER_KEY, userInfo);
        session.setMaxInactiveInterval(30 * 60); // 30분 세션 타임아웃

        log.info("Login successful for user: {}", usernameOrEmail);
        return userInfo;
    }

    /**
     * 로그아웃 처리
     */
    public void logout(HttpSession session) {
        log.debug("Logout request received");
        
        if (session != null) {
            session.removeAttribute(SESSION_USER_KEY);
            session.invalidate();
            log.info("Session invalidated successfully");
        }
    }

    /**
     * 현재 세션의 사용자 정보 조회
     */
    @Transactional(readOnly = true)
    public AdminUserInfo getCurrentUser(HttpSession session) {
        if (session == null) {
            throw new IllegalArgumentException("세션이 없습니다.");
        }

        AdminUserInfo userInfo = (AdminUserInfo) session.getAttribute(SESSION_USER_KEY);
        if (userInfo == null) {
            throw new IllegalArgumentException("인증되지 않은 사용자입니다.");
        }

        return userInfo;
    }

    /**
     * 세션 유효성 검증
     */
    public boolean isValidSession(HttpSession session) {
        if (session == null) {
            return false;
        }

        AdminUserInfo userInfo = (AdminUserInfo) session.getAttribute(SESSION_USER_KEY);
        return userInfo != null;
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