package com.aiportfolio.backend.infrastructure.web.controller;

import com.aiportfolio.backend.infrastructure.web.WebApiResponseMessages;
import com.aiportfolio.backend.infrastructure.web.dto.ApiResponse;
import com.aiportfolio.backend.infrastructure.web.dto.article.ArticleSummary;
import com.aiportfolio.backend.infrastructure.web.dto.project.ProjectDataResponse;
import com.aiportfolio.backend.domain.article.filter.ArticleFilter;
import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.port.in.GetArticleUseCase;
import com.aiportfolio.backend.domain.portfolio.model.Certification;
import com.aiportfolio.backend.domain.portfolio.model.Education;
import com.aiportfolio.backend.domain.portfolio.model.Experience;
import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.ProjectTechnicalCard;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProjectsUseCase;
import com.aiportfolio.backend.domain.portfolio.port.in.GetAllDataUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 데이터 웹 컨트롤러 (헥사고날 아키텍처 Infrastructure/Web Layer)
 * 인바운드 Use Case 포트만 사용하며 JPA Repository에 직접 의존하지 않습니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/data")
@Tag(name = "Data", description = "포트폴리오 데이터 API")
public class DataController {
    
    private final GetProjectsUseCase getProjectsUseCase;
    private final GetAllDataUseCase getAllDataUseCase;
    private final GetArticleUseCase getArticleUseCase;

    public DataController(
            @Qualifier("portfolioService") GetProjectsUseCase getProjectsUseCase,
            @Qualifier("portfolioApplicationService") GetAllDataUseCase getAllDataUseCase,
            GetArticleUseCase getArticleUseCase) {
        this.getProjectsUseCase = getProjectsUseCase;
        this.getAllDataUseCase = getAllDataUseCase;
        this.getArticleUseCase = getArticleUseCase;
    }
    
    @GetMapping("/all")
    @Operation(summary = "모든 포트폴리오 데이터 조회", description = "프로젝트, 경험, 자격증 등 모든 포트폴리오 데이터를 조회합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllData() {
        Map<String, Object> allData = getAllDataUseCase.getAllPortfolioData();
        Map<String, Object> responseData = new java.util.HashMap<>(allData);

        Object projects = allData.get("projects");
        if (projects instanceof List<?> projectList) {
            List<ProjectDataResponse> mappedProjects = projectList.stream()
                .filter(Project.class::isInstance)
                .map(Project.class::cast)
                .map(project -> {
                    List<ArticleSummary> developmentTimelineArticles = getDevelopmentTimelineArticles(project);
                    ProjectDataResponse.ProjectOverviewArticleSummary projectOverviewArticle =
                            getProjectOverviewArticle(project);
                    Map<Long, String> articleBusinessIdMap = buildArticleBusinessIdMap(project);
                    return ProjectDataResponse.from(project, developmentTimelineArticles, projectOverviewArticle, articleBusinessIdMap);
                })
                .toList();
            responseData.put("projects", mappedProjects);
        }

        return ResponseEntity.ok(ApiResponse.success(responseData, WebApiResponseMessages.PORTFOLIO_DATA_FETCH_SUCCESS));
    }
    
    @GetMapping("/projects")
    @Operation(summary = "프로젝트 데이터 조회", description = "모든 프로젝트 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<ProjectDataResponse>>> getProjects() {
        List<Project> projects = getProjectsUseCase.getAllProjects();
        List<ProjectDataResponse> responses = projects.stream()
            .map(project -> {
                List<ArticleSummary> developmentTimelineArticles = getDevelopmentTimelineArticles(project);
                ProjectDataResponse.ProjectOverviewArticleSummary projectOverviewArticle =
                        getProjectOverviewArticle(project);
                Map<Long, String> articleBusinessIdMap = buildArticleBusinessIdMap(project);
                return ProjectDataResponse.from(project, developmentTimelineArticles, projectOverviewArticle, articleBusinessIdMap);
            })
            .toList();
        return ResponseEntity.ok(ApiResponse.success(responses, WebApiResponseMessages.PROJECT_LIST_SUCCESS));
    }

