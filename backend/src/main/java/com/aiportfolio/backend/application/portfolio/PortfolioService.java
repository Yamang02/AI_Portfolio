package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.port.in.GetAllDataUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageProjectCacheUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.infrastructure.config.CacheKeys;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Portfolio 도메인의 통합 Application Service
 * 모든 Portfolio 관련 Use Case들을 구현하는 헥사고날 아키텍처의 Application Layer
 */
@Slf4j
@Service("portfolioService")
@RequiredArgsConstructor
public class PortfolioService implements GetAllDataUseCase, GetProjectsUseCase, ManageProjectCacheUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    private final ObjectProvider<PortfolioService> selfProvider;
    
    // === GetAllDataUseCase 구현 ===
    
    @Override
    public Map<String, Object> getAllPortfolioData() {
        try {
            PortfolioService self = selfProvider.getObject();
            List<Project> projects = self.getAllProjects();
            List<Experience> experiences = self.getAllExperiences();
            List<Education> educations = self.getAllEducations();
            List<Certification> certifications = self.getAllCertifications();
            
            return Map.of(
                "projects", projects,
                "experiences", experiences,
                "educations", educations,
                "certifications", certifications
            );
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("포트폴리오 데이터 조회 중 오류 발생", e);
            throw new IllegalStateException("포트폴리오 데이터 조회 실패", e);
        }
    }
    
    @Override
    @Cacheable(
        value = CacheKeys.PORTFOLIO,
        key = "'" + CacheKeys.EXPERIENCES_ALL + "'",
        unless = "#result == null || #result.isEmpty()"
    )
    public List<Experience> getAllExperiences() {
        log.debug("캐시 미스 - PostgreSQL에서 경험 조회");
        List<Experience> experiences = portfolioRepositoryPort.findAllExperiences();
        log.info("경험 데이터 조회 완료: {} 개", experiences.size());
        return experiences;
    }
    
    @Override
    @Cacheable(
        value = CacheKeys.PORTFOLIO,
        key = "'" + CacheKeys.EDUCATIONS_ALL + "'",
        unless = "#result == null || #result.isEmpty()"
    )
    public List<Education> getAllEducations() {
        log.debug("캐시 미스 - PostgreSQL에서 교육 조회");
        List<Education> educations = portfolioRepositoryPort.findAllEducations();
        log.info("교육 데이터 조회 완료: {} 개", educations.size());
        return educations;
    }
    
    @Override
    @Cacheable(
        value = CacheKeys.PORTFOLIO,
        key = "'" + CacheKeys.CERTIFICATIONS_ALL + "'",
        unless = "#result == null || #result.isEmpty()"
    )
    public List<Certification> getAllCertifications() {
        log.debug("캐시 미스 - PostgreSQL에서 자격증 조회");
        List<Certification> certifications = portfolioRepositoryPort.findAllCertifications();
        log.info("자격증 데이터 조회 완료: {} 개", certifications.size());
        return certifications;
    }
    
    // === GetProjectsUseCase 구현 ===
    
    @Override
    @Cacheable(
        value = CacheKeys.PORTFOLIO,
        key = "'" + CacheKeys.PROJECTS_ALL + "'",
        unless = "#result == null || #result.isEmpty()"
    )
    public List<Project> getAllProjects() {
        log.debug("캐시 미스 - PostgreSQL에서 프로젝트 조회");
        List<Project> projects = portfolioRepositoryPort.findAllProjects();
        log.info("프로젝트 조회 완료: {} 개", projects.size());
        return projects;
    }
    
    @Override
    public Optional<Project> getProjectById(String id) {
        log.debug("프로젝트 ID로 조회 요청: {}", id);
        Optional<Project> project = portfolioRepositoryPort.findProjectById(id);
        project.ifPresentOrElse(
                value -> log.debug("프로젝트 조회 성공: {}", id),
                () -> log.debug("프로젝트를 찾을 수 없음: {}", id)
        );
        return project;
    }
    
    @Override
    public Optional<Project> getProjectByTitle(String title) {
        log.debug("프로젝트 제목으로 조회 요청: {}", title);
        Optional<Project> project = portfolioRepositoryPort.findProjectByTitle(title);
        project.ifPresentOrElse(
                value -> log.debug("프로젝트 조회 성공: {}", title),
                () -> log.debug("프로젝트를 찾을 수 없음: {}", title)
        );
        return project;
    }
    
    @Override
    public List<Project> getProjectsByType(String type) {
        log.debug("프로젝트 타입으로 조회 요청: {}", type);
        return portfolioRepositoryPort.findProjectsByType(type);
    }
    
    @Override
    public List<Project> getProjectsBySource(String source) {
        log.debug("프로젝트 소스로 조회 요청: {}", source);
        return portfolioRepositoryPort.findProjectsBySource(source);
    }
    
    @Override
    public List<Project> getProjectsByTeamStatus(boolean isTeam) {
        log.debug("팀 프로젝트 여부로 조회 요청: {}", isTeam);
        return portfolioRepositoryPort.findProjectsByTeamStatus(isTeam);
    }

    @Override
    public Optional<Long> getProjectDatabaseIdByBusinessId(String businessId) {
        return portfolioRepositoryPort.findProjectDatabaseIdByBusinessId(businessId);
    }
    
    // === ManageProjectCacheUseCase 구현 ===
    
    @Override
    @CacheEvict(value = CacheKeys.PORTFOLIO, key = "'" + CacheKeys.PROJECTS_ALL + "'")
    public void refreshProjectsCache() {
        log.info("프로젝트 캐시 무효화");
    }

    @Override
    @Caching(evict = {
        @CacheEvict(value = CacheKeys.PORTFOLIO, allEntries = true),
        @CacheEvict(value = CacheKeys.GITHUB, allEntries = true)
    })
    public void refreshCache() {
        log.info("전체 포트폴리오 캐시 무효화");
    }
    
    @Override
    public boolean isCacheValid() {
        // Redis 캐시에서는 항상 유효하다고 간주 (TTL로 자동 관리)
        return true;
    }
}