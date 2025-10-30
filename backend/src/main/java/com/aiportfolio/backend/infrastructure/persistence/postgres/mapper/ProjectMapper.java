package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectScreenshotJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectScreenshotJpaRepository;

// 외부 라이브러리 imports
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

// Java 표준 라이브러리 imports
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

/**
 * Project 도메인 모델과 JPA 엔티티 간 변환 매퍼
 * 헥사고날 아키텍처에서 도메인과 인프라 레이어 분리를 위한 매퍼
 */
@Component
@Slf4j
public class ProjectMapper {
    
    private final TechStackMetadataMapper techStackMetadataMapper;
    private final ProjectScreenshotJpaRepository projectScreenshotJpaRepository;
    
    public ProjectMapper(TechStackMetadataMapper techStackMetadataMapper,
                         @Lazy ProjectScreenshotJpaRepository projectScreenshotJpaRepository) {
        this.techStackMetadataMapper = techStackMetadataMapper;
        this.projectScreenshotJpaRepository = projectScreenshotJpaRepository;
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
                .screenshots(new ArrayList<>()) // 목록 조회 시 스크린샷은 로드하지 않음 (성능 최적화)
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
                .projectScreenshots(new java.util.ArrayList<>()) // 관계 테이블은 별도로 관리
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
    
    /**
     * 프로젝트의 screenshots ID 배열을 사용하여 관계 테이블에서 URL 목록을 조회
     * 상세 조회 시에만 사용
     * @param jpaEntity 프로젝트 JPA 엔티티
     * @return 스크린샷 URL 리스트
     */
    public List<String> getScreenshotUrlsFromIds(ProjectJpaEntity jpaEntity) {
        try {
            if (jpaEntity.getScreenshots() == null || jpaEntity.getScreenshots().isEmpty()) {
                return new ArrayList<>();
            }
            
            // ID 배열을 사용하여 project_screenshots 테이블에서 조회
            List<ProjectScreenshotJpaEntity> screenshotEntities = 
                projectScreenshotJpaRepository.findAllById(jpaEntity.getScreenshots());
            
            if (screenshotEntities == null || screenshotEntities.isEmpty()) {
                log.debug("Screenshot entities not found for IDs: {}", jpaEntity.getScreenshots());
                return new ArrayList<>();
            }
            
            // display_order 순서대로 정렬하여 URL 추출
            return screenshotEntities.stream()
                .sorted((a, b) -> {
                    int orderA = a.getDisplayOrder() != null ? a.getDisplayOrder() : 0;
                    int orderB = b.getDisplayOrder() != null ? b.getDisplayOrder() : 0;
                    return Integer.compare(orderA, orderB);
                })
                .map(ProjectScreenshotJpaEntity::getImageUrl)
                .filter(url -> url != null && !url.isEmpty())
                .collect(Collectors.toList());
        } catch (Exception e) {
            // 예외 발생 시 빈 리스트 반환하여 전체 조회를 막지 않음
            log.warn("Error fetching screenshot URLs for project {}: {}", 
                    jpaEntity.getBusinessId(), e.getMessage());
            return new ArrayList<>();
        }
    }
    
}