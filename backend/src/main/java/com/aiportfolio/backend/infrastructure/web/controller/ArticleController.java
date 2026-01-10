package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.domain.article.filter.ArticleFilter;
import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleSeries;
import com.aiportfolio.backend.domain.article.model.ArticleStatistics;
import com.aiportfolio.backend.domain.article.port.in.GetArticleStatisticsUseCase;
import com.aiportfolio.backend.domain.article.port.in.GetArticleUseCase;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleSeriesUseCase;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.ArticleListRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final GetArticleUseCase getUseCase;
    private final ManageArticleSeriesUseCase manageSeriesUseCase;
    private final GetArticleStatisticsUseCase statisticsUseCase;

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
        if (request.getSortBy() == null) request.setSortBy("publishedAt");
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
        
        // 날짜 범위 파싱 (추후 필요 시 추가)
        // filter.setDateFrom(...);
        // filter.setDateTo(...);

        Page<Article> articles = getUseCase.findByFilter(filter, pageable);
        
        // 시리즈 정보 배치 조회 (N+1 문제 방지)
        List<String> seriesIds = articles.getContent().stream()
                .map(Article::getSeriesId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        
        Map<String, ArticleSeries> seriesMap = manageSeriesUseCase.findBySeriesIdIn(seriesIds);
        
        return ResponseEntity.ok(ApiResponse.success(
                articles.map(article -> ArticleListResponse.from(article, seriesMap)),
                "아티클 목록 조회 성공"));
    }

    /**
     * 정렬 필드명 매핑 (보안을 위해 허용된 필드만 사용)
     */
    private String getSortField(String sortBy) {
        if (sortBy == null || sortBy.isEmpty()) {
            return "publishedAt";
        }
        
        // 허용된 정렬 필드만 사용 (SQL Injection 방지)
        return switch (sortBy.toLowerCase()) {
            case "title" -> "title";
            case "publishedat", "published_at" -> "publishedAt";
            case "viewcount", "view_count" -> "viewCount";
            case "createdat", "created_at" -> "createdAt";
            case "updatedat", "updated_at" -> "updatedAt";
            default -> "publishedAt";
        };
    }

    /**
     * BusinessId로 조회 (상세)
     */
    @GetMapping("/{businessId}")
    public ResponseEntity<ApiResponse<ArticleDetailResponse>> getByBusinessId(@PathVariable String businessId) {
        return getUseCase.findByBusinessId(businessId)
                .filter(Article::isPublished)
                .map(article -> {
                    // 조회수 증가
                    getUseCase.incrementViewCount(article.getId());
                    return ResponseEntity.ok(ApiResponse.success(
                            ArticleDetailResponse.from(article, manageSeriesUseCase),
                            "아티클 조회 성공"));
                })
                .orElse(ResponseEntity.ok(ApiResponse.error("아티클을 찾을 수 없습니다.")));
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
                "아티클 통계 조회 성공"));
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
            String category,
            List<String> tags,
            List<String> techStack,
            String publishedAt,
            Integer viewCount,
            String seriesId,
            String seriesTitle,
            Integer seriesOrder
    ) {
        public static ArticleDetailResponse from(Article domain, ManageArticleSeriesUseCase seriesUseCase) {
            // 상세 조회는 단일 조회이므로 기존 방식 유지
            String seriesTitle = null;
            if (domain.getSeriesId() != null) {
                ArticleSeries series = seriesUseCase.findBySeriesId(domain.getSeriesId());
                if (series != null) {
                    seriesTitle = series.getTitle();
                }
            }
            
            return new ArticleDetailResponse(
                    domain.getBusinessId(),
                    domain.getTitle(),
                    domain.getContent(),
                    domain.getCategory(),
                    domain.getTags(),
                    domain.getTechStack() != null ?
                            domain.getTechStack().stream()
                                    .map(ts -> ts.getTechName())
                                    .toList() : List.of(),
                    domain.getPublishedAt() != null ? domain.getPublishedAt().toString() : null,
                    domain.getViewCount(),
                    domain.getSeriesId(),
                    seriesTitle,
                    domain.getSeriesOrder()
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
}
