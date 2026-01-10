package com.aiportfolio.backend.domain.article.port.in;

import com.aiportfolio.backend.domain.article.model.ArticleStatistics;

/**
 * 아티클 통계 조회 Use Case
 */
public interface GetArticleStatisticsUseCase {
    
    /**
     * 아티클 통계 조회
     * - 카테고리별 카운트
     * - 프로젝트별 카운트 (실제 연결된 프로젝트만)
     * - 시리즈별 카운트
     * 
     * @return 아티클 통계 정보
     */
    ArticleStatistics getStatistics();
}
