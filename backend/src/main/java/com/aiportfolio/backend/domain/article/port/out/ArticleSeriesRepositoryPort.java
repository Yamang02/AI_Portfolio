package com.aiportfolio.backend.domain.article.port.out;

import com.aiportfolio.backend.domain.article.model.ArticleSeries;

import java.util.List;
import java.util.Optional;

/**
 * 시리즈 Repository Port
 */
public interface ArticleSeriesRepositoryPort {
    
    ArticleSeries save(ArticleSeries series);
    
    Optional<ArticleSeries> findBySeriesId(String seriesId);
    
    /**
     * 시리즈 ID 목록으로 배치 조회 (N+1 문제 방지)
     * 
     * @param seriesIds 시리즈 ID 목록
     * @return 시리즈 목록
     */
    List<ArticleSeries> findBySeriesIdIn(List<String> seriesIds);
    
    boolean existsBySeriesId(String seriesId);
    
    /**
     * 다음 시리즈 ID 생성 (예: "article-series-001", "article-series-002")
     */
    String generateNextSeriesId();
    
    /**
     * 같은 시리즈의 최대 series_order 조회
     * 
     * @param seriesId 시리즈 ID
     * @return 최대 series_order (없으면 0)
     */
    Integer findMaxSeriesOrder(String seriesId);
}
