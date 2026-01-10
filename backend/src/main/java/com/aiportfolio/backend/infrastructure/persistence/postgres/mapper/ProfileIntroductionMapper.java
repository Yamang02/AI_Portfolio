package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

import com.aiportfolio.backend.domain.portfolio.model.ProfileIntroduction;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProfileIntroductionJpaEntity;
import org.springframework.stereotype.Component;

/**
 * ProfileIntroduction 도메인 모델 <-> JPA 엔티티 매퍼
 */
@Component
public class ProfileIntroductionMapper {

    /**
     * JPA 엔티티 -> 도메인 모델
     */
    public ProfileIntroduction toDomain(ProfileIntroductionJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        return ProfileIntroduction.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .version(entity.getVersion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * 도메인 모델 -> JPA 엔티티
     */
    public ProfileIntroductionJpaEntity toEntity(ProfileIntroduction domain) {
        if (domain == null) {
            return null;
        }
        return ProfileIntroductionJpaEntity.builder()
                .id(domain.getId())
                .content(domain.getContent())
                .version(domain.getVersion())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
