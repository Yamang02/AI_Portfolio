package com.aiportfolio.backend.infrastructure.persistence;

import com.aiportfolio.backend.domain.portfolio.ProjectRepository;
import com.aiportfolio.backend.model.Project;
import com.aiportfolio.backend.model.Experience;
import com.aiportfolio.backend.model.Education;
import com.aiportfolio.backend.model.Certification;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

/**
 * JSON 파일 기반 ProjectRepository 구현체
 * 헥사고날 아키텍처의 어댑터(Adapter) 역할
 */
@Slf4j
@Repository
public class JsonProjectRepository implements ProjectRepository {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 캐시 관련 필드
    private List<Project> cachedProjects;
    private List<Experience> cachedExperiences;
    private List<Education> cachedEducations;
    private List<Certification> cachedCertifications;
    private LocalDateTime lastCacheTime;
    private static final long CACHE_DURATION_MINUTES = 60; // 1시간 캐시
    
    // === 프로젝트 관련 구현 ===
    
    @Override
    public List<Project> findAllProjects() {
        if (cachedProjects == null || !isCacheValid()) {
            cachedProjects = loadProjectsFromJson();
            updateCacheTime();
        }
        return cachedProjects;
    }
    
    @Override
    public Optional<Project> findProjectById(String id) {
        return findAllProjects().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst();
    }
    
    @Override
    public Optional<Project> findProjectByTitle(String title) {
        return findAllProjects().stream()
                .filter(p -> p.getTitle().equals(title))
                .findFirst();
    }
    
    // === 경력 관련 구현 ===
    
    @Override
    public List<Experience> findAllExperiences() {
        if (cachedExperiences == null || !isCacheValid()) {
            cachedExperiences = loadExperiencesFromJson();
            updateCacheTime();
        }
        return cachedExperiences;
    }
    
    @Override
    public Optional<Experience> findExperienceById(String id) {
        return findAllExperiences().stream()
                .filter(e -> e.getId().equals(id))
                .findFirst();
    }
    
    // === 교육 관련 구현 ===
    
    @Override
    public List<Education> findAllEducations() {
        if (cachedEducations == null || !isCacheValid()) {
            cachedEducations = loadEducationsFromJson();
            updateCacheTime();
        }
        return cachedEducations;
    }
    
    @Override
    public Optional<Education> findEducationById(String id) {
        return findAllEducations().stream()
                .filter(e -> e.getId().equals(id))
                .findFirst();
    }
    
    // === 자격증 관련 구현 ===
    
    @Override
    public List<Certification> findAllCertifications() {
        if (cachedCertifications == null || !isCacheValid()) {
            cachedCertifications = loadCertificationsFromJson();
            updateCacheTime();
        }
        return cachedCertifications;
    }
    
    @Override
    public Optional<Certification> findCertificationById(String id) {
        return findAllCertifications().stream()
                .filter(c -> c.getId().equals(id))
                .findFirst();
    }
    
    // === 캐시 관리 ===
    
    @Override
    public void invalidateCache() {
        log.info("캐시 무효화 - 모든 캐시된 데이터를 제거합니다");
        cachedProjects = null;
        cachedExperiences = null;
        cachedEducations = null;
        cachedCertifications = null;
        lastCacheTime = null;
    }
    
    @Override
    public boolean isCacheValid() {
        if (lastCacheTime == null) {
            return false;
        }
        return lastCacheTime.plusMinutes(CACHE_DURATION_MINUTES).isAfter(LocalDateTime.now());
    }
    
    // === Private Helper Methods ===
    
    private List<Project> loadProjectsFromJson() {
        try {
            List<Project> all = new ArrayList<>();
            
            // GitHub 프로젝트 로드
            ClassPathResource resource1 = new ClassPathResource("data/projects.json");
            List<Project> githubProjects = objectMapper.readValue(
                resource1.getInputStream(), 
                new TypeReference<List<Project>>() {}
            );
            all.addAll(githubProjects);
            
            // 로컬 프로젝트 로드
            ClassPathResource resource2 = new ClassPathResource("data/localProjects.json");
            List<Project> localProjects = objectMapper.readValue(
                resource2.getInputStream(), 
                new TypeReference<List<Project>>() {}
            );
            all.addAll(localProjects);
            
            log.info("프로젝트 데이터 로드 완료: GitHub {} 개, Local {} 개, 총 {} 개", 
                     githubProjects.size(), localProjects.size(), all.size());
            return all;
            
        } catch (IOException e) {
            log.error("프로젝트 JSON 파일 로드 중 오류 발생", e);
            return new ArrayList<>();
        }
    }
    
    private List<Experience> loadExperiencesFromJson() {
        try {
            ClassPathResource resource = new ClassPathResource("data/experiences.json");
            List<Experience> experiences = objectMapper.readValue(
                resource.getInputStream(), 
                new TypeReference<List<Experience>>() {}
            );
            log.info("경력 데이터 로드 완료: {} 개", experiences.size());
            return experiences;
            
        } catch (IOException e) {
            log.error("경력 JSON 파일 로드 중 오류 발생", e);
            return new ArrayList<>();
        }
    }
    
    private List<Education> loadEducationsFromJson() {
        try {
            ClassPathResource resource = new ClassPathResource("data/education.json");
            List<Education> educations = objectMapper.readValue(
                resource.getInputStream(), 
                new TypeReference<List<Education>>() {}
            );
            log.info("교육 데이터 로드 완료: {} 개", educations.size());
            return educations;
            
        } catch (IOException e) {
            log.error("교육 JSON 파일 로드 중 오류 발생", e);
            return new ArrayList<>();
        }
    }
    
    private List<Certification> loadCertificationsFromJson() {
        try {
            ClassPathResource resource = new ClassPathResource("data/certifications.json");
            List<Certification> certifications = objectMapper.readValue(
                resource.getInputStream(), 
                new TypeReference<List<Certification>>() {}
            );
            log.info("자격증 데이터 로드 완료: {} 개", certifications.size());
            return certifications;
            
        } catch (IOException e) {
            log.error("자격증 JSON 파일 로드 중 오류 발생", e);
            return new ArrayList<>();
        }
    }
    
    private void updateCacheTime() {
        lastCacheTime = LocalDateTime.now();
        log.debug("캐시 시간 업데이트: {}", lastCacheTime);
    }
}