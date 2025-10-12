package com.aiportfolio.backend.infrastructure.security;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 관리자 인증 프로바이더
 * BCrypt 비밀번호 검증 및 계정 잠금 메커니즘 구현
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminAuthenticationProvider implements AuthenticationProvider {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 30;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();

        log.debug("Admin authentication attempt for user: {}", username);

        AdminUser adminUser = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Admin user not found: {}", username);
                    return new BadCredentialsException("Invalid username or password");
                });

        // 계정 잠금 확인
        if (adminUser.isLocked()) {
            log.warn("Admin account is locked: {}", username);
            throw new LockedException("Account is locked. Try again after " + LOCKOUT_DURATION_MINUTES + " minutes.");
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, adminUser.getPassword())) {
            log.warn("Invalid password for admin user: {}", username);
            
            // 로그인 시도 증가
            adminUser.incrementLoginAttempts();
            adminUserRepository.save(adminUser);

            // 최대 시도 횟수 초과 시 계정 잠금
            if (adminUser.getLoginAttempts() >= MAX_LOGIN_ATTEMPTS) {
                adminUser.lockAccount();
                adminUserRepository.save(adminUser);
                log.warn("Admin account locked due to too many failed attempts: {}", username);
                throw new LockedException("Account locked due to too many failed attempts. Try again after " + LOCKOUT_DURATION_MINUTES + " minutes.");
            }

            throw new BadCredentialsException("Invalid username or password");
        }

        // 로그인 성공 시 초기화
        adminUser.resetLoginAttempts();
        adminUserRepository.save(adminUser);

        log.info("Admin user authenticated successfully: {}", username);

        return new UsernamePasswordAuthenticationToken(
                adminUser,
                null,
                adminUser.getAuthorities()
        );
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}

