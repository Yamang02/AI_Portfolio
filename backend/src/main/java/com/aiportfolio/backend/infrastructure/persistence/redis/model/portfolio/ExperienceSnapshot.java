package com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Experience;
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
public class ExperienceSnapshot {
    private String id;
    private Long dbId;
    private String title;
    private String description;
    private List<TechStackMetadataSnapshot> techStackMetadata;
    private String organization;
    private String role;
    private LocalDate startDate;
    private LocalDate endDate;
    private String jobField;
    private String employmentType;
    private List<String> mainResponsibilities;
    private List<String> achievements;
    private List<String> projects;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ExperienceSnapshot fromDomain(Experience domain) {
        if (domain == null) {
            return null;
        }
        return ExperienceSnapshot.builder()
            .id(domain.getId())
            .dbId(domain.getDbId())
            .title(domain.getTitle())
            .description(domain.getDescription())
            .techStackMetadata(toTechStackSnapshots(domain.getTechStackMetadata()))
            .organization(domain.getOrganization())
            .role(domain.getRole())
            .startDate(domain.getStartDate())
            .endDate(domain.getEndDate())
            .jobField(domain.getJobField())
            .employmentType(domain.getEmploymentType())
            .mainResponsibilities(copyList(domain.getMainResponsibilities()))
            .achievements(copyList(domain.getAchievements()))
            .projects(copyList(domain.getProjects()))
            .sortOrder(domain.getSortOrder())
            .createdAt(domain.getCreatedAt())
            .updatedAt(domain.getUpdatedAt())
            .build();
    }

    public Experience toDomain() {
        return Experience.builder()
            .id(id)
            .dbId(dbId)
            .title(title)
            .description(description)
            .techStackMetadata(toTechStackDomains(techStackMetadata))
            .organization(organization)
            .role(role)
            .startDate(startDate)
            .endDate(endDate)
            .jobField(jobField)
            .employmentType(employmentType)
            .mainResponsibilities(copyList(mainResponsibilities))
            .achievements(copyList(achievements))
            .projects(copyList(projects))
            .sortOrder(sortOrder)
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
