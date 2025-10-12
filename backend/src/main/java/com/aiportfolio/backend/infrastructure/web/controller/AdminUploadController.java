package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.application.admin.CloudinaryService;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.admin.ImageUploadResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * 관리자 이미지 업로드 컨트롤러
 */
@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
@Slf4j
public class AdminUploadController {

    private final CloudinaryService cloudinaryService;

    /**
     * 단일 이미지 업로드
     */
    @PostMapping("/image")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "project") String type) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("파일이 비어있습니다"));
            }

            String folder = "portfolio/" + type;
            String url = cloudinaryService.uploadImage(file, folder);
            
            // Public ID 추출 (간단한 방식)
            String publicId = extractPublicIdFromUrl(url);
            
            ImageUploadResponse response = ImageUploadResponse.success(url, publicId);
            return ResponseEntity.ok(ApiResponse.success(response, "이미지 업로드 성공"));

        } catch (IOException e) {
            log.error("Image upload failed", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("이미지 업로드 중 오류가 발생했습니다"));
        } catch (IllegalStateException e) {
            log.error("Cloudinary not configured", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("이미지 서비스가 구성되지 않았습니다"));
        }
    }

    /**
     * 다중 이미지 업로드
     */
    @PostMapping("/images")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "type", defaultValue = "screenshots") String type) {
        
        try {
            if (files.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("파일이 비어있습니다"));
            }

            String folder = "portfolio/" + type;
            List<String> urls = cloudinaryService.uploadImages(files, folder);
            
            // Public IDs 추출
            List<String> publicIds = urls.stream()
                    .map(this::extractPublicIdFromUrl)
                    .toList();
            
            ImageUploadResponse response = ImageUploadResponse.success(urls, publicIds);
            return ResponseEntity.ok(ApiResponse.success(response, "이미지 업로드 성공"));

        } catch (IOException e) {
            log.error("Multiple image upload failed", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("이미지 업로드 중 오류가 발생했습니다"));
        } catch (IllegalStateException e) {
            log.error("Cloudinary not configured", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("이미지 서비스가 구성되지 않았습니다"));
        }
    }

    /**
     * 이미지 삭제
     */
    @DeleteMapping("/image/{publicId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable String publicId) {
        try {
            cloudinaryService.deleteImage(publicId);
            return ResponseEntity.ok(ApiResponse.success(null, "이미지 삭제 성공"));

        } catch (Exception e) {
            log.error("Image deletion failed: {}", publicId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("이미지 삭제 중 오류가 발생했습니다"));
        }
    }

    /**
     * URL에서 Public ID 추출 (간단한 방식)
     */
    private String extractPublicIdFromUrl(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            String[] parts = url.split("/");
            if (parts.length >= 2) {
                String filename = parts[parts.length - 1];
                return filename.substring(0, filename.lastIndexOf('.'));
            }
        } catch (Exception e) {
            log.warn("Failed to extract public ID from URL: {}", url);
        }
        
        return null;
    }
}

