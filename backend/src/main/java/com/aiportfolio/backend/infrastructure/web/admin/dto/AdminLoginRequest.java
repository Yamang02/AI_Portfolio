package com.aiportfolio.backend.infrastructure.web.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 웹 계층에서 사용하는 관리자 로그인 요청 DTO.
 */
@Getter
@Setter
@NoArgsConstructor
public class AdminLoginRequest {

    @NotBlank(message = "사용자명 또는 이메일은 필수입니다")
    @Size(min = 3, max = 255, message = "사용자명 또는 이메일은 3-255자 사이여야 합니다")
    private String username;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 6, max = 100, message = "비밀번호는 6-100자 사이여야 합니다")
    private String password;
}

