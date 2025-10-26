package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ExperienceTechStackJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Experience-TechStack 관계 JPA Repository
 */
@Repository
public interface ExperienceTechStackJpaRepository extends JpaRepository<ExperienceTechStackJpaEntity, Long> {
    
    /**
     * Experience ID로 기술스택 관계 조회
     */
    List<ExperienceTechStackJpaEntity> findByExperienceId(Long experienceId);
    
    /**
     * Experience ID와 TechStack ID로 관계 조회
     */
    ExperienceTechStackJpaEntity findByExperienceIdAndTechStackId(Long experienceId, Long techStackId);
    
    /**
     * Experience ID로 모든 관계 삭제
     */
    void deleteByExperienceId(Long experienceId);
    
    /**
     * 특정 관계 삭제
     */
    void deleteByExperienceIdAndTechStackId(Long experienceId, Long techStackId);
}

