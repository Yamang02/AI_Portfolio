package com.aiportfolio.backend.application.article;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleTechStack;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleSeriesUseCase;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleUseCase;
import com.aiportfolio.backend.domain.article.port.out.ArticleRepositoryPort;
import com.aiportfolio.backend.domain.article.port.out.ArticleSeriesRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioCachePort;
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ManageArticleService implements ManageArticleUseCase {

    private final ArticleRepositoryPort articleRepository;
    private final ManageArticleSeriesUseCase seriesUseCase;
    private final ArticleSeriesRepositoryPort seriesRepository;
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    private final PortfolioCachePort portfolioCachePort;

    @Override
    public Article create(CreateArticleCommand command) {
        String businessId = articleRepository.generateNextBusinessId();

        String seriesId = command.seriesId();
        Integer seriesOrder = command.seriesOrder();

        if (StringUtils.hasText(seriesId)) {
            if (!seriesUseCase.existsBySeriesId(seriesId)) {
                seriesUseCase.createSeries(command.title());
            }
            if (seriesOrder == null) {
                seriesOrder = seriesRepository.findMaxSeriesOrder(seriesId) + 1;
            }
        }

        List<ArticleTechStack> techStack = convertTechStack(null, command.techStack());
        Long projectId = resolveProjectDatabaseId(command.projectBusinessId());

        Article article = Article.builder()
                .businessId(businessId)
                .title(command.title())
                .summary(command.summary())
                .content(command.content())
                .projectId(projectId)
                .category(command.category())
                .tags(command.tags())
                .techStack(techStack)
                .status(command.status() != null ? command.status() : "draft")
                .isFeatured(command.isFeatured() != null ? command.isFeatured() : false)
                .featuredSortOrder(command.featuredSortOrder())
                .seriesId(seriesId)
                .seriesOrder(seriesOrder)
                .sortOrder(0)
                .viewCount(0)
                .build();

        article.validate();

        Article saved = articleRepository.save(article);
        portfolioCachePort.evictPortfolioProjects();
        return saved;
    }

    @Override
    public Article update(UpdateArticleCommand command) {
        Article existing = articleRepository.findById(command.id())
                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + command.id()));

        String seriesId = command.seriesId();
        Integer seriesOrder = command.seriesOrder();

        if (StringUtils.hasText(seriesId)) {
            if (!seriesUseCase.existsBySeriesId(seriesId)) {
                seriesUseCase.createSeries(command.title());
            }
            if (seriesOrder == null) {
                if (seriesId.equals(existing.getSeriesId())) {
                    seriesOrder = existing.getSeriesOrder();
                } else {
                    seriesOrder = seriesRepository.findMaxSeriesOrder(seriesId) + 1;
                }
            }
        } else {
            seriesId = existing.getSeriesId();
            seriesOrder = existing.getSeriesOrder();
        }

        List<ArticleTechStack> techStack = convertTechStack(command.id(), command.techStack());
        Long projectId = resolveProjectDatabaseId(command.projectBusinessId());

        LocalDateTime publishedAt = existing.getPublishedAt();
        if ("published".equals(command.status()) && publishedAt == null) {
            publishedAt = LocalDateTime.now();
            log.info("[ManageArticleService] Setting publishedAt to current time for article {}", command.id());
        }

        Article updated = Article.builder()
                .id(existing.getId())
                .businessId(existing.getBusinessId())
                .title(command.title())
                .summary(command.summary())
                .content(command.content())
                .projectId(projectId)
                .category(command.category())
                .tags(command.tags())
                .techStack(techStack)
                .status(command.status())
                .publishedAt(publishedAt)
                .isFeatured(command.isFeatured())
                .featuredSortOrder(command.featuredSortOrder())
                .seriesId(seriesId)
                .seriesOrder(seriesOrder)
                .sortOrder(existing.getSortOrder())
                .viewCount(existing.getViewCount())
                .createdAt(existing.getCreatedAt())
                .build();

        updated.validate();

        Article saved = articleRepository.save(updated);
        portfolioCachePort.evictPortfolioProjects();
        return saved;
    }

    @Override
    public void delete(Long id) {
        articleRepository.delete(id);
        portfolioCachePort.evictPortfolioProjects();
    }

    private Long resolveProjectDatabaseId(String projectBusinessId) {
        if (!StringUtils.hasText(projectBusinessId)) {
            return null;
        }
        return portfolioRepositoryPort.findProjectDatabaseIdByBusinessId(projectBusinessId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectBusinessId));
    }

    private List<ArticleTechStack> convertTechStack(Long articleId, List<String> techNames) {
        if (techNames == null || techNames.isEmpty()) {
            return List.of();
        }
        return techNames.stream()
                .map(techName -> ArticleTechStack.builder()
                        .articleId(articleId)
                        .techName(techName)
                        .isPrimary(false)
                        .build())
                .toList();
    }
}
