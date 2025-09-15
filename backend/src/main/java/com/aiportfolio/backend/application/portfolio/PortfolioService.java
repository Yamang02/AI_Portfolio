package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.port.in.GetAllDataUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageProjectCacheUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    
    // === GetAllDataUseCase 구현 ===
    
    @Override
    public Map<String, Object> getAllPortfolioData() {
        try {
            List<Project> projects = getAllProjects();
            List<Experience> experiences = getAllExperiences();
            List<Education> educations = getAllEducations();
            List<Certification> certifications = getAllCertifications();
            
            return Map.of(
                "projects", projects,
                "experiences", experiences,
                "educations", educations,
                "certifications", certifications
            );
        } catch (Exception e) {
            log.error("포트폴리오 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("포트폴리오 데이터 조회 실패", e);
        }
    }
    
    @Override
    public List<Experience> getAllExperiences() {
        try {
            log.debug("모든 경험 데이터 조회 요청");
            List<Experience> experiences = portfolioRepositoryPort.findAllExperiences();
            log.info("경험 데이터 조회 완료: {} 개", experiences.size());
            return experiences;
        } catch (Exception e) {
            log.error("경험 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("경험 데이터 조회 실패", e);
        }
    }
    
    @Override
    public List<Education> getAllEducations() {
        try {
            log.debug("모든 교육 데이터 조회 요청");
            List<Education> educations = portfolioRepositoryPort.findAllEducations();
            log.info("교육 데이터 조회 완료: {} 개", educations.size());
            return educations;
        } catch (Exception e) {
            log.error("교육 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("교육 데이터 조회 실패", e);
        }
    }
    
    @Override
    public List<Certification> getAllCertifications() {
        try {
            log.debug("모든 자격증 데이터 조회 요청");
            List<Certification> certifications = portfolioRepositoryPort.findAllCertifications();
            log.info("자격증 데이터 조회 완료: {} 개", certifications.size());
            return certifications;
        } catch (Exception e) {
            log.error("자격증 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("자격증 데이터 조회 실패", e);
        }
    }
    
    // === GetProjectsUseCase 구현 ===
    
    @Override
    public List<Project> getAllProjects() {
        try {
            log.debug("모든 프로젝트 조회 요청");
            List<Project> projects = portfolioRepositoryPort.findAllProjects();
            log.info("프로젝트 조회 완료: {} 개", projects.size());
            return projects;
        } catch (Exception e) {
            log.error("프로젝트 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("프로젝트 데이터 조회 실패", e);
        }
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
    
    // === ManageProjectCacheUseCase 구현 ===
    
    @Override
    public void refreshCache() {
        log.info("포트폴리오 캐시 무효화 요청");
        portfolioRepositoryPort.invalidateCache();
        log.info("포트폴리오 캐시가 무효화되었습니다");
    }
    
    @Override
    public boolean isCacheValid() {
        return portfolioRepositoryPort.isCacheValid();
    }
}