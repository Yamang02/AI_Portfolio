package com.aiportfolio.backend.domain.admin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 관리자 사용자 엔티티
 * Admin Dashboard 인증을 위한 사용자 정보를 저장합니다.
 */
@Entity
@Table(name = "admin_users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AdminUser {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(name = "password", nullable = false)
    private String password; // BCrypt 해시
    
    @Column(name = "role", nullable = false, length = 50)
    @Builder.Default
    private String role = "ROLE_ADMIN";
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @Column(name = "login_attempts")
    @Builder.Default
    private Integer loginAttempts = 0;
    
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    /**
     * 계정이 잠겨있는지 확인합니다.
     */
    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }
    
    /**
     * 로그인 시도 횟수를 증가시킵니다.
     */
    public void incrementLoginAttempts() {
        this.loginAttempts++;
    }
    
    /**
     * 계정을 잠급니다.
     */
    public void lockAccount(int lockMinutes) {
        this.lockedUntil = LocalDateTime.now().plusMinutes(lockMinutes);
    }
    
    /**
     * 계정 잠금을 해제합니다.
     */
    public void unlockAccount() {
        this.lockedUntil = null;
        this.loginAttempts = 0;
    }
    
    /**
     * 로그인 시도 횟수를 초기화합니다.
     */
    public void resetLoginAttempts() {
        this.loginAttempts = 0;
    }
    
    /**
     * 성공적인 로그인 후 상태를 업데이트합니다.
     */
    public void onSuccessfulLogin() {
        this.lastLogin = LocalDateTime.now();
        this.loginAttempts = 0;
        this.lockedUntil = null;
    }
}