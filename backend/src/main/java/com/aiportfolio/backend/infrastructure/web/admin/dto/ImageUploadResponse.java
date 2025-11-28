package com.aiportfolio.backend.infrastructure.web.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 단일 이미지 업로드 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadResponse {
    private String url;
    private String publicId;
}

/**
 * 다중 이미지 업로드 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MultiImageUploadResponse {
    private List<String> urls;
    private List<String> publicIds;
}

