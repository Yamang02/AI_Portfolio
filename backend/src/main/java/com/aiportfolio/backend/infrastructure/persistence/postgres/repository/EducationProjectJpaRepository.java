package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationProjectJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Education-Project 관계 JPA Repository
 */
@Repository
public interface EducationProjectJpaRepository extends JpaRepository<EducationProjectJpaEntity, Long> {
    
    /**
     * Education ID로 프로젝트 관계 조회
     */
    List<EducationProjectJpaEntity> findByEducationId(Long educationId);
    
    /**
     * Education ID와 Project ID로 관계 조회
     */
    EducationProjectJpaEntity findByEducationIdAndProjectId(Long educationId, Long projectId);
    
    /**
     * Education ID로 모든 관계 삭제
     */
    void deleteByEducationId(Long educationId);
    
    /**
     * 특정 관계 삭제
     */
    void deleteByEducationIdAndProjectId(Long educationId, Long projectId);
}

