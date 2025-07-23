package com.aiportfolio.backend.controller;

import com.aiportfolio.backend.model.ApiResponse;
import com.aiportfolio.backend.model.Project;
import com.aiportfolio.backend.service.GitHubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
@Tag(name = "GitHub", description = "GitHub 프로젝트 API")
public class GitHubController {
    
    private final GitHubService gitHubService;
    
    @GetMapping("/projects")
    @Operation(summary = "GitHub 프로젝트 조회", description = "GitHub에서 사용자의 프로젝트 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<Project>>> getGitHubProjects() {
        try {
            List<Project> projects = gitHubService.getPortfolioProjects();
            return ResponseEntity.ok(ApiResponse.success(projects, "GitHub 프로젝트 목록 조회 성공"));
        } catch (Exception e) {
            log.error("Error fetching GitHub projects", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("GitHub 프로젝트 목록 조회 실패", e.getMessage()));
        }
    }
    
    @GetMapping("/project/{repoName}")
    @Operation(summary = "GitHub 프로젝트 상세 조회", description = "특정 GitHub 저장소의 상세 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<Project>> getGitHubProject(@PathVariable String repoName) {
        try {
            Project project = gitHubService.getProjectInfo(repoName);
            if (project == null) {
                return ResponseEntity.status(404)
                        .body(ApiResponse.error("GitHub 프로젝트를 찾을 수 없습니다", "Project not found with repoName: " + repoName));
            }
            return ResponseEntity.ok(ApiResponse.success(project, "GitHub 프로젝트 조회 성공"));
        } catch (Exception e) {
            log.error("Error fetching GitHub project: {}", repoName, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("GitHub 프로젝트 조회 실패", e.getMessage()));
        }
    }
} 