package com.aiportfolio.backend.application.article;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleTechStack;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleUseCase;
import com.aiportfolio.backend.domain.article.port.out.ArticleRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ManageArticleService implements ManageArticleUseCase {

    private final ArticleRepositoryPort articleRepository;

    @Override
    public Article create(CreateArticleCommand command) {
        // 비즈니스 ID 생성
        String businessId = articleRepository.generateNextBusinessId();

        // 기술 스택 변환
        List<ArticleTechStack> techStack = convertTechStack(null, command.techStack());

        // Article 도메인 모델 생성
        Article article = Article.builder()
                .businessId(businessId)
                .title(command.title())
                .summary(command.summary())
                .content(command.content())
                .projectId(command.projectId())
                .category(command.category())
                .tags(command.tags())
                .techStack(techStack)
                .status(command.status() != null ? command.status() : "draft")
                .isFeatured(command.isFeatured() != null ? command.isFeatured() : false)
                .featuredSortOrder(command.featuredSortOrder())
                .seriesId(command.seriesId())
                .seriesOrder(command.seriesOrder())
                .sortOrder(0)
                .viewCount(0)
                .build();

        // 유효성 검증
        article.validate();

        // 저장
        return articleRepository.save(article);
    }

    @Override
    public Article update(UpdateArticleCommand command) {
        // 기존 Article 조회
        Article existing = articleRepository.findById(command.id())
                .orElseThrow(() -> new IllegalArgumentException("Article not found: " + command.id()));

        // 기술 스택 변환
        List<ArticleTechStack> techStack = convertTechStack(command.id(), command.techStack());

        // Article 업데이트
        Article updated = Article.builder()
                .id(existing.getId())
                .businessId(existing.getBusinessId())
                .title(command.title())
                .summary(command.summary())
                .content(command.content())
                .projectId(command.projectId())
                .category(command.category())
                .tags(command.tags())
                .techStack(techStack)
                .status(command.status())
                .publishedAt(existing.getPublishedAt())
                .isFeatured(command.isFeatured())
                .featuredSortOrder(command.featuredSortOrder())
                .seriesId(command.seriesId())
                .seriesOrder(command.seriesOrder())
                .sortOrder(existing.getSortOrder())
                .viewCount(existing.getViewCount())
                .createdAt(existing.getCreatedAt())
                .build();

        // 유효성 검증
        updated.validate();

        // 저장
        return articleRepository.save(updated);
    }

    @Override
    public void delete(Long id) {
        articleRepository.delete(id);
    }

    // 기술 스택 변환 헬퍼
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
                .collect(Collectors.toList());
    }
}
