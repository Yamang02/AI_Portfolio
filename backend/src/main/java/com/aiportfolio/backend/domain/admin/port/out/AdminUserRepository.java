package com.aiportfolio.backend.domain.admin.port.out;

import com.aiportfolio.backend.domain.admin.model.AdminUser;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 관리자 사용자 리포지토리
 * AdminUser 엔티티에 대한 데이터 접근을 담당합니다.
 */
@Repository
public interface AdminUserRepository {
    
    /**
     * 사용자명으로 관리자 사용자를 조회합니다.
     */
    Optional<AdminUser> findByUsername(String username);
    
    /**
     * 사용자명이 존재하는지 확인합니다.
     */
    boolean existsByUsername(String username);
    
    /**
     * 관리자 사용자를 저장합니다.
     */
    AdminUser save(AdminUser adminUser);
    
    /**
     * 로그인 시도 횟수를 증가시킵니다.
     */
    void incrementLoginAttempts(String username);
    
    /**
     * 계정을 잠급니다.
     */
    void lockAccount(String username, LocalDateTime lockedUntil);
    
    /**
     * 성공적인 로그인 후 상태를 업데이트합니다.
     */
    void updateSuccessfulLogin(String username, LocalDateTime lastLogin);
    
    /**
     * 계정 잠금을 해제합니다.
     */
    void unlockAccount(String username);
}