package com.aiportfolio.backend.domain.portfolio;

import com.aiportfolio.backend.model.Project;
import com.aiportfolio.backend.model.Experience;
import com.aiportfolio.backend.model.Education;
import com.aiportfolio.backend.model.Certification;

import java.util.List;
import java.util.Optional;

/**
 * 포트폴리오 데이터 접근을 위한 Repository 인터페이스
 * 헥사고날 아키텍처의 포트(Port) 역할
 */
public interface ProjectRepository {
    
    // === 프로젝트 관련 ===
    /**
     * 모든 프로젝트를 조회합니다 (GitHub + Local 데이터 통합)
     */
    List<Project> findAllProjects();
    
    /**
     * ID로 특정 프로젝트를 조회합니다
     */
    Optional<Project> findProjectById(String id);
    
    /**
     * 프로젝트 제목으로 검색합니다
     */
    Optional<Project> findProjectByTitle(String title);
    
    // === 경력 관련 ===
    /**
     * 모든 경력 정보를 조회합니다
     */
    List<Experience> findAllExperiences();
    
    /**
     * ID로 특정 경력을 조회합니다
     */
    Optional<Experience> findExperienceById(String id);
    
    // === 교육 관련 ===
    /**
     * 모든 교육 정보를 조회합니다
     */
    List<Education> findAllEducations();
    
    /**
     * ID로 특정 교육을 조회합니다
     */
    Optional<Education> findEducationById(String id);
    
    // === 자격증 관련 ===
    /**
     * 모든 자격증 정보를 조회합니다
     */
    List<Certification> findAllCertifications();
    
    /**
     * ID로 특정 자격증을 조회합니다
     */
    Optional<Certification> findCertificationById(String id);
    
    // === 캐시 관리 ===
    /**
     * 캐시를 무효화하고 데이터를 다시 로드합니다
     */
    void invalidateCache();
    
    /**
     * 캐시가 유효한지 확인합니다
     */
    boolean isCacheValid();
}