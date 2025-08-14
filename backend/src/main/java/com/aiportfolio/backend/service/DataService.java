package com.aiportfolio.backend.service;

import com.aiportfolio.backend.domain.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.domain.port.in.ManageProjectCacheUseCase;
import com.aiportfolio.backend.domain.port.out.ProjectRepositoryPort;
import com.aiportfolio.backend.domain.model.Certification;
import com.aiportfolio.backend.domain.model.Education;
import com.aiportfolio.backend.domain.model.Experience;
import com.aiportfolio.backend.domain.model.Project;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 포트폴리오 관련 모든 데이터를 제공하는 통합 서비스
 * Repository 패턴을 통해 데이터 접근 계층과 분리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DataService {
    
    private final GetProjectsUseCase getProjectsUseCase;
    private final ManageProjectCacheUseCase manageProjectCacheUseCase;
    private final ProjectRepositoryPort projectRepositoryPort;
    
    /**
     * 모든 프로젝트를 조회합니다
     */
    public List<Project> getAllProjects() {
        return getProjectsUseCase.getAllProjects();
    }
    
    /**
     * 모든 경력 정보를 조회합니다
     */
    public List<Experience> getAllExperiences() {
        return projectRepositoryPort.findAllExperiences();
    }
    
    /**
     * 모든 자격증 정보를 조회합니다
     */
    public List<Certification> getAllCertifications() {
        return projectRepositoryPort.findAllCertifications();
    }
    
    /**
     * 모든 교육 정보를 조회합니다
     */
    public List<Education> getAllEducation() {
        return projectRepositoryPort.findAllEducations();
    }
    
    /**
     * 모든 캐시를 무효화합니다 (관리자 기능)
     */
    public void refreshAllCache() {
        manageProjectCacheUseCase.refreshCache();
        log.info("모든 포트폴리오 데이터 캐시가 무효화되었습니다");
    }
} 