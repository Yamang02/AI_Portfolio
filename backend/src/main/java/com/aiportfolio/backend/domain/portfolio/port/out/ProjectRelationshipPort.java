package com.aiportfolio.backend.domain.portfolio.port.out;

import java.util.List;

/**
 * Project 관계 관리 Port
 * Hexagonal Architecture의 Secondary Port (Outbound Port)
 * 
 * Project와 TechStack 간의 관계를 관리하는 인터페이스
 */
public interface ProjectRelationshipPort {
    
    /**
     * 프로젝트의 기술 스택 관계를 교체합니다.
     * 기존 관계를 모두 삭제하고 새로운 관계를 생성합니다.
     * 
     * @param projectId 프로젝트 DB ID
     * @param relationships 기술 스택 관계 리스트
     */
    void replaceTechStacks(Long projectId, List<TechStackRelation> relationships);

    /**
     * 프로젝트 비즈니스 ID 기준 기술 스택 관계 목록 조회.
     */
    List<ProjectTechStackRow> listTechStacksByProjectBusinessId(String projectBusinessId);

    /**
     * 기술 스택 관계 추가 (프로젝트는 비즈니스 ID, techStackId는 숫자 ID 또는 레거시 name 문자열).
     */
    void addTechStackByProjectBusinessId(
            String projectBusinessId,
            Long techStackIdOrLegacy,
            boolean isPrimary,
            String usageDescription);

    void deleteTechStackByProjectBusinessId(String projectBusinessId, long techStackId);

    void replaceTechStacksByProjectBusinessId(String projectBusinessId, List<TechStackRelation> relationships);
    
    /**
     * 기술 스택 관계를 표현하는 record
     */
    record TechStackRelation(Long techStackId, boolean isPrimary, String usageDescription) {}

    record ProjectTechStackRow(
            Long id,
            Long techStackId,
            String techStackName,
            String techStackDisplayName,
            String category,
            Boolean isPrimary,
            String usageDescription) {}
}



