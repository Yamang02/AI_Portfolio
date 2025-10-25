package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.admin.port.in.SearchProjectsUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.admin.model.vo.ProjectFilter;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.application.admin.mapper.ProjectResponseMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 프로젝트 검색 서비스
 * SearchProjectsUseCase 인터페이스의 구현체
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProjectSearchService implements SearchProjectsUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    private final ProjectResponseMapper projectResponseMapper;
    
    @Override
    public List<ProjectResponse> searchProjects(ProjectFilter filter) {
        log.debug("Searching projects with filter: {}", filter);
        
        List<Project> projects = portfolioRepositoryPort.findByFilter(filter);
        
        return projects.stream()
                .map(projectResponseMapper::toDetailedResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public ProjectResponse getProjectById(String id) {
        log.debug("Getting project by id: {}", id);

        Project project = portfolioRepositoryPort.findProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));

        return projectResponseMapper.toDetailedResponse(project);
    }
}
