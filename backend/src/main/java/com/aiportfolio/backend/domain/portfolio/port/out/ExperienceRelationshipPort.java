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
     * 기술 스택 관계를 표현하는 record
     */
    record TechStackRelation(Long techStackId, boolean isPrimary, String usageDescription) {}

    /**
     * 프로젝트 관계를 표현하는 record
     * @param projectDbId 프로젝트 DB ID (Long, 비즈니스 ID 아님)
     */
    record ProjectRelation(Long projectDbId, String roleInProject, String contributionDescription) {}
}
