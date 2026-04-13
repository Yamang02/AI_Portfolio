package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.ProjectTechnicalCard;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectScreenshotJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechnicalCardJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectScreenshotJpaRepository;

// 외부 라이브러리 imports
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

// Java 표준 라이브러리 imports
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

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
                .id(jpaEntity.getBusinessId()) // business_id → domain.id (비즈니스 ID)
                .dbId(jpaEntity.getId()) // id → domain.dbId (DB ID)
                .title(jpaEntity.getTitle())
                .description(jpaEntity.getDescription())
                .techStackMetadata(techStackMetadataMapper.toDomainList(
                    jpaEntity.getProjectTechStacks() != null ? 
                    jpaEntity.getProjectTechStacks().stream()
                        .map(ProjectTechStackJpaEntity::getTechStack)
                        .toList() : 
                    new java.util.ArrayList<>()
                ))
                .githubUrl(jpaEntity.getGithubUrl())
                .liveUrl(jpaEntity.getLiveUrl())
                .imageUrl(jpaEntity.getImageUrl())
                .type(jpaEntity.getType())
                .source(jpaEntity.getSource())
                .status(jpaEntity.getStatus())
                .sortOrder(jpaEntity.getSortOrder())
                .startDate(jpaEntity.getStartDate())
                .endDate(jpaEntity.getEndDate())
                .isTeam(jpaEntity.getIsTeam() != null ? jpaEntity.getIsTeam() : false)
                .isFeatured(jpaEntity.getIsFeatured() != null ? jpaEntity.getIsFeatured() : false)
                .teamSize(jpaEntity.getTeamSize())
                .externalUrl(jpaEntity.getExternalUrl())
                .myContributions(jpaEntity.getMyContributions())
                .role(jpaEntity.getRole())
                .screenshots(new ArrayList<>()) // 목록 조회 시 스크린샷은 로드하지 않음 (성능 최적화)
                .technicalCards(toDomainTechnicalCards(jpaEntity.getProjectTechnicalCards()))
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
        
        ProjectJpaEntity entity = ProjectJpaEntity.builder()
                .businessId(domainModel.getId()) // domain.id → business_id
                .title(domainModel.getTitle())
                .description(domainModel.getDescription())
                .projectTechStacks(new java.util.ArrayList<>()) // 관계 테이블은 별도로 관리
                .githubUrl(domainModel.getGithubUrl())
                .liveUrl(domainModel.getLiveUrl())
                .imageUrl(domainModel.getImageUrl())
                .type(domainModel.getType())
                .source(domainModel.getSource())
                .status(domainModel.getStatus() != null ? domainModel.getStatus() : "completed")
                .sortOrder(domainModel.getSortOrder() != null ? domainModel.getSortOrder() : 0)
                .startDate(domainModel.getStartDate())
                .endDate(domainModel.getEndDate())
                .isTeam(domainModel.isTeam())
                .isFeatured(domainModel.isFeatured())
                .teamSize(domainModel.getTeamSize())
                .externalUrl(domainModel.getExternalUrl())
                .myContributions(domainModel.getMyContributions())
                .role(domainModel.getRole())
                .projectScreenshots(new java.util.ArrayList<>()) // 관계 테이블은 별도로 관리
                .projectTechnicalCards(new java.util.ArrayList<>())
                .createdAt(domainModel.getCreatedAt())
                .updatedAt(domainModel.getUpdatedAt())
                .build();

        entity.setProjectTechnicalCards(toJpaTechnicalCards(domainModel.getTechnicalCards(), entity));
        return entity;
    }
    
    /**
     * JPA 엔티티 리스트를 도메인 모델 리스트로 변환
     * @param jpaEntities JPA 엔티티 리스트
     * @return 도메인 모델 리스트
     */
    public List<Project> toDomainList(List<ProjectJpaEntity> jpaEntities) {
        if (jpaEntities == null) {
            return List.of();
        }
        
        return jpaEntities.stream()
                .map(this::toDomain)
                .toList();
    }
    
    /**
     * 도메인 모델 리스트를 JPA 엔티티 리스트로 변환
     * @param domainModels 도메인 모델 리스트
     * @return JPA 엔티티 리스트
     */
    public List<ProjectJpaEntity> toJpaEntityList(List<Project> domainModels) {
        if (domainModels == null) {
            return List.of();
        }
        
        return domainModels.stream()
                .map(this::toJpaEntity)
                .toList();
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
                .toList();
        } catch (Exception e) {
            // 예외 발생 시 빈 리스트 반환하여 전체 조회를 막지 않음
            log.warn("Error fetching screenshot URLs for project {}: {}", 
                    jpaEntity.getBusinessId(), e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<ProjectTechnicalCardJpaEntity> toJpaTechnicalCards(
            List<ProjectTechnicalCard> cards,
            ProjectJpaEntity projectEntity) {
        if (cards == null) {
            return new ArrayList<>();
        }
        return cards.stream()
                .map(card -> ProjectTechnicalCardJpaEntity.builder()
                        .id(card.getId())
                        .businessId(normalizeCardBusinessId(card.getBusinessId()))
                        .project(projectEntity)
                        .title(card.getTitle())
                        .category(card.getCategory())
                        .problemStatement(card.getProblemStatement())
                        .analysis(card.getAnalysis())
                        .solution(card.getSolution())
                        .articleId(card.getArticleId())
                        .isPinned(card.isPinned())
                        .sortOrder(card.getSortOrder() != null ? card.getSortOrder() : 0)
                        .build())
                .toList();
    }

    public List<ProjectTechnicalCard> toDomainTechnicalCards(List<ProjectTechnicalCardJpaEntity> entities) {
        if (entities == null) {
            return new ArrayList<>();
        }
        return entities.stream()
                .map(entity -> ProjectTechnicalCard.builder()
                        .id(entity.getId())
                        .businessId(entity.getBusinessId())
                        .title(entity.getTitle())
                        .category(entity.getCategory())
                        .problemStatement(entity.getProblemStatement())
                        .analysis(entity.getAnalysis())
                        .solution(entity.getSolution())
                        .articleId(entity.getArticleId())
                        .pinned(Boolean.TRUE.equals(entity.getIsPinned()))
                        .sortOrder(entity.getSortOrder())
                        .build())
                .toList();
    }

    private String normalizeCardBusinessId(String businessId) {
        if (businessId != null && !businessId.isBlank()) {
            return businessId;
        }
        return "ptc-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
