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
    private final ProjectRelationshipPort projectRelationshipPort;
    private final ProjectResponseMapper projectResponseMapper;
    private final ImageStoragePort imageStoragePort;
    private final TechStackMetadataRepositoryPort techStackMetadataRepositoryPort;

    /**
     * 관계 포함 프로젝트 생성 (DTO 반환)
     */
    public ProjectResponse createProjectWithRelations(
            ProjectCreateCommand command,
            List<Long> techStackIds) {
        Project created = createProject(command);
        if (techStackIds != null && !techStackIds.isEmpty()) {
            List<TechStackRelation> techStacks = toTechStackRelations(techStackIds);
            List<ProjectRelationshipPort.TechStackRelation> portRelations = techStacks.stream()
                    .map(TechStackRelation::toPortRelation)
                    .collect(java.util.stream.Collectors.toList());
            projectRelationshipPort.replaceTechStacks(created.getId(), portRelations);
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
            List<TechStackRelation> techStacks = toTechStackRelations(techStackIds);
            List<ProjectRelationshipPort.TechStackRelation> portRelations = techStacks.stream()
                    .map(TechStackRelation::toPortRelation)
                    .collect(java.util.stream.Collectors.toList());
            projectRelationshipPort.replaceTechStacks(updated.getId(), portRelations);
        }
        return projectResponseMapper.toDetailedResponse(updated);
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Project createProject(ProjectCreateCommand command) {
        log.info("Creating new project: {}", command.getTitle());

        // 프로젝트 ID 자동 생성
        String projectId = generateProjectId();

        boolean isTeam = Boolean.TRUE.equals(command.getIsTeam());

        // 정렬 순서 자동 할당
        Integer sortOrder = command.getSortOrder();
        if (sortOrder == null) {
            // TODO: PortfolioRepositoryPort에 findMaxProjectSortOrder 메서드 추가 필요
            // 임시로 0으로 설정 (기존 로직 유지)
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
    @CacheEvict(value = "portfolio", allEntries = true)
    public Project updateProject(String id, ProjectUpdateCommand command) {
        log.info("Updating project: {}", id);

        Project project = portfolioRepositoryPort.findProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));

        // 기존 이미지 URL 백업 (교체될 때 삭제해야 함)
        String oldImageUrl = project.getImageUrl();
        List<String> oldScreenshots = project.getScreenshots() != null
                ? new java.util.ArrayList<>(project.getScreenshots())
                : null;

        // 필드 업데이트
        // 필수 필드: 정규화 없음 (유효성 검증에서 처리)
        if (command.getTitle() != null) project.setTitle(command.getTitle());
        if (command.getDescription() != null) project.setDescription(command.getDescription());
        
        // 선택 필드: 정규화 적용
        if (command.getReadme() != null) {
            project.setReadme(TextFieldHelper.normalizeText(command.getReadme()));
        }
        if (command.getType() != null) {
            project.setType(TextFieldHelper.normalizeText(command.getType()));
        }
        if (command.getStatus() != null) {
            project.setStatus(TextFieldHelper.normalizeText(command.getStatus()));
        }
        if (command.getRole() != null) {
            project.setRole(TextFieldHelper.normalizeText(command.getRole()));
        }
        if (command.getMyContributions() != null) {
            project.setMyContributions(TextFieldHelper.normalizeTextList(command.getMyContributions()));
        }
        if (command.getStartDate() != null) project.setStartDate(command.getStartDate());
        if (command.getEndDate() != null) project.setEndDate(command.getEndDate());

        project.updateTeamInfo(command.getIsTeam(), command.getTeamSize());

        // 이미지 URL 업데이트 (선택 필드: 정규화 적용)
        if (command.getImageUrl() != null) {
            project.setImageUrl(TextFieldHelper.normalizeText(command.getImageUrl()));
        }

        // 스크린샷 업데이트 (선택 필드: 정규화 적용)
        if (command.getScreenshots() != null) {
            List<String> validScreenshots = command.getScreenshots().stream()
                    .map(TextFieldHelper::normalizeText)
                    .filter(url -> url != null)
                    .collect(java.util.stream.Collectors.toList());
            project.setScreenshots(validScreenshots.isEmpty() ? null : validScreenshots);
        }
        if (command.getGithubUrl() != null) {
            project.setGithubUrl(TextFieldHelper.normalizeText(command.getGithubUrl()));
        }
        if (command.getLiveUrl() != null) {
            project.setLiveUrl(TextFieldHelper.normalizeText(command.getLiveUrl()));
        }
        if (command.getExternalUrl() != null) {
            project.setExternalUrl(TextFieldHelper.normalizeText(command.getExternalUrl()));
        }
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
        return updatedProject;
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
     * TechStack 관계 교체
     * Port를 통한 관계 관리로 변경
     */
    private void replaceTechStacks(String projectBusinessId, List<TechStackRelation> relationships) {
        List<ProjectRelationshipPort.TechStackRelation> portRelations = relationships.stream()
                .map(TechStackRelation::toPortRelation)
                .collect(java.util.stream.Collectors.toList());
        projectRelationshipPort.replaceTechStacks(projectBusinessId, portRelations);
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

    private void deleteScreenshots(ProjectAssetSnapshot assetSnapshot) {
        if (assetSnapshot.getScreenshots() == null || assetSnapshot.getScreenshots().isEmpty()) {
            return;
        }

        for (ProjectAssetSnapshot.ProjectScreenshotAsset screenshot : assetSnapshot.getScreenshots()) {
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
                .collect(java.util.stream.Collectors.toList());
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

