package com.aiportfolio.backend.controller;

import com.aiportfolio.backend.model.ApiResponse;
import com.aiportfolio.backend.model.Project;
import com.aiportfolio.backend.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "프로젝트 정보 API")
public class ProjectController {
    
    private final ProjectService projectService;
    
    @GetMapping
    @Operation(summary = "모든 프로젝트 조회", description = "등록된 모든 프로젝트 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects() {
        try {
            List<Project> projects = projectService.getAllProjects();
            return ResponseEntity.ok(ApiResponse.success(projects, "프로젝트 목록 조회 성공"));
        } catch (Exception e) {
            log.error("Error fetching projects", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("프로젝트 목록 조회 실패", e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "프로젝트 상세 조회", description = "특정 프로젝트의 상세 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<Project>> getProjectById(@PathVariable String id) {
        try {
            Project project = projectService.getProjectById(id);
            if (project == null) {
                return ResponseEntity.status(404)
                        .body(ApiResponse.error("프로젝트를 찾을 수 없습니다", "Project not found with id: " + id));
            }
            return ResponseEntity.ok(ApiResponse.success(project, "프로젝트 조회 성공"));
        } catch (Exception e) {
            log.error("Error fetching project by id: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("프로젝트 조회 실패", e.getMessage()));
        }
    }
    
    @GetMapping("/title/{title}")
    @Operation(summary = "프로젝트 제목으로 조회", description = "프로젝트 제목으로 프로젝트 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<Project>> getProjectByTitle(@PathVariable String title) {
        try {
            Project project = projectService.getProjectByTitle(title);
            if (project == null) {
                return ResponseEntity.status(404)
                        .body(ApiResponse.error("프로젝트를 찾을 수 없습니다", "Project not found with title: " + title));
            }
            return ResponseEntity.ok(ApiResponse.success(project, "프로젝트 조회 성공"));
        } catch (Exception e) {
            log.error("Error fetching project by title: {}", title, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("프로젝트 조회 실패", e.getMessage()));
        }
    }
} 