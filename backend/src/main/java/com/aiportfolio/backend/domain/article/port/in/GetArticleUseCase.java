package com.aiportfolio.backend.domain.article.port.in;

import com.aiportfolio.backend.domain.article.filter.ArticleFilter;
import com.aiportfolio.backend.domain.article.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface GetArticleUseCase {

    /**
     * ID로 조회
     */
    Optional<Article> findById(Long id);

    /**
     * BusinessId로 조회
     */
    Optional<Article> findByBusinessId(String businessId);

    /**
     * 전체 목록 조회 (페이징)
     */
    Page<Article> findAll(Pageable pageable);

    /**
     * 필터링 조회 (검색, 정렬, 페이지네이션 포함)
     */
    Page<Article> findByFilter(ArticleFilter filter, Pageable pageable);

    /**
     * 조회수 증가
     */
    void incrementViewCount(Long id);

    /**
     * 이전 아티클 조회 (publishedAt 기준, 발행된 것만)
     * 현재 아티클보다 이전에 발행된 아티클 중 가장 최근 것
     */
    Optional<Article> findPreviousArticle(java.time.LocalDateTime publishedAt);

    /**
     * 다음 아티클 조회 (publishedAt 기준, 발행된 것만)
     * 현재 아티클보다 나중에 발행된 아티클 중 가장 오래된 것
     */
    Optional<Article> findNextArticle(java.time.LocalDateTime publishedAt);
}
