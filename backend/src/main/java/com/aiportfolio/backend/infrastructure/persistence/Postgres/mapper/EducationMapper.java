package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.enums.EducationType;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationJpaEntity;

// 외부 라이브러리 imports
import org.springframework.stereotype.Component;

// Java 표준 라이브러리 imports
import java.util.List;
import java.util.stream.Collectors;

/**
 * Education 도메인 모델과 JPA 엔티티 간 변환 매퍼
 */
@Component
public class EducationMapper {
    
    /**
     * JPA 엔티티를 도메인 모델로 변환
     */
    public Education toDomain(EducationJpaEntity jpaEntity) {
        if (jpaEntity == null) {
            return null;
        }
        
        return Education.builder()
                .id(jpaEntity.getBusinessId()) // business_id → domain.id
                .title(jpaEntity.getTitle())
                .description(jpaEntity.getDescription())
                .organization(jpaEntity.getOrganization())
                .startDate(jpaEntity.getStartDate())
                .endDate(jpaEntity.getEndDate())
                .type(parseEducationType(jpaEntity.getType()))
                .technologies(jpaEntity.getTechnologies())
                .projects(jpaEntity.getProjects())
                .build();
    }
    
    /**
     * 도메인 모델을 JPA 엔티티로 변환
     */
    public EducationJpaEntity toJpaEntity(Education domainModel) {
        if (domainModel == null) {
            return null;
        }
        
        return EducationJpaEntity.builder()
                .businessId(domainModel.getId()) // domain.id → business_id
                .title(domainModel.getTitle())
                .description(domainModel.getDescription())
                .organization(domainModel.getOrganization())
                .startDate(domainModel.getStartDate())
                .endDate(domainModel.getEndDate())
                .type(domainModel.getType() != null ? domainModel.getType().name() : null)
                .technologies(domainModel.getTechnologies())
                .projects(domainModel.getProjects())
                .sortOrder(0) // 기본값
                .build();
    }
    
    /**
     * JPA 엔티티 리스트를 도메인 모델 리스트로 변환
     */
    public List<Education> toDomainList(List<EducationJpaEntity> jpaEntities) {
        if (jpaEntities == null) {
            return null;
        }
        
        return jpaEntities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
    
    /**
     * 도메인 모델 리스트를 JPA 엔티티 리스트로 변환
     */
    public List<EducationJpaEntity> toJpaEntityList(List<Education> domainModels) {
        if (domainModels == null) {
            return null;
        }
        
        return domainModels.stream()
                .map(this::toJpaEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 문자열을 EducationType enum으로 변환
     */
    private EducationType parseEducationType(String typeString) {
        if (typeString == null || typeString.trim().isEmpty()) {
            return null;
        }
        
        try {
            return EducationType.valueOf(typeString.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}