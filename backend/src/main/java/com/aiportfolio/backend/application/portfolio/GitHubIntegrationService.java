package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioCachePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubIntegrationService {
    
    private final WebClient.Builder webClientBuilder;
    private final PortfolioCachePort portfolioCachePort;
    @Value("${app.github.username:}")
    private String githubUsername;
    
    private static final String GITHUB_API_BASE = "https://api.github.com";
    
    public List<Project> getPortfolioProjects() {
        var cached = portfolioCachePort.getGithubProjects();
        if (cached.isPresent()) {
            return cached.get();
        }
        try {
            String username = githubUsername;
            if (username == null || username.isEmpty()) {
                log.warn("GitHub username not configured");
                return List.of();
            }
            
            List<Map<String, Object>> repos = webClientBuilder.build()
                    .get()
                    .uri(GITHUB_API_BASE + "/users/" + username + "/repos?sort=updated&per_page=100")
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block();
            
            if (repos == null) {
                return List.of();
            }
            
            List<Project> projects = repos.stream()
                    .filter(repo -> !(Boolean) repo.get("fork"))
                    .map(this::convertToProject)
                    .toList();
            portfolioCachePort.putGithubProjects(projects);
            return projects;
                    
        } catch (Exception e) {
            log.error("Failed to fetch GitHub projects", e);
            return List.of();
        }
    }
    
    public Project getProjectInfo(String repoName) {
        var cached = portfolioCachePort.getGithubProject(repoName);
        if (cached.isPresent()) {
            return cached.get();
        }
        try {
            String username = githubUsername;
            if (username == null || username.isEmpty()) {
                return null;
            }
            
            Map<String, Object> repo = webClientBuilder.build()
                    .get()
                    .uri(GITHUB_API_BASE + "/repos/" + username + "/" + repoName)
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
            
            if (repo == null) {
                return null;
            }
            
            Project project = convertToProject(repo);
            portfolioCachePort.putGithubProject(repoName, project);
            return project;
            
        } catch (Exception e) {
            log.error("Failed to fetch project info for: " + repoName, e);
            return null;
        }
    }
    
    private Project convertToProject(Map<String, Object> repo) {
        return Project.builder()
                .id((String) repo.get("name"))
                .title((String) repo.get("name"))
                .description((String) repo.get("description"))
                .githubUrl((String) repo.get("html_url"))
                .techStackMetadata(List.of()) // GitHub API에서는 기술 스택 정보를 제공하지 않음
                .isTeam(false)
                .type("project")
                .source("github")
                .build();
    }
} 
