package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechStackJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 프로젝트-기술 스택 매핑 JPA Repository
 */
@Repository
public interface ProjectTechStackJpaRepository extends JpaRepository<ProjectTechStackJpaEntity, Long> {
    
    /**
     * 프로젝트 ID로 기술 스택 매핑 조회
     */
    List<ProjectTechStackJpaEntity> findByProjectId(Long projectId);
    
    /**
     * 기술 스택 이름으로 프로젝트 매핑 조회
     */
    List<ProjectTechStackJpaEntity> findByTechStackName(String techStackName);
    
    /**
     * 프로젝트 ID와 기술 스택 이름으로 매핑 조회
     */
    ProjectTechStackJpaEntity findByProjectIdAndTechStackName(Long projectId, String techStackName);
    
    /**
     * 프로젝트 ID로 기술 스택 매핑 삭제
     */
    void deleteByProjectId(Long projectId);
    
    /**
     * 기술 스택 이름으로 프로젝트 매핑 삭제
     */
    void deleteByTechStackName(String techStackName);
    
    /**
     * 주요 기술 스택만 조회
     */
    List<ProjectTechStackJpaEntity> findByIsPrimaryTrue();
    
    /**
     * 특정 프로젝트의 주요 기술 스택 조회
     */
    List<ProjectTechStackJpaEntity> findByProjectIdAndIsPrimaryTrue(Long projectId);
}

