package com.aiportfolio.backend.application.service;

import com.aiportfolio.backend.domain.portfolio.port.in.GetAllDataUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.ProjectRepositoryPort;
import com.aiportfolio.backend.domain.model.Certification;
import com.aiportfolio.backend.domain.model.Education;
import com.aiportfolio.backend.domain.model.Experience;
import com.aiportfolio.backend.domain.model.Project;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 포트폴리오 관련 Application Service
 * GetAllDataUseCase를 구현하는 헥사고날 아키텍처의 Application Layer
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioApplicationService implements GetAllDataUseCase {
    
    private final GetProjectsUseCase getProjectsUseCase;
    private final ProjectRepositoryPort projectRepositoryPort;
    
    @Override
    public Map<String, Object> getAllPortfolioData() {
        try {
            List<Project> projects = getProjectsUseCase.getAllProjects();
            List<Experience> experiences = projectRepositoryPort.findAllExperiences();
            List<Education> educations = projectRepositoryPort.findAllEducations();
            List<Certification> certifications = projectRepositoryPort.findAllCertifications();
            
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
            return projectRepositoryPort.findAllExperiences();
        } catch (Exception e) {
            log.error("경험 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("경험 데이터 조회 실패", e);
        }
    }
    
    @Override
    public List<Education> getAllEducations() {
        try {
            return projectRepositoryPort.findAllEducations();
        } catch (Exception e) {
            log.error("교육 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("교육 데이터 조회 실패", e);
        }
    }
    
    @Override
    public List<Certification> getAllCertifications() {
        try {
            return projectRepositoryPort.findAllCertifications();
        } catch (Exception e) {
            log.error("자격증 데이터 조회 중 오류 발생", e);
            throw new RuntimeException("자격증 데이터 조회 실패", e);
        }
    }
}