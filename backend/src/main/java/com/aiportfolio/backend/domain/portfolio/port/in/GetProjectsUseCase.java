package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.ProjectReferenceByDatabaseId;
import com.aiportfolio.backend.domain.portfolio.model.ProjectTechnicalCard;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 프로젝트 조회 관련 Use Case
 * Primary Port (인바운드 포트)
 */
public interface GetProjectsUseCase {
    
    /**
     * 모든 프로젝트를 조회합니다
     */
    List<Project> getAllProjects();
    
    /**
     * ID로 프로젝트를 조회합니다
     */
    Optional<Project> getProjectById(String id);
    
    /**
     * 제목으로 프로젝트를 조회합니다
     */
    Optional<Project> getProjectByTitle(String title);
    
    /**
     * 타입별로 프로젝트를 필터링하여 조회합니다
     */
    List<Project> getProjectsByType(String type);
    
    /**
     * 소스별로 프로젝트를 필터링하여 조회합니다
     */
    List<Project> getProjectsBySource(String source);
    
    /**
     * 팀 프로젝트 여부로 필터링하여 조회합니다
     */
    List<Project> getProjectsByTeamStatus(boolean isTeam);

    /**
     * 비즈니스 ID에 대응하는 프로젝트 DB PK를 조회합니다.
     */
    Optional<Long> getProjectDatabaseIdByBusinessId(String businessId);

    /**
     * 프로젝트 DB PK 목록에 대한 businessId·제목 (배치, 단일 쿼리).
     */
    Map<Long, ProjectReferenceByDatabaseId> getProjectReferencesByDatabaseIds(List<Long> databaseIds);

    /**
     * 프로젝트 DB PK 한 건에 대한 businessId·제목.
     */
    Optional<ProjectReferenceByDatabaseId> getProjectReferenceByDatabaseId(Long databaseId);

    /**
     * 프로젝트 DB PK로 단일 프로젝트 조회 (공개 기사 상세의 프로젝트 블록용).
     */
    Optional<Project> getProjectByDatabaseId(Long databaseId);

    /**
     * 아티클 DB PK에 매핑된 프로젝트 기술 카드 목록.
     */
    List<ProjectTechnicalCard> getTechnicalCardsByArticleDatabaseId(Long articleDatabaseId);
}