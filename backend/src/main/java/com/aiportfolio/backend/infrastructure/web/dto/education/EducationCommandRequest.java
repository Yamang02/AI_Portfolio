package com.aiportfolio.backend.infrastructure.web.dto.education;

import com.aiportfolio.backend.infrastructure.web.dto.relationship.BulkProjectRelationshipRequest;
import com.aiportfolio.backend.infrastructure.web.dto.relationship.BulkTechStackRelationshipRequest;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

/**
 * 학력 기본 정보와 관계 정보를 함께 전달하기 위한 커맨드 요청 DTO.
 *
 * <p>관리자용 생성/수정 요청에서 사용되며, 하나의 트랜잭션 안에서
 * 학력 기본 정보와 연관 관계(기술 스택, 프로젝트)를 모두 갱신합니다.</p>
 */
@Data
public class EducationCommandRequest {

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    @Size(max = 2000, message = "설명은 2000자를 넘을 수 없습니다")
    private String description;

    @NotBlank(message = "교육기관은 필수입니다")
    private String organization;

    private String degree;

    private String major;

    @NotNull(message = "시작일은 필수입니다")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    private BigDecimal gpa;

    @NotBlank(message = "타입은 필수입니다")
    private String type;

    private Integer sortOrder;

    private List<BulkTechStackRelationshipRequest.TechStackRelationshipItem> techStackRelationships;

    private List<BulkProjectRelationshipRequest.ProjectRelationshipItem> projectRelationships;

    public List<BulkTechStackRelationshipRequest.TechStackRelationshipItem> safeTechStackRelationships() {
        return techStackRelationships != null ? techStackRelationships : Collections.emptyList();
    }

    public List<BulkProjectRelationshipRequest.ProjectRelationshipItem> safeProjectRelationships() {
        return projectRelationships != null ? projectRelationships : Collections.emptyList();
    }
}
