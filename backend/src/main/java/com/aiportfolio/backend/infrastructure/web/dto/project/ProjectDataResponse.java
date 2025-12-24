package com.aiportfolio.backend.infrastructure.web.dto.project;

import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class ProjectDataResponse {
    String id;
    String title;
    String description;
    String readme;
    String type;
    String source;
    String status;
    Integer sortOrder;
    LocalDate startDate;
    LocalDate endDate;

    @JsonProperty("isTeam")
    boolean isTeam;

    Integer teamSize;
    String role;
    List<String> myContributions;
    String githubUrl;
    String liveUrl;
    String externalUrl;
    String imageUrl;
    List<String> screenshots;
    List<String> technologies;
    List<TechStackMetadata> techStackMetadata;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    public static ProjectDataResponse from(Project project) {
        return ProjectDataResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .readme(project.getReadme())
                .type(project.getType())
                .source(project.getSource())
                .status(project.getStatus())
                .sortOrder(project.getSortOrder())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .isTeam(project.isTeam())
                .teamSize(project.getTeamSize())
                .role(project.getRole())
                .myContributions(project.getMyContributions())
                .githubUrl(project.getGithubUrl())
                .liveUrl(project.getLiveUrl())
                .externalUrl(project.getExternalUrl())
                .imageUrl(project.getImageUrl())
                .screenshots(project.getScreenshots())
                .technologies(project.getTechnologies())
                .techStackMetadata(project.getTechStackMetadata())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}
