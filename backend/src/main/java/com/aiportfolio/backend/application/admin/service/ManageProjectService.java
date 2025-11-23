package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.admin.mapper.ProjectResponseMapper;
import com.aiportfolio.backend.application.common.util.BusinessIdGenerator;
import com.aiportfolio.backend.application.common.util.MetadataHelper;
import com.aiportfolio.backend.domain.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.admin.model.command.ProjectCreateCommand;
import com.aiportfolio.backend.domain.admin.model.command.ProjectUpdateCommand;
import com.aiportfolio.backend.domain.admin.port.in.ManageProjectUseCase;
import com.aiportfolio.backend.domain.admin.port.out.ImageStoragePort;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.TechStackMetadataJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectTechStackJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.TechStackMetadataJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private final PortfolioRepositoryPort portfolioRepositoryPort;
    private final ProjectJpaRepository projectJpaRepository;
    private final ProjectTechStackJpaRepository projectTechStackJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;
    private final ProjectResponseMapper projectResponseMapper;
    private final ImageStoragePort imageStoragePort;

    /**
     * 관계 포함 프로젝트 생성
     */
    public ProjectResponse createProjectWithRelations(
            ProjectCreateCommand command,
            List<TechStackRelation> techStacks) {
        ProjectResponse created = createProject(command);
        if (techStacks != null && !techStacks.isEmpty()) {
            replaceTechStacks(created.getId(), techStacks);
        }
        return created;
    }

    /**
     * 관계 포함 프로젝트 수정
     */
    public ProjectResponse updateProjectWithRelations(
            String id,
            ProjectUpdateCommand command,
            List<TechStackRelation> techStacks) {
        ProjectResponse updated = updateProject(id, command);
        if (techStacks != null) {
            replaceTechStacks(updated.getId(), techStacks);
        }
        return updated;
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public ProjectResponse createProject(ProjectCreateCommand command) {
        log.info("Creating new project: {}", command.getTitle());

        // 프로젝트 ID 자동 생성
        String projectId = generateProjectId();

        boolean isTeam = Boolean.TRUE.equals(command.getIsTeam());
        Integer normalizedTeamSize = normalizeTeamSize(isTeam, command.getTeamSize());

        // 정렬 순서 자동 할당
        Integer sortOrder = command.getSortOrder();
        if (sortOrder == null) {
            Integer maxSortOrder = projectJpaRepository.findMaxSortOrder();
            sortOrder = (maxSortOrder != null ? maxSortOrder : 0) + 1;
        }

        Project project = Project.builder()
                .id(projectId)
                .title(command.getTitle())
                .description(command.getDescription())
                .readme(command.getReadme())
                .type(command.getType())
                .status(command.getStatus())
                .isTeam(isTeam)
                .teamSize(normalizedTeamSize)
                .role(command.getRole())
                .myContributions(command.getMyContributions())
                .startDate(command.getStartDate())
                .endDate(command.getEndDate())
                .imageUrl(command.getImageUrl())
                .screenshots(command.getScreenshots())
                .githubUrl(command.getGithubUrl())
                .liveUrl(command.getLiveUrl())
                .externalUrl(command.getExternalUrl())
                .sortOrder(sortOrder)
                .createdAt(MetadataHelper.setupCreatedAt(null))
                .updatedAt(MetadataHelper.setupUpdatedAt())
                .build();

        Project savedProject = portfolioRepositoryPort.saveProject(project);

        log.info("Project created successfully: {}", savedProject.getId());
        return projectResponseMapper.toResponse(savedProject);
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public ProjectResponse updateProject(String id, ProjectUpdateCommand command) {
        log.info("Updating project: {}", id);

        Project project = portfolioRepositoryPort.findProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));

        // 기존 이미지 URL 백업 (교체될 때 삭제해야 함)
        String oldImageUrl = project.getImageUrl();
        List<String> oldScreenshots = project.getScreenshots() != null
                ? new java.util.ArrayList<>(project.getScreenshots())
                : null;

        // 필드 업데이트
        if (command.getTitle() != null) project.setTitle(command.getTitle());
        if (command.getDescription() != null) project.setDescription(command.getDescription());
        if (command.getReadme() != null) project.setReadme(command.getReadme());
        if (command.getType() != null) project.setType(command.getType());
        if (command.getStatus() != null) project.setStatus(command.getStatus());
        if (command.getRole() != null) project.setRole(command.getRole());
        if (command.getMyContributions() != null) project.setMyContributions(command.getMyContributions());
        if (command.getStartDate() != null) project.setStartDate(command.getStartDate());
        if (command.getEndDate() != null) project.setEndDate(command.getEndDate());

        applyTeamAttributes(project, command.getIsTeam(), command.getTeamSize());

        // 이미지 URL 업데이트
        if (command.getImageUrl() != null) {
            project.setImageUrl(command.getImageUrl());
        }

        // 스크린샷 업데이트
        if (command.getScreenshots() != null) {
            List<String> validScreenshots = command.getScreenshots().stream()
                    .filter(url -> url != null && !url.trim().isEmpty())
                    .collect(java.util.stream.Collectors.toList());
            project.setScreenshots(validScreenshots);
            log.debug("Filtered invalid screenshot URLs: {} -> {}",
                    command.getScreenshots().size(), validScreenshots.size());
        }
        if (command.getGithubUrl() != null) project.setGithubUrl(command.getGithubUrl());
        if (command.getLiveUrl() != null) project.setLiveUrl(command.getLiveUrl());
        if (command.getExternalUrl() != null) project.setExternalUrl(command.getExternalUrl());
        if (command.getSortOrder() != null) project.setSortOrder(command.getSortOrder());

        // 수정 시간 갱신
        project.setUpdatedAt(MetadataHelper.setupUpdatedAt());

        // 수정된 이미지 처리 (교체된 경우 기존 이미지 삭제)
        try {
            // 썸네일이 교체되었는지 확인
            if (command.getImageUrl() != null && !command.getImageUrl().equals(oldImageUrl)) {
                if (oldImageUrl != null && oldImageUrl.contains("cloudinary.com")) {
                    String publicId = imageStoragePort.extractPublicId(oldImageUrl);
                    if (publicId != null) {
                        log.info("Deleting old thumbnail from Cloudinary: {}", publicId);
                        imageStoragePort.deleteImage(publicId);
                    }
                }
            }

            // 스크린샷이 교체되었는지 확인
            if (command.getScreenshots() != null) {
                List<String> newScreenshots = command.getScreenshots();

                if (oldScreenshots != null && !oldScreenshots.isEmpty()) {
                    for (String oldScreenshot : oldScreenshots) {
                        if (oldScreenshot != null && oldScreenshot.contains("cloudinary.com")) {
                            boolean stillExists = newScreenshots.stream()
                                    .anyMatch(s -> s != null && s.equals(oldScreenshot));

                            if (!stillExists) {
                                String publicId = imageStoragePort.extractPublicId(oldScreenshot);
                                if (publicId != null) {
                                    log.info("Deleting old screenshot from Cloudinary: {}", publicId);
                                    imageStoragePort.deleteImage(publicId);
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete old images from Cloudinary during update: {}", id, e);
        }

        Project updatedProject = portfolioRepositoryPort.updateProject(project);

        log.info("Project updated successfully: {}", updatedProject.getId());
        return projectResponseMapper.toResponse(updatedProject);
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void deleteProject(String id) {
        log.info("Deleting project: {}", id);

        // 프로젝트 존재 여부 확인
        if (!portfolioRepositoryPort.findProjectById(id).isPresent()) {
            throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id);
        }

        try {
            Optional<com.aiportfolio.backend.domain.admin.model.ProjectAssetSnapshot> assetSnapshotOpt =
                    portfolioRepositoryPort.findProjectAssets(id);

            if (assetSnapshotOpt.isEmpty()) {
                log.warn("프로젝트 자산 정보를 찾을 수 없어 이미지 삭제를 건너뜁니다: {}", id);
            } else {
                com.aiportfolio.backend.domain.admin.model.ProjectAssetSnapshot assetSnapshot = assetSnapshotOpt.get();
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
     * TechStack 관계 교체
     */
    private void replaceTechStacks(String projectBusinessId, List<TechStackRelation> relationships) {
        ProjectJpaEntity project = projectJpaRepository.findByBusinessId(projectBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectBusinessId));

        projectTechStackJpaRepository.deleteByProjectId(project.getId());
        log.debug("Cleared existing tech stack relationships for project {}", projectBusinessId);

        if (relationships == null || relationships.isEmpty()) {
            return;
        }

        for (TechStackRelation item : relationships) {
            if (item.techStackId() == null) {
                throw new IllegalArgumentException("Tech stack ID must not be null");
            }

            TechStackMetadataJpaEntity techStack = techStackMetadataJpaRepository.findById(item.techStackId())
                    .orElseThrow(() -> new IllegalArgumentException("TechStack not found: " + item.techStackId()));

            ProjectTechStackJpaEntity relation = ProjectTechStackJpaEntity.builder()
                    .project(project)
                    .techStack(techStack)
                    .isPrimary(item.isPrimary())
                    .usageDescription(item.usageDescription())
                    .build();

            projectTechStackJpaRepository.save(relation);
        }

        log.debug("Created {} tech stack relationships for project {}", relationships.size(), projectBusinessId);
    }

    /**
     * 프로젝트 ID 자동 생성
     */
    private String generateProjectId() {
        Optional<String> lastBusinessId = portfolioRepositoryPort.findLastBusinessIdByPrefix(BusinessIdGenerator.Prefix.PROJECT);
        return BusinessIdGenerator.generate(BusinessIdGenerator.Prefix.PROJECT, lastBusinessId);
    }

    private void deleteThumbnailIfNecessary(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return;
        }

        String publicId = imageStoragePort.extractPublicId(imageUrl);
        if (publicId != null) {
            log.info("Deleting thumbnail image from Cloudinary: {}", publicId);
            imageStoragePort.deleteImage(publicId);
        }
    }

    private void deleteScreenshots(com.aiportfolio.backend.domain.admin.model.ProjectAssetSnapshot assetSnapshot) {
        if (assetSnapshot.getScreenshots() == null || assetSnapshot.getScreenshots().isEmpty()) {
            return;
        }

        for (com.aiportfolio.backend.domain.admin.model.ProjectAssetSnapshot.ProjectScreenshotAsset screenshot : assetSnapshot.getScreenshots()) {
            try {
                String publicId = screenshot.getCloudinaryPublicId();
                if ((publicId == null || publicId.isEmpty())
                        && screenshot.getImageUrl() != null
                        && screenshot.getImageUrl().contains("cloudinary.com")) {
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

    private void applyTeamAttributes(Project project, Boolean isTeamUpdate, Integer teamSizeUpdate) {
        if (isTeamUpdate != null) {
            project.setTeam(isTeamUpdate);
            if (!isTeamUpdate) {
                project.setTeamSize(null);
            }
        }

        if (teamSizeUpdate != null) {
            if (project.isTeam()) {
                Integer normalized = normalizeTeamSize(true, teamSizeUpdate);
                project.setTeamSize(normalized);
            } else {
                log.debug("Ignoring teamSize update for non-team project: {}", project.getId());
            }
        }
    }

    private Integer normalizeTeamSize(boolean isTeam, Integer teamSize) {
        if (!isTeam) {
            return null;
        }

        if (teamSize == null) {
            return null;
        }

        if (teamSize <= 0) {
            log.warn("Invalid team size provided ({}). Falling back to null.", teamSize);
            return null;
        }

        return teamSize;
    }

    /**
     * TechStack 관계를 표현하는 record
     */
    public record TechStackRelation(Long techStackId, boolean isPrimary, String usageDescription) {
    }
}

