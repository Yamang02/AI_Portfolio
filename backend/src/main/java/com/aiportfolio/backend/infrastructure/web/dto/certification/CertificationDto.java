package com.aiportfolio.backend.infrastructure.web.dto.certification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Certification DTO
 *
 * REST API 요청/응답용 데이터 전송 객체
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificationDto {

    /**
     * 비즈니스 ID (CRT001, CRT002 등)
     */
    private String id;

    /**
     * 자격증명
     */
    @NotBlank(message = "자격증명은 필수입니다")
    @Size(max = 200, message = "자격증명은 최대 200자까지 입력할 수 있습니다")
    private String name;

    /**
     * 발급기관
     */
    @NotBlank(message = "발급기관은 필수입니다")
    @Size(max = 200, message = "발급기관은 최대 200자까지 입력할 수 있습니다")
    private String issuer;

    /**
     * 취득일
     */
    private LocalDate date;

    /**
     * 만료일 (NULL이면 만료 없음)
     */
    private LocalDate expiryDate;

    /**
     * 자격증 번호/ID
     */
    @Size(max = 100, message = "자격증 번호는 최대 100자까지 입력할 수 있습니다")
    private String credentialId;

    /**
     * 자격증 확인 URL
     */
    @Size(max = 500, message = "URL은 최대 500자까지 입력할 수 있습니다")
    private String credentialUrl;

    /**
     * 설명
     */
    @Size(max = 1000, message = "설명은 최대 1000자까지 입력할 수 있습니다")
    private String description;

    /**
     * 카테고리 (IT, LANGUAGE, PROJECT_MANAGEMENT, CLOUD, SECURITY, DATA, OTHER)
     */
    @Size(max = 100, message = "카테고리는 최대 100자까지 입력할 수 있습니다")
    private String category;

    /**
     * 정렬 순서
     */
    private Integer sortOrder;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;
}
