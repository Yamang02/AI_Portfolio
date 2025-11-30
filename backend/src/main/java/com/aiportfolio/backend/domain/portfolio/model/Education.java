package com.aiportfolio.backend.domain.portfolio.model;

import com.aiportfolio.backend.application.common.util.Sortable;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import com.aiportfolio.backend.domain.portfolio.model.enums.EducationType;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Education implements Sortable {
    private String id;
    private String title;
    private String description;
    // 기존 technologies 필드 제거됨 - techStackMetadata 관계 필드로 대체
    private List<TechStackMetadata> techStackMetadata;
    private String organization;
    private String degree;  // 학위 정보
    private String major;   // 전공
    private LocalDate startDate;
    private LocalDate endDate;
    private java.math.BigDecimal gpa;  // 학점 (4.0 만점)
    private EducationType type;
    private List<String> projects;
    private Integer sortOrder;  // 정렬 순서
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;

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
     * 교육 기간이 현재 진행중인지 확인
     */
    public boolean isOngoing() {
        return endDate == null;
    }

    /**
     * 교육 기간 계산 (월 단위)
     */
    public int getDurationInMonths() {
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        return (int) java.time.temporal.ChronoUnit.MONTHS.between(startDate, end);
    }
}

