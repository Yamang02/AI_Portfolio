package com.aiportfolio.backend.infrastructure.web.dto.project;

import com.aiportfolio.backend.domain.portfolio.model.Project;
import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.infrastructure.web.dto.article.ArticleSummary;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class ProjectDataResponse {
    String id; // 비즈니스 ID
    String title;
    String description;
    String type;
    String source;
    String status;
    Integer sortOrder;
    LocalDate startDate;
    LocalDate endDate;

    @JsonProperty("isTeam")
    boolean isTeam;

    @JsonProperty("isFeatured")
    boolean isFeatured;

    Integer teamSize;
    String role;
    List<String> myContributions;
    String githubUrl;
    String liveUrl;
    String externalUrl;
    String imageUrl;
    List<String> screenshots;
    List<ProjectTechnicalCardSummary> technicalCards;
    List<String> technologies;
    List<TechStackMetadata> techStackMetadata;
    ProjectOverviewArticleSummary projectOverviewArticle;
    List<ArticleSummary> developmentTimelineArticles;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    public static ProjectDataResponse from(Project project) {
        return ProjectDataResponse.builder()
                .id(project.getId()) // 비즈니스 ID
                .title(project.getTitle())
                .description(project.getDescription())
                .type(project.getType())
                .source(project.getSource())
                .status(project.getStatus())
                .sortOrder(project.getSortOrder())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .isTeam(project.isTeam())
                .isFeatured(project.isFeatured())
                .teamSize(project.getTeamSize())
                .role(project.getRole())
                .myContributions(project.getMyContributions())
                .githubUrl(project.getGithubUrl())
                .liveUrl(project.getLiveUrl())
                .externalUrl(project.getExternalUrl())
                .imageUrl(project.getImageUrl())
                .screenshots(project.getScreenshots())
                .technicalCards(toTechnicalCards(project))
                .technologies(project.getTechnologies())
                .techStackMetadata(project.getTechStackMetadata())
                .projectOverviewArticle(null)
                .developmentTimelineArticles(List.of()) // 기본값은 빈 리스트, DataController에서 채움
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    /**
     * Article 정보를 포함한 ProjectDataResponse 생성
     */
    public static ProjectDataResponse from(
            Project project,
            List<ArticleSummary> developmentTimelineArticles,
            ProjectOverviewArticleSummary projectOverviewArticle) {
        return ProjectDataResponse.builder()
                .id(project.getId()) // 비즈니스 ID
                .title(project.getTitle())
                .description(project.getDescription())
                .type(project.getType())
                .source(project.getSource())
                .status(project.getStatus())
                .sortOrder(project.getSortOrder())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .isTeam(project.isTeam())
                .isFeatured(project.isFeatured())
                .teamSize(project.getTeamSize())
                .role(project.getRole())
                .myContributions(project.getMyContributions())
                .githubUrl(project.getGithubUrl())
                .liveUrl(project.getLiveUrl())
                .externalUrl(project.getExternalUrl())
                .imageUrl(project.getImageUrl())
                .screenshots(project.getScreenshots())
                .technicalCards(toTechnicalCards(project))
                .technologies(project.getTechnologies())
                .techStackMetadata(project.getTechStackMetadata())
                .projectOverviewArticle(projectOverviewArticle)
                .developmentTimelineArticles(developmentTimelineArticles != null ? developmentTimelineArticles : List.of())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private static List<ProjectTechnicalCardSummary> toTechnicalCards(Project project) {
        if (project.getTechnicalCards() == null) {
            return List.of();
        }
        return project.getTechnicalCards().stream()
                .map(card -> ProjectTechnicalCardSummary.builder()
                        .id(card.getBusinessId())
                        .title(card.getTitle())
                        .category(card.getCategory())
                        .problemStatement(card.getProblemStatement())
                        .analysis(card.getAnalysis())
                        .solution(card.getSolution())
                        .articleId(card.getArticleId())
                        .isPinned(card.isPinned())
                        .sortOrder(card.getSortOrder())
                        .build())
                .toList();
    }

    @Value
    @Builder
    public static class ProjectTechnicalCardSummary {
        String id;
        String title;
        String category;
        String problemStatement;
        String analysis;
        String solution;
        Long articleId;
        @JsonProperty("isPinned")
        boolean isPinned;
        Integer sortOrder;
    }

    @Value
    @Builder
    public static class ProjectOverviewArticleSummary {
        String businessId;
        String title;
        String content;
    }
}
