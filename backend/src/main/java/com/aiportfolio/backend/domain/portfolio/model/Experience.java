package com.aiportfolio.backend.domain.portfolio.model;

import com.aiportfolio.backend.application.common.util.Sortable;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Experience 도메인 모델
 *
 * 순수 비즈니스 도메인 모델 (인프라 의존성 없음)
 * Hexagonal Architecture의 중심 도메인
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Experience implements Sortable {

    /**
     * 비즈니스 ID (exp-001, exp-002 등)
     */
    private String id;
    
    /**
     * 데이터베이스 ID (Long, 자동 증가)
     */
    private Long dbId;

    /**
     * 직책
     */
    private String title;

    /**
     * 경력 설명
     */
    private String description;

    /**
     * 기술 스택 메타데이터
     * (기존 technologies 필드 제거됨 - techStackMetadata 관계 필드로 대체)
     */
    private List<TechStackMetadata> techStackMetadata;

    /**
     * 조직명
     */
    private String organization;

    /**
     * 역할
     */
    private String role;

    /**
     * 시작일
     */
    private LocalDate startDate;

    /**
     * 종료일 (NULL이면 현재 재직중)
     */
    private LocalDate endDate;

    /**
     * 직무 분야 (개발, 교육, 디자인 등)
     */
    private String jobField;

    /**
     * 계약 조건 (FULL_TIME, PART_TIME, CONTRACT 등)
     */
    private String employmentType;

    /**
     * 주요 책임
     */
    private List<String> mainResponsibilities;

    /**
     * 주요 성과
     */
    private List<String> achievements;

    /**
     * 관련 프로젝트
     */
    private List<String> projects;

    /**
     * 정렬 순서
     */
    private Integer sortOrder;

    /**
     * 생성일시
     */
    private java.time.LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private java.time.LocalDateTime updatedAt;
    
    /**
     * 현재 재직중인지 확인
     */
    public boolean isCurrentlyEmployed() {
        return endDate == null;
    }
    
    /**
     * 경력 기간을 월 단위로 계산
     */
    public long getDurationInMonths() {
        if (endDate == null) {
            return java.time.temporal.ChronoUnit.MONTHS.between(startDate, LocalDate.now());
        }
        return java.time.temporal.ChronoUnit.MONTHS.between(startDate, endDate);
    }
    
    /**
     * 경력이 특정 기술을 사용하는지 확인
     */
    public boolean usesTechnology(String technology) {
        return techStackMetadata != null && 
               techStackMetadata.stream()
                   .anyMatch(tech -> tech.getName().toLowerCase().contains(technology.toLowerCase()));
    }
    
    /**
     * 기술 스택 이름 리스트 반환 (호환성용)
     */
    public List<String> getTechnologies() {
        return techStackMetadata != null ? 
               techStackMetadata.stream()
                   .map(TechStackMetadata::getName)
                   .collect(java.util.stream.Collectors.toList()) : 
               new java.util.ArrayList<>();
    }
    
    /**
     * 경력이 특정 조직에서의 경험인지 확인
     */
    public boolean isFromOrganization(String orgName) {
        return organization != null && 
               organization.toLowerCase().contains(orgName.toLowerCase());
    }
}

