package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ExperienceProjectJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Experience-Project 관계 JPA Repository
 */
@Repository
public interface ExperienceProjectJpaRepository extends JpaRepository<ExperienceProjectJpaEntity, Long> {
    
    /**
     * Experience ID로 프로젝트 관계 조회
     */
    List<ExperienceProjectJpaEntity> findByExperienceId(Long experienceId);
    
    /**
     * Experience ID와 Project ID로 관계 조회
     */
    ExperienceProjectJpaEntity findByExperienceIdAndProjectId(Long experienceId, Long projectId);
    
    /**
     * Experience ID로 모든 관계 삭제
     */
    void deleteByExperienceId(Long experienceId);
    
    /**
     * 특정 관계 삭제
     */
    void deleteByExperienceIdAndProjectId(Long experienceId, Long projectId);
}

