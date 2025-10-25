package com.aiportfolio.backend.domain.portfolio.port.out;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;

import java.util.List;
import java.util.Optional;

/**
 * 기술 스택 메타데이터 Repository Port
 * 도메인에서 기술 스택 메타데이터 데이터 접근을 위한 인터페이스
 */
public interface TechStackMetadataRepositoryPort {
    
    /**
     * 모든 기술 스택 메타데이터 조회 (활성/비활성 포함)
     */
    List<TechStackMetadata> findAll();
    
    /**
     * 모든 활성화된 기술 스택 메타데이터 조회
     */
    List<TechStackMetadata> findAllActive();
    
    /**
     * 핵심 기술 스택 메타데이터만 조회
     */
    List<TechStackMetadata> findCoreTechnologies();
    
    /**
     * 기술명으로 기술 스택 메타데이터 조회
     */
    Optional<TechStackMetadata> findByName(String name);
    
    /**
     * 카테고리별 기술 스택 메타데이터 조회
     */
    List<TechStackMetadata> findByCategory(String category);
    
    /**
     * 레벨별 기술 스택 메타데이터 조회
     */
    List<TechStackMetadata> findByLevel(String level);
    
    /**
     * 카테고리와 레벨로 기술 스택 메타데이터 조회
     */
    List<TechStackMetadata> findByCategoryAndLevel(String category, String level);
    
    /**
     * 기술명 목록으로 기술 스택 메타데이터 조회
     */
    List<TechStackMetadata> findByNames(List<String> names);
    
    /**
     * 기술명이 포함된 기술 스택 메타데이터 조회 (검색용)
     */
    List<TechStackMetadata> findByNameContaining(String name);
    
    /**
     * 프로젝트에서 사용된 기술 스택들의 메타데이터 조회
     */
    List<TechStackMetadata> findTechnologiesUsedInProjects();
    
    /**
     * 기술 스택 메타데이터 저장
     */
    TechStackMetadata save(TechStackMetadata techStackMetadata);
    
    /**
     * 기술 스택 메타데이터 업데이트
     */
    TechStackMetadata updateByName(String name, TechStackMetadata techStackMetadata);
    
    /**
     * 기술 스택 메타데이터 목록 저장
     */
    List<TechStackMetadata> saveAll(List<TechStackMetadata> techStackMetadataList);
    
    /**
     * 기술 스택 메타데이터 삭제
     */
    void deleteByName(String name);
    
    /**
     * 기술 스택 메타데이터 존재 여부 확인
     */
    boolean existsByName(String name);
    
    /**
     * 최대 정렬 순서 조회
     */
    int findMaxSortOrder();
}

