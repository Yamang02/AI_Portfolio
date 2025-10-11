package com.aiportfolio.backend.domain.portfolio.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

/**
 * 기술 스택 메타데이터 도메인 모델
 * 기술 스택의 분류, 레벨, 핵심 여부 등을 관리하는 도메인 엔티티
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechStackMetadata {
    
    @NotBlank(message = "기술명은 필수입니다")
    @Size(max = 100, message = "기술명은 100자를 초과할 수 없습니다")
    private String name; // JavaScript, React 등
    
    @NotBlank(message = "표시명은 필수입니다")
    @Size(max = 100, message = "표시명은 100자를 초과할 수 없습니다")
    private String displayName; // JavaScript, React 등
    
    @NotBlank(message = "카테고리는 필수입니다")
    @Size(max = 50, message = "카테고리는 50자를 초과할 수 없습니다")
    private String category; // language, framework, database, tool, web, api, ai_ml 등
    
    @NotBlank(message = "레벨은 필수입니다")
    @Size(max = 20, message = "레벨은 20자를 초과할 수 없습니다")
    private String level; // expert, intermediate, beginner
    
    @NotNull(message = "핵심 기술 여부는 필수입니다")
    private Boolean isCore; // 핵심 기술 여부
    
    @NotNull(message = "활성화 여부는 필수입니다")
    private Boolean isActive; // 활성화 여부
    
    @Size(max = 500, message = "아이콘 URL은 500자를 초과할 수 없습니다")
    private String iconUrl; // 아이콘 URL
    
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "색상 코드는 #RRGGBB 형식이어야 합니다")
    private String colorHex; // 배지 색상 (#FF5733)
    
    @Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다")
    private String description; // 기술 설명
    
    @NotNull(message = "정렬 순서는 필수입니다")
    private Integer sortOrder; // 정렬 순서
    
    private LocalDateTime createdAt;
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

