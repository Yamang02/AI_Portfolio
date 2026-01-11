package com.aiportfolio.backend.domain.portfolio.port.out;

import java.util.List;

/**
 * Education 관계 관리 Port
 * Hexagonal Architecture의 Secondary Port (Outbound Port)
 * 
 * Education과 TechStack, Project 간의 관계를 관리하는 인터페이스
 */
public interface EducationRelationshipPort {
    
    /**
     * 교육의 기술 스택 관계를 교체합니다.
     * 기존 관계를 모두 삭제하고 새로운 관계를 생성합니다.
     * 
     * @param educationId 교육 DB ID
     * @param relationships 기술 스택 관계 리스트
     */
    void replaceTechStacks(Long educationId, List<TechStackRelation> relationships);
    
    /**
     * 교육의 프로젝트 관계를 교체합니다.
     * 기존 관계를 모두 삭제하고 새로운 관계를 생성합니다.
     * 
     * @param educationId 교육 DB ID
     * @param relationships 프로젝트 관계 리스트
     */
    void replaceProjects(Long educationId, List<ProjectRelation> relationships);

    /**
     * 기술 스택 관계를 표현하는 record
     */
    record TechStackRelation(Long techStackId, boolean isPrimary, String usageDescription) {}

    /**
     * 프로젝트 관계를 표현하는 record
     * @param projectDbId 프로젝트 DB ID (Long, 비즈니스 ID 아님)
     */
    record ProjectRelation(Long projectDbId, String projectType, String grade) {}
}



