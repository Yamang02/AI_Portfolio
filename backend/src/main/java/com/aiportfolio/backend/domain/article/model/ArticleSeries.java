package com.aiportfolio.backend.domain.article.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ArticleSeries {
    private Long id;
    private String seriesId;  // 시리즈 ID (예: 'article-series-001')
    private String title;  // 시리즈 대표명
    private String description;  // 시리즈 설명 (Optional)
    private String thumbnailUrl;  // 시리즈 썸네일 (Optional)
    private Integer sortOrder;  // 메인페이지 노출 순서
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 유효성 검증
     */
    public void validate() {
        if (seriesId == null || seriesId.isBlank()) {
            throw new IllegalArgumentException("시리즈 ID는 필수입니다.");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("시리즈 제목은 필수입니다.");
        }
    }
}
