package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.domain.admin.model.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 관리자 사용자 JPA 리포지토리
 */
@Repository
public interface AdminUserJpaRepository extends JpaRepository<AdminUser, Long> {

    /**
     * 사용자명으로 관리자 사용자 조회
     */
    Optional<AdminUser> findByUsername(String username);

    /**
     * 사용자명 존재 여부 확인
     */
    boolean existsByUsername(String username);

    /**
     * 로그인 시도 증가 (updatedAt 자동)
     */
    @Modifying
    @Query("UPDATE AdminUser u SET u.loginAttempts = u.loginAttempts + 1 WHERE u.username = :username")
    void incrementLoginAttempts(@Param("username") String username);

    /**
     * 성공적인 로그인 후 상태 업데이트
     */
    @Modifying
    @Query("UPDATE AdminUser u SET u.lastLogin = :lastLogin, u.loginAttempts = 0, u.lockedUntil = null WHERE u.username = :username")
    void updateSuccessfulLogin(@Param("username") String username, @Param("lastLogin") LocalDateTime lastLogin);

    /**
     * 계정 잠금 설정 (updatedAt 자동)
     */
    @Modifying
    @Query("UPDATE AdminUser u SET u.lockedUntil = :lockedUntil WHERE u.username = :username")
    void lockAccount(@Param("username") String username, @Param("lockedUntil") LocalDateTime lockedUntil);

    /**
     * 계정 잠금 해제
     */
    @Modifying
    @Query("UPDATE AdminUser u SET u.lockedUntil = null, u.loginAttempts = 0 WHERE u.username = :username")
    void unlockAccount(@Param("username") String username);
}

