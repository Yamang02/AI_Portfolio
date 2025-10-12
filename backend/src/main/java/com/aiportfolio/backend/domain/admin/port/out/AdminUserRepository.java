package com.aiportfolio.backend.domain.admin.port.out;

import com.aiportfolio.backend.domain.admin.model.AdminUser;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 관리자 사용자 리포지토리 포트
 */
public interface AdminUserRepository {

    /**
     * 사용자명으로 관리자 사용자 조회
     */
    Optional<AdminUser> findByUsername(String username);

    /**
     * 관리자 사용자 저장
     */
    AdminUser save(AdminUser adminUser);

    /**
     * 사용자명 존재 여부 확인
     */
    boolean existsByUsername(String username);

    /**
     * 로그인 시도 증가
     */
    void incrementLoginAttempts(String username);

    /**
     * 로그인 성공 시 초기화
     */
    void resetLoginAttempts(String username);

    /**
     * 계정 잠금 설정
     */
    void lockAccount(String username);
}

