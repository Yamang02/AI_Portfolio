package com.aiportfolio.backend.service;

import com.aiportfolio.backend.model.Project;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
public class ProjectService {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<Project> cachedProjects;
    
    public List<Project> getAllProjects() {
        if (cachedProjects == null) {
            cachedProjects = loadProjectsFromJson();
        }
        return cachedProjects;
    }
    
    public Project getProjectById(String id) {
        return getAllProjects().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
    
    public Project getProjectByTitle(String title) {
        return getAllProjects().stream()
                .filter(p -> p.getTitle().equals(title))
                .findFirst()
                .orElse(null);
    }
    
    private List<Project> loadProjectsFromJson() {
        try {
            ClassPathResource resource = new ClassPathResource("data/projects.json");
            return objectMapper.readValue(resource.getInputStream(), new TypeReference<List<Project>>() {});
        } catch (IOException e) {
            log.error("Failed to load projects from JSON", e);
            return List.of(); // 빈 리스트 반환
        }
    }
} 