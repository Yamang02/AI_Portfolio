package com.aiportfolio.backend.domain.portfolio.model;

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
public class Education {
    private String id;
    private String title;
    private String description;
    // 기존 technologies 필드 제거됨 - techStackMetadata 관계 필드로 대체
    private List<TechStackMetadata> techStackMetadata;
    private String organization;
    private LocalDate startDate;
    private LocalDate endDate;
    private EducationType type;
    private List<String> projects;
    
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
}

