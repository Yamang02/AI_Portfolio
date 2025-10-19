package com.aiportfolio.backend.application.admin;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Cloudinary 이미지 업로드 서비스
 * 이미지 업로드, 삭제, 최적화를 담당합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * 단일 이미지를 업로드합니다.
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        log.debug("Uploading image to folder: {}", folder);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> params = ObjectUtils.asMap(
            "folder", folder,
            "resource_type", "image",
            "transformation", Arrays.asList(
                ObjectUtils.asMap(
                    "width", 1000,
                    "height", 1000,
                    "crop", "limit",
                    "quality", "auto",
                    "format", "auto"
                )
            )
        );
        
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), params);
        String url = (String) result.get("secure_url");
        String publicId = (String) result.get("public_id");
        
        log.info("Image uploaded successfully: {} -> {}", publicId, url);
        return url;
    }

    /**
     * 다중 이미지를 업로드합니다.
     */
    public List<String> uploadImages(List<MultipartFile> files, String folder) throws IOException {
        log.debug("Uploading {} images to folder: {}", files.size(), folder);
        
        return files.stream()
            .map(file -> {
                try {
                    return uploadImage(file, folder);
                } catch (IOException e) {
                    log.error("Failed to upload image: {}", file.getOriginalFilename(), e);
                    throw new RuntimeException("이미지 업로드 실패: " + file.getOriginalFilename(), e);
                }
            })
            .toList();
    }

    /**
     * 이미지를 삭제합니다.
     */
    public void deleteImage(String publicId) throws Exception {
        log.debug("Deleting image: {}", publicId);
        
        Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        String resultStatus = (String) result.get("result");
        
        if ("ok".equals(resultStatus)) {
            log.info("Image deleted successfully: {}", publicId);
        } else {
            log.warn("Image deletion result: {} for {}", resultStatus, publicId);
        }
    }

    /**
     * URL에서 public ID를 추출합니다.
     */
    public String extractPublicId(String url) {
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
     * 이미지 URL을 최적화된 형태로 변환합니다.
     */
    public String optimizeImageUrl(String url, int width, int height) {
        if (url == null || !url.contains("cloudinary.com")) {
            return url;
        }
        
        try {
            String publicId = extractPublicId(url);
            if (publicId != null) {
                return cloudinary.url()
                    .transformation(new com.cloudinary.Transformation()
                        .width(width)
                        .height(height)
                        .crop("limit")
                        .quality("auto")
                        .fetchFormat("auto"))
                    .generate(publicId);
            }
        } catch (Exception e) {
            log.warn("Failed to optimize image URL: {}", url, e);
        }
        
        return url;
    }
}