package com.aiportfolio.backend.service;

import com.aiportfolio.backend.model.Certification;
import com.aiportfolio.backend.model.Education;
import com.aiportfolio.backend.model.Experience;
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
public class DataService {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ProjectService projectService;
    
    public DataService(ProjectService projectService) {
        this.projectService = projectService;
    }
    
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }
    
    public List<Experience> getAllExperiences() {
        return loadExperiencesFromJson();
    }
    
    public List<Certification> getAllCertifications() {
        return loadCertificationsFromJson();
    }
    
    public List<Education> getAllEducation() {
        return loadEducationFromJson();
    }
    
    private List<Experience> loadExperiencesFromJson() {
        try {
            ClassPathResource resource = new ClassPathResource("data/experiences.json");
            return objectMapper.readValue(resource.getInputStream(), new TypeReference<List<Experience>>() {});
        } catch (IOException e) {
            log.error("Failed to load experiences from JSON", e);
            return List.of();
        }
    }
    
    private List<Certification> loadCertificationsFromJson() {
        try {
            ClassPathResource resource = new ClassPathResource("data/certifications.json");
            return objectMapper.readValue(resource.getInputStream(), new TypeReference<List<Certification>>() {});
        } catch (IOException e) {
            log.error("Failed to load certifications from JSON", e);
            return List.of();
        }
    }
    
    private List<Education> loadEducationFromJson() {
        try {
            ClassPathResource resource = new ClassPathResource("data/education.json");
            return objectMapper.readValue(resource.getInputStream(), new TypeReference<List<Education>>() {});
        } catch (IOException e) {
            log.error("Failed to load education from JSON", e);
            return List.of();
        }
    }
} 