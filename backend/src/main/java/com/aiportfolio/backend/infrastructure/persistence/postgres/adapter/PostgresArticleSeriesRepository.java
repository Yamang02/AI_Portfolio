package com.aiportfolio.backend.infrastructure.persistence.postgres.adapter;

import com.aiportfolio.backend.domain.article.model.ArticleSeries;
import com.aiportfolio.backend.domain.article.port.out.ArticleSeriesRepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleSeriesJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ArticleJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ArticleSeriesJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PostgresArticleSeriesRepository implements ArticleSeriesRepositoryPort {

    private final ArticleSeriesJpaRepository jpaRepository;
    private final ArticleJpaRepository articleJpaRepository;

    @Override
    public ArticleSeries save(ArticleSeries series) {
        ArticleSeriesJpaEntity entity;
        
        if (series.getId() != null) {
            // 업데이트
            entity = jpaRepository.findById(series.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Series not found: " + series.getId()));
            entity.setTitle(series.getTitle());
            entity.setDescription(series.getDescription());
            entity.setThumbnailUrl(series.getThumbnailUrl());
            entity.setSortOrder(series.getSortOrder());
        } else {
            // 생성
            entity = ArticleSeriesJpaEntity.builder()
                    .seriesId(series.getSeriesId())
                    .title(series.getTitle())
                    .description(series.getDescription())
                    .thumbnailUrl(series.getThumbnailUrl())
                    .sortOrder(series.getSortOrder())
                    .build();
        }
        
        ArticleSeriesJpaEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<ArticleSeries> findBySeriesId(String seriesId) {
        ArticleSeriesJpaEntity entity = jpaRepository.findBySeriesId(seriesId);
        return entity != null ? Optional.of(toDomain(entity)) : Optional.empty();
    }

    @Override
    public boolean existsBySeriesId(String seriesId) {
        return jpaRepository.existsBySeriesId(seriesId);
    }

    @Override
    public String generateNextSeriesId() {
        Integer maxNumber = jpaRepository.findMaxSeriesIdNumber();
        int nextNumber = (maxNumber != null ? maxNumber : 0) + 1;
        return String.format("article-series-%03d", nextNumber);
    }

    @Override
    public Integer findMaxSeriesOrder(String seriesId) {
        Integer maxOrder = articleJpaRepository.findMaxSeriesOrderBySeriesId(seriesId);
        return maxOrder != null ? maxOrder : 0;
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
