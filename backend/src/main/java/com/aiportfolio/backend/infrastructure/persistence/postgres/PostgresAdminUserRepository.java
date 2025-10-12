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
    public AdminUser save(AdminUser adminUser) {
        return adminUserJpaRepository.save(adminUser);
    }

    @Override
    public boolean existsByUsername(String username) {
        return adminUserJpaRepository.existsByUsername(username);
    }

    @Override
    public void incrementLoginAttempts(String username) {
        adminUserJpaRepository.incrementLoginAttempts(username, LocalDateTime.now());
    }

    @Override
    public void resetLoginAttempts(String username) {
        adminUserJpaRepository.resetLoginAttempts(username, LocalDateTime.now(), LocalDateTime.now());
    }

    @Override
    public void lockAccount(String username) {
        adminUserJpaRepository.lockAccount(username, LocalDateTime.now().plusMinutes(30), LocalDateTime.now());
    }
}

