package com.aiportfolio.backend.application.admin;

import com.aiportfolio.backend.domain.admin.model.AdminUser;
import com.aiportfolio.backend.domain.admin.model.dto.AdminUserInfo;
import com.aiportfolio.backend.domain.admin.port.out.AdminUserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 관리자 인증 서비스
 * 로그인, 로그아웃, 세션 관리를 담당합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String SESSION_ADMIN_KEY = "ADMIN_USER";

    /**
     * 관리자 로그인을 처리합니다.
     * @throws IllegalArgumentException 인증 실패 시
     */
    public AdminUserInfo login(String username, String password, HttpSession session) {
        log.debug("Processing login request for user: {}", username);

        // 사용자 조회
        AdminUser adminUser = adminUserRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다."));

        log.debug("Found user: username={}, role={}", adminUser.getUsername(), adminUser.getRole());

        // 계정 잠금 확인
        if (adminUser.isLocked()) {
            log.warn("Login failed: Account locked - {}", username);
            throw new IllegalArgumentException("계정이 잠겨있습니다. 나중에 다시 시도해주세요.");
        }

        // 비밀번호 검증 (bcrypt 해시 비교)
        boolean passwordMatches = passwordEncoder.matches(password, adminUser.getPassword());
        log.debug("Password match result: {}", passwordMatches);

        if (!passwordMatches) {
            log.warn("Login failed: Invalid password - {}", username);
            throw new IllegalArgumentException("사용자명 또는 비밀번호가 올바르지 않습니다.");
        }

        // 성공적인 로그인 처리
        adminUser.onSuccessfulLogin();
        adminUserRepository.save(adminUser);

        // 응답 생성
        AdminUserInfo userInfo = AdminUserInfo.builder()
            .username(adminUser.getUsername())
            .role(adminUser.getRole())
            .lastLogin(adminUser.getLastLogin())
            .build();

        // 세션에 사용자 정보 저장
        session.setAttribute(SESSION_ADMIN_KEY, userInfo);
        log.info("Login successful for user: {}, session ID: {}", username, session.getId());
        
        // 세션 저장 확인 로그 추가
        Object storedUserInfo = session.getAttribute(SESSION_ADMIN_KEY);
        if (storedUserInfo != null) {
            log.info("Session attribute '{}' successfully stored for user: {}", SESSION_ADMIN_KEY, username);
        } else {
            log.error("Failed to store session attribute '{}' for user: {}", SESSION_ADMIN_KEY, username);
        }

        return userInfo;
    }

    /**
     * 관리자 로그아웃을 처리합니다.
     */
    public void logout(HttpSession session) {
        log.info("Logout request received, session ID: {}", session.getId());
        session.invalidate();
        log.info("Session invalidated successfully");
    }

    /**
     * 현재 세션 상태를 확인합니다.
     * @throws IllegalArgumentException 세션이 유효하지 않은 경우
     */
    @Transactional(readOnly = true)
    public AdminUserInfo checkSession(HttpSession session) {
        log.debug("Session check request received, session ID: {}", session.getId());

        try {
            // 세션에서 사용자 정보 조회
            AdminUserInfo userInfo = (AdminUserInfo) session.getAttribute(SESSION_ADMIN_KEY);
            
            log.debug("Retrieved userInfo from session: {}", userInfo);

            if (userInfo == null) {
                log.warn("No admin user found in session, session ID: {}", session.getId());
                throw new IllegalArgumentException("세션이 만료되었습니다");
            }

            log.debug("Session valid for user: {}", userInfo.getUsername());
            return userInfo;
        } catch (Exception e) {
            log.error("Error during session check, session ID: {}", session.getId(), e);
            throw new IllegalArgumentException("세션 확인 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}