package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechStackJpaEntity;

// 외부 라이브러리 imports
import org.springframework.stereotype.Component;

// Java 표준 라이브러리 imports
import java.util.List;
import java.util.stream.Collectors;

/**
 * Project 도메인 모델과 JPA 엔티티 간 변환 매퍼
 * 헥사고날 아키텍처에서 도메인과 인프라 레이어 분리를 위한 매퍼
 */
@Component
public class ProjectMapper {
    
    private final TechStackMetadataMapper techStackMetadataMapper;
    
    public ProjectMapper(TechStackMetadataMapper techStackMetadataMapper) {
        this.techStackMetadataMapper = techStackMetadataMapper;
    }
    
    /**
     * JPA 엔티티를 도메인 모델로 변환
     * @param jpaEntity JPA 엔티티
     * @return 도메인 모델
     */
    public Project toDomain(ProjectJpaEntity jpaEntity) {
        if (jpaEntity == null) {
            return null;
        }
        
        return Project.builder()
                .id(jpaEntity.getBusinessId()) // business_id → domain.id
                .title(jpaEntity.getTitle())
                .description(jpaEntity.getDescription())
                .detailedDescription(jpaEntity.getDetailedDescription())
                .techStackMetadata(techStackMetadataMapper.toDomainList(
                    jpaEntity.getProjectTechStacks() != null ? 
                    jpaEntity.getProjectTechStacks().stream()
                        .map(ProjectTechStackJpaEntity::getTechStack)
                        .collect(java.util.stream.Collectors.toList()) : 
                    new java.util.ArrayList<>()
                ))
                .githubUrl(jpaEntity.getGithubUrl())
                .liveUrl(jpaEntity.getLiveUrl())
                .imageUrl(jpaEntity.getImageUrl())
                .readme(jpaEntity.getReadme())
                .type(jpaEntity.getType())
                .source(jpaEntity.getSource())
                .status(jpaEntity.getStatus())
                .sortOrder(jpaEntity.getSortOrder())
                .startDate(jpaEntity.getStartDate())
                .endDate(jpaEntity.getEndDate())
                .isTeam(jpaEntity.getIsTeam() != null ? jpaEntity.getIsTeam() : false)
                .externalUrl(jpaEntity.getExternalUrl())
                .myContributions(jpaEntity.getMyContributions())
                .role(jpaEntity.getRole())
                .screenshots(jpaEntity.getScreenshots())
                .createdAt(jpaEntity.getCreatedAt())
                .updatedAt(jpaEntity.getUpdatedAt())
                .build();
    }
    
    /**
     * 도메인 모델을 JPA 엔티티로 변환
     * @param domainModel 도메인 모델
     * @return JPA 엔티티
     */
    public ProjectJpaEntity toJpaEntity(Project domainModel) {
        if (domainModel == null) {
            return null;
        }
        
        return ProjectJpaEntity.builder()
                .businessId(domainModel.getId()) // domain.id → business_id
                .title(domainModel.getTitle())
                .description(domainModel.getDescription())
                .detailedDescription(domainModel.getDetailedDescription())
                .projectTechStacks(new java.util.ArrayList<>()) // 관계 테이블은 별도로 관리
                .githubUrl(domainModel.getGithubUrl())
                .liveUrl(domainModel.getLiveUrl())
                .imageUrl(domainModel.getImageUrl())
                .readme(domainModel.getReadme())
                .type(domainModel.getType())
                .source(domainModel.getSource())
                .status(domainModel.getStatus() != null ? domainModel.getStatus() : "completed")
                .sortOrder(domainModel.getSortOrder() != null ? domainModel.getSortOrder() : 0)
                .startDate(domainModel.getStartDate())
                .endDate(domainModel.getEndDate())
                .isTeam(domainModel.isTeam())
                .externalUrl(domainModel.getExternalUrl())
                .myContributions(domainModel.getMyContributions())
                .role(domainModel.getRole())
                .screenshots(domainModel.getScreenshots())
                .createdAt(domainModel.getCreatedAt())
                .updatedAt(domainModel.getUpdatedAt())
                .build();
    }
    
    /**
     * JPA 엔티티 리스트를 도메인 모델 리스트로 변환
     * @param jpaEntities JPA 엔티티 리스트
     * @return 도메인 모델 리스트
     */
    public List<Project> toDomainList(List<ProjectJpaEntity> jpaEntities) {
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
    public List<ProjectJpaEntity> toJpaEntityList(List<Project> domainModels) {
        if (domainModels == null) {
            return null;
        }
        
        return domainModels.stream()
                .map(this::toJpaEntity)
                .collect(Collectors.toList());
    }
    
}