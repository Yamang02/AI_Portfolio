package com.aiportfolio.backend.domain.portfolio.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    
    private String id;
    private String title;
    private String description;
    
    // 기존 technologies 필드 제거됨 - techStackMetadata 관계 필드로 대체
    private List<TechStackMetadata> techStackMetadata;
    
    private String githubUrl;
    private String liveUrl;
    private String imageUrl;
    private String readme;
    private String type; // 'project' 또는 'certification'
    private String source;
    private String status; // 프로젝트 상태 (completed, in_progress, maintenance 등)
    private Integer sortOrder; // 정렬 순서
    private LocalDate startDate;
    private LocalDate endDate; // 종료일은 선택사항 (진행중인 프로젝트)
    private boolean isTeam;
    private Integer teamSize;
    private String externalUrl;
    private List<String> myContributions;
    private String role; // 팀 프로젝트에서의 역할
    private List<String> screenshots; // 추가 스크린샷 URL 배열

    private LocalDateTime createdAt; // 생성일시
    
    private LocalDateTime updatedAt; // 수정일시

    /**
     * 프로젝트가 진행중인지 확인
     */
    public boolean isOngoing() {
        return endDate == null;
    }
    
    /**
     * 프로젝트 기간을 월 단위로 계산
     */
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
     * Redis 캐시 직렬화/역직렬화에서 제외 (computed property)
     */
    @JsonIgnore
    public List<String> getTechnologies() {
        return techStackMetadata != null ? 
               techStackMetadata.stream()
                   .map(TechStackMetadata::getName)
                   .collect(java.util.stream.Collectors.toList()) : 
               new java.util.ArrayList<>();
    }
    
    /**
     * 핵심 기술 스택만 반환
     * Redis 캐시 직렬화/역직렬화에서 제외 (computed property)
     */
    @JsonIgnore
    public List<TechStackMetadata> getCoreTechnologies() {
        return techStackMetadata != null ? 
               techStackMetadata.stream()
                   .filter(TechStackMetadata::isCoreTechnology)
                   .collect(java.util.stream.Collectors.toList()) : 
               new java.util.ArrayList<>();
    }

    /**
     * 팀 정보 업데이트 (비즈니스 규칙 포함)
     * 
     * @param isTeam 팀 프로젝트 여부
     * @param teamSize 팀 크기
     */
    public void updateTeamInfo(Boolean isTeam, Integer teamSize) {
        if (isTeam != null) {
            this.isTeam = isTeam;
            if (!isTeam) {
                this.teamSize = null; // 개인 프로젝트면 팀 크기 무효화
                return;
            }
        }

        if (teamSize != null && this.isTeam) {
            this.teamSize = validateTeamSize(teamSize);
        }
    }

    /**
     * 팀 크기 검증
     * 
     * @param size 팀 크기
     * @return 검증된 팀 크기 (유효하지 않으면 null)
     */
    private Integer validateTeamSize(Integer size) {
        if (size == null || size <= 0) {
            return null; // 유효하지 않은 크기는 null 처리
        }
        return size;
    }
}
