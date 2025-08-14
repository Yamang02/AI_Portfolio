package com.aiportfolio.backend.domain.port.in;

import com.aiportfolio.backend.domain.model.Project;

import java.util.List;
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
}