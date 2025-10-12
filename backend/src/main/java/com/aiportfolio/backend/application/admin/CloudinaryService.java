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
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    /**
     * 단일 이미지 업로드
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary is not configured");
        }
        
        Map<String, Object> params = ObjectUtils.asMap(
            "folder", folder,
            "resource_type", "image",
            "transformation", Arrays.asList(
                ObjectUtils.asMap("width", 1000, "height", 1000, "crop", "limit")
            )
        );
        
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), params);
        String url = (String) result.get("secure_url");
        String publicId = (String) result.get("public_id");
        
        log.info("Image uploaded successfully: {} -> {}", publicId, url);
        return url;
    }
    
    /**
     * 다중 이미지 업로드
     */
    public List<String> uploadImages(List<MultipartFile> files, String folder) throws IOException {
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary is not configured");
        }
        
        return files.stream()
                .map(file -> {
                    try {
                        return uploadImage(file, folder);
                    } catch (IOException e) {
                        log.error("Failed to upload image: {}", file.getOriginalFilename(), e);
                        throw new RuntimeException("Failed to upload image: " + file.getOriginalFilename(), e);
                    }
                })
                .toList();
    }
    
    /**
     * 이미지 삭제
     */
    public void deleteImage(String publicId) throws Exception {
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary is not configured");
        }
        
        Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        log.info("Image deleted successfully: {}", publicId);
    }
    
    /**
     * Public ID 추출 (URL에서)
     */
    public String extractPublicId(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }
        
        try {
            // URL에서 public_id 추출
            String[] parts = imageUrl.split("/");
            if (parts.length >= 2) {
                String filename = parts[parts.length - 1];
                return filename.substring(0, filename.lastIndexOf('.'));
            }
        } catch (Exception e) {
            log.warn("Failed to extract public ID from URL: {}", imageUrl);
        }
        
        return null;
    }
}

