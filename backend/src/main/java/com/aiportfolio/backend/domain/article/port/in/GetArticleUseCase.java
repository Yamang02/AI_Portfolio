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
}
