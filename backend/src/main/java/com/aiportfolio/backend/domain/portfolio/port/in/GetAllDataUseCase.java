package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;

import java.util.List;
import java.util.Map;

/**
 * 전체 포트폴리오 데이터 조회 Use Case
 * Primary Port (인바운드 포트)
 */
public interface GetAllDataUseCase {
    
    /**
     * 모든 포트폴리오 데이터를 조회합니다
     */
    Map<String, Object> getAllPortfolioData();
    
    /**
     * 모든 경험 정보를 조회합니다
     */
    List<Experience> getAllExperiences();
    
    /**
     * 모든 교육 정보를 조회합니다
     */
    List<Education> getAllEducations();
    
    /**
     * 모든 자격증 정보를 조회합니다
     */
    List<Certification> getAllCertifications();
}