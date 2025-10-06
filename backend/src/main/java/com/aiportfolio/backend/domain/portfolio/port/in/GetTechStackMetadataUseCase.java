package com.aiportfolio.backend.domain.portfolio.port.in;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;

import java.util.List;
import java.util.Optional;

/**
 * 기술 스택 메타데이터 조회 Use Case
 * 기술 스택 메타데이터 관련 비즈니스 로직을 정의
 */
public interface GetTechStackMetadataUseCase {
    
    /**
     * 모든 활성화된 기술 스택 메타데이터 조회
     */
    List<TechStackMetadata> getAllActiveTechStackMetadata();
    
    /**
     * 핵심 기술 스택 메타데이터만 조회
     */
    List<TechStackMetadata> getCoreTechStackMetadata();
    
    /**
     * 기술명으로 기술 스택 메타데이터 조회
     */
    Optional<TechStackMetadata> getTechStackMetadataByName(String name);
    
    /**
     * 카테고리별 기술 스택 메타데이터 조회
     */
    List<TechStackMetadata> getTechStackMetadataByCategory(String category);
    
    /**
     * 레벨별 기술 스택 메타데이터 조회
     */
    List<TechStackMetadata> getTechStackMetadataByLevel(String level);
    
    /**
     * 카테고리와 레벨로 기술 스택 메타데이터 조회
     */
    List<TechStackMetadata> getTechStackMetadataByCategoryAndLevel(String category, String level);
    
    /**
     * 기술명 목록으로 기술 스택 메타데이터 조회
     */
    List<TechStackMetadata> getTechStackMetadataByNames(List<String> names);
    
    /**
     * 기술명이 포함된 기술 스택 메타데이터 조회 (검색용)
     */
    List<TechStackMetadata> searchTechStackMetadataByName(String name);
    
    /**
     * 프로젝트에서 사용된 기술 스택들의 메타데이터 조회
     */
    List<TechStackMetadata> getTechnologiesUsedInProjects();
    
    /**
     * 기술 스택 통계 정보 조회
     */
    TechStackStatistics getTechStackStatistics();
    
    /**
     * 기술 스택 통계 정보
     */
    record TechStackStatistics(
        long totalTechnologies,
        long coreTechnologies,
        long activeTechnologies,
        List<CategoryCount> categoryCounts,
        List<LevelCount> levelCounts
    ) {}
    
    /**
     * 카테고리별 개수
     */
    record CategoryCount(String category, long count) {}
    
    /**
     * 레벨별 개수
     */
    record LevelCount(String level, long count) {}
}

