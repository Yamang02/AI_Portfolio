package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.admin.port.in.UploadImageUseCase;
import com.aiportfolio.backend.domain.admin.port.in.ManageProjectUseCase;
import com.aiportfolio.backend.domain.admin.port.in.SearchProjectsUseCase;
import com.aiportfolio.backend.domain.admin.model.command.ProjectUpdateCommand;
import com.aiportfolio.backend.infrastructure.web.admin.dto.ImageUploadResponse;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 관리자 이미지 업로드 컨트롤러
 * Cloudinary를 통한 이미지 업로드 및 관리를 담당합니다.
 */
@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
@Slf4j
public class AdminUploadController {

    private final UploadImageUseCase uploadImageUseCase;
    private final ManageProjectUseCase manageProjectUseCase;
    private final SearchProjectsUseCase searchProjectsUseCase;

    /**
     * 단일 이미지 업로드
     * @param file 업로드할 이미지 파일
     * @param type 이미지 타입 (project, screenshots, skill, profile 등)
     * @param projectId 프로젝트 ID (선택사항, 제공되면 자동으로 DB에 저장)
     * @param request HTTP 요청 (인증 확인용)
     */
    @PostMapping("/image")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type,
            @RequestParam(value = "projectId", required = false) String projectId) {

        log.debug("Image upload request - type: {}, filename: {}, projectId: {}", 
                type, file.getOriginalFilename(), projectId);

        try {
            // 파일 유효성 검사
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("파일이 비어있습니다", "잘못된 요청"));
            }

            if (!isValidImageFile(file)) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("지원하지 않는 이미지 형식입니다", "잘못된 요청"));
            }

            // 폴더 경로 결정
            String folder = getFolderPath(type);

            // 이미지 업로드
            String url = uploadImageUseCase.uploadImage(file, folder);
            
            // 업로드 성공 여부 및 URL 유효성 검증
            if (url == null || url.trim().isEmpty()) {
                log.error("Image upload returned null or empty URL");
                return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("이미지 업로드는 성공했지만 URL을 받지 못했습니다", "업로드 실패"));
            }
            
            String publicId = extractPublicIdFromUrl(url);
            log.info("Image uploaded successfully: {} -> {}", publicId, url);

            // 프로젝트 ID가 제공되고 타입이 project 또는 screenshots이면 자동으로 DB에 저장
            // 업로드가 성공하고 URL이 유효한 경우에만 DB 업데이트 수행
            if (projectId != null && !projectId.isEmpty() && !projectId.equals("new")) {
                try {
                    if ("project".equals(type)) {
                        // 썸네일 업로드 - 프로젝트 imageUrl 업데이트
                        log.debug("Auto-saving thumbnail to DB: projectId={}, url={}", projectId, url);
                        ProjectUpdateCommand updateCommand = ProjectUpdateCommand.builder()
                                .imageUrl(url)
                                .build();
                        manageProjectUseCase.updateProject(projectId, updateCommand);
                        log.info("Project thumbnail saved to DB automatically: projectId={}, url={}", projectId, url);
                    } else if ("screenshots".equals(type)) {
                        // 스크린샷 업로드 - 프로젝트 screenshots에 추가
                        log.debug("Auto-saving screenshot to DB: projectId={}, url={}", projectId, url);
                        var existingProject = searchProjectsUseCase.getProjectById(projectId);
                        List<String> existingScreenshots = existingProject.getScreenshots() != null
                            ? existingProject.getScreenshots().stream()
                                .filter(imageUrl -> imageUrl != null && !imageUrl.trim().isEmpty())
                                .collect(Collectors.toList())
                            : new ArrayList<String>();
                        
                        // 새 스크린샷 URL 추가 (중복 방지 및 빈 값 필터링)
                        if (!existingScreenshots.contains(url) && !url.trim().isEmpty()) {
                            existingScreenshots.add(url);
                            
                            ProjectUpdateCommand updateCommand = ProjectUpdateCommand.builder()
                                    .screenshots(existingScreenshots)
                                    .build();
                            manageProjectUseCase.updateProject(projectId, updateCommand);
                            log.info("Project screenshot saved to DB automatically: projectId={}, url={}, totalScreenshots={}", 
                                    projectId, url, existingScreenshots.size());
                        } else {
                            log.warn("Screenshot URL already exists or is empty, skipping: projectId={}, url={}", projectId, url);
                        }
                    }
                } catch (Exception e) {
                    log.error("Failed to auto-save image to project in DB: projectId={}, type={}, error={}", 
                            projectId, type, e.getMessage(), e);
                    // DB 저장 실패 시 트랜잭션 롤백되므로 DB는 변경되지 않음
                    // 하지만 Cloudinary에는 이미 업로드되어 있으므로, 사용자에게 실패 응답 반환
                    // TODO: 향후 보상 트랜잭션(Compensating Transaction) 패턴으로 Cloudinary 이미지 삭제 고려
                    return ResponseEntity.internalServerError()
                        .body(ApiResponse.error(
                            "이미지 업로드는 성공했지만 DB 저장에 실패했습니다. 이미지는 Cloudinary에 저장되었지만 프로젝트 정보는 업데이트되지 않았습니다.", 
                            "DB 저장 실패"));
                }
            } else {
                log.debug("Skipping auto-save: projectId={}, type={}", projectId, type);
            }

            ImageUploadResponse response = ImageUploadResponse.builder()
                .url(url)
                .publicId(publicId)
                .build();

            return ResponseEntity.ok(ApiResponse.success(response, "이미지 업로드 성공"));

        } catch (org.springframework.web.multipart.MaxUploadSizeExceededException e) {
            log.warn("File upload size exceeded: {}", file.getOriginalFilename(), e);
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(ApiResponse.error("파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.", "파일 크기 제한 초과"));
        } catch (Exception e) {
            log.error("Image upload failed: {}", file.getOriginalFilename(), e);
            String errorMessage = "이미지 업로드 중 오류가 발생했습니다";
            if (e.getMessage() != null && e.getMessage().contains("크기")) {
                errorMessage = e.getMessage();
            }
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(errorMessage, "업로드 실패"));
        }
    }

    /**
     * 다중 이미지 업로드
     * @param files 업로드할 이미지 파일들
     * @param type 이미지 타입 (project, screenshots, skill, profile 등)
     * @param projectId 프로젝트 ID (선택사항, 제공되면 자동으로 DB에 저장)
     * @param request HTTP 요청 (인증 확인용)
     */
    @PostMapping("/images")
    public ResponseEntity<ApiResponse<List<String>>> uploadImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("type") String type,
            @RequestParam(value = "projectId", required = false) String projectId) {

        log.debug("Multiple image upload request - type: {}, count: {}, projectId: {}", 
                type, files.size(), projectId);

        try {
            // 파일 유효성 검사
            if (files.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("업로드할 파일이 없습니다", "잘못된 요청"));
            }

            for (MultipartFile file : files) {
                if (file.isEmpty() || !isValidImageFile(file)) {
                    return ResponseEntity.badRequest()
                        .body(ApiResponse.error("유효하지 않은 파일이 포함되어 있습니다", "잘못된 요청"));
                }
            }

            // 폴더 경로 결정
            String folder = getFolderPath(type);

            // 이미지 업로드
            List<String> urls = uploadImageUseCase.uploadImages(files, folder);

            // 업로드된 URL 유효성 검증 (null 및 빈 문자열 필터링)
            List<String> validUrls = urls.stream()
                .filter(url -> url != null && !url.trim().isEmpty())
                .collect(Collectors.toList());
            
            if (validUrls.size() != urls.size()) {
                log.warn("Some images failed to upload. Expected: {}, Got: {}", urls.size(), validUrls.size());
            }
            
            // 모든 업로드가 실패한 경우
            if (validUrls.isEmpty()) {
                log.error("All image uploads failed or returned invalid URLs");
                return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("모든 이미지 업로드에 실패했습니다", "업로드 실패"));
            }

            log.info("Multiple images uploaded successfully: {}/{} files", validUrls.size(), files.size());

            // 프로젝트 ID가 제공되고 타입이 screenshots이면 자동으로 DB에 저장
            // 업로드가 성공하고 URL이 유효한 경우에만 DB 업데이트 수행
            if (projectId != null && !projectId.isEmpty() && !projectId.equals("new") && "screenshots".equals(type)) {
                try {
                    log.debug("Auto-saving {} screenshots to DB: projectId={}", validUrls.size(), projectId);
                    // 기존 프로젝트 조회
                    var existingProject = searchProjectsUseCase.getProjectById(projectId);
                    List<String> existingScreenshots = existingProject.getScreenshots() != null
                        ? existingProject.getScreenshots().stream()
                            .filter(imageUrl -> imageUrl != null && !imageUrl.trim().isEmpty())
                            .collect(Collectors.toList())
                        : new ArrayList<String>();
                    
                    // 새 스크린샷 URL들 추가 (중복 방지 및 빈 값 필터링)
                    int addedCount = 0;
                    for (String newUrl : validUrls) {
                        if (!existingScreenshots.contains(newUrl) && !newUrl.trim().isEmpty()) {
                            existingScreenshots.add(newUrl);
                            addedCount++;
                        }
                    }
                    
                    if (addedCount > 0) {
                        ProjectUpdateCommand updateCommand = ProjectUpdateCommand.builder()
                                .screenshots(existingScreenshots)
                                .build();
                        manageProjectUseCase.updateProject(projectId, updateCommand);
                        log.info("Project screenshots saved to DB automatically: projectId={}, added={}/{}, total={}", 
                                projectId, addedCount, validUrls.size(), existingScreenshots.size());
                    } else {
                        log.warn("All screenshot URLs already exist or are invalid, skipping: projectId={}", projectId);
                    }
                } catch (Exception e) {
                    log.error("Failed to auto-save screenshots to project in DB: projectId={}, error={}", 
                            projectId, e.getMessage(), e);
                    // DB 저장 실패 시 트랜잭션 롤백되므로 DB는 변경되지 않음
                    // 하지만 Cloudinary에는 이미 업로드되어 있으므로, 사용자에게 실패 응답 반환
                    // TODO: 향후 보상 트랜잭션(Compensating Transaction) 패턴으로 Cloudinary 이미지 삭제 고려
                    return ResponseEntity.internalServerError()
                        .body(ApiResponse.error(
                            String.format("이미지 업로드는 성공했지만 DB 저장에 실패했습니다. %d개의 이미지가 Cloudinary에 저장되었지만 프로젝트 정보는 업데이트되지 않았습니다.", validUrls.size()), 
                            "DB 저장 실패"));
                }
            } else {
                log.debug("Skipping auto-save: projectId={}, type={}", projectId, type);
            }
            
            // 유효한 URL만 반환
            urls = validUrls;

            return ResponseEntity.ok(ApiResponse.success(urls, "이미지 업로드 성공"));

        } catch (org.springframework.web.multipart.MaxUploadSizeExceededException e) {
            log.warn("File upload size exceeded in batch upload", e);
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(ApiResponse.error("파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.", "파일 크기 제한 초과"));
        } catch (Exception e) {
            log.error("Multiple image upload failed", e);
            String errorMessage = "이미지 업로드 중 오류가 발생했습니다";
            if (e.getMessage() != null && e.getMessage().contains("크기")) {
                errorMessage = e.getMessage();
            }
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(errorMessage, "업로드 실패"));
        }
    }

    /**
     * 이미지 삭제
     */
    @DeleteMapping("/image/{publicId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable String publicId) {
        log.debug("Image deletion request: {}", publicId);

        try {
            uploadImageUseCase.deleteImage(publicId);

            log.info("Image deleted successfully: {}", publicId);

            return ResponseEntity.ok(ApiResponse.success(null, "이미지 삭제 성공"));

        } catch (Exception e) {
            log.error("Image deletion failed: {}", publicId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("이미지 삭제 중 오류가 발생했습니다", "삭제 실패"));
        }
    }

    /**
     * 이미지 파일 유효성 검사
     */
    private boolean isValidImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    /**
     * URL에서 public ID를 추출합니다.
     */
    private String extractPublicIdFromUrl(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            // URL에서 public ID 추출
            // 예: https://res.cloudinary.com/cloud/image/upload/v1234567890/folder/image.jpg
            // -> folder/image
            String[] parts = url.split("/");
            if (parts.length >= 8) {
                String folder = parts[parts.length - 2];
                String filename = parts[parts.length - 1];
                String nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));
                return folder + "/" + nameWithoutExtension;
            }
        } catch (Exception e) {
            log.warn("Failed to extract public ID from URL: {}", url, e);
        }
        
        return null;
    }

    /**
     * 타입에 따른 폴더 경로 결정
     */
    private String getFolderPath(String type) {
        return switch (type.toLowerCase()) {
            case "project" -> "portfolio/projects";
            case "skill" -> "portfolio/skills";
            case "profile" -> "portfolio/profile";
            case "screenshots" -> "portfolio/projects/screenshots";
            case "article-thumbnail" -> "portfolio/articles/thumbnails";
            case "article-content" -> "portfolio/articles/content";
            default -> "portfolio/misc";
        };
    }
}
