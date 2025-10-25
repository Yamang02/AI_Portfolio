package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.admin.port.in.UploadImageUseCase;
import com.aiportfolio.backend.domain.admin.model.dto.ImageUploadResponse;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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

    /**
     * 단일 이미지 업로드
     */
    @PostMapping("/image")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {

        log.debug("Image upload request - type: {}, filename: {}", type, file.getOriginalFilename());

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
            String publicId = extractPublicIdFromUrl(url);

            log.info("Image uploaded successfully: {} -> {}", publicId, url);

            ImageUploadResponse response = ImageUploadResponse.builder()
                .url(url)
                .publicId(publicId)
                .build();

            return ResponseEntity.ok(ApiResponse.success(response, "이미지 업로드 성공"));

        } catch (Exception e) {
            log.error("Image upload failed: {}", file.getOriginalFilename(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("이미지 업로드 중 오류가 발생했습니다", "업로드 실패"));
        }
    }

    /**
     * 다중 이미지 업로드
     */
    @PostMapping("/images")
    public ResponseEntity<ApiResponse<List<String>>> uploadImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("type") String type) {

        log.debug("Multiple image upload request - type: {}, count: {}", type, files.size());

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

            log.info("Multiple images uploaded successfully: {} files", files.size());

            return ResponseEntity.ok(ApiResponse.success(urls, "이미지 업로드 성공"));

        } catch (Exception e) {
            log.error("Multiple image upload failed", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("이미지 업로드 중 오류가 발생했습니다", "업로드 실패"));
        }
    }

    /**
     * 이미지 삭제
     */
    @DeleteMapping("/image/{publicId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable String publicId) {
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
            default -> "portfolio/misc";
        };
    }
}
