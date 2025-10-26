package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationTechStackJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Education-TechStack 관계 JPA Repository
 */
@Repository
public interface EducationTechStackJpaRepository extends JpaRepository<EducationTechStackJpaEntity, Long> {
    
    /**
     * Education ID로 기술스택 관계 조회
     */
    List<EducationTechStackJpaEntity> findByEducationId(Long educationId);
    
    /**
     * Education ID와 TechStack ID로 관계 조회
     */
    EducationTechStackJpaEntity findByEducationIdAndTechStackId(Long educationId, Long techStackId);
    
    /**
     * Education ID로 모든 관계 삭제
     */
    void deleteByEducationId(Long educationId);
    
    /**
     * 특정 관계 삭제
     */
    void deleteByEducationIdAndTechStackId(Long educationId, Long techStackId);
}

