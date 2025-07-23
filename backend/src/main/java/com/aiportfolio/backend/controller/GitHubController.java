package com.aiportfolio.backend.controller;

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
    public ResponseEntity<List<Project>> getGitHubProjects() {
        try {
            List<Project> projects = gitHubService.getPortfolioProjects();
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            log.error("Error fetching GitHub projects", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/project/{repoName}")
    @Operation(summary = "GitHub 프로젝트 상세 조회", description = "특정 GitHub 저장소의 상세 정보를 조회합니다.")
    public ResponseEntity<Project> getGitHubProject(@PathVariable String repoName) {
        try {
            Project project = gitHubService.getProjectInfo(repoName);
            if (project == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            log.error("Error fetching GitHub project: {}", repoName, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 