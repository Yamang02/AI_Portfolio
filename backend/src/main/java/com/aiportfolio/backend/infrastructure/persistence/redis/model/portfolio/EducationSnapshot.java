package com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.model.enums.EducationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationSnapshot {
    private String id;
    private Long dbId;
    private String title;
    private String description;
    private List<TechStackMetadataSnapshot> techStackMetadata;
    private String organization;
    private String degree;
    private String major;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal gpa;
    private String type;
    private List<String> projects;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EducationSnapshot fromDomain(Education domain) {
        if (domain == null) {
            return null;
        }
        return EducationSnapshot.builder()
            .id(domain.getId())
            .dbId(domain.getDbId())
            .title(domain.getTitle())
            .description(domain.getDescription())
            .techStackMetadata(toTechStackSnapshots(domain.getTechStackMetadata()))
            .organization(domain.getOrganization())
            .degree(domain.getDegree())
            .major(domain.getMajor())
            .startDate(domain.getStartDate())
            .endDate(domain.getEndDate())
            .gpa(domain.getGpa())
            .type(domain.getType() != null ? domain.getType().name() : null)
            .projects(copyList(domain.getProjects()))
            .sortOrder(domain.getSortOrder())
            .createdAt(domain.getCreatedAt())
            .updatedAt(domain.getUpdatedAt())
            .build();
    }

    public Education toDomain() {
        return Education.builder()
            .id(id)
            .dbId(dbId)
            .title(title)
            .description(description)
            .techStackMetadata(toTechStackDomains(techStackMetadata))
            .organization(organization)
            .degree(degree)
            .major(major)
            .startDate(startDate)
            .endDate(endDate)
            .gpa(gpa)
            .type(toEducationType(type))
            .projects(copyList(projects))
            .sortOrder(sortOrder)
            .createdAt(createdAt)
            .updatedAt(updatedAt)
            .build();
    }

    private static EducationType toEducationType(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return EducationType.valueOf(value);
        } catch (IllegalArgumentException ignored) {
            return null;
        }
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
