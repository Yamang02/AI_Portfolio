package com.aiportfolio.backend.controller;

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
    public ResponseEntity<List<Project>> getAllProjects() {
        try {
            List<Project> projects = projectService.getAllProjects();
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            log.error("Error fetching projects", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "프로젝트 상세 조회", description = "특정 프로젝트의 상세 정보를 조회합니다.")
    public ResponseEntity<Project> getProjectById(@PathVariable String id) {
        try {
            Project project = projectService.getProjectById(id);
            if (project == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            log.error("Error fetching project by id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/title/{title}")
    @Operation(summary = "프로젝트 제목으로 조회", description = "프로젝트 제목으로 프로젝트 정보를 조회합니다.")
    public ResponseEntity<Project> getProjectByTitle(@PathVariable String title) {
        try {
            Project project = projectService.getProjectByTitle(title);
            if (project == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            log.error("Error fetching project by title: {}", title, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 