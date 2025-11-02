package com.aiportfolio.backend.infrastructure.web.dto.relationship;

import lombok.Data;

/**
 * 프로젝트 관계 생성/수정 요청 DTO
 *
 * Business ID를 사용하여 외부 API와 통신
 */
@Data
public class ProjectRelationshipRequest {

    private String projectBusinessId;  // Business ID (PRJ001, PRJ002...)
    private Boolean isPrimary;
    private String usageDescription;

    // Experience-Project만 사용
    private String roleInProject;
    private String contributionDescription;

    // Education-Project만 사용
    private String projectType;
    private String grade;
}

