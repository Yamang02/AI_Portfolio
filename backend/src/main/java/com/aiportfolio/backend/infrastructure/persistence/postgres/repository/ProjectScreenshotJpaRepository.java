package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectScreenshotJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 프로젝트 스크린샷 JPA Repository
 */
@Repository
public interface ProjectScreenshotJpaRepository extends JpaRepository<ProjectScreenshotJpaEntity, Long> {
    
    /**
     * 프로젝트 ID로 스크린샷 목록 조회 (display_order 순서대로)
     */
    List<ProjectScreenshotJpaEntity> findByProjectIdOrderByDisplayOrderAsc(Long projectId);
    
    /**
     * 프로젝트 ID로 모든 스크린샷 삭제
     */
    void deleteByProjectId(Long projectId);
    
    /**
     * 이미지 URL로 스크린샷 조회
     */
    List<ProjectScreenshotJpaEntity> findByImageUrl(String imageUrl);
}

