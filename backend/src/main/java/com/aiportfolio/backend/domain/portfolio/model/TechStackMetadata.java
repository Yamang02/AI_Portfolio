package com.aiportfolio.backend.domain.portfolio.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * TechStackMetadata 도메인 모델
 *
 * 기술 스택의 분류, 레벨, 핵심 여부 등을 관리하는 도메인 엔티티
 * 순수 비즈니스 도메인 모델 (인프라 의존성 없음)
 * Hexagonal Architecture의 중심 도메인
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechStackMetadata {

    /**
     * 기술명 (JavaScript, React 등)
     */
    private String name;

    /**
     * 표시명 (JavaScript, React 등)
     */
    private String displayName;

    /**
     * 카테고리 (language, framework, database, tool, web, api, ai_ml 등)
     */
    private String category;

    /**
     * 레벨 (expert, intermediate, beginner)
     */
    private String level;

    /**
     * 핵심 기술 여부
     */
    private Boolean isCore;

    /**
     * 활성화 여부
     */
    private Boolean isActive;

    /**
     * 아이콘 URL
     */
    private String iconUrl;

    /**
     * 배지 색상 (#RRGGBB 형식)
     */
    private String colorHex;

    /**
     * 기술 설명
     */
    private String description;

    /**
     * 정렬 순서
     */
    private Integer sortOrder;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;
    
    /**
     * 핵심 기술인지 확인
     */
    public boolean isCoreTechnology() {
        return Boolean.TRUE.equals(isCore);
    }
    
    /**
     * 활성화된 기술인지 확인
     */
    public boolean isActiveTechnology() {
        return Boolean.TRUE.equals(isActive);
    }
    
    /**
     * 전문가 레벨인지 확인
     */
    public boolean isExpertLevel() {
        return "expert".equalsIgnoreCase(level);
    }
    
    /**
     * 중급 레벨인지 확인
     */
    public boolean isIntermediateLevel() {
        return "intermediate".equalsIgnoreCase(level);
    }
    
    /**
     * 초급 레벨인지 확인
     */
    public boolean isBeginnerLevel() {
        return "beginner".equalsIgnoreCase(level);
    }
    
    /**
     * 언어 카테고리인지 확인
     */
    public boolean isLanguageCategory() {
        return "language".equalsIgnoreCase(category);
    }
    
    /**
     * 프레임워크 카테고리인지 확인
     */
    public boolean isFrameworkCategory() {
        return "framework".equalsIgnoreCase(category);
    }
    
    /**
     * 데이터베이스 카테고리인지 확인
     */
    public boolean isDatabaseCategory() {
        return "database".equalsIgnoreCase(category);
    }
    
    /**
     * 도구 카테고리인지 확인
     */
    public boolean isToolCategory() {
        return "tool".equalsIgnoreCase(category);
    }
}

