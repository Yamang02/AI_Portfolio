package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.port.in.GetAllDataUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioCachePort;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.ProjectReferenceByDatabaseId;
import com.aiportfolio.backend.domain.portfolio.model.ProjectTechnicalCard;

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
public class PortfolioService implements GetAllDataUseCase, GetProjectsUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    private final PortfolioCachePort portfolioCachePort;
    
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
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("포트폴리오 데이터 조회 중 오류 발생", e);
            throw new IllegalStateException("포트폴리오 데이터 조회 실패", e);
        }
    }
    
    @Override
    public List<Experience> getAllExperiences() {
        Optional<List<Experience>> cached = portfolioCachePort.getPortfolioExperiences();
        if (cached.isPresent()) {
            return cached.get();
        }
        log.debug("캐시 미스 - PostgreSQL에서 경험 조회");
        List<Experience> experiences = portfolioRepositoryPort.findAllExperiences();
        log.info("경험 데이터 조회 완료: {} 개", experiences.size());
        portfolioCachePort.putPortfolioExperiences(experiences);
        return experiences;
    }

    @Override
    public List<Education> getAllEducations() {
        Optional<List<Education>> cached = portfolioCachePort.getPortfolioEducations();
        if (cached.isPresent()) {
            return cached.get();
        }
        log.debug("캐시 미스 - PostgreSQL에서 교육 조회");
        List<Education> educations = portfolioRepositoryPort.findAllEducations();
        log.info("교육 데이터 조회 완료: {} 개", educations.size());
        portfolioCachePort.putPortfolioEducations(educations);
        return educations;
    }

    @Override
    public List<Certification> getAllCertifications() {
        Optional<List<Certification>> cached = portfolioCachePort.getPortfolioCertifications();
        if (cached.isPresent()) {
            return cached.get();
        }
        log.debug("캐시 미스 - PostgreSQL에서 자격증 조회");
        List<Certification> certifications = portfolioRepositoryPort.findAllCertifications();
        log.info("자격증 데이터 조회 완료: {} 개", certifications.size());
        portfolioCachePort.putPortfolioCertifications(certifications);
        return certifications;
    }
    
    // === GetProjectsUseCase 구현 ===
    
    @Override
    public List<Project> getAllProjects() {
        Optional<List<Project>> cached = portfolioCachePort.getPortfolioProjects();
        if (cached.isPresent()) {
            return cached.get();
        }
        log.debug("캐시 미스 - PostgreSQL에서 프로젝트 조회");
        List<Project> projects = portfolioRepositoryPort.findAllProjects();
        log.info("프로젝트 조회 완료: {} 개", projects.size());
        portfolioCachePort.putPortfolioProjects(projects);
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

    @Override
    public Map<Long, ProjectReferenceByDatabaseId> getProjectReferencesByDatabaseIds(List<Long> databaseIds) {
        return portfolioRepositoryPort.findProjectReferencesByDatabaseIds(databaseIds);
    }

    @Override
    public Optional<ProjectReferenceByDatabaseId> getProjectReferenceByDatabaseId(Long databaseId) {
        return portfolioRepositoryPort.findProjectReferenceByDatabaseId(databaseId);
    }

    @Override
    public Optional<Project> getProjectByDatabaseId(Long databaseId) {
        return portfolioRepositoryPort.findProjectByDatabaseId(databaseId);
    }

    @Override
    public List<ProjectTechnicalCard> getTechnicalCardsByArticleDatabaseId(Long articleDatabaseId) {
        return portfolioRepositoryPort.findTechnicalCardsByArticleDatabaseId(articleDatabaseId);
    }
}