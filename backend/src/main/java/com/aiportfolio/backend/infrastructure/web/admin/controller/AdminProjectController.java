package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.application.admin.mapper.ProjectResponseMapper;
import com.aiportfolio.backend.application.admin.service.ManageProjectService;
import com.aiportfolio.backend.domain.admin.port.in.SearchProjectsUseCase;
import com.aiportfolio.backend.infrastructure.web.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.admin.model.vo.ProjectFilter;
import com.aiportfolio.backend.infrastructure.web.admin.dto.AdminProjectCreateRequest;
import com.aiportfolio.backend.infrastructure.web.admin.dto.AdminProjectTechnicalCardsUpdateRequest;
import com.aiportfolio.backend.infrastructure.web.admin.dto.AdminProjectUpdateRequest;
import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 프로젝트 컨트롤러
 * 관리자 권한이 필요한 프로젝트 관리 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/admin/projects")
@Slf4j
public class AdminProjectController {

    private final ManageProjectService manageProjectService;
    private final SearchProjectsUseCase searchProjectsUseCase;
    private final ProjectResponseMapper projectResponseMapper;

    public AdminProjectController(
            @Qualifier("manageProjectService") ManageProjectService manageProjectService,
            SearchProjectsUseCase searchProjectsUseCase,
            ProjectResponseMapper projectResponseMapper) {
        this.manageProjectService = manageProjectService;
        this.searchProjectsUseCase = searchProjectsUseCase;
        this.projectResponseMapper = projectResponseMapper;
    }

    /**
     * 프로젝트 목록 조회 (필터링 지원)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String isTeam,
            @RequestParam(required = false) String projectType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) List<String> techs,
            @RequestParam(required = false, defaultValue = "sortOrder") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortOrder,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size) {
        
        log.debug("Getting projects with filters - search: {}, isTeam: {}, type: {}, status: {}", 
                search, isTeam, projectType, status);

        ProjectFilter filter = ProjectFilter.builder()
                .searchQuery(search)
                .isTeam(isTeam)
                .projectType(projectType)
                .status(status)
                .selectedTechs(techs)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .page(page)
                .size(size)
                .build();

        List<ProjectResponse> projects = searchProjectsUseCase.searchProjects(filter).stream()
                .map(projectResponseMapper::toDetailedResponse)
                .toList();
        
        return ResponseEntity.ok(ApiResponse.success(projects, WebApiResponseMessages.PROJECT_LIST_SUCCESS));
    }

    /**
     * 프로젝트 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
            @PathVariable String id) {
        
        log.debug("Getting project by id: {}", id);
        
        ProjectResponse project = projectResponseMapper.toDetailedResponse(
                searchProjectsUseCase.getProjectById(id));
        return ResponseEntity.ok(ApiResponse.success(project, WebApiResponseMessages.PROJECT_GET_SUCCESS));
    }

    @GetMapping("/{id}/technical-cards")
    public ResponseEntity<ApiResponse<List<ProjectResponse.ProjectTechnicalCardResponse>>> getProjectTechnicalCards(
            @PathVariable String id) {
        ProjectResponse project = projectResponseMapper.toDetailedResponse(searchProjectsUseCase.getProjectById(id));
        return ResponseEntity.ok(
                ApiResponse.success(project.getTechnicalCards(), WebApiResponseMessages.PROJECT_GET_SUCCESS));
    }

    /**
     * 프로젝트 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody AdminProjectCreateRequest request) {

        log.info("Creating new project: {}", request.getTitle());

        ProjectResponse project = manageProjectService.createProjectWithRelations(
                request.toCommand(), 
                request.getTechnologies()
        );
        return ResponseEntity.ok(ApiResponse.success(project, WebApiResponseMessages.PROJECT_CREATE_SUCCESS));
    }

    /**
     * 프로젝트 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable String id,
            @Valid @RequestBody AdminProjectUpdateRequest request) {

        log.info("Updating project: {}", id);
        log.debug("Update request data: title={}, description length={}, startDate={}, endDate={}, technologies={}", 
                request.getTitle(), 
                request.getDescription() != null ? request.getDescription().length() : 0,
                request.getStartDate(), 
                request.getEndDate(),
                request.getTechnologies());

        ProjectResponse project = manageProjectService.updateProjectWithRelations(
                id,
                request.toCommand(),
                request.getTechnologies()
        );
        return ResponseEntity.ok(ApiResponse.success(project, WebApiResponseMessages.PROJECT_UPDATE_SUCCESS));
    }

    @PutMapping("/{id}/technical-cards")
    public ResponseEntity<ApiResponse<List<ProjectResponse.ProjectTechnicalCardResponse>>> updateProjectTechnicalCards(
            @PathVariable String id,
            @Valid @RequestBody AdminProjectTechnicalCardsUpdateRequest request) {
        var updatedProject = manageProjectService.updateProjectTechnicalCards(id, request.toCommands());
        var response = projectResponseMapper.toDetailedResponse(updatedProject);
        return ResponseEntity.ok(
                ApiResponse.success(response.getTechnicalCards(), WebApiResponseMessages.PROJECT_UPDATE_SUCCESS));
    }

    /**
     * 프로젝트 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable String id) {

        log.info("Deleting project: {}", id);

        manageProjectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.PROJECT_DELETE_SUCCESS));
    }
}
