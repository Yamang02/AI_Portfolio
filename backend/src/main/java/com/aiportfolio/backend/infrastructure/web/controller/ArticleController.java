package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.article.filter.ArticleFilter;
import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleSeries;
import com.aiportfolio.backend.domain.article.model.ArticleStatistics;
import com.aiportfolio.backend.domain.article.port.in.GetArticleStatisticsUseCase;
import com.aiportfolio.backend.domain.article.port.in.GetArticleUseCase;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleSeriesUseCase;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.ProjectTechnicalCard;
import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.ArticleListRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {
    private static final String SORT_FIELD_PUBLISHED_AT = "publishedAt";

    private final GetArticleUseCase getUseCase;
    private final ManageArticleSeriesUseCase manageSeriesUseCase;
    private final GetArticleStatisticsUseCase statisticsUseCase;
    @Qualifier("portfolioService")
    private final GetProjectsUseCase getProjectsUseCase;

    /**
     * 전체 목록 조회 (페이징, 발행된 것만)
     * genpresso-admin-backend 패턴 참고: 검색, 정렬, 페이지네이션 지원
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ArticleListResponse>>> getAll(
            @ModelAttribute ArticleListRequest request) {
        
        // 기본값 설정
        if (request.getPage() == null) request.setPage(0);
        if (request.getSize() == null) request.setSize(10);
        if (request.getSortBy() == null) request.setSortBy(SORT_FIELD_PUBLISHED_AT);
        if (request.getSortOrder() == null) request.setSortOrder("desc");
        
        // Pageable 생성 (정렬 포함)
        Sort sort = Sort.by(
                "desc".equalsIgnoreCase(request.getSortOrder()) ? Sort.Direction.DESC : Sort.Direction.ASC,
                getSortField(request.getSortBy())
        );
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        // ArticleFilter 생성
        ArticleFilter filter = new ArticleFilter();
        filter.setCategory(request.getCategory());
        filter.setProjectId(request.getProjectId());
        filter.setSeriesId(request.getSeriesId());
        filter.setIsFeatured(request.getIsFeatured());
        filter.setSearchKeyword(request.getSearchKeyword());

        Page<Article> articles = getUseCase.findByFilter(filter, pageable);
        
        // 시리즈 정보 배치 조회 (N+1 문제 방지)
        List<String> seriesIds = articles.getContent().stream()
                .map(Article::getSeriesId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        
        Map<String, ArticleSeries> seriesMap = manageSeriesUseCase.findBySeriesIdIn(seriesIds);
        
        return ResponseEntity.ok(ApiResponse.success(
                articles.map(article -> ArticleListResponse.from(article, seriesMap)),
                WebApiResponseMessages.ARTICLE_LIST_SUCCESS));
    }

    /**
     * 정렬 필드명 매핑 (보안을 위해 허용된 필드만 사용)
     */
    private String getSortField(String sortBy) {
        if (sortBy == null || sortBy.isEmpty()) {
            return SORT_FIELD_PUBLISHED_AT;
        }
        
        // 허용된 정렬 필드만 사용 (SQL Injection 방지)
        return switch (sortBy.toLowerCase()) {
            case "title" -> "title";
            case "publishedat", "published_at" -> SORT_FIELD_PUBLISHED_AT;
            case "viewcount", "view_count" -> "viewCount";
            case "createdat", "created_at" -> "createdAt";
            case "updatedat", "updated_at" -> "updatedAt";
            default -> SORT_FIELD_PUBLISHED_AT;
        };
    }

    /**
     * BusinessId로 조회 (상세)
     */
    @GetMapping("/{businessId}")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> getByBusinessId(@PathVariable String businessId) {
        Optional<Article> articleOpt = getUseCase.findByBusinessId(businessId).filter(Article::isPublished);
        if (articleOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error(WebApiResponseMessages.ARTICLE_NOT_FOUND));
        }
        Article article = articleOpt.get();
        getUseCase.incrementViewCount(article.getId());
        String seriesTitle = null;
        if (article.getSeriesId() != null) {
            ArticleSeries series = manageSeriesUseCase.findBySeriesId(article.getSeriesId());
            if (series != null) {
                seriesTitle = series.getTitle();
            }
        }
        Optional<Project> linkedProject = article.getProjectId() != null
                ? getProjectsUseCase.getProjectByDatabaseId(article.getProjectId())
                : Optional.empty();
        List<ProjectTechnicalCard> technicalCards =
                getProjectsUseCase.getTechnicalCardsByArticleDatabaseId(article.getId());
        ArticleDetailResponse body =
                ArticleDetailResponse.from(article, seriesTitle, linkedProject, technicalCards);
        return ResponseEntity.ok(ApiResponse.success(body, WebApiResponseMessages.ARTICLE_GET_SUCCESS));
    }

    /**
     * 아티클 통계 조회
     * - 카테고리별 카운트
     * - 프로젝트별 카운트 (실제 연결된 프로젝트만)
     * - 시리즈별 카운트
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<ArticleStatisticsResponse>> getStatistics() {
        ArticleStatistics statistics = statisticsUseCase.getStatistics();
        return ResponseEntity.ok(ApiResponse.success(
                ArticleStatisticsResponse.from(statistics),
                WebApiResponseMessages.ARTICLE_STATS_SUCCESS));
    }

    /**
     * 이전/다음 아티클 조회 (네비게이션용)
     * 성능 최적화: 전체 목록을 가져오지 않고 이전/다음 아티클만 반환
     */
    @GetMapping("/{businessId}/navigation")
    public ResponseEntity<ApiResponse<ArticleNavigationResponse>> getNavigation(@PathVariable String businessId) {
        return getUseCase.findByBusinessId(businessId)
                .filter(Article::isPublished)
                .map(article -> {
                    // 이전/다음 아티클 조회
                    var prevArticle = article.getPublishedAt() != null
                            ? getUseCase.findPreviousArticle(article.getPublishedAt())
                            : Optional.<Article>empty();
                    var nextArticle = article.getPublishedAt() != null
                            ? getUseCase.findNextArticle(article.getPublishedAt())
                            : Optional.<Article>empty();

                    return ResponseEntity.ok(ApiResponse.success(
                            ArticleNavigationResponse.from(prevArticle, nextArticle),
                            WebApiResponseMessages.ARTICLE_NAVIGATION_SUCCESS));
                })
                .orElse(ResponseEntity.ok(ApiResponse.error(WebApiResponseMessages.ARTICLE_NOT_FOUND)));
    }

    // DTOs (Public용 - 필요한 정보만 노출)
    public record ArticleListResponse(
            String businessId,
            String title,
            String summary,
            String category,
            List<String> tags,
            List<String> techStack,
            String publishedAt,
            Integer viewCount,
            Boolean isFeatured,
            String seriesId,
            String seriesTitle,
            Integer seriesOrder
    ) {
        public static ArticleListResponse from(Article domain, Map<String, ArticleSeries> seriesMap) {
            // 시리즈 제목 조회 (Map에서 조회)
            String seriesTitle = null;
            if (domain.getSeriesId() != null) {
                ArticleSeries series = seriesMap.get(domain.getSeriesId());
                if (series != null) {
                    seriesTitle = series.getTitle();
                }
            }
            
            return new ArticleListResponse(
                    domain.getBusinessId(),
                    domain.getTitle(),
                    domain.getSummary(),
                    domain.getCategory(),
                    domain.getTags(),
                    domain.getTechStack() != null ?
                            domain.getTechStack().stream()
                                    .map(ts -> ts.getTechName())
                                    .toList() : List.of(),
                    domain.getPublishedAt() != null ? domain.getPublishedAt().toString() : null,
                    domain.getViewCount(),
                    domain.getIsFeatured() != null ? domain.getIsFeatured() : false,
                    domain.getSeriesId(),
                    seriesTitle,
                    domain.getSeriesOrder()
            );
        }
    }

    public record ArticleDetailResponse(
            String businessId,
            String title,
            String content,
            String summary,
            String category,
            List<String> tags,
            List<String> techStack,
            String publishedAt,
            String updatedAt,
            Integer viewCount,
            String seriesId,
            String seriesTitle,
            Integer seriesOrder,
            ProjectInfo project,
            List<TechnicalCardInfo> technicalCards
    ) {
        public record ProjectInfo(
                String id,  // businessId
                String title,
                String description,
                String imageUrl,
                Boolean isTeam,
                Boolean isFeatured,
                List<String> technologies,
                String startDate,
                String endDate,
                String githubUrl,
                String liveUrl
        ) {}

        public record TechnicalCardInfo(
                String id,
                String title,
                String category,
                String problemStatement,
                String analysis,
                String solution,
                Boolean isPinned,
                Integer sortOrder
        ) {}

        public static ArticleDetailResponse from(
                Article domain,
                String seriesTitle,
                Optional<Project> linkedProject,
                List<ProjectTechnicalCard> technicalCards) {
            ProjectInfo projectInfo = linkedProject
                    .map(p -> {
                        List<String> technologies = List.of();
                        if (p.getTechStackMetadata() != null) {
                            technologies = p.getTechStackMetadata().stream()
                                    .map(TechStackMetadata::getName)
                                    .filter(Objects::nonNull)
                                    .toList();
                        }
                        return new ProjectInfo(
                                p.getId(),
                                p.getTitle(),
                                p.getDescription(),
                                p.getImageUrl(),
                                p.isTeam(),
                                p.isFeatured(),
                                technologies,
                                p.getStartDate() != null ? p.getStartDate().toString() : null,
                                p.getEndDate() != null ? p.getEndDate().toString() : null,
                                p.getGithubUrl(),
                                p.getLiveUrl()
                        );
                    })
                    .orElse(null);

            List<TechnicalCardInfo> cardInfos = technicalCards.stream()
                    .map(card -> new TechnicalCardInfo(
                            card.getBusinessId(),
                            card.getTitle(),
                            card.getCategory(),
                            card.getProblemStatement(),
                            card.getAnalysis(),
                            card.getSolution(),
                            card.isPinned(),
                            card.getSortOrder()
                    ))
                    .toList();

            return new ArticleDetailResponse(
                    domain.getBusinessId(),
                    domain.getTitle(),
                    domain.getContent(),
                    domain.getSummary(),
                    domain.getCategory(),
                    domain.getTags(),
                    domain.getTechStack() != null ?
                            domain.getTechStack().stream()
                                    .map(ts -> ts.getTechName())
                                    .toList() : List.of(),
                    domain.getPublishedAt() != null ? domain.getPublishedAt().toString() : null,
                    domain.getUpdatedAt() != null ? domain.getUpdatedAt().toString() : null,
                    domain.getViewCount(),
                    domain.getSeriesId(),
                    seriesTitle,
                    domain.getSeriesOrder(),
                    projectInfo,
                    cardInfos
            );
        }
    }

    public record ArticleStatisticsResponse(
            Map<String, Long> categories,
            List<ProjectStatisticsResponse> projects,
            List<SeriesStatisticsResponse> series
    ) {
        public static ArticleStatisticsResponse from(ArticleStatistics statistics) {
            return new ArticleStatisticsResponse(
                    statistics.categories(),
                    statistics.projects().stream()
                            .map(p -> new ProjectStatisticsResponse(
                                    p.projectId(),
                                    p.projectBusinessId(),
                                    p.projectTitle(),
                                    p.count()
                            ))
                            .toList(),
                    statistics.series().stream()
                            .map(s -> new SeriesStatisticsResponse(
                                    s.seriesId(),
                                    s.seriesTitle(),
                                    s.count()
                            ))
                            .toList()
            );
        }
    }

    public record ProjectStatisticsResponse(
            Long projectId,
            String projectBusinessId,
            String projectTitle,
            Long count
    ) {}

    public record SeriesStatisticsResponse(
            String seriesId,
            String seriesTitle,
            Long count
    ) {}

    public record ArticleNavigationResponse(
            ArticleNavigationItem prevArticle,
            ArticleNavigationItem nextArticle
    ) {
        public record ArticleNavigationItem(
                String businessId,
                String title
        ) {}

        public static ArticleNavigationResponse from(
                Optional<Article> prevArticle,
                Optional<Article> nextArticle) {
            return new ArticleNavigationResponse(
                    prevArticle.map(a -> new ArticleNavigationItem(a.getBusinessId(), a.getTitle()))
                            .orElse(null),
                    nextArticle.map(a -> new ArticleNavigationItem(a.getBusinessId(), a.getTitle()))
                            .orElse(null)
            );
        }
    }
}
