package com.aiportfolio.backend.domain.portfolio.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.aiportfolio.backend.domain.portfolio.model.enums.ExperienceType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Experience {
    
    @NotBlank(message = "경력 ID는 필수입니다")
    private String id;
    
    @NotBlank(message = "직책은 필수입니다")
    @Size(max = 200, message = "직책은 200자를 초과할 수 없습니다")
    private String title;
    
    @NotBlank(message = "경력 설명은 필수입니다")
    @Size(max = 2000, message = "경력 설명은 2000자를 초과할 수 없습니다")
    private String description;
    
    @NotNull(message = "기술 스택은 필수입니다")
    @Size(min = 1, message = "최소 1개 이상의 기술 스택이 필요합니다")
    private List<String> technologies;
    
    @NotBlank(message = "조직명은 필수입니다")
    @Size(max = 200, message = "조직명은 200자를 초과할 수 없습니다")
    private String organization;
    
    @NotBlank(message = "역할은 필수입니다")
    @Size(max = 200, message = "역할은 200자를 초과할 수 없습니다")
    private String role;
    
    @NotNull(message = "시작일은 필수입니다")
    private LocalDate startDate;
    
    private LocalDate endDate; // 종료일은 선택사항 (현재 재직중)
    
    @NotNull(message = "경력 타입은 필수입니다")
    private ExperienceType type;
    
    @Size(max = 10, message = "주요 책임은 최대 10개까지 가능합니다")
    private List<String> mainResponsibilities;
    
    @Size(max = 10, message = "주요 성과는 최대 10개까지 가능합니다")
    private List<String> achievements;
    
    @Size(max = 20, message = "관련 프로젝트는 최대 20개까지 가능합니다")
    private List<String> projects;
    
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
        return technologies != null && 
               technologies.stream()
                   .anyMatch(tech -> tech.toLowerCase().contains(technology.toLowerCase()));
    }
    
    /**
     * 경력이 특정 조직에서의 경험인지 확인
     */
    public boolean isFromOrganization(String orgName) {
        return organization != null && 
               organization.toLowerCase().contains(orgName.toLowerCase());
    }
}

