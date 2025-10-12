package com.aiportfolio.backend.infrastructure.web.dto.admin;

import com.aiportfolio.backend.domain.admin.model.AdminUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 관리자 로그인 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginResponse {

    private boolean success;
    private String message;
    private AdminUserInfo user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminUserInfo {
        private String username;
        private String role;
        private LocalDateTime lastLogin;
    }

    public static AdminLoginResponse success(AdminUser adminUser) {
        return AdminLoginResponse.builder()
                .success(true)
                .message("로그인 성공")
                .user(AdminUserInfo.builder()
                        .username(adminUser.getUsername())
                        .role(adminUser.getRole())
                        .lastLogin(adminUser.getLastLogin())
                        .build())
                .build();
    }

    public static AdminLoginResponse failure(String message) {
        return AdminLoginResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}

