package com.aiportfolio.backend.infrastructure.web.admin.controller;

import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleSeries;
import com.aiportfolio.backend.domain.article.port.in.GetArticleUseCase;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleUseCase;
import com.aiportfolio.backend.domain.article.port.in.ManageArticleSeriesUseCase;
import com.aiportfolio.backend.domain.article.port.in.SearchArticleSeriesUseCase;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectJpaRepository;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/articles")
@RequiredArgsConstructor
public class AdminArticleController {

    private final ManageArticleUseCase manageUseCase;
    private final GetArticleUseCase getUseCase;
    private final SearchArticleSeriesUseCase searchSeriesUseCase;
    private final ManageArticleSeriesUseCase manageSeriesUseCase;
    private final ProjectJpaRepository projectJpaRepository;

    /**
     * 전체 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ArticleResponse>>> getAll(Pageable pageable) {
        Page<Article> articles = getUseCase.findAll(pageable);
        
        // 시리즈 정보 배치 조회 (N+1 문제 방지)
        List<String> seriesIds = articles.getContent().stream()
                .map(Article::getSeriesId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        
        Map<String, ArticleSeries> seriesMap = manageSeriesUseCase.findBySeriesIdIn(seriesIds);
        
        // 프로젝트 정보 배치 조회 (N+1 문제 방지)
        List<Long> projectIds = articles.getContent().stream()
                .map(Article::getProjectId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        
        Map<Long, String> projectBusinessIdMap = projectJpaRepository.findAllById(projectIds)
                .stream()
                .collect(Collectors.toMap(
                        project -> project.getId(),
                        project -> project.getBusinessId()
                ));
        
        Map<Long, String> projectTitleMap = projectJpaRepository.findAllById(projectIds)
                .stream()
                .collect(Collectors.toMap(
                        project -> project.getId(),
                        project -> project.getTitle()
                ));
        
        return ResponseEntity.ok(ApiResponse.success(
                articles.map(article -> ArticleResponse.from(article, seriesMap, projectBusinessIdMap, projectTitleMap)),
                "아티클 목록 조회 성공"));
    }

    /**
     * ID로 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ArticleResponse>> getById(@PathVariable Long id) {
        return getUseCase.findById(id)
                .map(article -> ResponseEntity.ok(ApiResponse.success(
                        ArticleResponse.from(article, manageSeriesUseCase, projectJpaRepository),
                        "아티클 조회 성공")))
                .orElse(ResponseEntity.ok(ApiResponse.error("아티클을 찾을 수 없습니다.")));
    }

    /**
     * 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ArticleResponse>> create(@RequestBody CreateArticleRequest request) {
        ManageArticleUseCase.CreateArticleCommand command = new ManageArticleUseCase.CreateArticleCommand(
                request.title(),
                request.summary(),
                request.content(),
                request.projectId(), // 비즈니스 ID (String)
                request.category(),
                request.tags(),
                request.techStack(),
                request.status(),
                request.isFeatured(),
                request.featuredSortOrder(),
                request.seriesId(),
                request.seriesOrder()
        );

        Article created = manageUseCase.create(command);
        return ResponseEntity.ok(ApiResponse.success(
                ArticleResponse.from(created, manageSeriesUseCase, projectJpaRepository),
                "아티클 생성 성공"));
    }

    /**
     * 업데이트
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ArticleResponse>> update(
            @PathVariable Long id,
            @RequestBody UpdateArticleRequest request) {

        ManageArticleUseCase.UpdateArticleCommand command = new ManageArticleUseCase.UpdateArticleCommand(
                id,
                request.title(),
                request.summary(),
                request.content(),
                request.projectId(), // 비즈니스 ID (String)
                request.category(),
                request.tags(),
                request.techStack(),
                request.status(),
                request.isFeatured(),
                request.featuredSortOrder(),
                request.seriesId(),
                request.seriesOrder()
        );

        Article updated = manageUseCase.update(command);
        return ResponseEntity.ok(ApiResponse.success(
                ArticleResponse.from(updated, manageSeriesUseCase, projectJpaRepository),
                "아티클 수정 성공"));
    }

    /**
     * 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        manageUseCase.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "아티클 삭제 성공"));
    }

    /**
     * 시리즈 검색 (제목으로 검색)
     */
    @GetMapping("/series/search")
    public ResponseEntity<ApiResponse<List<SeriesSearchResponse>>> searchSeries(
            @RequestParam(required = false) String keyword) {
        List<ArticleSeries> series = searchSeriesUseCase.searchByTitle(keyword != null ? keyword : "");
        List<SeriesSearchResponse> responses = series.stream()
                .map(s -> new SeriesSearchResponse(s.getSeriesId(), s.getTitle()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(responses, "시리즈 검색 성공"));
    }

    /**
     * 시리즈 ID로 조회
     */
    @GetMapping("/series/{seriesId}")
    public ResponseEntity<ApiResponse<SeriesSearchResponse>> getSeriesById(
            @PathVariable String seriesId) {
        ArticleSeries series = manageSeriesUseCase.findBySeriesId(seriesId);
        if (series == null) {
            return ResponseEntity.ok(ApiResponse.error("시리즈를 찾을 수 없습니다."));
        }
        SeriesSearchResponse response = new SeriesSearchResponse(series.getSeriesId(), series.getTitle());
        return ResponseEntity.ok(ApiResponse.success(response, "시리즈 조회 성공"));
    }

    /**
     * 시리즈 생성 (시리즈 ID 자동 생성)
     */
    @PostMapping("/series")
    public ResponseEntity<ApiResponse<SeriesSearchResponse>> createSeries(
            @RequestBody CreateSeriesRequest request) {
        ArticleSeries series = manageSeriesUseCase.createSeries(request.title());
        SeriesSearchResponse response = new SeriesSearchResponse(series.getSeriesId(), series.getTitle());
        return ResponseEntity.ok(ApiResponse.success(response, "시리즈 생성 성공"));
    }

    // DTOs
    public record CreateArticleRequest(
            String title,
            String summary,
            String content,
            String projectId, // 비즈니스 ID (String)
            String category,
            List<String> tags,
            List<String> techStack,
            String status,
            Boolean isFeatured,
            Integer featuredSortOrder,
            String seriesId,
            Integer seriesOrder
    ) {}

    public record UpdateArticleRequest(
            String title,
            String summary,
            String content,
            String projectId, // 비즈니스 ID (String)
            String category,
            List<String> tags,
            List<String> techStack,
            String status,
            Boolean isFeatured,
            Integer featuredSortOrder,
            String seriesId,
            Integer seriesOrder
    ) {}

    public record ArticleResponse(
            Long id,
            String businessId,
            String title,
            String summary,
            String content,
            String projectId, // 비즈니스 ID (String)
            String projectTitle, // 프로젝트명 (읽기 전용 표시용)
            String category,
            List<String> tags,
            List<String> techStack,
            String status,
            String publishedAt,
            Integer sortOrder,
            Integer viewCount,
            Boolean isFeatured,
            Integer featuredSortOrder,
            String seriesId,
            String seriesTitle,
            Integer seriesOrder,
            String createdAt,
            String updatedAt
    ) {
        // 배치 조회용 (목록 조회 시 사용)
        public static ArticleResponse from(Article domain, Map<String, ArticleSeries> seriesMap, Map<Long, String> projectBusinessIdMap, Map<Long, String> projectTitleMap) {
            // 시리즈 제목 조회 (Map에서 조회)
            String seriesTitle = null;
            if (domain.getSeriesId() != null) {
                ArticleSeries series = seriesMap.get(domain.getSeriesId());
                if (series != null) {
                    seriesTitle = series.getTitle();
                }
            }
            
            // 프로젝트 비즈니스 ID 및 제목 조회 (Map에서 조회)
            String projectBusinessId = null;
            String projectTitle = null;
            if (domain.getProjectId() != null) {
                projectBusinessId = projectBusinessIdMap.get(domain.getProjectId());
                projectTitle = projectTitleMap.get(domain.getProjectId());
            }
            
            return new ArticleResponse(
                    domain.getId(),
                    domain.getBusinessId(),
                    domain.getTitle(),
                    domain.getSummary(),
                    domain.getContent(),
                    projectBusinessId,
                    projectTitle,
                    domain.getCategory(),
                    domain.getTags(),
                    domain.getTechStack() != null ?
                            domain.getTechStack().stream()
                                    .map(ts -> ts.getTechName())
                                    .toList() : List.of(),
                    domain.getStatus(),
                    domain.getPublishedAt() != null ? domain.getPublishedAt().toString() : null,
                    domain.getSortOrder(),
                    domain.getViewCount(),
                    domain.getIsFeatured(),
                    domain.getFeaturedSortOrder(),
                    domain.getSeriesId(),
                    seriesTitle,
                    domain.getSeriesOrder(),
                    domain.getCreatedAt() != null ? domain.getCreatedAt().toString() : null,
                    domain.getUpdatedAt() != null ? domain.getUpdatedAt().toString() : null
            );
        }
        
        // 단일 조회용 (상세 조회 시 사용)
        public static ArticleResponse from(Article domain, ManageArticleSeriesUseCase seriesUseCase, ProjectJpaRepository projectJpaRepository) {
            // 시리즈 제목 조회
            String seriesTitle = null;
            if (domain.getSeriesId() != null) {
                ArticleSeries series = seriesUseCase.findBySeriesId(domain.getSeriesId());
                if (series != null) {
                    seriesTitle = series.getTitle();
                }
            }
            
            // 프로젝트 DB ID를 비즈니스 ID 및 제목으로 변환
            String projectBusinessId = null;
            String projectTitle = null;
            if (domain.getProjectId() != null) {
                var projectOpt = projectJpaRepository.findById(domain.getProjectId());
                if (projectOpt.isPresent()) {
                    var project = projectOpt.get();
                    projectBusinessId = project.getBusinessId();
                    projectTitle = project.getTitle();
                }
            }
            
            return new ArticleResponse(
                    domain.getId(),
                    domain.getBusinessId(),
                    domain.getTitle(),
                    domain.getSummary(),
                    domain.getContent(),
                    projectBusinessId,
                    projectTitle,
                    domain.getCategory(),
                    domain.getTags(),
                    domain.getTechStack() != null ?
                            domain.getTechStack().stream()
                                    .map(ts -> ts.getTechName())
                                    .toList() : List.of(),
                    domain.getStatus(),
                    domain.getPublishedAt() != null ? domain.getPublishedAt().toString() : null,
                    domain.getSortOrder(),
                    domain.getViewCount(),
                    domain.getIsFeatured(),
                    domain.getFeaturedSortOrder(),
                    domain.getSeriesId(),
                    seriesTitle,
                    domain.getSeriesOrder(),
                    domain.getCreatedAt() != null ? domain.getCreatedAt().toString() : null,
                    domain.getUpdatedAt() != null ? domain.getUpdatedAt().toString() : null
            );
        }
    }

    public record SeriesSearchResponse(
            String seriesId,
            String title
    ) {}
    
    public record CreateSeriesRequest(
            String title
    ) {}
}
