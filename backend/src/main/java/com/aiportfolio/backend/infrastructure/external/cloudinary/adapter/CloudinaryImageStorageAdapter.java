package com.aiportfolio.backend.infrastructure.external.cloudinary.adapter;

import com.aiportfolio.backend.domain.admin.port.out.ImageStoragePort;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Cloudinary 이미지 저장소 어댑터
 * ImageStoragePort 인터페이스의 Cloudinary 구현체
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CloudinaryImageStorageAdapter implements ImageStoragePort {
    
    private final Cloudinary cloudinary;
    
    @Override
    public String uploadImage(byte[] imageData, String folder, ImageMetadata metadata) {
        log.debug("Uploading image to folder: {}", folder);
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> params = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image",
                "transformation", Arrays.asList(
                    ObjectUtils.asMap(
                        "width", metadata.getMaxWidth(),
                        "height", metadata.getMaxHeight(),
                        "crop", "limit",
                        "quality", metadata.getQuality(),
                        "format", metadata.getFormat()
                    )
                )
            );
            
            Map<?, ?> result = cloudinary.uploader().upload(imageData, params);
            String url = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");
            
            log.info("Image uploaded successfully: {} -> {}", publicId, url);
            return url;
            
        } catch (IOException e) {
            log.error("Failed to upload image to folder: {}", folder, e);
            throw new RuntimeException("이미지 업로드 실패: " + e.getMessage(), e);
        }
    }
    
    @Override
    public List<String> uploadImages(List<byte[]> imagesData, String folder, ImageMetadata metadata) {
        log.debug("Uploading {} images to folder: {}", imagesData.size(), folder);
        
        return imagesData.stream()
            .map(imageData -> {
                try {
                    return uploadImage(imageData, folder, metadata);
                } catch (Exception e) {
                    log.error("Failed to upload image in batch", e);
                    throw new RuntimeException("배치 이미지 업로드 실패: " + e.getMessage(), e);
                }
            })
            .collect(Collectors.toList());
    }
    
    @Override
    public void deleteImage(String publicId) {
        log.debug("Deleting image: {}", publicId);
        
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String resultStatus = (String) result.get("result");
            
            if ("ok".equals(resultStatus)) {
                log.info("Image deleted successfully: {}", publicId);
            } else {
                log.warn("Image deletion result: {} for {}", resultStatus, publicId);
            }
            
        } catch (Exception e) {
            log.error("Failed to delete image: {}", publicId, e);
            throw new RuntimeException("이미지 삭제 실패: " + e.getMessage(), e);
        }
    }
    
    @Override
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
    
    @Override
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
