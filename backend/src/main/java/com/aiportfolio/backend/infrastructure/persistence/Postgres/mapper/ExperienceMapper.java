package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.enums.ExperienceType;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ExperienceJpaEntity;

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
                .type(parseExperienceType(jpaEntity.getType()))
                .technologies(jpaEntity.getTechnologies())
                .mainResponsibilities(jpaEntity.getMainResponsibilities())
                .achievements(jpaEntity.getAchievements())
                .projects(jpaEntity.getProjects())
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
                .type(domainModel.getType() != null ? domainModel.getType().name() : null)
                .technologies(domainModel.getTechnologies())
                .mainResponsibilities(domainModel.getMainResponsibilities())
                .achievements(domainModel.getAchievements())
                .projects(domainModel.getProjects())
                .sortOrder(0) // 기본값
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
    
    /**
     * 문자열을 ExperienceType enum으로 변환
     * @param typeString 타입 문자열
     * @return ExperienceType enum
     */
    private ExperienceType parseExperienceType(String typeString) {
        if (typeString == null || typeString.trim().isEmpty()) {
            return null;
        }
        
        try {
            return ExperienceType.valueOf(typeString.toUpperCase());
        } catch (IllegalArgumentException e) {
            // 알 수 없는 타입인 경우 기본값 반환 또는 null
            return null;
        }
    }
}