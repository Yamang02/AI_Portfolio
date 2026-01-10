package com.aiportfolio.backend.domain.article.port.out;

import com.aiportfolio.backend.domain.article.filter.ArticleFilter;
import com.aiportfolio.backend.domain.article.model.Article;
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
     * 다음 비즈니스 ID 생성 (예: "article-001", "article-002")
     */
    String generateNextBusinessId();
}
