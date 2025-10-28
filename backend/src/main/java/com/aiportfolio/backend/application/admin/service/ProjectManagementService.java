package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.admin.port.in.ManageProjectUseCase;
import com.aiportfolio.backend.domain.admin.port.out.ImageStoragePort;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.admin.dto.request.ProjectCreateRequest;
import com.aiportfolio.backend.domain.admin.dto.request.ProjectUpdateRequest;
import com.aiportfolio.backend.domain.admin.dto.response.ProjectResponse;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.application.admin.mapper.ProjectResponseMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        if (request.getImageUrl() != null) project.setImageUrl(request.getImageUrl());
        if (request.getScreenshots() != null) project.setScreenshots(request.getScreenshots());
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
            if (request.getScreenshots() != null && oldScreenshots != null) {
                // 기존 스크린샷 중 새로운 목록에 없는 것 찾기
                for (String oldScreenshot : oldScreenshots) {
                    if (oldScreenshot != null && oldScreenshot.contains("cloudinary.com")) {
                        boolean stillExists = request.getScreenshots().stream()
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
        } catch (Exception e) {
            log.error("Failed to delete old images from Cloudinary during update: {}", id, e);
            // 이미지 삭제 실패해도 업데이트는 계속 진행
        }

        Project updatedProject = portfolioRepositoryPort.updateProject(project);
        
        log.info("Project updated successfully: {}", updatedProject.getId());
        return projectResponseMapper.toResponse(updatedProject);
    }
    
    @Override
    public void deleteProject(String id) {
        log.info("Deleting project: {}", id);

        // 프로젝트 존재 여부 확인
        Project project = portfolioRepositoryPort.findProjectById(id)
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + id));

        // Cloudinary 이미지 삭제
        try {
            // 썸네일 이미지 삭제
            if (project.getImageUrl() != null && project.getImageUrl().contains("cloudinary.com")) {
                String publicId = imageStoragePort.extractPublicId(project.getImageUrl());
                if (publicId != null) {
                    log.info("Deleting thumbnail image from Cloudinary: {}", publicId);
                    imageStoragePort.deleteImage(publicId);
                }
            }

            // 스크린샷 이미지들 삭제
            if (project.getScreenshots() != null) {
                for (String screenshotUrl : project.getScreenshots()) {
                    if (screenshotUrl != null && screenshotUrl.contains("cloudinary.com")) {
                        String publicId = imageStoragePort.extractPublicId(screenshotUrl);
                        if (publicId != null) {
                            log.info("Deleting screenshot from Cloudinary: {}", publicId);
                            imageStoragePort.deleteImage(publicId);
                        }
                    }
                }
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
     * 형식: proj-XXX (예: proj-001, proj-002)
     */
    private String generateProjectId() {
        // 현재 시간 기반 고유 ID 생성
        String timestamp = String.valueOf(System.currentTimeMillis());
        return "proj-" + timestamp.substring(timestamp.length() - 6);
    }
}
