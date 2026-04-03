package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.port.in.GetAllDataUseCase;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 포트폴리오 관련 Application Service
 * GetAllDataUseCase를 구현하는 헥사고날 아키텍처의 Application Layer.
 * 집계 조회는 {@link PortfolioService}의 캐시된 목록 API를 사용해 Redis와 계약을 맞춘다.
 */
@Slf4j
@Service
public class PortfolioApplicationService implements GetAllDataUseCase {

    private final PortfolioService portfolioService;

    public PortfolioApplicationService(
            @Qualifier("portfolioService") PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @Override
    public Map<String, Object> getAllPortfolioData() {
        try {
            List<Project> projects = portfolioService.getAllProjects();
            List<Experience> experiences = portfolioService.getAllExperiences();
            List<Education> educations = portfolioService.getAllEducations();
            List<Certification> certifications = portfolioService.getAllCertifications();
            
            return Map.of(
                "projects", projects,
                "experiences", experiences,
                "educations", educations,
                "certifications", certifications
            );
        } catch (Exception e) {
            log.error("포트폴리오 데이터 조회 중 오류 발생", e);
            throw new IllegalStateException("포트폴리오 데이터 조회 실패", e);
        }
    }
    
    @Override
    public List<Experience> getAllExperiences() {
        try {
            return portfolioService.getAllExperiences();
        } catch (Exception e) {
            log.error("경험 데이터 조회 중 오류 발생", e);
            throw new IllegalStateException("경험 데이터 조회 실패", e);
        }
    }

    @Override
    public List<Education> getAllEducations() {
        try {
            return portfolioService.getAllEducations();
        } catch (Exception e) {
            log.error("교육 데이터 조회 중 오류 발생", e);
            throw new IllegalStateException("교육 데이터 조회 실패", e);
        }
    }

    @Override
    public List<Certification> getAllCertifications() {
        try {
            return portfolioService.getAllCertifications();
        } catch (Exception e) {
            log.error("자격증 데이터 조회 중 오류 발생", e);
            throw new IllegalStateException("자격증 데이터 조회 실패", e);
        }
    }
}