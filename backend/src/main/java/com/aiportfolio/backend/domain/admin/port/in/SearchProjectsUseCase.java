package com.aiportfolio.backend.domain.admin.port.in;

import com.aiportfolio.backend.domain.admin.model.vo.ProjectFilter;
import com.aiportfolio.backend.domain.admin.dto.response.ProjectResponse;

import java.util.List;

/**
 * 프로젝트 검색 Use Case 인터페이스
 * 프로젝트 조회 및 검색 기능을 정의합니다.
 */
public interface SearchProjectsUseCase {
    
    /**
     * 필터 조건에 따라 프로젝트를 검색합니다.
     * 
     * @param filter 검색 필터
     * @return 프로젝트 목록
     */
    List<ProjectResponse> searchProjects(ProjectFilter filter);
    
    /**
     * ID로 프로젝트를 조회합니다.
     * 
     * @param id 프로젝트 ID
     * @return 프로젝트 응답
     */
    ProjectResponse getProjectById(String id);
}
