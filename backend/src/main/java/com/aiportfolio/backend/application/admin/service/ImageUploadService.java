package com.aiportfolio.backend.application.admin.service;

import com.aiportfolio.backend.domain.admin.port.in.UploadImageUseCase;
import com.aiportfolio.backend.domain.admin.port.out.ImageStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

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
            throw new IllegalStateException("이미지 업로드 실패: " + file.getOriginalFilename(), e);
        }
    }
    
    @Override
    public List<String> uploadImages(List<MultipartFile> files, String folder) {
        log.debug("Uploading {} images to folder: {}", files.size(), folder);
        
        try {
            List<byte[]> imagesData = files.stream()
                .map(this::readMultipartBytes)
                .toList();
            
            ImageStoragePort.ImageMetadata metadata = ImageStoragePort.ImageMetadata.defaultMetadata();
            
            return imageStoragePort.uploadImages(imagesData, folder, metadata);
            
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to upload images batch", e);
            throw new IllegalStateException("배치 이미지 업로드 실패: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void deleteImage(String publicId) {
        log.debug("Deleting image: {}", publicId);
        
        try {
            imageStoragePort.deleteImage(publicId);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to delete image: {}", publicId, e);
            throw new IllegalStateException("이미지 삭제 실패: " + e.getMessage(), e);
        }
    }

    private byte[] readMultipartBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new IllegalStateException("파일 읽기 실패: " + file.getOriginalFilename(), e);
        }
    }
}
