package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.port.in.GetAllDataUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 포트폴리오 관련 Application Service
 * GetAllDataUseCase를 구현하는 헥사고날 아키텍처의 Application Layer
 */
@Slf4j
@Service
public class PortfolioApplicationService implements GetAllDataUseCase {
    
    private final GetProjectsUseCase getProjectsUseCase;
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    
    public PortfolioApplicationService(
            @Qualifier("portfolioService") GetProjectsUseCase getProjectsUseCase,
            PortfolioRepositoryPort portfolioRepositoryPort) {
        this.getProjectsUseCase = getProjectsUseCase;
        this.portfolioRepositoryPort = portfolioRepositoryPort;
    }
    
    @Override
    public Map<String, Object> getAllPortfolioData() {
        try {
            List<Project> projects = getProjectsUseCase.getAllProjects();
            List<Experience> experiences = portfolioRepositoryPort.findAllExperiences();
            List<Education> educations = portfolioRepositoryPort.findAllEducations();
            List<Certification> certifications = portfolioRepositoryPort.findAllCertifications();
            
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
            return portfolioRepositoryPort.findAllExperiences();
        } catch (Exception e) {
            log.error("경험 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("경험 데이터 조회 실패", e);
        }
    }
    
    @Override
    public List<Education> getAllEducations() {
        try {
            return portfolioRepositoryPort.findAllEducations();
        } catch (Exception e) {
            log.error("교육 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("교육 데이터 조회 실패", e);
        }
    }
    
    @Override
    public List<Certification> getAllCertifications() {
        try {
            return portfolioRepositoryPort.findAllCertifications();
        } catch (Exception e) {
            log.error("자격증 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("자격증 데이터 조회 실패", e);
        }
    }
}