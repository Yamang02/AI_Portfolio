package com.aiportfolio.backend.domain.article.port.in;

import com.aiportfolio.backend.domain.article.model.ArticleSeries;

/**
 * 시리즈 관리 Use Case 인터페이스
 */
public interface ManageArticleSeriesUseCase {
    
    /**
     * 시리즈 생성 (시리즈 ID 자동 생성)
     * 
     * @param title 시리즈 제목
     * @return 생성된 시리즈
     */
    ArticleSeries createSeries(String title);
    
    /**
     * 시리즈 ID로 조회
     * 
     * @param seriesId 시리즈 ID
     * @return 시리즈 (없으면 null)
     */
    ArticleSeries findBySeriesId(String seriesId);
    
    /**
     * 시리즈가 존재하는지 확인
     * 
     * @param seriesId 시리즈 ID
     * @return 존재 여부
     */
    boolean existsBySeriesId(String seriesId);
}
