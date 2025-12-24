package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageProjectCacheUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * 프로젝트 관련 Application Service
 * Use Case들을 구현하는 헥사고날 아키텍처의 Application Layer
 */
@Slf4j
@Service("projectApplicationService")
@RequiredArgsConstructor
public class ProjectApplicationService implements GetProjectsUseCase, ManageProjectCacheUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    
    @Override
    public List<Project> getAllProjects() {
        log.debug("모든 프로젝트 조회 요청");
        List<Project> projects = portfolioRepositoryPort.findAllProjects();
        log.info("프로젝트 조회 완료: {} 개", projects.size());
        return projects;
    }
    
    @Override
    public Optional<Project> getProjectById(String id) {
        log.debug("프로젝트 ID로 조회 요청: {}", id);
        Optional<Project> project = portfolioRepositoryPort.findProjectById(id);
        if (project.isPresent()) {
            log.debug("프로젝트 조회 성공: {}", id);
        } else {
            log.debug("프로젝트를 찾을 수 없음: {}", id);
        }
        return project;
    }
    
    @Override
    public Optional<Project> getProjectByTitle(String title) {
        log.debug("프로젝트 제목으로 조회 요청: {}", title);
        Optional<Project> project = portfolioRepositoryPort.findProjectByTitle(title);
        if (project.isPresent()) {
            log.debug("프로젝트 조회 성공: {}", title);
        } else {
            log.debug("프로젝트를 찾을 수 없음: {}", title);
        }
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
    @CacheEvict(value = "portfolio", key = "'projects:all'")
    public void refreshProjectsCache() {
        log.info("프로젝트 캐시 무효화");
    }

    @Override
    @CacheEvict(value = {"portfolio", "github"}, allEntries = true)
    public void refreshCache() {
        log.info("전체 포트폴리오 캐시 무효화");
    }
    
    @Override
    public boolean isCacheValid() {
        // Redis 캐시에서는 항상 유효하다고 간주 (TTL로 자동 관리)
        return true;
    }
}