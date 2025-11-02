package com.aiportfolio.backend.infrastructure.persistence.postgres;

import com.aiportfolio.backend.domain.admin.model.AdminUser;
import com.aiportfolio.backend.domain.admin.port.out.AdminUserRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.AdminUserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 관리자 사용자 리포지토리 어댑터
 */
@Component
@RequiredArgsConstructor
public class PostgresAdminUserRepository implements AdminUserRepository {

    private final AdminUserJpaRepository adminUserJpaRepository;

    @Override
    public Optional<AdminUser> findByUsername(String username) {
        return adminUserJpaRepository.findByUsername(username);
    }

    @Override
    public Optional<AdminUser> findByEmail(String email) {
        return adminUserJpaRepository.findByEmail(email);
    }

    @Override
    public AdminUser save(AdminUser adminUser) {
        return adminUserJpaRepository.save(adminUser);
    }

    @Override
    public boolean existsByUsername(String username) {
        return adminUserJpaRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return adminUserJpaRepository.existsByEmail(email);
    }

    @Override
    public void incrementLoginAttempts(String username) {
        adminUserJpaRepository.incrementLoginAttempts(username);
    }

    @Override
    public void lockAccount(String username, LocalDateTime lockedUntil) {
        adminUserJpaRepository.lockAccount(username, lockedUntil);
    }

    @Override
    public void updateSuccessfulLogin(String username, LocalDateTime lastLogin) {
        adminUserJpaRepository.updateSuccessfulLogin(username, lastLogin);
    }

    @Override
    public void unlockAccount(String username) {
        adminUserJpaRepository.unlockAccount(username);
    }
}

