package com.aiportfolio.backend.service;

import com.aiportfolio.backend.config.AppConfig;
import com.aiportfolio.backend.model.Project;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubService {
    
    private final AppConfig appConfig;
    private final WebClient.Builder webClientBuilder;
    
    private static final String GITHUB_API_BASE = "https://api.github.com";
    
    public List<Project> getPortfolioProjects() {
        try {
            String username = appConfig.getGitHub().getUsername();
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
            
            return repos.stream()
                    .filter(repo -> !(Boolean) repo.get("fork"))
                    .map(this::convertToProject)
                    .toList();
                    
        } catch (Exception e) {
            log.error("Failed to fetch GitHub projects", e);
            return List.of();
        }
    }
    
    public Project getProjectInfo(String repoName) {
        try {
            String username = appConfig.getGitHub().getUsername();
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
            
            return convertToProject(repo);
            
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
                .technologies(List.of()) // GitHub API에서는 기술 스택 정보를 제공하지 않음
                .isTeam(false)
                .type("project")
                .source("github")
                .build();
    }
} 