    @GetMapping("/projects/{id}")
    @Operation(summary = "프로젝트 단건 조회", description = "비즈니스 ID로 단일 프로젝트를 조회합니다.")
    public ResponseEntity<ApiResponse<ProjectDataResponse>> getProject(@PathVariable String id) {
        Optional<Project> found = getProjectsUseCase.getProjectById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(WebApiResponseMessages.PROJECT_NOT_FOUND, "id: " + id));
        }
        Project project = found.get();
        List<ArticleSummary> developmentTimelineArticles = getDevelopmentTimelineArticles(project);
        ProjectDataResponse.ProjectOverviewArticleSummary projectOverviewArticle = getProjectOverviewArticle(project);
        Map<Long, String> articleBusinessIdMap = buildArticleBusinessIdMap(project);
        ProjectDataResponse response = ProjectDataResponse.from(project, developmentTimelineArticles, projectOverviewArticle, articleBusinessIdMap);
        return ResponseEntity.ok(ApiResponse.success(response, WebApiResponseMessages.PROJECT_GET_SUCCESS));
    }

    /**
     * 프로젝트의 development-timeline 타입 Article 조회 (최대 50개, 최신순)
     */
    private List<ArticleSummary> getDevelopmentTimelineArticles(Project project) {
        Long projectDbId = getProjectsUseCase.getProjectDatabaseIdByBusinessId(project.getId()).orElse(null);
        if (projectDbId == null) {
            return List.of();
        }
        
        // development-timeline 타입 Article 필터 생성
        ArticleFilter filter = new ArticleFilter();
        filter.setCategory("development-timeline");
        filter.setProjectId(projectDbId);
        
        // 최신순 정렬, 최대 50개
        Pageable pageable = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "publishedAt"));
        
        // Article 조회 및 ArticleSummary로 변환
        return getArticleUseCase.findByFilter(filter, pageable)
            .getContent()
            .stream()
            .map(this::toArticleSummary)
            .toList();
    }

    private ProjectDataResponse.ProjectOverviewArticleSummary getProjectOverviewArticle(Project project) {
        Long projectDbId = getProjectsUseCase.getProjectDatabaseIdByBusinessId(project.getId()).orElse(null);
        if (projectDbId == null) {
            return null;
        }

        ArticleFilter filter = new ArticleFilter();
        filter.setCategory("project-overview");
        filter.setProjectId(projectDbId);

        Pageable pageable = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "publishedAt"));
        return getArticleUseCase.findByFilter(filter, pageable)
                .getContent()
                .stream()
                .findFirst()
                .map(article -> ProjectDataResponse.ProjectOverviewArticleSummary.builder()
                        .businessId(article.getBusinessId())
                        .title(article.getTitle())
                        .content(article.getContent())
                        .build())
                .orElse(null);
    }

    private Map<Long, String> buildArticleBusinessIdMap(Project project) {
        if (project.getTechnicalCards() == null) return Map.of();
        List<Long> articleIds = project.getTechnicalCards().stream()
                .map(ProjectTechnicalCard::getArticleId)
                .filter(id -> id != null)
                .distinct()
                .toList();
        if (articleIds.isEmpty()) return Map.of();
        return getArticleUseCase.resolveBusinessIds(articleIds);
    }

    /**
     * Article을 ArticleSummary로 변환
     */
    private ArticleSummary toArticleSummary(Article article) {
        return ArticleSummary.builder()
            .businessId(article.getBusinessId())
            .title(article.getTitle())
            .summary(article.getSummary())
            .publishedAt(article.getPublishedAt())
            .build();
    }
    
    @GetMapping("/experiences")
    @Operation(summary = "경험 데이터 조회", description = "모든 경험 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Experience>>> getExperiences() {
        List<Experience> experiences = getAllDataUseCase.getAllExperiences();
        return ResponseEntity.ok(ApiResponse.success(experiences, WebApiResponseMessages.PUBLIC_EXPERIENCE_LIST_SUCCESS));
    }
    
    @GetMapping("/certifications")
    @Operation(summary = "자격증 데이터 조회", description = "모든 자격증 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Certification>>> getCertifications() {
        List<Certification> certifications = getAllDataUseCase.getAllCertifications();
        return ResponseEntity.ok(ApiResponse.success(certifications, WebApiResponseMessages.PUBLIC_CERTIFICATION_LIST_SUCCESS));
    }
    
    @GetMapping("/education")
    @Operation(summary = "교육 데이터 조회", description = "모든 교육 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<List<Education>>> getEducation() {
        List<Education> education = getAllDataUseCase.getAllEducations();
        return ResponseEntity.ok(ApiResponse.success(education, WebApiResponseMessages.PUBLIC_EDUCATION_LIST_SUCCESS));
    }

}
