package com.aiportfolio.backend.application.article;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleTechStack;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleUseCase;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleSeriesUseCase;
import com.aiportfolio.backend.domain.article.port.out.ArticleRepositoryPort;
import com.aiportfolio.backend.domain.article.port.out.ArticleSeriesRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ManageArticleService implements ManageArticleUseCase {

    private final ArticleRepositoryPort articleRepository;
    private final ManageArticleSeriesUseCase seriesUseCase;
    private final ArticleSeriesRepositoryPort seriesRepository;

    @Override
    public Article create(CreateArticleCommand command) {
        // 비즈니스 ID 생성
        String businessId = articleRepository.generateNextBusinessId();

        // 시리즈 처리
        String seriesId = command.seriesId();
        Integer seriesOrder = command.seriesOrder();
        
        if (StringUtils.hasText(seriesId)) {
            // 시리즈가 존재하지 않으면 자동 생성 (시리즈 제목은 아티클 제목 사용)
            if (!seriesUseCase.existsBySeriesId(seriesId)) {
                seriesUseCase.createSeries(command.title());
            }
            
            // 시리즈 순서가 제공되지 않았으면 자동 계산
            if (seriesOrder == null) {
                seriesOrder = seriesRepository.findMaxSeriesOrder(seriesId) + 1;
            }
        }

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
                .seriesId(seriesId)
                .seriesOrder(seriesOrder)
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

        // 시리즈 처리
        String seriesId = command.seriesId();
        Integer seriesOrder = command.seriesOrder();
        
        if (StringUtils.hasText(seriesId)) {
            // 시리즈가 존재하지 않으면 자동 생성 (시리즈 제목은 아티클 제목 사용)
            if (!seriesUseCase.existsBySeriesId(seriesId)) {
                seriesUseCase.createSeries(command.title());
            }
            
            // 시리즈 순서가 제공되지 않았으면 자동 계산
            // 단, 기존 시리즈와 동일한 경우 기존 순서 유지
            if (seriesOrder == null) {
                if (seriesId.equals(existing.getSeriesId())) {
                    // 같은 시리즈면 기존 순서 유지
                    seriesOrder = existing.getSeriesOrder();
                } else {
                    // 다른 시리즈로 변경된 경우 새 시리즈의 최대값 + 1
                    seriesOrder = seriesRepository.findMaxSeriesOrder(seriesId) + 1;
                }
            }
        }

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
                .seriesId(seriesId)
                .seriesOrder(seriesOrder)
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
