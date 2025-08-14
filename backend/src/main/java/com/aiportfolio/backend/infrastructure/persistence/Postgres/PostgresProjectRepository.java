package com.aiportfolio.backend.infrastructure.persistence.Postgres;

import com.aiportfolio.backend.domain.port.out.ProjectRepositoryPort;
import com.aiportfolio.backend.domain.model.Project;
import com.aiportfolio.backend.domain.model.Experience;
import com.aiportfolio.backend.domain.model.Education;
import com.aiportfolio.backend.domain.model.Certification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

/**
 * PostgreSQL 기반 ProjectRepository 구현체
 * 헥사고날 아키텍처의 어댑터(Adapter) 역할
 * 현재는 JSON 파일 기반으로 구현되어 있으며, 향후 PostgreSQL로 마이그레이션 예정
 */
@Slf4j
@Repository
public class PostgresProjectRepository implements ProjectRepositoryPort {
    
    // 캐시 관련 필드
    private List<Project> cachedProjects;
    private List<Experience> cachedExperiences;
    private List<Education> cachedEducations;
    private List<Certification> cachedCertifications;
    private LocalDateTime lastCacheTime;
    private static final long CACHE_DURATION_MINUTES = 60; // 1시간 캐시
    
    public PostgresProjectRepository() {
        // 향후 PostgreSQL 연결을 위한 생성자
        log.info("PostgresProjectRepository 초기화 - 현재 JSON 파일 기반으로 동작");
    }
    
    // === 프로젝트 관련 구현 ===
    
    @Override
    public List<Project> findAllProjects() {
        if (cachedProjects == null || !isCacheValid()) {
            // TODO: 향후 PostgreSQL로 마이그레이션
            log.warn("PostgreSQL 구현이 완료되지 않았습니다. JSON 파일을 사용합니다.");
            cachedProjects = new ArrayList<>(); // 임시로 빈 리스트 반환
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
    
    @Override
    public List<Project> findProjectsByType(String type) {
        return findAllProjects().stream()
                .filter(p -> type == null || type.equals(p.getType()))
                .collect(java.util.stream.Collectors.toList());
    }
    
    @Override
    public List<Project> findProjectsBySource(String source) {
        return findAllProjects().stream()
                .filter(p -> source == null || source.equals(p.getSource()))
                .collect(java.util.stream.Collectors.toList());
    }
    
    @Override
    public List<Project> findProjectsByTeamStatus(boolean isTeam) {
        return findAllProjects().stream()
                .filter(p -> p.isTeam() == isTeam)
                .collect(java.util.stream.Collectors.toList());
    }
    
    // === 경력 관련 구현 ===
    
    @Override
    public List<Experience> findAllExperiences() {
        if (cachedExperiences == null || !isCacheValid()) {
            // TODO: 향후 PostgreSQL로 마이그레이션
            log.warn("PostgreSQL 구현이 완료되지 않았습니다. JSON 파일을 사용합니다.");
            cachedExperiences = new ArrayList<>(); // 임시로 빈 리스트 반환
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
            // TODO: 향후 PostgreSQL로 마이그레이션
            log.warn("PostgreSQL 구현이 완료되지 않았습니다. JSON 파일을 사용합니다.");
            cachedEducations = new ArrayList<>(); // 임시로 빈 리스트 반환
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
            // TODO: 향후 PostgreSQL로 마이그레이션
            log.warn("PostgreSQL 구현이 완료되지 않았습니다. JSON 파일을 사용합니다.");
            cachedCertifications = new ArrayList<>(); // 임시로 빈 리스트 반환
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
        cachedProjects = null;
        cachedExperiences = null;
        cachedEducations = null;
        cachedCertifications = null;
        lastCacheTime = null;
        log.info("캐시가 무효화되었습니다.");
    }
    
    @Override
    public boolean isCacheValid() {
        if (lastCacheTime == null) {
            return false;
        }
        return LocalDateTime.now().minusMinutes(CACHE_DURATION_MINUTES).isBefore(lastCacheTime);
    }
    
    private void updateCacheTime() {
        lastCacheTime = LocalDateTime.now();
    }
}
