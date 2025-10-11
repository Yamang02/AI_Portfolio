package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 기술 스택 메타데이터 JPA Repository
 * 기술 스택 메타데이터의 데이터베이스 접근을 담당
 */
@Repository
public interface TechStackMetadataJpaRepository extends JpaRepository<TechStackMetadataJpaEntity, Long> {
    
    /**
     * 기술명으로 기술 스택 메타데이터 조회
     */
    Optional<TechStackMetadataJpaEntity> findByName(String name);
    
    /**
     * 활성화된 기술 스택 메타데이터만 조회
     */
    List<TechStackMetadataJpaEntity> findByIsActiveTrueOrderBySortOrderAsc();
    
    /**
     * 핵심 기술 스택 메타데이터만 조회
     */
    List<TechStackMetadataJpaEntity> findByIsCoreTrueAndIsActiveTrueOrderBySortOrderAsc();
    
    /**
     * 카테고리별 기술 스택 메타데이터 조회
     */
    List<TechStackMetadataJpaEntity> findByCategoryAndIsActiveTrueOrderBySortOrderAsc(String category);
    
    /**
     * 레벨별 기술 스택 메타데이터 조회
     */
    List<TechStackMetadataJpaEntity> findByLevelAndIsActiveTrueOrderBySortOrderAsc(String level);
    
    /**
     * 카테고리와 레벨로 기술 스택 메타데이터 조회
     */
    List<TechStackMetadataJpaEntity> findByCategoryAndLevelAndIsActiveTrueOrderBySortOrderAsc(String category, String level);
    
    /**
     * 기술명 목록으로 기술 스택 메타데이터 조회
     */
    List<TechStackMetadataJpaEntity> findByNameInAndIsActiveTrueOrderBySortOrderAsc(List<String> names);
    
    /**
     * 기술명이 포함된 기술 스택 메타데이터 조회 (검색용)
     */
    List<TechStackMetadataJpaEntity> findByNameContainingIgnoreCaseAndIsActiveTrueOrderBySortOrderAsc(String name);
    
    /**
     * 카테고리별 기술 스택 개수 조회
     */
    @Query("SELECT t.category, COUNT(t) FROM TechStackMetadataJpaEntity t WHERE t.isActive = true GROUP BY t.category ORDER BY t.category")
    List<Object[]> countByCategory();
    
    /**
     * 레벨별 기술 스택 개수 조회
     */
    @Query("SELECT t.level, COUNT(t) FROM TechStackMetadataJpaEntity t WHERE t.isActive = true GROUP BY t.level ORDER BY t.level")
    List<Object[]> countByLevel();
    
    /**
     * 핵심 기술 스택 개수 조회
     */
    @Query("SELECT COUNT(t) FROM TechStackMetadataJpaEntity t WHERE t.isCore = true AND t.isActive = true")
    Long countCoreTechnologies();
    
    /**
     * 전체 활성화된 기술 스택 개수 조회
     */
    @Query("SELECT COUNT(t) FROM TechStackMetadataJpaEntity t WHERE t.isActive = true")
    Long countActiveTechnologies();
    
    /**
     * 프로젝트에서 사용된 기술 스택들의 메타데이터 조회
     */
    @Query("SELECT DISTINCT t FROM TechStackMetadataJpaEntity t " +
           "JOIN ProjectTechStackJpaEntity pts ON t.name = pts.techStack.name " +
           "WHERE t.isActive = true " +
           "ORDER BY t.sortOrder ASC")
    List<TechStackMetadataJpaEntity> findTechnologiesUsedInProjects();
    
    /**
     * 프로젝트에서 사용된 기술 스택들의 사용 빈도와 함께 조회
     */
    @Query("SELECT t FROM TechStackMetadataJpaEntity t " +
           "JOIN ProjectTechStackJpaEntity pts ON t.name = pts.techStack.name " +
           "WHERE t.isActive = true " +
           "ORDER BY t.sortOrder ASC")
    List<TechStackMetadataJpaEntity> findTechnologiesWithUsageCount();
}
