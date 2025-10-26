package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.model.enums.ExperienceType;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ExperienceJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ExperienceTechStackJpaEntity;

// 외부 라이브러리 imports
import org.springframework.stereotype.Component;

// Java 표준 라이브러리 imports
import java.util.List;
import java.util.stream.Collectors;

/**
 * Experience 도메인 모델과 JPA 엔티티 간 변환 매퍼
 * 헥사고날 아키텍처에서 도메인과 인프라 레이어 분리를 위한 매퍼
 */
@Component
public class ExperienceMapper {
    
    private final TechStackMetadataMapper techStackMetadataMapper;
    
    public ExperienceMapper(TechStackMetadataMapper techStackMetadataMapper) {
        this.techStackMetadataMapper = techStackMetadataMapper;
    }
    
    /**
     * JPA 엔티티를 도메인 모델로 변환
     * @param jpaEntity JPA 엔티티
     * @return 도메인 모델
     */
    public Experience toDomain(ExperienceJpaEntity jpaEntity) {
        if (jpaEntity == null) {
            return null;
        }
        
        return Experience.builder()
                .id(jpaEntity.getBusinessId()) // business_id → domain.id
                .title(jpaEntity.getTitle())
                .description(jpaEntity.getDescription())
                .organization(jpaEntity.getOrganization())
                .role(jpaEntity.getRole())
                .startDate(jpaEntity.getStartDate())
                .endDate(jpaEntity.getEndDate())
                .jobField(jpaEntity.getJobField())
                .employmentType(jpaEntity.getEmploymentType())
                .techStackMetadata(techStackMetadataMapper.toDomainList(
                    jpaEntity.getExperienceTechStacks() != null ? 
                    jpaEntity.getExperienceTechStacks().stream()
                        .map(ExperienceTechStackJpaEntity::getTechStack)
                        .collect(java.util.stream.Collectors.toList()) : 
                    new java.util.ArrayList<>()
                ))
                .mainResponsibilities(jpaEntity.getMainResponsibilities())
                .achievements(jpaEntity.getAchievements())
                .projects(new java.util.ArrayList<>()) // 릴레이션 테이블로 분리됨
                .sortOrder(jpaEntity.getSortOrder())
                .createdAt(jpaEntity.getCreatedAt())
                .updatedAt(jpaEntity.getUpdatedAt())
                .build();
    }
    
    /**
     * 도메인 모델을 JPA 엔티티로 변환
     * @param domainModel 도메인 모델
     * @return JPA 엔티티
     */
    public ExperienceJpaEntity toJpaEntity(Experience domainModel) {
        if (domainModel == null) {
            return null;
        }
        
        return ExperienceJpaEntity.builder()
                .businessId(domainModel.getId()) // domain.id → business_id
                .title(domainModel.getTitle())
                .description(domainModel.getDescription())
                .organization(domainModel.getOrganization())
                .role(domainModel.getRole())
                .startDate(domainModel.getStartDate())
                .endDate(domainModel.getEndDate())
                .jobField(domainModel.getJobField())
                .employmentType(domainModel.getEmploymentType())
                .experienceTechStacks(new java.util.ArrayList<>()) // 관계 테이블은 별도로 관리
                .mainResponsibilities(domainModel.getMainResponsibilities())
                .achievements(domainModel.getAchievements())
                .sortOrder(domainModel.getSortOrder() != null ? domainModel.getSortOrder() : 0)
                .createdAt(domainModel.getCreatedAt())
                .updatedAt(domainModel.getUpdatedAt())
                .build();
    }
    
    /**
     * JPA 엔티티 리스트를 도메인 모델 리스트로 변환
     * @param jpaEntities JPA 엔티티 리스트
     * @return 도메인 모델 리스트
     */
    public List<Experience> toDomainList(List<ExperienceJpaEntity> jpaEntities) {
        if (jpaEntities == null) {
            return null;
        }
        
        return jpaEntities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
    
    /**
     * 도메인 모델 리스트를 JPA 엔티티 리스트로 변환
     * @param domainModels 도메인 모델 리스트
     * @return JPA 엔티티 리스트
     */
    public List<ExperienceJpaEntity> toJpaEntityList(List<Experience> domainModels) {
        if (domainModels == null) {
            return null;
        }
        
        return domainModels.stream()
                .map(this::toJpaEntity)
                .collect(Collectors.toList());
    }
    
    // ExperienceType enum 변환 메서드 제거됨 - employment_type으로 대체됨
}