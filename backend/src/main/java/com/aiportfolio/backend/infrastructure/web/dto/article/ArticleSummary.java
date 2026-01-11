package com.aiportfolio.backend.infrastructure.web.dto.article;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

/**
 * Article 요약 정보 DTO
 * 프로젝트 상세 페이지에서 사용하는 제한된 Article 정보
 */
@Value
@Builder
public class ArticleSummary {
    String businessId;
    String title;
    String summary;
    LocalDateTime publishedAt;
}
