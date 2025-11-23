package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.application.admin.service.ManageProjectService;
import com.aiportfolio.backend.domain.admin.port.in.SearchProjectsUseCase;
import com.aiportfolio.backend.domain.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.admin.model.vo.ProjectFilter;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.TechStackMetadataJpaRepository;
import com.aiportfolio.backend.infrastructure.web.admin.dto.AdminProjectCreateRequest;
import com.aiportfolio.backend.infrastructure.web.admin.dto.AdminProjectUpdateRequest;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자 프로젝트 컨트롤러
 * 관리자 권한이 필요한 프로젝트 관리 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/admin/projects")
@RequiredArgsConstructor
@Slf4j
public class AdminProjectController {

    @Qualifier("manageProjectService")
    private final ManageProjectService manageProjectService;
    private final SearchProjectsUseCase searchProjectsUseCase;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;

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

        try {
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

            List<ProjectResponse> projects = searchProjectsUseCase.searchProjects(filter);
            
            return ResponseEntity.ok(ApiResponse.success(projects, "프로젝트 목록 조회 성공"));
        } catch (Exception e) {
            log.error("Failed to get projects", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("프로젝트 목록 조회 중 오류가 발생했습니다: " + e.getMessage(), "서버 오류"));
        }
    }

    /**
     * 프로젝트 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
            @PathVariable String id) {
        
        log.debug("Getting project by id: {}", id);
        
        try {
            ProjectResponse project = searchProjectsUseCase.getProjectById(id);
            return ResponseEntity.ok(ApiResponse.success(project, "프로젝트 조회 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(e.getMessage(), "프로젝트를 찾을 수 없습니다"));
        } catch (Exception e) {
            log.error("Failed to get project: {}", id, e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("프로젝트 조회 중 오류가 발생했습니다: " + e.getMessage(), "서버 오류"));
        }
    }

    /**
     * 프로젝트 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody AdminProjectCreateRequest request) {

        log.info("Creating new project: {}", request.getTitle());

        try {
            List<ManageProjectService.TechStackRelation> techStackRelations = 
                toTechStackRelations(request.getTechnologies());
            ProjectResponse project = manageProjectService.createProjectWithRelations(
                request.toCommand(), 
                techStackRelations
            );
            return ResponseEntity.ok(ApiResponse.success(project, "프로젝트 생성 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to create project", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 생성 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 프로젝트 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable String id,
            @Valid @RequestBody AdminProjectUpdateRequest request) {

        log.info("Updating project: {}", id);

        try {
            List<ManageProjectService.TechStackRelation> techStackRelations = null;
            if (request.getTechnologies() != null) {
                techStackRelations = toTechStackRelations(request.getTechnologies());
            }
            ProjectResponse project = manageProjectService.updateProjectWithRelations(
                id,
                request.toCommand(),
                techStackRelations
            );
            return ResponseEntity.ok(ApiResponse.success(project, "프로젝트 수정 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update project: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 수정 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 프로젝트 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable String id) {

        log.info("Deleting project: {}", id);

        try {
            manageProjectService.deleteProject(id);
            return ResponseEntity.ok(ApiResponse.success(null, "프로젝트 삭제 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Failed to delete project: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("프로젝트 삭제 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    // ==================== 변환 메서드 ====================

    /**
     * TechStack 이름 목록을 TechStackRelation 리스트로 변환
     */
    private List<ManageProjectService.TechStackRelation> toTechStackRelations(List<String> techStackNames) {
        if (techStackNames == null || techStackNames.isEmpty()) {
            return new ArrayList<>();
        }

        return techStackNames.stream()
            .map(name -> {
                return techStackMetadataJpaRepository.findByName(name)
                    .map(techStack -> new ManageProjectService.TechStackRelation(
                        techStack.getId(),
                        false, // 기본값: isPrimary = false
                        null   // 기본값: usageDescription = null
                    ))
                    .orElseThrow(() -> new IllegalArgumentException(
                        "TechStack을 찾을 수 없습니다: " + name));
            })
            .collect(Collectors.toList());
    }
}
