package com.aiportfolio.backend.domain.portfolio.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    
    @NotBlank(message = "프로젝트 ID는 필수입니다")
    private String id;
    
    @NotBlank(message = "프로젝트 제목은 필수입니다")
    @Size(max = 200, message = "프로젝트 제목은 200자를 초과할 수 없습니다")
    private String title;
    
    @NotBlank(message = "프로젝트 설명은 필수입니다")
    @Size(max = 2000, message = "프로젝트 설명은 2000자를 초과할 수 없습니다")
    private String description;
    
    // 기존 technologies 필드 제거됨 - techStackMetadata 관계 필드로 대체
    private List<TechStackMetadata> techStackMetadata;
    
    @URL(message = "올바른 GitHub URL 형식이어야 합니다")
    private String githubUrl;
    
    @URL(message = "올바른 라이브 URL 형식이어야 합니다")
    private String liveUrl;
    
    @URL(message = "올바른 이미지 URL 형식이어야 합니다")
    private String imageUrl;
    
    @Size(max = 10000, message = "README는 10000자를 초과할 수 없습니다")
    private String readme;
    
    @Size(max = 50, message = "프로젝트 타입은 50자를 초과할 수 없습니다")
    private String type; // 'project' 또는 'certification'
    
    @Size(max = 100, message = "소스 정보는 100자를 초과할 수 없습니다")
    private String source;

    @Size(max = 50, message = "상태는 50자를 초과할 수 없습니다")
    private String status; // 프로젝트 상태 (completed, in_progress, maintenance 등)

    private Integer sortOrder; // 정렬 순서

    @NotNull(message = "시작일은 필수입니다")
    private LocalDate startDate;

    private LocalDate endDate; // 종료일은 선택사항 (진행중인 프로젝트)
    
    @JsonProperty("isTeam")
    private boolean isTeam;
    
    @URL(message = "올바른 외부 URL 형식이어야 합니다")
    private String externalUrl;
    
    private List<String> myContributions;

    @Size(max = 255, message = "역할은 255자를 초과할 수 없습니다")
    private String role; // 팀 프로젝트에서의 역할

    private List<@URL(message = "올바른 스크린샷 URL 형식이어야 합니다") String> screenshots; // 추가 스크린샷 URL 배열

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

