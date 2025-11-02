package com.aiportfolio.backend.infrastructure.web.dto.relationship;

import lombok.Data;
import java.util.List;

/**
 * 프로젝트 관계 일괄 업데이트 요청 DTO
 * 
 * Education 또는 Experience의 프로젝트 관계를 한 번에 업데이트
 * (기존 관계 전체 삭제 → 새 관계 생성, @Transactional로 원자성 보장)
 */
@Data
public class BulkProjectRelationshipRequest {
    
    private List<ProjectRelationshipItem> projectRelationships;
    
    /**
     * 개별 프로젝트 관계 아이템
     */
    @Data
    public static class ProjectRelationshipItem {
        private String projectBusinessId;  // Business ID (prj-001, prj-002...)
        
        // Education-Project 필드
        private String projectType;
        private String grade;
        
        // Experience-Project 필드
        private String roleInProject;
        private String contributionDescription;
        
        private Boolean isPrimary;
        private String usageDescription;
    }
}

