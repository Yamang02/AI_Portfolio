package com.aiportfolio.backend.infrastructure.persistence.redis.model.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechStackMetadataSnapshot {
    private Long id;
    private String name;
    private String displayName;
    private String category;
    private String level;
    private Boolean isCore;
    private Boolean isActive;
    private String iconUrl;
    private String colorHex;
    private String description;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TechStackMetadataSnapshot fromDomain(TechStackMetadata domain) {
        if (domain == null) {
            return null;
        }
        return TechStackMetadataSnapshot.builder()
            .id(domain.getId())
            .name(domain.getName())
            .displayName(domain.getDisplayName())
            .category(domain.getCategory())
            .level(domain.getLevel())
            .isCore(domain.getIsCore())
            .isActive(domain.getIsActive())
            .iconUrl(domain.getIconUrl())
            .colorHex(domain.getColorHex())
            .description(domain.getDescription())
            .sortOrder(domain.getSortOrder())
            .createdAt(domain.getCreatedAt())
            .updatedAt(domain.getUpdatedAt())
            .build();
    }

    public TechStackMetadata toDomain() {
        return TechStackMetadata.builder()
            .id(id)
            .name(name)
            .displayName(displayName)
            .category(category)
            .level(level)
            .isCore(isCore)
            .isActive(isActive)
            .iconUrl(iconUrl)
            .colorHex(colorHex)
            .description(description)
            .sortOrder(sortOrder)
            .createdAt(createdAt)
            .updatedAt(updatedAt)
            .build();
    }
}
