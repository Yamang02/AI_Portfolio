package com.aiportfolio.backend.domain.portfolio.port.out;

import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.admin.model.vo.ProjectFilter;

import java.util.List;
import java.util.Optional;

/**
 * 포트폴리오 데이터 접근을 위한 Repository Port
 * Secondary Port (아웃바운드 포트)
 * 헥사고날 아키텍처의 포트(Port) 역할
 */
public interface PortfolioRepositoryPort {
    
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
    
    /**
     * 타입별로 프로젝트를 필터링하여 조회합니다
     */
    List<Project> findProjectsByType(String type);
    
    /**
     * 소스별로 프로젝트를 필터링하여 조회합니다
     */
    List<Project> findProjectsBySource(String source);
    
    /**
     * 팀 프로젝트 여부로 필터링하여 조회합니다
     */
    List<Project> findProjectsByTeamStatus(boolean isTeam);
    
    /**
     * 프로젝트를 저장합니다 (Admin Dashboard용)
     */
    Project saveProject(Project project);
    
    /**
     * 프로젝트를 삭제합니다 (Admin Dashboard용)
     */
    void deleteProject(String id);
    
    /**
     * 특정 기술스택을 사용하는 프로젝트 목록 조회
     */
    List<Project> findProjectsByTechStack(String techStackName);
    
    /**
     * 여러 기술스택을 사용하는 프로젝트 목록 조회
     */
    List<Project> findProjectsByTechStacks(List<String> techStackNames);
    
    // === 경력 관련 ===
    /**
     * 모든 경력 정보를 조회합니다 (캐시 포함)
     */
    List<Experience> findAllExperiences();
    
    /**
     * 모든 경력 정보를 조회합니다 (어드민용, 캐시 없음)
     */
    List<Experience> findAllExperiencesWithoutCache();

    /**
     * ID로 특정 경력을 조회합니다
     */
    Optional<Experience> findExperienceById(String id);

    /**
     * Experience를 저장합니다 (생성/수정 공통)
     */
    Experience saveExperience(Experience experience);

    /**
     * Experience를 삭제합니다
     */
    void deleteExperience(String id);
    
    // === 교육 관련 ===
    /**
     * 모든 교육 정보를 조회합니다 (캐시 포함)
     */
    List<Education> findAllEducations();
    
    /**
     * 모든 교육 정보를 조회합니다 (어드민용, 캐시 없음)
     */
    List<Education> findAllEducationsWithoutCache();

    /**
     * ID로 특정 교육을 조회합니다
     */
    Optional<Education> findEducationById(String id);

    /**
     * Education을 저장합니다 (생성/수정 공통)
     */
    Education saveEducation(Education education);

    /**
     * Education을 삭제합니다
     */
    void deleteEducation(String id);
    
    /**
     * Experience의 최대 정렬 순서를 조회합니다
     */
    int findMaxExperienceSortOrder();
    
    /**
     * Education의 최대 정렬 순서를 조회합니다
     */
    int findMaxEducationSortOrder();
    
    // === 자격증 관련 ===
    /**
     * 모든 자격증 정보를 조회합니다 (캐시 포함)
     */
    List<Certification> findAllCertifications();

    /**
     * 모든 자격증 정보를 조회합니다 (어드민용, 캐시 없음)
     */
    List<Certification> findAllCertificationsWithoutCache();

    /**
     * ID로 특정 자격증을 조회합니다
     */
    Optional<Certification> findCertificationById(String id);

    /**
     * Certification을 저장합니다 (생성/수정 공통)
     */
    Certification saveCertification(Certification certification);

    /**
     * Certification을 삭제합니다
     */
    void deleteCertification(String id);

    /**
     * Certification의 최대 정렬 순서를 조회합니다
     */
    int findMaxCertificationSortOrder();

    /**
     * 카테고리별 자격증 목록 조회
     */
    List<Certification> findCertificationsByCategory(String category);

    // === 관리자 기능 추가 ===
    /**
     * 필터 조건에 따라 프로젝트 목록을 조회합니다 (관리자용)
     */
    List<Project> findByFilter(ProjectFilter filter);
    
    /**
     * 프로젝트 존재 여부를 확인합니다 (관리자용)
     */
    boolean existsProjectById(String id);
    
    /**
     * 프로젝트를 업데이트합니다 (관리자용)
     */
    Project updateProject(Project project);
}