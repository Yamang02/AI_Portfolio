package com.aiportfolio.backend.domain.article.port.in;

import com.aiportfolio.backend.domain.article.model.ArticleSeries;

import java.util.List;

/**
 * 시리즈 검색 Use Case 인터페이스
 * 시리즈 조회 및 검색 기능을 정의합니다.
 */
public interface SearchArticleSeriesUseCase {
    
    /**
     * 키워드로 시리즈를 검색합니다.
     * 
     * @param keyword 검색 키워드 (시리즈 제목)
     * @return 시리즈 도메인 모델 목록
     */
    List<ArticleSeries> searchByTitle(String keyword);
}
