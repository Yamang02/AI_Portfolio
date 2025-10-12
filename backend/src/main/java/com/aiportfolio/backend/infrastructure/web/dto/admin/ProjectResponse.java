package com.aiportfolio.backend.infrastructure.web.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 프로젝트 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private Long id;
    private String title;
    private String description;
    private String detailedDescription;
    private String readme;
    private String type;
    private String status;
    private Boolean isTeam;
    private Integer teamSize;
    private String role;
    private List<String> myContributions;
    private LocalDate startDate;
    private LocalDate endDate;
    private String imageUrl;
    private List<ProjectScreenshotResponse> screenshots;
    private String githubUrl;
    private String liveUrl;
    private String externalUrl;
    private List<TechnologyResponse> technologies;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectScreenshotResponse {
        private Long id;
        private String imageUrl;
        private String cloudinaryPublicId;
        private Integer displayOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TechnologyResponse {
        private Long id;
        private String name;
        private String category;
        private Integer proficiencyLevel;
    }
}

