package com.aiportfolio.backend.domain.portfolio.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Project 도메인 모델
 *
 * 순수 비즈니스 도메인 모델 (인프라 의존성 없음)
 * Hexagonal Architecture의 중심 도메인
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    /**
     * 비즈니스 ID (prj-001, prj-002 등)
     */
    private String id;

    /**
     * 프로젝트 제목
     */
    private String title;

    /**
     * 프로젝트 설명
     */
    private String description;

    /**
     * 기술 스택 메타데이터
     * (기존 technologies 필드 제거됨 - techStackMetadata 관계 필드로 대체)
     */
    private List<TechStackMetadata> techStackMetadata;

    /**
     * GitHub URL
     */
    private String githubUrl;

    /**
     * 라이브 URL
     */
    private String liveUrl;

    /**
     * 이미지 URL
     */
    private String imageUrl;

    /**
     * README 내용
     */
    private String readme;

    /**
     * 프로젝트 타입 ('project' 또는 'certification')
     */
    private String type;

    /**
     * 소스 정보
     */
    private String source;

    /**
     * 프로젝트 상태 (completed, in_progress, maintenance 등)
     */
    private String status;

    /**
     * 정렬 순서
     */
    private Integer sortOrder;

    /**
     * 시작일
     */
    private LocalDate startDate;

    /**
     * 종료일 (NULL이면 진행중)
     */
    private LocalDate endDate;

    /**
     * 팀 프로젝트 여부
     */
    @JsonProperty("isTeam")
    private boolean isTeam;

    /**
     * 외부 URL
     */
    private String externalUrl;

    /**
     * 나의 기여 사항
     */
    private List<String> myContributions;

    /**
     * 팀 프로젝트에서의 역할
     */
    private String role;

    /**
     * 추가 스크린샷 URL 배열
     */
    private List<String> screenshots;

    /**
     * 생성일시
     */
    private LocalDateTime createdAt;

    /**
     * 수정일시
     */
    private LocalDateTime updatedAt;

    /**
     * 프로젝트가 진행중인지 확인
     */
    @JsonIgnore
    public boolean isOngoing() {
        return endDate == null;
    }
    
    /**
     * 프로젝트 기간을 월 단위로 계산
     */
    @JsonIgnore
    public long getDurationInMonths() {
        if (endDate == null) {
            return java.time.temporal.ChronoUnit.MONTHS.between(startDate, LocalDate.now());
        }
        return java.time.temporal.ChronoUnit.MONTHS.between(startDate, endDate);
    }
    
    /**
     * 프로젝트가 특정 기술을 사용하는지 확인
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
     * 핵심 기술 스택만 반환
     */
    public List<TechStackMetadata> getCoreTechnologies() {
        return techStackMetadata != null ? 
               techStackMetadata.stream()
                   .filter(TechStackMetadata::isCoreTechnology)
                   .collect(java.util.stream.Collectors.toList()) : 
               new java.util.ArrayList<>();
    }
}

