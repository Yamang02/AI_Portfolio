package com.aiportfolio.backend.application.article;

import com.aiportfolio.backend.domain.article.model.ArticleSeries;
import com.aiportfolio.backend.domain.article.port.in.SearchArticleSeriesUseCase;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleSeriesJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ArticleSeriesJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 시리즈 검색 서비스
 * SearchArticleSeriesUseCase 인터페이스의 구현체
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ArticleSeriesSearchService implements SearchArticleSeriesUseCase {
    
    private final ArticleSeriesJpaRepository jpaRepository;
    
    @Override
    public List<ArticleSeries> searchByTitle(String keyword) {
        log.debug("Searching article series with keyword: {}", keyword);
        
        if (!StringUtils.hasText(keyword)) {
            // 키워드가 없으면 빈 리스트 반환
            return List.of();
        }
        
        List<ArticleSeriesJpaEntity> entities = jpaRepository.findByTitleContainingIgnoreCase(keyword);
        
        return entities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
    
    private ArticleSeries toDomain(ArticleSeriesJpaEntity entity) {
        return ArticleSeries.builder()
                .id(entity.getId())
                .seriesId(entity.getSeriesId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .thumbnailUrl(entity.getThumbnailUrl())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
