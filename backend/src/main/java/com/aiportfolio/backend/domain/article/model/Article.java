package com.aiportfolio.backend.domain.article.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class Article {
    private Long id;  // PK (내부 식별자)
    private String businessId;  // 외부 식별자 (예: "article-001")
    private String title;
    private String summary;
    private String content;  // Markdown

    // 프로젝트 연계 (Optional)
    private Long projectId;  // 프로젝트 PK 참조

    // 분류
    private String category;
    private List<String> tags;

    // 기술 스택 (Join 데이터)
    private List<ArticleTechStack> techStack;

    // 메타데이터
    private String status;  // 'draft', 'published', 'archived'
    private LocalDateTime publishedAt;
    private Integer sortOrder;
    private Integer viewCount;

    // 메인페이지 노출
    private Boolean isFeatured;
    private Integer featuredSortOrder;  // Featured 아티클 섹션 내 노출 순서
    private String seriesId;  // 시리즈 그룹 ID
    private Integer seriesOrder;  // 시리즈 내 순서

    // 타임스탬프
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 비즈니스 로직
    public boolean isPublished() {
        return "published".equals(status);
    }

    public boolean hasProject() {
        return projectId != null;
    }

    public boolean isInSeries() {
        return seriesId != null;
    }

    public void incrementViewCount() {
        this.viewCount = (this.viewCount == null ? 0 : this.viewCount) + 1;
    }

    /**
     * 유효성 검증
     */
    public void validate() {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("제목은 필수입니다.");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("본문은 필수입니다.");
        }
        if (businessId == null || businessId.isBlank()) {
            throw new IllegalArgumentException("비즈니스 ID는 필수입니다.");
        }
        if (status == null) {
            throw new IllegalArgumentException("상태는 필수입니다.");
        }
    }
}
