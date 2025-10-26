package com.aiportfolio.backend.infrastructure.web.dto.relationship;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 프로젝트 관계 응답 DTO
 *
 * Business ID를 포함하여 프론트엔드에서 일관되게 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRelationshipDto {

    private Long id;  // 관계 테이블의 ID
    private Long projectId;  // DB ID (내부 사용, 삭제 시)
    private String projectBusinessId;  // Business ID (외부 API 사용)
    private String projectTitle;
    private Boolean isPrimary;
    private String usageDescription;

    // Experience-Project만 사용
    private String roleInProject;
    private String contributionDescription;

    // Education-Project만 사용
    private String projectType;
    private String grade;
}

