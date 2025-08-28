package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.enums.ProjectType;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;

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
                .technologies(jpaEntity.getTechnologies())
                .githubUrl(jpaEntity.getGithubUrl())
                .liveUrl(jpaEntity.getLiveUrl())
                .imageUrl(jpaEntity.getImageUrl())
                .readme(jpaEntity.getReadme())
                .type(parseProjectType(jpaEntity.getType()))
                .source(jpaEntity.getSource())
                .startDate(jpaEntity.getStartDate())
                .endDate(jpaEntity.getEndDate())
                .isTeam(jpaEntity.getIsTeam() != null ? jpaEntity.getIsTeam() : false)
                .externalUrl(jpaEntity.getExternalUrl())
                .myContributions(jpaEntity.getMyContributions())
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
                .technologies(domainModel.getTechnologies())
                .githubUrl(domainModel.getGithubUrl())
                .liveUrl(domainModel.getLiveUrl())
                .imageUrl(domainModel.getImageUrl())
                .readme(domainModel.getReadme())
                .type(domainModel.getType() != null ? domainModel.getType().name() : null)
                .source(domainModel.getSource())
                .startDate(domainModel.getStartDate())
                .endDate(domainModel.getEndDate())
                .isTeam(domainModel.isTeam())
                .externalUrl(domainModel.getExternalUrl())
                .myContributions(domainModel.getMyContributions())
                .status("completed") // 기본값
                .sortOrder(0) // 기본값
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
    
    /**
     * 문자열을 ProjectType enum으로 변환
     * @param typeString 타입 문자열
     * @return ProjectType enum
     */
    private ProjectType parseProjectType(String typeString) {
        if (typeString == null || typeString.trim().isEmpty()) {
            return null;
        }
        
        try {
            return ProjectType.valueOf(typeString.toUpperCase());
        } catch (IllegalArgumentException e) {
            // 알 수 없는 타입인 경우 기본값 반환 또는 null
            return null;
        }
    }
}