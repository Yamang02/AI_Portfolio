package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.admin.mapper.ProjectResponseMapper;
import com.aiportfolio.backend.application.common.util.BusinessIdGenerator;
import com.aiportfolio.backend.application.common.util.MetadataHelper;
import com.aiportfolio.backend.application.common.util.TextFieldHelper;
import com.aiportfolio.backend.infrastructure.web.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.admin.model.ProjectAssetSnapshot;
import com.aiportfolio.backend.domain.admin.model.command.ProjectCreateCommand;
import com.aiportfolio.backend.domain.admin.model.command.ProjectUpdateCommand;
import com.aiportfolio.backend.domain.admin.port.in.ManageProjectUseCase;
import com.aiportfolio.backend.domain.admin.port.out.ImageStoragePort;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.port.out.ProjectRelationshipPort;
import com.aiportfolio.backend.domain.portfolio.port.out.TechStackMetadataRepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectJpaRepository;
import com.aiportfolio.backend.infrastructure.config.CacheKeys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Admin 전용 Project 관리 서비스
 *
 * 책임: Project 생성/수정/삭제 UseCase 구현
 * 특징: Cache Evict로 캐시 자동 무효화, TechStack 관계 관리 포함
 */
@Service("manageProjectService")
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ManageProjectService implements ManageProjectUseCase {
    private static final String CLOUDINARY_DOMAIN = "cloudinary.com";

    private final PortfolioRepositoryPort portfolioRepositoryPort;
    private final ProjectRelationshipPort projectRelationshipPort;
    private final ProjectResponseMapper projectResponseMapper;
    private final ImageStoragePort imageStoragePort;
    private final TechStackMetadataRepositoryPort techStackMetadataRepositoryPort;
    private final ProjectJpaRepository projectJpaRepository;

    /**
     * 관계 포함 프로젝트 생성 (DTO 반환)
     */
    public ProjectResponse createProjectWithRelations(
            ProjectCreateCommand command,
            List<Long> techStackIds) {
        Project created = createProject(command);
        if (techStackIds != null && !techStackIds.isEmpty()) {
            ProjectJpaEntity projectEntity = projectJpaRepository.findByBusinessId(created.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found: " + created.getId()));
            List<TechStackRelation> techStacks = toTechStackRelations(techStackIds);
            List<ProjectRelationshipPort.TechStackRelation> portRelations = techStacks.stream()
                    .map(TechStackRelation::toPortRelation)
                    .toList();
            projectRelationshipPort.replaceTechStacks(projectEntity.getId(), portRelations);
        }
        return projectResponseMapper.toDetailedResponse(created);
    }

    /**
     * 관계 포함 프로젝트 수정 (DTO 반환)
     */
    public ProjectResponse updateProjectWithRelations(
            String id,
            ProjectUpdateCommand command,
            List<Long> techStackIds) {
        Project updated = updateProject(id, command);
        if (techStackIds != null) {
            ProjectJpaEntity projectEntity = projectJpaRepository.findByBusinessId(updated.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found: " + updated.getId()));
            List<TechStackRelation> techStacks = toTechStackRelations(techStackIds);
            List<ProjectRelationshipPort.TechStackRelation> portRelations = techStacks.stream()
                    .map(TechStackRelation::toPortRelation)
                    .toList();
            projectRelationshipPort.replaceTechStacks(projectEntity.getId(), portRelations);
        }
        return projectResponseMapper.toDetailedResponse(updated);
    }

    @Override
    @CacheEvict(value = CacheKeys.PORTFOLIO, key = "'" + CacheKeys.PROJECTS_ALL + "'")
    public Project createProject(ProjectCreateCommand command) {
        log.info("Creating new project: {}", command.getTitle());

        // 프로젝트 ID 자동 생성
        String projectId = generateProjectId();

        boolean isTeam = Boolean.TRUE.equals(command.getIsTeam());

        // 정렬 순서 자동 할당
        Integer sortOrder = command.getSortOrder();
        if (sortOrder == null) {
            // 기본 정렬 순서 미지정 시 첫 항목 순서(1)를 사용합니다.
            sortOrder = 1;
        }

        Project project = Project.builder()
                .id(projectId)
                .title(command.getTitle()) // 필수 필드: 정규화 없음 (유효성 검증에서 처리)
                .description(command.getDescription()) // 필수 필드: 정규화 없음 (유효성 검증에서 처리)
                .readme(TextFieldHelper.normalizeText(command.getReadme())) // 선택 필드
                .type(TextFieldHelper.normalizeText(command.getType())) // 선택 필드
                .status(TextFieldHelper.normalizeText(command.getStatus())) // 선택 필드
                .isTeam(isTeam)
                .isFeatured(command.getIsFeatured() != null ? command.getIsFeatured() : false)
                .teamSize(isTeam ? command.getTeamSize() : null)
                .role(TextFieldHelper.normalizeText(command.getRole())) // 선택 필드
                .myContributions(TextFieldHelper.normalizeTextList(command.getMyContributions())) // 선택 필드
                .startDate(command.getStartDate())
                .endDate(command.getEndDate())
                .imageUrl(TextFieldHelper.normalizeText(command.getImageUrl())) // 선택 필드
                .screenshots(command.getScreenshots())
                .githubUrl(TextFieldHelper.normalizeText(command.getGithubUrl())) // 선택 필드
                .liveUrl(TextFieldHelper.normalizeText(command.getLiveUrl())) // 선택 필드
                .externalUrl(TextFieldHelper.normalizeText(command.getExternalUrl())) // 선택 필드
                .sortOrder(sortOrder)
                .createdAt(MetadataHelper.setupCreatedAt(null))
                .updatedAt(MetadataHelper.setupUpdatedAt())
                .build();

        Project savedProject = portfolioRepositoryPort.saveProject(project);

        log.info("Project created successfully: {}", savedProject.getId());
        return savedProject;
    }

    @Override
    @CacheEvict(value = CacheKeys.PORTFOLIO, key = "'" + CacheKeys.PROJECTS_ALL + "'")
    public Project updateProject(String id, ProjectUpdateCommand command) {
        log.info("Updating project: {}", id);

        Project project = portfolioRepositoryPort.findProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));

        String oldImageUrl = project.getImageUrl();
        List<String> oldScreenshots = project.getScreenshots() != null
                ? new ArrayList<>(project.getScreenshots())
                : null;

        applyUpdateCommandFields(project, command);
        project.setUpdatedAt(MetadataHelper.setupUpdatedAt());
        removeObsoleteCloudinaryAssetsAfterUpdate(id, command, oldImageUrl, oldScreenshots);

        Project updatedProject = portfolioRepositoryPort.updateProject(project);

        log.info("Project updated successfully: {}", updatedProject.getId());
        return updatedProject;
    }

    private void applyUpdateCommandFields(Project project, ProjectUpdateCommand command) {
        applyUpdateCommandTitleDescriptionReadmeTypeStatus(project, command);
        applyUpdateCommandRoleContributionsDates(project, command);
        project.updateTeamInfo(command.getIsTeam(), command.getTeamSize());
        applyUpdateCommandFeaturedImageScreenshots(project, command);
        applyUpdateCommandLinksAndSortOrder(project, command);
    }

    private void applyUpdateCommandTitleDescriptionReadmeTypeStatus(Project project, ProjectUpdateCommand command) {
        if (command.getTitle() != null) {
            project.setTitle(command.getTitle());
        }
        if (command.getDescription() != null) {
            project.setDescription(command.getDescription());
        }
        if (command.getReadme() != null) {
            project.setReadme(TextFieldHelper.normalizeText(command.getReadme()));
        }
        if (command.getType() != null) {
            project.setType(TextFieldHelper.normalizeText(command.getType()));
        }
        if (command.getStatus() != null) {
            project.setStatus(TextFieldHelper.normalizeText(command.getStatus()));
        }
    }

    private void applyUpdateCommandRoleContributionsDates(Project project, ProjectUpdateCommand command) {
        if (command.getRole() != null) {
            project.setRole(TextFieldHelper.normalizeText(command.getRole()));
        }
        if (command.getMyContributions() != null) {
            project.setMyContributions(TextFieldHelper.normalizeTextList(command.getMyContributions()));
        }
        if (command.getStartDate() != null) {
            project.setStartDate(command.getStartDate());
        }
        if (command.getEndDate() != null) {
            project.setEndDate(command.getEndDate());
        }
    }

    private void applyUpdateCommandFeaturedImageScreenshots(Project project, ProjectUpdateCommand command) {
        if (command.getIsFeatured() != null) {
            project.setFeatured(Boolean.TRUE.equals(command.getIsFeatured()));
        }
        if (command.getImageUrl() != null) {
            project.setImageUrl(TextFieldHelper.normalizeText(command.getImageUrl()));
        }
        if (command.getScreenshots() != null) {
            List<String> validScreenshots = command.getScreenshots().stream()
                    .map(TextFieldHelper::normalizeText)
                    .filter(url -> url != null)
                    .toList();
            project.setScreenshots(validScreenshots.isEmpty() ? null : validScreenshots);
        }
    }

    private void applyUpdateCommandLinksAndSortOrder(Project project, ProjectUpdateCommand command) {
        if (command.getGithubUrl() != null) {
            project.setGithubUrl(TextFieldHelper.normalizeText(command.getGithubUrl()));
        }
        if (command.getLiveUrl() != null) {
            project.setLiveUrl(TextFieldHelper.normalizeText(command.getLiveUrl()));
        }
        if (command.getExternalUrl() != null) {
            project.setExternalUrl(TextFieldHelper.normalizeText(command.getExternalUrl()));
        }
        if (command.getSortOrder() != null) {
            project.setSortOrder(command.getSortOrder());
        }
    }

    private void removeObsoleteCloudinaryAssetsAfterUpdate(
            String projectBusinessId,
            ProjectUpdateCommand command,
            String oldImageUrl,
            List<String> oldScreenshots) {
        try {
            deleteReplacedThumbnailIfNeeded(command, oldImageUrl);
            deleteRemovedScreenshotsIfNeeded(command, oldScreenshots);
        } catch (Exception e) {
            log.error("Failed to delete old images from Cloudinary during update: {}", projectBusinessId, e);
        }
    }

    private void deleteReplacedThumbnailIfNeeded(ProjectUpdateCommand command, String oldImageUrl) {
        if (command.getImageUrl() == null
                || command.getImageUrl().equals(oldImageUrl)
                || oldImageUrl == null
                || !oldImageUrl.contains(CLOUDINARY_DOMAIN)) {
            return;
        }
        String publicId = imageStoragePort.extractPublicId(oldImageUrl);
        if (publicId != null) {
            log.info("Deleting old thumbnail from Cloudinary: {}", publicId);
            imageStoragePort.deleteImage(publicId);
        }
    }

    private void deleteRemovedScreenshotsIfNeeded(ProjectUpdateCommand command, List<String> oldScreenshots) {
        if (command.getScreenshots() == null || oldScreenshots == null || oldScreenshots.isEmpty()) {
            return;
        }
        List<String> newScreenshots = command.getScreenshots();
        for (String oldScreenshot : oldScreenshots) {
            if (oldScreenshot == null
                    || !oldScreenshot.contains(CLOUDINARY_DOMAIN)
                    || newScreenshots.stream().anyMatch(s -> s != null && s.equals(oldScreenshot))) {
                continue;
            }
            String publicId = imageStoragePort.extractPublicId(oldScreenshot);
            if (publicId != null) {
                log.info("Deleting old screenshot from Cloudinary: {}", publicId);
                imageStoragePort.deleteImage(publicId);
            }
        }
    }

    @Override
    @CacheEvict(value = CacheKeys.PORTFOLIO, key = "'" + CacheKeys.PROJECTS_ALL + "'")
    public void deleteProject(String id) {
        log.info("Deleting project: {}", id);

        // 프로젝트 존재 여부 확인
        if (portfolioRepositoryPort.findProjectById(id).isEmpty()) {
            throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id);
        }

        try {
            Optional<ProjectAssetSnapshot> assetSnapshotOpt =
                    portfolioRepositoryPort.findProjectAssets(id);

            if (assetSnapshotOpt.isEmpty()) {
                log.warn("프로젝트 자산 정보를 찾을 수 없어 이미지 삭제를 건너뜁니다: {}", id);
            } else {
                ProjectAssetSnapshot assetSnapshot = assetSnapshotOpt.get();
                deleteThumbnailIfNecessary(assetSnapshot.getThumbnailUrl());
                deleteScreenshots(assetSnapshot);
            }
        } catch (Exception e) {
            log.error("Failed to delete images from Cloudinary for project: {}", id, e);
        }

        // 프로젝트 삭제
        portfolioRepositoryPort.deleteProject(id);

        log.info("Project deleted successfully: {}", id);
    }

    /**
     * 프로젝트 ID 자동 생성
     */
    private String generateProjectId() {
        Optional<String> lastBusinessId = portfolioRepositoryPort.findLastBusinessIdByPrefix(BusinessIdGenerator.Prefix.PROJECT);
        return BusinessIdGenerator.generate(BusinessIdGenerator.Prefix.PROJECT, lastBusinessId);
    }

    private void deleteThumbnailIfNecessary(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains(CLOUDINARY_DOMAIN)) {
            return;
        }

        String publicId = imageStoragePort.extractPublicId(imageUrl);
        if (publicId != null) {
            log.info("Deleting thumbnail image from Cloudinary: {}", publicId);
            imageStoragePort.deleteImage(publicId);
        }
    }

    private void deleteScreenshots(ProjectAssetSnapshot assetSnapshot) {
        if (assetSnapshot.getScreenshots() == null || assetSnapshot.getScreenshots().isEmpty()) {
            return;
        }

        for (ProjectAssetSnapshot.ProjectScreenshotAsset screenshot : assetSnapshot.getScreenshots()) {
            try {
                String publicId = screenshot.getCloudinaryPublicId();
                if ((publicId == null || publicId.isEmpty())
                        && screenshot.getImageUrl() != null
                        && screenshot.getImageUrl().contains(CLOUDINARY_DOMAIN)) {
                    publicId = imageStoragePort.extractPublicId(screenshot.getImageUrl());
                }

                if (publicId != null && !publicId.isEmpty()) {
                    log.info("Deleting screenshot from Cloudinary: {} (publicId: {})",
                            screenshot.getImageUrl(), publicId);
                    imageStoragePort.deleteImage(publicId);
                } else {
                    log.warn("Screenshot publicId를 찾을 수 없습니다: {}", screenshot.getImageUrl());
                }
            } catch (Exception ex) {
                log.error("Failed to delete screenshot asset: {}", screenshot.getImageUrl(), ex);
            }
        }
    }


    /**
     * TechStack ID 목록을 TechStackRelation 리스트로 변환
     * 
     * @param techStackIds 기술 스택 ID 목록
     * @return TechStackRelation 리스트
     * @throws IllegalArgumentException 기술 스택을 찾을 수 없는 경우
     */
    public List<TechStackRelation> toTechStackRelations(List<Long> techStackIds) {
        if (techStackIds == null || techStackIds.isEmpty()) {
            return new java.util.ArrayList<>();
        }

        return techStackIds.stream()
                .filter(id -> id != null) // null 필터링
                .map(id -> {
                    return techStackMetadataRepositoryPort.findById(id)
                            .map(techStack -> new TechStackRelation(
                                    techStack.getId(),
                                    false, // 기본값: isPrimary = false
                                    null   // 기본값: usageDescription = null
                            ))
                            .orElseThrow(() -> new IllegalArgumentException(
                                    "TechStack을 찾을 수 없습니다: ID=" + id));
                })
                .toList();
    }

    /**
     * TechStack 관계를 표현하는 record
     * ProjectRelationshipPort의 TechStackRelation과 동일한 구조
     */
    public record TechStackRelation(Long techStackId, boolean isPrimary, String usageDescription) {
        /**
         * ProjectRelationshipPort.TechStackRelation으로 변환
         */
        public ProjectRelationshipPort.TechStackRelation toPortRelation() {
            return new ProjectRelationshipPort.TechStackRelation(techStackId, isPrimary, usageDescription);
        }
    }
}

