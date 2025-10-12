package com.aiportfolio.backend.infrastructure.web.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 이미지 업로드 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadResponse {

    private boolean success;
    private String message;
    private String url;
    private String publicId;
    private List<String> urls;
    private List<String> publicIds;

    public static ImageUploadResponse success(String url, String publicId) {
        return ImageUploadResponse.builder()
                .success(true)
                .message("이미지 업로드 성공")
                .url(url)
                .publicId(publicId)
                .build();
    }

    public static ImageUploadResponse success(List<String> urls, List<String> publicIds) {
        return ImageUploadResponse.builder()
                .success(true)
                .message("이미지 업로드 성공")
                .urls(urls)
                .publicIds(publicIds)
                .build();
    }

    public static ImageUploadResponse failure(String message) {
        return ImageUploadResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}

