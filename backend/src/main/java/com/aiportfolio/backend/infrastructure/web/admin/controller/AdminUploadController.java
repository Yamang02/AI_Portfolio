package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.admin.port.in.UploadImageUseCase;
import com.aiportfolio.backend.domain.admin.port.in.ManageProjectUseCase;
import com.aiportfolio.backend.domain.admin.port.in.SearchProjectsUseCase;
import com.aiportfolio.backend.domain.admin.model.command.ProjectUpdateCommand;
import com.aiportfolio.backend.infrastructure.web.admin.dto.ImageUploadResponse;
import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 관리자 이미지 업로드 컨트롤러
 * Cloudinary를 통한 이미지 업로드 및 관리를 담당합니다.
 */
@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
@Slf4j
public class AdminUploadController {
    private static final String TYPE_SCREENSHOTS = "screenshots";

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
            return validateSingleUploadFile(file)
                    .orElseGet(() -> uploadImageAfterValidation(file, type, projectId));
        } catch (org.springframework.web.multipart.MaxUploadSizeExceededException e) {
            log.warn("File upload size exceeded: {}", file.getOriginalFilename(), e);
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(ApiResponse.error(WebApiResponseMessages.UPLOAD_MAX_SIZE_10MB_DETAIL, WebApiResponseMessages.LABEL_PAYLOAD_TOO_LARGE));
        } catch (Exception e) {
            log.error("Image upload failed: {}", file.getOriginalFilename(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(resolveUploadErrorMessage(e), WebApiResponseMessages.LABEL_UPLOAD_FAILED));
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
            return validateBatchUploadFiles(files)
                    .orElseGet(() -> uploadImagesAfterValidation(files, type, projectId));
        } catch (org.springframework.web.multipart.MaxUploadSizeExceededException e) {
            log.warn("File upload size exceeded in batch upload", e);
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(ApiResponse.error(WebApiResponseMessages.UPLOAD_MAX_SIZE_10MB_DETAIL, WebApiResponseMessages.LABEL_PAYLOAD_TOO_LARGE));
        } catch (Exception e) {
            log.error("Multiple image upload failed", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(resolveUploadErrorMessage(e), WebApiResponseMessages.LABEL_UPLOAD_FAILED));
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

            return ResponseEntity.ok(ApiResponse.success(null, WebApiResponseMessages.IMAGE_DELETE_SUCCESS));

        } catch (Exception e) {
            log.error("Image deletion failed: {}", publicId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error(WebApiResponseMessages.IMAGE_DELETE_ERROR, WebApiResponseMessages.LABEL_DELETE_FAILED));
        }
    }

    private ResponseEntity<ApiResponse<ImageUploadResponse>> uploadImageAfterValidation(
            MultipartFile file, String type, String projectId) {
        String folder = getFolderPath(type);
        String url = uploadImageUseCase.uploadImage(file, folder);
        return validateNonEmptyUploadUrl(url)
                .orElseGet(() -> finalizeSingleImageUpload(projectId, type, url));
    }

    private ResponseEntity<ApiResponse<ImageUploadResponse>> finalizeSingleImageUpload(
            String projectId, String type, String url) {
        String publicId = extractPublicIdFromUrl(url);
        log.info("Image uploaded successfully: {} -> {}", publicId, url);
        return tryAutoSaveUploadedImageToProject(projectId, type, url)
                .orElseGet(() -> {
                    if (!hasPersistableProjectId(projectId)) {
                        log.debug("Skipping auto-save: projectId={}, type={}", projectId, type);
                    }
                    ImageUploadResponse response = ImageUploadResponse.builder()
                            .url(url)
                            .publicId(publicId)
                            .build();
                    return ResponseEntity.ok(ApiResponse.success(response, WebApiResponseMessages.IMAGE_UPLOAD_SUCCESS));
                });
    }

    private ResponseEntity<ApiResponse<List<String>>> uploadImagesAfterValidation(
            List<MultipartFile> files, String type, String projectId) {
        String folder = getFolderPath(type);
        List<String> urls = uploadImageUseCase.uploadImages(files, folder);
        List<String> validUrls = filterNonEmptyUrls(urls);
        if (validUrls.size() != urls.size()) {
            log.warn("Some images failed to upload. Expected: {}, Got: {}", urls.size(), validUrls.size());
        }
        return validateBatchHasAtLeastOneUrl(validUrls)
                .orElseGet(() -> finalizeBatchImageUpload(projectId, type, files, validUrls));
    }

    private ResponseEntity<ApiResponse<List<String>>> finalizeBatchImageUpload(
            String projectId, String type, List<MultipartFile> files, List<String> validUrls) {
        log.info("Multiple images uploaded successfully: {}/{} files", validUrls.size(), files.size());
        return tryAutoSaveBatchScreenshots(projectId, type, validUrls)
                .orElseGet(() -> {
                    if (!hasPersistableProjectId(projectId) || !TYPE_SCREENSHOTS.equals(type)) {
                        log.debug("Skipping auto-save: projectId={}, type={}", projectId, type);
                    }
                    return ResponseEntity.ok(ApiResponse.success(validUrls, WebApiResponseMessages.IMAGE_UPLOAD_SUCCESS));
                });
    }

    /**
     * 이미지 파일 유효성 검사
     */
    private Optional<ResponseEntity<ApiResponse<ImageUploadResponse>>> validateSingleUploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            return Optional.of(ResponseEntity.badRequest()
                    .body(ApiResponse.error(WebApiResponseMessages.UPLOAD_FILE_EMPTY, WebApiResponseMessages.LABEL_BAD_REQUEST)));
        }
        if (!isValidImageFile(file)) {
            return Optional.of(ResponseEntity.badRequest()
                    .body(ApiResponse.error(WebApiResponseMessages.UPLOAD_UNSUPPORTED_IMAGE_TYPE, WebApiResponseMessages.LABEL_BAD_REQUEST)));
        }
        return Optional.empty();
    }

    private Optional<ResponseEntity<ApiResponse<ImageUploadResponse>>> validateNonEmptyUploadUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            log.error("Image upload returned null or empty URL");
            return Optional.of(ResponseEntity.internalServerError()
                    .body(ApiResponse.error(WebApiResponseMessages.UPLOAD_URL_MISSING, WebApiResponseMessages.LABEL_UPLOAD_FAILED)));
        }
        return Optional.empty();
    }

    private Optional<ResponseEntity<ApiResponse<List<String>>>> validateBatchUploadFiles(List<MultipartFile> files) {
        if (files.isEmpty()) {
            return Optional.of(ResponseEntity.badRequest()
                    .body(ApiResponse.error(WebApiResponseMessages.UPLOAD_NO_FILES, WebApiResponseMessages.LABEL_BAD_REQUEST)));
        }
        for (MultipartFile file : files) {
            if (file.isEmpty() || !isValidImageFile(file)) {
                return Optional.of(ResponseEntity.badRequest()
                        .body(ApiResponse.error(WebApiResponseMessages.UPLOAD_INVALID_FILES_IN_BATCH, WebApiResponseMessages.LABEL_BAD_REQUEST)));
            }
        }
        return Optional.empty();
    }

    private static List<String> filterNonEmptyUrls(List<String> urls) {
        return urls.stream()
                .filter(u -> u != null && !u.trim().isEmpty())
                .toList();
    }

    private Optional<ResponseEntity<ApiResponse<List<String>>>> validateBatchHasAtLeastOneUrl(List<String> validUrls) {
        if (validUrls.isEmpty()) {
            log.error("All image uploads failed or returned invalid URLs");
            return Optional.of(ResponseEntity.internalServerError()
                    .body(ApiResponse.error(WebApiResponseMessages.UPLOAD_ALL_IMAGES_FAILED, WebApiResponseMessages.LABEL_UPLOAD_FAILED)));
        }
        return Optional.empty();
    }

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
            case TYPE_SCREENSHOTS -> "portfolio/projects/screenshots";
            case "article-thumbnail" -> "portfolio/articles/thumbnails";
            case "article-content" -> "portfolio/articles/content";
            default -> "portfolio/misc";
        };
    }

    private String resolveUploadErrorMessage(Exception exception) {
        if (exception.getMessage() != null && exception.getMessage().contains("크기")) {
            return exception.getMessage();
        }
        return WebApiResponseMessages.UPLOAD_GENERIC_ERROR;
    }

    private boolean hasPersistableProjectId(String projectId) {
        return projectId != null && !projectId.isEmpty() && !"new".equals(projectId);
    }

    /**
     * 단일 업로드 후 프로젝트/스크린샷 DB 반영. 실패 시 오류 응답을 담은 Optional, 스킵·성공 시 empty.
     */
    private Optional<ResponseEntity<ApiResponse<ImageUploadResponse>>> tryAutoSaveUploadedImageToProject(
            String projectId, String type, String url) {
        if (!hasPersistableProjectId(projectId)) {
            return Optional.empty();
        }
        try {
            if ("project".equals(type)) {
                log.debug("Auto-saving thumbnail to DB: projectId={}, url={}", projectId, url);
                ProjectUpdateCommand updateCommand = ProjectUpdateCommand.builder()
                        .imageUrl(url)
                        .build();
                manageProjectUseCase.updateProject(projectId, updateCommand);
                log.info("Project thumbnail saved to DB automatically: projectId={}, url={}", projectId, url);
            } else if (TYPE_SCREENSHOTS.equals(type)) {
                log.debug("Auto-saving screenshot to DB: projectId={}, url={}", projectId, url);
                List<String> existingScreenshots = getExistingScreenshots(projectId);
                if (addUniqueScreenshot(existingScreenshots, url)) {
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
            return Optional.empty();
        } catch (Exception e) {
            log.error("Failed to auto-save image to project in DB: projectId={}, type={}, error={}",
                    projectId, type, e.getMessage(), e);
            return Optional.of(ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            WebApiResponseMessages.UPLOAD_DB_SAVE_FAILED_SINGLE,
                            WebApiResponseMessages.LABEL_DB_SAVE_FAILED)));
        }
    }

    private Optional<ResponseEntity<ApiResponse<List<String>>>> tryAutoSaveBatchScreenshots(
            String projectId, String type, List<String> validUrls) {
        if (!hasPersistableProjectId(projectId) || !TYPE_SCREENSHOTS.equals(type)) {
            return Optional.empty();
        }
        try {
            log.debug("Auto-saving {} screenshots to DB: projectId={}", validUrls.size(), projectId);
            List<String> existingScreenshots = getExistingScreenshots(projectId);
            int addedCount = 0;
            for (String newUrl : validUrls) {
                if (addUniqueScreenshot(existingScreenshots, newUrl)) {
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
            return Optional.empty();
        } catch (Exception e) {
            log.error("Failed to auto-save screenshots to project in DB: projectId={}, error={}",
                    projectId, e.getMessage(), e);
            return Optional.of(ResponseEntity.internalServerError()
                    .body(ApiResponse.error(
                            WebApiResponseMessages.uploadDbSaveFailedMultiMessage(validUrls.size()),
                            WebApiResponseMessages.LABEL_DB_SAVE_FAILED)));
        }
    }

    private List<String> getExistingScreenshots(String projectId) {
        var existingProject = searchProjectsUseCase.getProjectById(projectId);
        if (existingProject.getScreenshots() == null) {
            return new ArrayList<>();
        }
        return existingProject.getScreenshots().stream()
                .filter(imageUrl -> imageUrl != null && !imageUrl.trim().isEmpty())
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    }

    private boolean addUniqueScreenshot(List<String> existingScreenshots, String newUrl) {
        return !existingScreenshots.contains(newUrl) && newUrl != null && !newUrl.trim().isEmpty();
    }
}
