package com.aiportfolio.backend.application.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

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
