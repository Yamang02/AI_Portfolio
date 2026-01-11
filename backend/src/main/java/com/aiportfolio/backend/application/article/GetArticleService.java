package com.aiportfolio.backend.application.article;

import com.aiportfolio.backend.domain.article.filter.ArticleFilter;
import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.port.in.GetArticleUseCase;
import com.aiportfolio.backend.domain.article.port.out.ArticleRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetArticleService implements GetArticleUseCase {

    private final ArticleRepositoryPort articleRepository;

    @Override
    public Optional<Article> findById(Long id) {
        return articleRepository.findById(id);
    }

    @Override
    public Optional<Article> findByBusinessId(String businessId) {
        return articleRepository.findByBusinessId(businessId);
    }

    @Override
    public Page<Article> findAll(Pageable pageable) {
        return articleRepository.findAll(pageable);
    }

    @Override
    public Page<Article> findByFilter(ArticleFilter filter, Pageable pageable) {
        return articleRepository.findByFilter(filter, pageable);
    }

    @Override
    @Transactional
    public void incrementViewCount(Long id) {
        articleRepository.incrementViewCount(id);
    }

    @Override
    public Optional<Article> findPreviousArticle(java.time.LocalDateTime publishedAt) {
        return articleRepository.findPreviousArticle(publishedAt);
    }

    @Override
    public Optional<Article> findNextArticle(java.time.LocalDateTime publishedAt) {
        return articleRepository.findNextArticle(publishedAt);
    }
}
