package com.aiportfolio.backend.infrastructure.web.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 관리자 사용자 정보 DTO
 * 세션에 저장되므로 Serializable 구현
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserInfo implements Serializable {
    private static final long serialVersionUID = 1L;

    private String username;
    private String email;
    private String authProvider;
    private String role;
    private LocalDateTime lastLogin;
}

