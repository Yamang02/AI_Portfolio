package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.admin.port.in.ManageProjectUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.admin.dto.request.ProjectCreateRequest;
import com.aiportfolio.backend.domain.admin.dto.request.ProjectUpdateRequest;
import com.aiportfolio.backend.domain.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.application.admin.mapper.ProjectResponseMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 프로젝트 관리 서비스
 * ManageProjectUseCase 인터페이스의 구현체
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProjectManagementService implements ManageProjectUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    private final ProjectResponseMapper projectResponseMapper;
    
    @Override
    public ProjectResponse createProject(ProjectCreateRequest request) {
        log.info("Creating new project: {}", request.getTitle());
        
        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .readme(request.getReadme())
                .type(request.getType())
                .status(request.getStatus())
                .isTeam(request.getIsTeam())
                .role(request.getRole())
                .myContributions(request.getMyContributions())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .imageUrl(request.getImageUrl())
                .screenshots(request.getScreenshots())
                .githubUrl(request.getGithubUrl())
                .liveUrl(request.getLiveUrl())
                .externalUrl(request.getExternalUrl())
                .sortOrder(request.getSortOrder())
                .build();

        Project savedProject = portfolioRepositoryPort.saveProject(project);
        
        log.info("Project created successfully: {}", savedProject.getId());
        return projectResponseMapper.toResponse(savedProject);
    }
    
    @Override
    public ProjectResponse updateProject(String id, ProjectUpdateRequest request) {
        log.info("Updating project: {}", id);

        Project project = portfolioRepositoryPort.findProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));

        // 필드 업데이트
        if (request.getTitle() != null) project.setTitle(request.getTitle());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getReadme() != null) project.setReadme(request.getReadme());
        if (request.getType() != null) project.setType(request.getType());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getIsTeam() != null) project.setTeam(request.getIsTeam());
        if (request.getRole() != null) project.setRole(request.getRole());
        if (request.getMyContributions() != null) project.setMyContributions(request.getMyContributions());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());
        if (request.getImageUrl() != null) project.setImageUrl(request.getImageUrl());
        if (request.getScreenshots() != null) project.setScreenshots(request.getScreenshots());
        if (request.getGithubUrl() != null) project.setGithubUrl(request.getGithubUrl());
        if (request.getLiveUrl() != null) project.setLiveUrl(request.getLiveUrl());
        if (request.getExternalUrl() != null) project.setExternalUrl(request.getExternalUrl());
        if (request.getSortOrder() != null) project.setSortOrder(request.getSortOrder());

        Project updatedProject = portfolioRepositoryPort.updateProject(project);
        
        log.info("Project updated successfully: {}", updatedProject.getId());
        return projectResponseMapper.toResponse(updatedProject);
    }
    
    @Override
    public void deleteProject(String id) {
        log.info("Deleting project: {}", id);

        // 프로젝트 존재 여부 확인
        if (!portfolioRepositoryPort.existsProjectById(id)) {
            throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id);
        }

        portfolioRepositoryPort.deleteProject(id);

        log.info("Project deleted successfully: {}", id);
    }
}
