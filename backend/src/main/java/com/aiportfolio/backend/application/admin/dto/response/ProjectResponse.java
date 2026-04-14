package com.aiportfolio.backend.application.admin.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private String id;
    private String title;
    private String description;
    @Deprecated(since = "E18", forRemoval = false)
    private String readme;
    private String type;
    private String status;

    @JsonProperty("isTeam")
    private Boolean isTeam;

    @JsonProperty("isFeatured")
    private Boolean isFeatured;

    private Integer teamSize;
    private String role;
    private List<String> myContributions;
    private LocalDate startDate;
    private LocalDate endDate;
    private String imageUrl;
    private List<ProjectScreenshotResponse> screenshots;
    private List<ProjectTechnicalCardResponse> technicalCards;
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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectTechnicalCardResponse {
        private Long id;
        private String businessId;
        private String title;
        private String category;
        private String problemStatement;
        private String analysis;
        private String solution;
        private Long articleId;
        @JsonProperty("isPinned")
        private Boolean isPinned;
        private Integer sortOrder;
    }
}
