package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 기술 스택 메타데이터 매퍼
 * JPA 엔티티와 도메인 모델 간의 변환을 담당
 */
@Component
public class TechStackMetadataMapper {
    
    /**
     * JPA 엔티티를 도메인 모델로 변환
     */
    public TechStackMetadata toDomain(TechStackMetadataJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return TechStackMetadata.builder()
                .name(entity.getName())
                .displayName(entity.getDisplayName())
                .category(entity.getCategory())
                .level(entity.getLevel())
                .isCore(entity.getIsCore())
                .isActive(entity.getIsActive())
                .iconUrl(entity.getIconUrl())
                .colorHex(entity.getColorHex())
                .description(entity.getDescription())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    /**
     * 도메인 모델을 JPA 엔티티로 변환
     */
    public TechStackMetadataJpaEntity toEntity(TechStackMetadata domain) {
        if (domain == null) {
            return null;
        }
        
        return TechStackMetadataJpaEntity.builder()
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
    
    /**
     * JPA 엔티티 리스트를 도메인 모델 리스트로 변환
     */
    public List<TechStackMetadata> toDomainList(List<TechStackMetadataJpaEntity> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
    
    /**
     * 도메인 모델 리스트를 JPA 엔티티 리스트로 변환
     */
    public List<TechStackMetadataJpaEntity> toEntityList(List<TechStackMetadata> domains) {
        if (domains == null) {
            return null;
        }
        
        return domains.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}

