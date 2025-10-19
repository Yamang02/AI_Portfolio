package com.aiportfolio.backend.infrastructure.security.provider;

import com.aiportfolio.backend.domain.admin.model.AdminUser;
import com.aiportfolio.backend.domain.admin.port.out.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * 관리자 인증 제공자
 * AdminUser 엔티티를 사용한 커스텀 인증 로직을 구현합니다.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAuthenticationProvider implements AuthenticationProvider {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCK_DURATION_MINUTES = 30;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();

        log.debug("Attempting authentication for user: {}", username);

        // 사용자 조회
        AdminUser adminUser = adminUserRepository.findByUsername(username)
            .orElseThrow(() -> {
                log.warn("Authentication failed: User not found - {}", username);
                return new BadCredentialsException("Invalid username or password");
            });

        // 계정 잠금 확인
        if (adminUser.isLocked()) {
            log.warn("Authentication failed: Account locked - {}", username);
            throw new LockedException("Account is locked. Please try again later.");
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, adminUser.getPassword())) {
            handleFailedLogin(adminUser);
            log.warn("Authentication failed: Invalid password - {}", username);
            throw new BadCredentialsException("Invalid username or password");
        }

        // 성공적인 로그인 처리
        handleSuccessfulLogin(adminUser);
        log.info("Authentication successful for user: {}", username);

        return new UsernamePasswordAuthenticationToken(
            username,
            password,
            Collections.singletonList(new SimpleGrantedAuthority(adminUser.getRole()))
        );
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }

    /**
     * 로그인 실패 처리를 수행합니다.
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
     * 성공적인 로그인 처리를 수행합니다.
     */
    private void handleSuccessfulLogin(AdminUser adminUser) {
        adminUser.onSuccessfulLogin();
        adminUserRepository.save(adminUser);
    }
}
