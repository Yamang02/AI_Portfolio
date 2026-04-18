package com.aiportfolio.backend.application.article;

import com.aiportfolio.backend.domain.article.model.ArticleSeries;
import com.aiportfolio.backend.domain.article.port.in.SearchArticleSeriesUseCase;
import com.aiportfolio.backend.domain.article.port.out.ArticleSeriesRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 시리즈 검색 서비스
 * SearchArticleSeriesUseCase 인터페이스의 구현체
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ArticleSeriesSearchService implements SearchArticleSeriesUseCase {
    
    private final ArticleSeriesRepositoryPort seriesRepositoryPort;
    
    @Override
    public List<ArticleSeries> searchByTitle(String keyword) {
        log.debug("Searching article series with keyword: {}", keyword);
        
        if (!StringUtils.hasText(keyword)) {
            return List.of();
        }

        return seriesRepositoryPort.searchByTitleContaining(keyword);
    }
}
