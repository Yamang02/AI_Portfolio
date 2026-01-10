package com.aiportfolio.backend.domain.article.port.out;

import com.aiportfolio.backend.domain.article.filter.ArticleFilter;
import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleStatistics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ArticleRepositoryPort {

    Article save(Article article);
    void delete(Long id);
    Optional<Article> findById(Long id);
    Optional<Article> findByBusinessId(String businessId);
    Page<Article> findAll(Pageable pageable);
    Page<Article> findByFilter(ArticleFilter filter, Pageable pageable);
    void incrementViewCount(Long id);
    
    /**
     * 같은 시리즈의 특정 순서보다 큰 순서를 가진 아티클들의 순서를 1씩 감소
     * (아티클 삭제 시 시리즈 순서 재정렬용)
     */
    void decreaseSeriesOrderAfter(String seriesId, Integer deletedOrder);

    /**
     * 다음 비즈니스 ID 생성 (예: "article-001", "article-002")
     */
    String generateNextBusinessId();

    /**
     * 아티클 통계 조회
     * - 카테고리별 카운트
     * - 프로젝트별 카운트 (실제 연결된 프로젝트만)
     * - 시리즈별 카운트
     */
    ArticleStatistics getStatistics();
}
