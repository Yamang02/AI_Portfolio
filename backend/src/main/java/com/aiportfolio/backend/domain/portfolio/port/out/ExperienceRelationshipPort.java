package com.aiportfolio.backend.domain.portfolio.port.out;

import java.util.List;

/**
 * Experience 관계 관리 Port
 * Hexagonal Architecture의 Secondary Port (Outbound Port)
 * 
 * Experience와 TechStack, Project 간의 관계를 관리하는 인터페이스
 */
public interface ExperienceRelationshipPort {

    /**
     * Experience-TechStack 관계를 교체 (머지 전략)
     *
     * @param experienceId Experience DB ID
     * @param relationships TechStack 관계 리스트
     */
    void replaceTechStacks(Long experienceId, List<TechStackRelation> relationships);

    /**
     * Experience-Project 관계를 교체 (머지 전략)
     *
     * @param experienceId Experience DB ID
     * @param relationships Project 관계 리스트
     */
    void replaceProjects(Long experienceId, List<ProjectRelation> relationships);

    /**
     * 경력–프로젝트 관계 존재 여부 (프로젝트는 비즈니스 ID 기준).
     */
    boolean hasProjectRelationship(Long experienceDbId, String projectBusinessId);

    /**
     * 경력–프로젝트 관계 단건 추가 (프로젝트 비즈니스 ID 해석은 어댑터에서 수행).
     */
    void addProjectRelationship(
            Long experienceDbId,
            String projectBusinessId,
            String roleInProject,
            String contributionDescription);

    /**
     * 경력–프로젝트 관계 일괄 반영: 요청은 프로젝트 비즈니스 ID 기준.
     */
    void replaceProjectsFromBusinessIds(Long experienceDbId, List<ExperienceProjectBulkItem> items);

    /**
     * 기술 스택 관계를 표현하는 record
     */
    record TechStackRelation(Long techStackId, boolean isPrimary, String usageDescription) {}

    /**
     * 프로젝트 관계를 표현하는 record
     * @param projectDbId 프로젝트 DB ID (Long, 비즈니스 ID 아님)
     */
    record ProjectRelation(Long projectDbId, String roleInProject, String contributionDescription) {}

    record ExperienceProjectBulkItem(String projectBusinessId, String roleInProject, String contributionDescription) {}
}
