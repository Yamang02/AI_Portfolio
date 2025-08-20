package com.aiportfolio.backend.domain.portfolio.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 포트폴리오 메인 엔티티
 * 개발자의 전체 포트폴리오 정보를 관리하는 도메인 루트 엔티티
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {
    
    @NotBlank(message = "포트폴리오 ID는 필수입니다")
    private String id;
    
    @NotBlank(message = "개발자 이름은 필수입니다")
    @Size(max = 100, message = "개발자 이름은 100자를 초과할 수 없습니다")
    private String developerName;
    
    @Size(max = 500, message = "개발자 소개는 500자를 초과할 수 없습니다")
    private String introduction;
    
    @Size(max = 1000, message = "개발자 요약은 1000자를 초과할 수 없습니다")
    private String summary;
    
    @NotNull(message = "프로젝트 목록은 필수입니다")
    private List<Project> projects;
    
    @NotNull(message = "경력 목록은 필수입니다")
    private List<Experience> experiences;
    
    @NotNull(message = "교육 목록은 필수입니다")
    private List<Education> educations;
    
    @NotNull(message = "자격증 목록은 필수입니다")
    private List<Certification> certifications;
    
    @Size(max = 50, message = "주요 기술스택은 최대 50개까지 가능합니다")
    private List<String> mainSkills;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * 전체 프로젝트 수를 반환합니다
     */
    public int getTotalProjectsCount() {
        return projects != null ? projects.size() : 0;
    }
    
    /**
     * 전체 경력 기간을 월 단위로 계산합니다
     */
    public long getTotalExperienceMonths() {
        if (experiences == null || experiences.isEmpty()) {
            return 0;
        }
        
        return experiences.stream()
                .mapToLong(Experience::getDurationInMonths)
                .sum();
    }
    
    /**
     * 특정 기술을 사용한 프로젝트 수를 반환합니다
     */
    public long getProjectCountByTechnology(String technology) {
        if (projects == null || technology == null) {
            return 0;
        }
        
        return projects.stream()
                .filter(project -> project.usesTechnology(technology))
                .count();
    }
    
    /**
     * 팀 프로젝트와 개인 프로젝트 비율을 계산합니다
     */
    public double getTeamProjectRatio() {
        if (projects == null || projects.isEmpty()) {
            return 0.0;
        }
        
        long teamProjectsCount = projects.stream()
                .filter(Project::isTeam)
                .count();
                
        return (double) teamProjectsCount / projects.size();
    }
    
    /**
     * 최신 프로젝트를 반환합니다
     */
    public Project getLatestProject() {
        if (projects == null || projects.isEmpty()) {
            return null;
        }
        
        return projects.stream()
                .max((p1, p2) -> {
                    // 진행중인 프로젝트가 우선
                    if (p1.isOngoing() && !p2.isOngoing()) return 1;
                    if (!p1.isOngoing() && p2.isOngoing()) return -1;
                    
                    // 시작일 비교
                    return p1.getStartDate().compareTo(p2.getStartDate());
                })
                .orElse(null);
    }
    
    /**
     * 현재 진행중인 프로젝트들을 반환합니다
     */
    public List<Project> getOngoingProjects() {
        if (projects == null) {
            return List.of();
        }
        
        return projects.stream()
                .filter(Project::isOngoing)
                .toList();
    }
    
    /**
     * 포트폴리오 데이터가 유효한지 검증합니다
     */
    public boolean isValid() {
        return id != null && !id.trim().isEmpty() &&
               developerName != null && !developerName.trim().isEmpty() &&
               projects != null && experiences != null &&
               educations != null && certifications != null;
    }
}