package com.aiportfolio.backend.application.admin;

import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.infrastructure.web.dto.admin.ProjectCreateRequest;
import com.aiportfolio.backend.infrastructure.web.dto.admin.ProjectFilter;
import com.aiportfolio.backend.infrastructure.web.dto.admin.ProjectResponse;
import com.aiportfolio.backend.infrastructure.web.dto.admin.ProjectUpdateRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자 프로젝트 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminProjectService {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    /**
     * 필터링된 프로젝트 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects(ProjectFilter filter) {
        log.debug("Getting projects with filter: {}", filter);
        
        List<Project> projects = portfolioRepositoryPort.findAllProjects();
        
        // 필터링 적용
        List<Project> filteredProjects = projects.stream()
                .filter(project -> applySearchFilter(project, filter))
                .filter(project -> applyTeamFilter(project, filter))
                .filter(project -> applyTypeFilter(project, filter))
                .filter(project -> applyStatusFilter(project, filter))
                .filter(project -> applyTechFilter(project, filter))
                .collect(Collectors.toList());

        // 정렬 적용
        filteredProjects.sort((p1, p2) -> {
            String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "sortOrder";
            String sortOrder = filter.getSortOrder() != null ? filter.getSortOrder() : "asc";
            
            int comparison = 0;
            switch (sortBy) {
                case "startDate":
                    comparison = compareDates(p1.getStartDate(), p2.getStartDate());
                    break;
                case "endDate":
                    comparison = compareDates(p1.getEndDate(), p2.getEndDate());
                    break;
                case "title":
                    comparison = p1.getTitle().compareToIgnoreCase(p2.getTitle());
                    break;
                case "status":
                    comparison = p1.getStatus().compareTo(p2.getStatus());
                    break;
                case "type":
                    comparison = p1.getType().compareTo(p2.getType());
                    break;
                default: // sortOrder
                    comparison = Integer.compare(
                            p1.getSortOrder() != null ? p1.getSortOrder() : 0,
                            p2.getSortOrder() != null ? p2.getSortOrder() : 0
                    );
                    break;
            }
            
            return "desc".equals(sortOrder) ? -comparison : comparison;
        });

        return filteredProjects.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 프로젝트 상세 조회
     */
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        log.debug("Getting project by id: {}", id);
        
        Project project = portfolioRepositoryPort.findProjectById(String.valueOf(id))
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));
        
        return convertToResponse(project);
    }

    /**
     * 프로젝트 생성
     */
    public ProjectResponse createProject(ProjectCreateRequest request) {
        log.info("Creating new project: {}", request.getTitle());
        
        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .detailedDescription(request.getDetailedDescription())
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
        return convertToResponse(savedProject);
    }

    /**
     * 프로젝트 수정
     */
    public ProjectResponse updateProject(Long id, ProjectUpdateRequest request) {
        log.info("Updating project: {}", id);
        
        Project project = portfolioRepositoryPort.findProjectById(String.valueOf(id))
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));

        // 필드 업데이트
        if (request.getTitle() != null) project.setTitle(request.getTitle());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getDetailedDescription() != null) project.setDetailedDescription(request.getDetailedDescription());
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
        if (request.getTechnologies() != null) {
            // 기술 스택 업데이트 로직 (추후 구현)
        }
        if (request.getSortOrder() != null) project.setSortOrder(request.getSortOrder());

        Project updatedProject = portfolioRepositoryPort.saveProject(project);
        
        log.info("Project updated successfully: {}", updatedProject.getId());
        return convertToResponse(updatedProject);
    }

    /**
     * 프로젝트 삭제
     */
    public void deleteProject(Long id) {
        log.info("Deleting project: {}", id);
        
        Project project = portfolioRepositoryPort.findProjectById(String.valueOf(id))
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));
        
        portfolioRepositoryPort.deleteProject(String.valueOf(id));
        
        log.info("Project deleted successfully: {}", id);
    }

    // 필터링 메서드들
    private boolean applySearchFilter(Project project, ProjectFilter filter) {
        if (!filter.hasSearchQuery()) return true;
        
        String searchQuery = filter.getSearchQuery().toLowerCase();
        return project.getTitle().toLowerCase().contains(searchQuery) ||
               (project.getDescription() != null && project.getDescription().toLowerCase().contains(searchQuery));
    }

    private boolean applyTeamFilter(Project project, ProjectFilter filter) {
        if (filter.isTeamFilter()) return project.isTeam();
        if (filter.isIndividualFilter()) return !project.isTeam();
        return true;
    }

    private boolean applyTypeFilter(Project project, ProjectFilter filter) {
        if (filter.isAllType()) return true;
        return project.getType().equals(filter.getProjectType());
    }

    private boolean applyStatusFilter(Project project, ProjectFilter filter) {
        if (filter.isAllStatus()) return true;
        return project.getStatus().toLowerCase().equals(filter.getStatus());
    }

    private boolean applyTechFilter(Project project, ProjectFilter filter) {
        if (!filter.hasTechFilter()) return true;
        
        // 기술 스택 필터링 로직 (추후 구현)
        return true;
    }

    private int compareDates(java.time.LocalDate date1, java.time.LocalDate date2) {
        if (date1 == null && date2 == null) return 0;
        if (date1 == null) return -1;
        if (date2 == null) return 1;
        return date1.compareTo(date2);
    }

    private ProjectResponse convertToResponse(Project project) {
        return ProjectResponse.builder()
                .id(Long.parseLong(project.getId()))
                .title(project.getTitle())
                .description(project.getDescription())
                .detailedDescription(project.getDetailedDescription())
                .readme(project.getReadme())
                .type(project.getType())
                .status(project.getStatus())
                .isTeam(project.isTeam())
                .role(project.getRole())
                .myContributions(project.getMyContributions())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .imageUrl(project.getImageUrl())
                .githubUrl(project.getGithubUrl())
                .liveUrl(project.getLiveUrl())
                .externalUrl(project.getExternalUrl())
                .sortOrder(project.getSortOrder())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
