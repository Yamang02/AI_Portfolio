package com.aiportfolio.backend.domain.article.model;

import java.util.List;
import java.util.Map;

/**
 * 아티클 통계 정보
 */
public record ArticleStatistics(
    Map<String, Long> categories,  // 카테고리별 카운트
    List<ProjectStatistics> projects,  // 프로젝트별 통계 (실제 연결된 프로젝트만)
    List<SeriesStatistics> series  // 시리즈별 통계
) {
    public record ProjectStatistics(
        Long projectId,  // 프로젝트 PK
        String projectBusinessId,  // 프로젝트 businessId
        String projectTitle,  // 프로젝트 제목
        Long count  // 아티클 개수
    ) {}

    public record SeriesStatistics(
        String seriesId,  // 시리즈 ID
        String seriesTitle,  // 시리즈 제목
        Long count  // 아티클 개수
    ) {}
}
