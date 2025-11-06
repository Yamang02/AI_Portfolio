package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.application.admin.mapper.ProjectResponseMapper;
import com.aiportfolio.backend.domain.admin.model.ProjectAssetSnapshot;
import com.aiportfolio.backend.domain.admin.model.command.ProjectCreateCommand;
import com.aiportfolio.backend.domain.admin.model.command.ProjectUpdateCommand;
import com.aiportfolio.backend.domain.admin.port.in.ManageProjectUseCase;
import com.aiportfolio.backend.domain.admin.port.out.ImageStoragePort;
import com.aiportfolio.backend.domain.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 프로젝트 관리 서비스
 * ManageProjectUseCase 인터페이스의 구현체
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProjectManagementService implements ManageProjectUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    private final ProjectResponseMapper projectResponseMapper;
    private final ImageStoragePort imageStoragePort;
    
    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public ProjectResponse createProject(ProjectCreateCommand command) {
        log.info("Creating new project: {}", command.getTitle());
        
        // 프로젝트 ID 자동 생성 (형식: proj-XXX)
        String projectId = generateProjectId();

        boolean isTeam = Boolean.TRUE.equals(command.getIsTeam());
        Integer normalizedTeamSize = normalizeTeamSize(isTeam, command.getTeamSize());

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
                .sortOrder(command.getSortOrder())
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
        
        // 이미지 URL 업데이트 - 빈 문자열도 허용 (값을 비우는 의도)
        // 빈 문자열 필터링은 Cloudinary 업로드 실패 시에만 적용되며,
        // 일반 업데이트에서는 빈 문자열을 null로 변환하지 않음 (저장 계층에서 처리)
        if (command.getImageUrl() != null) {
            project.setImageUrl(command.getImageUrl());
        }
        
        // 스크린샷 업데이트 - 빈 배열도 허용 (모든 스크린샷 제거 의도)
        // 빈 배열은 그대로 유지하여 저장 계층에서 처리하도록 함
        // 저장 계층에서 빈 값들은 필터링되지만, 빈 배열 자체는 null이 아닌 빈 리스트로 전달
        if (command.getScreenshots() != null) {
            // null 또는 빈 문자열인 URL만 필터링 (빈 배열은 유지)
            List<String> validScreenshots = command.getScreenshots().stream()
                .filter(url -> url != null && !url.trim().isEmpty())
                .collect(java.util.stream.Collectors.toList());
            // 빈 배열인 경우도 그대로 유지 (모든 스크린샷 제거 의도)
            project.setScreenshots(validScreenshots);
            log.debug("Filtered invalid screenshot URLs: {} -> {} (empty list preserved for removal intent)",
                    command.getScreenshots().size(), validScreenshots.size());
        }
        if (command.getGithubUrl() != null) project.setGithubUrl(command.getGithubUrl());
        if (command.getLiveUrl() != null) project.setLiveUrl(command.getLiveUrl());
        if (command.getExternalUrl() != null) project.setExternalUrl(command.getExternalUrl());
        if (command.getSortOrder() != null) project.setSortOrder(command.getSortOrder());

        // 수정된 이미지 처리 (교체된 경우 기존 이미지 삭제)
        try {
            // 썸네일이 교체되었는지 확인
            if (command.getImageUrl() != null && !command.getImageUrl().equals(oldImageUrl)) {
                // 기존 썸네일 삭제
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
                // 빈 배열로 업데이트한 경우에도 처리
                List<String> newScreenshots = command.getScreenshots();
                
                if (oldScreenshots != null && !oldScreenshots.isEmpty()) {
                    // 기존 스크린샷 중 새로운 목록에 없는 것 찾기
                    for (String oldScreenshot : oldScreenshots) {
                        if (oldScreenshot != null && oldScreenshot.contains("cloudinary.com")) {
                            boolean stillExists = newScreenshots.stream()
                                .anyMatch(s -> s != null && s.equals(oldScreenshot));
                            
                            if (!stillExists) {
                                // 삭제된 스크린샷
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
            // 이미지 삭제 실패해도 업데이트는 계속 진행
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
        Project project = portfolioRepositoryPort.findProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));

        try {
            Optional<ProjectAssetSnapshot> assetSnapshotOpt = portfolioRepositoryPort.findProjectAssets(id);

            if (assetSnapshotOpt.isEmpty()) {
                log.warn("프로젝트 자산 정보를 찾을 수 없어 이미지 삭제를 건너뜁니다: {}", id);
            } else {
                ProjectAssetSnapshot assetSnapshot = assetSnapshotOpt.get();

                deleteThumbnailIfNecessary(assetSnapshot.getThumbnailUrl());
                deleteScreenshots(assetSnapshot);
            }
        } catch (Exception e) {
            log.error("Failed to delete images from Cloudinary for project: {}", id, e);
            // 이미지 삭제 실패해도 프로젝트 삭제는 계속 진행
        }

        // 프로젝트 삭제
        portfolioRepositoryPort.deleteProject(id);

        log.info("Project deleted successfully: {}", id);
    }
    
    /**
     * 프로젝트 ID 자동 생성
     * DB에서 마지막 ID를 조회하여 +1 증가
     * 형식: prj-XXX (예: prj-001, prj-002)
     */
    private String generateProjectId() {
        // DB에서 "prj-" prefix를 가진 마지막 business_id 조회
        Optional<String> lastBusinessId = portfolioRepositoryPort.findLastBusinessIdByPrefix("prj-");
        
        int nextNumber;
        if (lastBusinessId.isPresent()) {
            // 마지막 ID에서 숫자 추출 (예: "prj-010" → 10)
            nextNumber = extractNumber(lastBusinessId.get());
        } else {
            // 데이터 없으면 0부터 시작
            nextNumber = 0;
        }
        
        // +1 증가 후 3자리 포맷팅 (예: 11 → "prj-011")
        String formattedNumber = String.format("%03d", nextNumber + 1);
        return "prj-" + formattedNumber;
    }
    
    /**
     * 비즈니스 ID에서 숫자 부분을 추출
     * @param businessId 비즈니스 ID (예: "prj-010")
     * @return 숫자 부분 (예: 10)
     */
    private int extractNumber(String businessId) {
        if (businessId == null || businessId.isEmpty()) {
            return 0;
        }
        // "prj-010" → "010" → 10
        try {
            String numberPart = businessId.substring(4); // "prj-" (4글자) 이후
            return Integer.parseInt(numberPart);
        } catch (Exception e) {
            log.error("비즈니스 ID 숫자 추출 실패: {}", businessId, e);
            return 0;
        }
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
}
