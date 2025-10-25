package com.aiportfolio.backend.domain.admin.port.in;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 이미지 업로드 Use Case 인터페이스
 * 이미지 업로드 및 관리 기능을 정의합니다.
 */
public interface UploadImageUseCase {
    
    /**
     * 단일 이미지를 업로드합니다.
     * 
     * @param file 업로드할 파일
     * @param folder 업로드할 폴더
     * @return 업로드된 이미지 URL
     */
    String uploadImage(MultipartFile file, String folder);
    
    /**
     * 다중 이미지를 업로드합니다.
     * 
     * @param files 업로드할 파일 목록
     * @param folder 업로드할 폴더
     * @return 업로드된 이미지 URL 목록
     */
    List<String> uploadImages(List<MultipartFile> files, String folder);
    
    /**
     * 이미지를 삭제합니다.
     * 
     * @param publicId 삭제할 이미지의 Public ID
     */
    void deleteImage(String publicId);
}
