package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.admin.port.in.ManageProjectUseCase;
import com.aiportfolio.backend.domain.admin.port.out.ImageStoragePort;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.admin.dto.request.ProjectCreateRequest;
import com.aiportfolio.backend.domain.admin.dto.request.ProjectUpdateRequest;
import com.aiportfolio.backend.domain.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.application.admin.mapper.ProjectResponseMapper;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectScreenshotJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectScreenshotJpaRepository;
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
    private final ProjectJpaRepository projectJpaRepository;
    private final ProjectScreenshotJpaRepository projectScreenshotJpaRepository;
    
    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public ProjectResponse createProject(ProjectCreateRequest request) {
        log.info("Creating new project: {}", request.getTitle());
        
        // 프로젝트 ID 자동 생성 (형식: proj-XXX)
        String projectId = generateProjectId();
        
        Project project = Project.builder()
                .id(projectId) // ID 필수 설정
                .title(request.getTitle())
                .description(request.getDescription())
                .readme(request.getReadme())
                .type(request.getType())
                .status(request.getStatus())
                .isTeam(request.getIsTeam())
                .role(request.getRole())
                .myContributions(request.getMyContributions())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .imageUrl(request.getImageUrl())
                .screenshots(request.getScreenshots())
                .githubUrl(request.getGithubUrl())
                .liveUrl(request.getLiveUrl())
                .externalUrl(request.getExternalUrl())
                .sortOrder(request.getSortOrder())
                .build();

        Project savedProject = portfolioRepositoryPort.saveProject(project);
        
        log.info("Project created successfully: {}", savedProject.getId());
        return projectResponseMapper.toResponse(savedProject);
    }
    
    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public ProjectResponse updateProject(String id, ProjectUpdateRequest request) {
        log.info("Updating project: {}", id);

        Project project = portfolioRepositoryPort.findProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));

        // 기존 이미지 URL 백업 (교체될 때 삭제해야 함)
        String oldImageUrl = project.getImageUrl();
        List<String> oldScreenshots = project.getScreenshots() != null 
            ? new java.util.ArrayList<>(project.getScreenshots()) 
            : null;

        // 필드 업데이트
        if (request.getTitle() != null) project.setTitle(request.getTitle());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getReadme() != null) project.setReadme(request.getReadme());
        if (request.getType() != null) project.setType(request.getType());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getIsTeam() != null) project.setTeam(request.getIsTeam());
        if (request.getRole() != null) project.setRole(request.getRole());
        if (request.getMyContributions() != null) project.setMyContributions(request.getMyContributions());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());
        
        // 이미지 URL 업데이트 - 빈 문자열도 허용 (값을 비우는 의도)
        // 빈 문자열 필터링은 Cloudinary 업로드 실패 시에만 적용되며,
        // 일반 업데이트에서는 빈 문자열을 null로 변환하지 않음 (저장 계층에서 처리)
        if (request.getImageUrl() != null) {
            project.setImageUrl(request.getImageUrl());
        }
        
        // 스크린샷 업데이트 - 빈 배열도 허용 (모든 스크린샷 제거 의도)
        // 빈 배열은 그대로 유지하여 저장 계층에서 처리하도록 함
        // 저장 계층에서 빈 값들은 필터링되지만, 빈 배열 자체는 null이 아닌 빈 리스트로 전달
        if (request.getScreenshots() != null) {
            // null 또는 빈 문자열인 URL만 필터링 (빈 배열은 유지)
            List<String> validScreenshots = request.getScreenshots().stream()
                .filter(url -> url != null && !url.trim().isEmpty())
                .collect(java.util.stream.Collectors.toList());
            // 빈 배열인 경우도 그대로 유지 (모든 스크린샷 제거 의도)
            project.setScreenshots(validScreenshots);
            log.debug("Filtered invalid screenshot URLs: {} -> {} (empty list preserved for removal intent)", 
                    request.getScreenshots().size(), validScreenshots.size());
        }
        if (request.getGithubUrl() != null) project.setGithubUrl(request.getGithubUrl());
        if (request.getLiveUrl() != null) project.setLiveUrl(request.getLiveUrl());
        if (request.getExternalUrl() != null) project.setExternalUrl(request.getExternalUrl());
        if (request.getSortOrder() != null) project.setSortOrder(request.getSortOrder());

        // 수정된 이미지 처리 (교체된 경우 기존 이미지 삭제)
        try {
            // 썸네일이 교체되었는지 확인
            if (request.getImageUrl() != null && !request.getImageUrl().equals(oldImageUrl)) {
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
            if (request.getScreenshots() != null) {
                // 빈 배열로 업데이트한 경우에도 처리
                List<String> newScreenshots = request.getScreenshots();
                
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

        // Cloudinary 이미지 삭제
        try {
            // 프로젝트 엔티티 조회 (스크린샷 정보 포함)
            Optional<ProjectJpaEntity> projectEntityOpt = projectJpaRepository.findByBusinessId(id);
            
            if (projectEntityOpt.isPresent()) {
                ProjectJpaEntity projectEntity = projectEntityOpt.get();
                
                // 썸네일 이미지 삭제
                if (project.getImageUrl() != null && project.getImageUrl().contains("cloudinary.com")) {
                    String publicId = imageStoragePort.extractPublicId(project.getImageUrl());
                    if (publicId != null) {
                        log.info("Deleting thumbnail image from Cloudinary: {}", publicId);
                        imageStoragePort.deleteImage(publicId);
                    }
                }

                // 스크린샷 이미지들 삭제 (엔티티에서 cloudinaryPublicId 직접 사용)
                if (projectEntity.getScreenshots() != null && !projectEntity.getScreenshots().isEmpty()) {
                    List<ProjectScreenshotJpaEntity> screenshotEntities = 
                        projectScreenshotJpaRepository.findAllById(projectEntity.getScreenshots());
                    
                    for (ProjectScreenshotJpaEntity screenshot : screenshotEntities) {
                        // cloudinaryPublicId가 있으면 직접 사용, 없으면 URL에서 추출
                        String publicId = screenshot.getCloudinaryPublicId();
                        if (publicId == null || publicId.isEmpty()) {
                            // fallback: URL에서 추출
                            if (screenshot.getImageUrl() != null && screenshot.getImageUrl().contains("cloudinary.com")) {
                                publicId = imageStoragePort.extractPublicId(screenshot.getImageUrl());
                            }
                        }
                        
                        if (publicId != null && !publicId.isEmpty()) {
                            log.info("Deleting screenshot from Cloudinary: {} (publicId: {})", 
                                screenshot.getImageUrl(), publicId);
                            imageStoragePort.deleteImage(publicId);
                        } else {
                            log.warn("Screenshot publicId를 찾을 수 없습니다: {}", screenshot.getImageUrl());
                        }
                    }
                }
            } else {
                log.warn("프로젝트 엔티티를 찾을 수 없어 이미지 삭제를 건너뜁니다: {}", id);
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
}
