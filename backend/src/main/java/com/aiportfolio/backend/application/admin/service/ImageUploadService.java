package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.admin.port.in.UploadImageUseCase;
import com.aiportfolio.backend.domain.admin.port.out.ImageStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 이미지 업로드 서비스
 * UploadImageUseCase 인터페이스의 구현체
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ImageUploadService implements UploadImageUseCase {
    
    private final ImageStoragePort imageStoragePort;
    
    @Override
    public String uploadImage(MultipartFile file, String folder) {
        log.debug("Uploading image to folder: {}", folder);
        
        try {
            byte[] imageData = file.getBytes();
            ImageStoragePort.ImageMetadata metadata = ImageStoragePort.ImageMetadata.defaultMetadata();
            
            return imageStoragePort.uploadImage(imageData, folder, metadata);
            
        } catch (IOException e) {
            log.error("Failed to upload image: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("이미지 업로드 실패: " + file.getOriginalFilename(), e);
        }
    }
    
    @Override
    public List<String> uploadImages(List<MultipartFile> files, String folder) {
        log.debug("Uploading {} images to folder: {}", files.size(), folder);
        
        try {
            List<byte[]> imagesData = files.stream()
                .map(file -> {
                    try {
                        return file.getBytes();
                    } catch (IOException e) {
                        throw new RuntimeException("파일 읽기 실패: " + file.getOriginalFilename(), e);
                    }
                })
                .collect(Collectors.toList());
            
            ImageStoragePort.ImageMetadata metadata = ImageStoragePort.ImageMetadata.defaultMetadata();
            
            return imageStoragePort.uploadImages(imagesData, folder, metadata);
            
        } catch (Exception e) {
            log.error("Failed to upload images batch", e);
            throw new RuntimeException("배치 이미지 업로드 실패: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void deleteImage(String publicId) {
        log.debug("Deleting image: {}", publicId);
        
        try {
            imageStoragePort.deleteImage(publicId);
        } catch (Exception e) {
            log.error("Failed to delete image: {}", publicId, e);
            throw new RuntimeException("이미지 삭제 실패: " + e.getMessage(), e);
        }
    }
}
