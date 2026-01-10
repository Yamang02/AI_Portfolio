package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleTechStack;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleTechStackJpaEntity;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ArticleMapper {

    public Article toDomain(ArticleJpaEntity entity) {
        return Article.builder()
                .id(entity.getId())
                .businessId(entity.getBusinessId())
                .title(entity.getTitle())
                .summary(entity.getSummary())
                .content(entity.getContent())
                .projectId(entity.getProjectId())
                .category(entity.getCategory())
                .tags(entity.getTags() != null ? Arrays.asList(entity.getTags()) : List.of())
                .techStack(entity.getTechStack() != null ?
                        entity.getTechStack().stream()
                                .map(this::techStackToDomain)
                                .collect(Collectors.toList()) : List.of())
                .status(entity.getStatus())
                .publishedAt(entity.getPublishedAt())
                .sortOrder(entity.getSortOrder())
                .viewCount(entity.getViewCount())
                .isFeatured(entity.getIsFeatured())
                .featuredSortOrder(entity.getFeaturedSortOrder())
                .seriesId(entity.getSeriesId())
                .seriesOrder(entity.getSeriesOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ArticleJpaEntity toEntity(Article domain) {
        return ArticleJpaEntity.builder()
                .id(domain.getId())
                .businessId(domain.getBusinessId())
                .title(domain.getTitle())
                .summary(domain.getSummary())
                .content(domain.getContent())
                .projectId(domain.getProjectId())
                .category(domain.getCategory())
                .tags(domain.getTags() != null ? domain.getTags().toArray(new String[0]) : new String[0])
                .status(domain.getStatus())
                .publishedAt(domain.getPublishedAt())
                .sortOrder(domain.getSortOrder())
                .viewCount(domain.getViewCount())
                .isFeatured(domain.getIsFeatured())
                .featuredSortOrder(domain.getFeaturedSortOrder())
                .seriesId(domain.getSeriesId())
                .seriesOrder(domain.getSeriesOrder())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    private ArticleTechStack techStackToDomain(ArticleTechStackJpaEntity entity) {
        return ArticleTechStack.builder()
                .id(entity.getId())
                .articleId(entity.getArticle().getId())
                .techName(entity.getTechName())
                .isPrimary(entity.getIsPrimary())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
