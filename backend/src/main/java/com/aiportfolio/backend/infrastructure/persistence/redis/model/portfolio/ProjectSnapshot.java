package com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSnapshot {
    private String id;
    private Long dbId;
    private String title;
    private String description;
    private List<TechStackMetadataSnapshot> techStackMetadata;
    private String githubUrl;
    private String liveUrl;
    private String imageUrl;
    private String readme;
    private String type;
    private String source;
    private String status;
    private Integer sortOrder;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean team;
    private Boolean featured;
    private Integer teamSize;
    private String externalUrl;
    private List<String> myContributions;
    private String role;
    private List<String> screenshots;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectSnapshot fromDomain(Project domain) {
        if (domain == null) {
            return null;
        }
        return ProjectSnapshot.builder()
            .id(domain.getId())
            .dbId(domain.getDbId())
            .title(domain.getTitle())
            .description(domain.getDescription())
            .techStackMetadata(toTechStackSnapshots(domain.getTechStackMetadata()))
            .githubUrl(domain.getGithubUrl())
            .liveUrl(domain.getLiveUrl())
            .imageUrl(domain.getImageUrl())
            .readme(domain.getReadme())
            .type(domain.getType())
            .source(domain.getSource())
            .status(domain.getStatus())
            .sortOrder(domain.getSortOrder())
            .startDate(domain.getStartDate())
            .endDate(domain.getEndDate())
            .team(domain.isTeam())
            .featured(domain.isFeatured())
            .teamSize(domain.getTeamSize())
            .externalUrl(domain.getExternalUrl())
            .myContributions(copyList(domain.getMyContributions()))
            .role(domain.getRole())
            .screenshots(copyList(domain.getScreenshots()))
            .createdAt(domain.getCreatedAt())
            .updatedAt(domain.getUpdatedAt())
            .build();
    }

    public Project toDomain() {
        return Project.builder()
            .id(id)
            .dbId(dbId)
            .title(title)
            .description(description)
            .techStackMetadata(toTechStackDomains(techStackMetadata))
            .githubUrl(githubUrl)
            .liveUrl(liveUrl)
            .imageUrl(imageUrl)
            .readme(readme)
            .type(type)
            .source(source)
            .status(status)
            .sortOrder(sortOrder)
            .startDate(startDate)
            .endDate(endDate)
            .isTeam(Boolean.TRUE.equals(team))
            .isFeatured(Boolean.TRUE.equals(featured))
            .teamSize(teamSize)
            .externalUrl(externalUrl)
            .myContributions(copyList(myContributions))
            .role(role)
            .screenshots(copyList(screenshots))
            .createdAt(createdAt)
            .updatedAt(updatedAt)
            .build();
    }

    private static List<TechStackMetadataSnapshot> toTechStackSnapshots(List<TechStackMetadata> source) {
        if (source == null) {
            return new ArrayList<>();
        }
        return source.stream().map(TechStackMetadataSnapshot::fromDomain).toList();
    }

    private static List<TechStackMetadata> toTechStackDomains(List<TechStackMetadataSnapshot> source) {
        if (source == null) {
            return new ArrayList<>();
        }
        return source.stream().map(TechStackMetadataSnapshot::toDomain).toList();
    }

    private static <T> List<T> copyList(List<T> source) {
        return source == null ? new ArrayList<>() : new ArrayList<>(source);
    }
}
