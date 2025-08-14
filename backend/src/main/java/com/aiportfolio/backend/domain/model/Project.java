package com.aiportfolio.backend.domain.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.aiportfolio.backend.domain.model.enums.ProjectType;

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
    
    @NotNull(message = "기술 스택은 필수입니다")
    @Size(min = 1, message = "최소 1개 이상의 기술 스택이 필요합니다")
    private List<String> technologies;
    
    @URL(message = "올바른 GitHub URL 형식이어야 합니다")
    private String githubUrl;
    
    @URL(message = "올바른 라이브 URL 형식이어야 합니다")
    private String liveUrl;
    
    @URL(message = "올바른 이미지 URL 형식이어야 합니다")
    private String imageUrl;
    
    @Size(max = 10000, message = "README는 10000자를 초과할 수 없습니다")
    private String readme;
    
    @NotNull(message = "프로젝트 타입은 필수입니다")
    private ProjectType type;
    
    @Size(max = 100, message = "소스 정보는 100자를 초과할 수 없습니다")
    private String source;
    
    @NotNull(message = "시작일은 필수입니다")
    private LocalDate startDate;
    
    private LocalDate endDate; // 종료일은 선택사항 (진행중인 프로젝트)
    
    @JsonProperty("isTeam")
    private boolean isTeam;
    
    @URL(message = "올바른 외부 URL 형식이어야 합니다")
    private String externalUrl;
    
    private List<String> myContributions;
    
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
        return technologies != null && 
               technologies.stream()
                   .anyMatch(tech -> tech.toLowerCase().contains(technology.toLowerCase()));
    }
}

