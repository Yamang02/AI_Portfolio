package com.aiportfolio.backend.infrastructure.persistence.postgres.adapter;

import com.aiportfolio.backend.domain.article.filter.ArticleFilter;
import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.model.ArticleStatistics;
import com.aiportfolio.backend.domain.article.port.out.ArticleRepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleSeriesJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.ArticleMapper;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ArticleJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ArticleSeriesJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ArticleTechStackJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ProjectJpaRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class PostgresArticleRepository implements ArticleRepositoryPort {

    private final ArticleJpaRepository jpaRepository;
    private final ArticleTechStackJpaRepository techStackRepository;
    private final ArticleMapper mapper;
    private final ProjectJpaRepository projectJpaRepository;
    private final ArticleSeriesJpaRepository seriesJpaRepository;

    @Override
    public Article save(Article article) {
        ArticleJpaEntity entity;

        if (article.getId() != null) {
            // 업데이트: 기존 엔티티 조회
            entity = jpaRepository.findById(article.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Article not found: " + article.getId()));

            // 필드 업데이트
            entity.setTitle(article.getTitle());
            entity.setSummary(article.getSummary());
            entity.setContent(article.getContent());
            entity.setProjectId(article.getProjectId());
            entity.setCategory(article.getCategory());
            entity.setTags(article.getTags() != null ? article.getTags().toArray(new String[0]) : new String[0]);
            entity.setStatus(article.getStatus());
            entity.setIsFeatured(article.getIsFeatured());
            entity.setSeriesId(article.getSeriesId());
            entity.setSeriesOrder(article.getSeriesOrder());

            // 기술 스택 업데이트 (머지 전략: 삭제/추가만 수행)
            // 1. 기존 기술 스택 조회
            List<ArticleTechStackJpaEntity> existingTechStacks = 
                    techStackRepository.findByArticleIdIn(List.of(article.getId()));
            
            // 2. 요청된 techName 집합
            Set<String> requestedTechNames = (article.getTechStack() == null || article.getTechStack().isEmpty())
                    ? Collections.emptySet()
                    : article.getTechStack().stream()
                            .map(ts -> ts.getTechName())
                            .filter(Objects::nonNull)
                            .collect(Collectors.toSet());
            
            // 3. 기존 기술 스택 중 삭제할 것들 (요청에 없는 것들)
            List<ArticleTechStackJpaEntity> toDelete = existingTechStacks.stream()
                    .filter(existing -> !requestedTechNames.contains(existing.getTechName()))
                    .collect(Collectors.toList());
            
            if (!toDelete.isEmpty()) {
                techStackRepository.deleteAll(toDelete);
                techStackRepository.flush(); // 명시적 플러시로 삭제가 DB에 반영되도록 보장
            }
            
            // 4. 기존에 있던 techName 집합
            Set<String> existingTechNames = existingTechStacks.stream()
                    .map(ArticleTechStackJpaEntity::getTechName)
                    .collect(Collectors.toSet());
            
            // 5. 새로 추가할 기술 스택들 (기존에 없는 것들)
            if (article.getTechStack() != null && !article.getTechStack().isEmpty()) {
                List<ArticleTechStackJpaEntity> toAdd = article.getTechStack().stream()
                        .filter(ts -> !existingTechNames.contains(ts.getTechName()))
                        .map(ts -> ArticleTechStackJpaEntity.builder()
                                .article(entity)
                                .techName(ts.getTechName())
                                .isPrimary(ts.getIsPrimary())
                                .build())
                        .collect(Collectors.toList());
                
                if (!toAdd.isEmpty()) {
                    entity.getTechStack().addAll(toAdd);
                }
            }
        } else {
            // 생성: 새 엔티티
            entity = mapper.toEntity(article);

            // 기술 스택 설정
            if (article.getTechStack() != null) {
                List<ArticleTechStackJpaEntity> techStackEntities = article.getTechStack().stream()
                        .map(ts -> ArticleTechStackJpaEntity.builder()
                                .article(entity)
                                .techName(ts.getTechName())
                                .isPrimary(ts.getIsPrimary())
                                .build())
                        .collect(Collectors.toList());
                entity.setTechStack(techStackEntities);
            }
        }

        ArticleJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void delete(Long id) {
        // 삭제 전에 시리즈 정보 조회 (순서 재정렬을 위해)
        Optional<ArticleJpaEntity> entityOpt = jpaRepository.findById(id);
        if (entityOpt.isPresent()) {
            ArticleJpaEntity entity = entityOpt.get();
            String seriesId = entity.getSeriesId();
            Integer seriesOrder = entity.getSeriesOrder();
            
            // 시리즈에 속한 아티클인 경우 순서 재정렬
            if (seriesId != null && seriesOrder != null) {
                jpaRepository.decreaseSeriesOrderAfter(seriesId, seriesOrder);
            }
        }
        
        // 아티클 삭제 (ArticleTechStack은 CASCADE로 자동 삭제됨)
        jpaRepository.deleteById(id);
    }
    
    @Override
    public void decreaseSeriesOrderAfter(String seriesId, Integer deletedOrder) {
        jpaRepository.decreaseSeriesOrderAfter(seriesId, deletedOrder);
    }

    @Override
    public Optional<Article> findById(Long id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Article> findByBusinessId(String businessId) {
        return jpaRepository.findByBusinessId(businessId)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Article> findAll(Pageable pageable) {
        Page<ArticleJpaEntity> page = jpaRepository.findAll(pageable);
        
        // techStack을 배치로 조회하여 N+1 문제 방지
        List<ArticleJpaEntity> entities = page.getContent();
        if (entities.isEmpty()) {
            return page.map(mapper::toDomain);
        }
        
        // 모든 articleId의 techStack을 한 번에 조회
        List<Long> articleIds = entities.stream()
                .map(ArticleJpaEntity::getId)
                .collect(Collectors.toList());
        List<ArticleTechStackJpaEntity> allTechStacks = techStackRepository.findByArticleIdIn(articleIds);
        
        // articleId별로 techStack을 그룹화
        java.util.Map<Long, List<ArticleTechStackJpaEntity>> techStackMap = allTechStacks.stream()
                .collect(Collectors.groupingBy(ts -> ts.getArticle().getId()));
        
        // DTO 변환 시 techStack을 포함 (엔티티는 수정하지 않음)
        return page.map(entity -> {
            List<ArticleTechStackJpaEntity> techStacks = techStackMap.getOrDefault(entity.getId(), List.of());
            // 임시 엔티티 생성하여 매핑 (원본 엔티티는 수정하지 않음)
            ArticleJpaEntity entityWithTechStack = ArticleJpaEntity.builder()
                    .id(entity.getId())
                    .businessId(entity.getBusinessId())
                    .title(entity.getTitle())
                    .summary(entity.getSummary())
                    .content(entity.getContent())
                    .projectId(entity.getProjectId())
                    .category(entity.getCategory())
                    .tags(entity.getTags())
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
                    .techStack(techStacks)
                    .build();
            return mapper.toDomain(entityWithTechStack);
        });
    }

    @Override
    public Page<Article> findByFilter(ArticleFilter filter, Pageable pageable) {
        Specification<ArticleJpaEntity> spec = buildSpecification(filter);
        Page<ArticleJpaEntity> page = jpaRepository.findAll(spec, pageable);
        
        // techStack을 배치로 조회하여 N+1 문제 방지
        List<ArticleJpaEntity> entities = page.getContent();
        if (entities.isEmpty()) {
            return page.map(mapper::toDomain);
        }
        
        // 모든 articleId의 techStack을 한 번에 조회
        List<Long> articleIds = entities.stream()
                .map(ArticleJpaEntity::getId)
                .collect(Collectors.toList());
        List<ArticleTechStackJpaEntity> allTechStacks = techStackRepository.findByArticleIdIn(articleIds);
        
        // articleId별로 techStack을 그룹화
        java.util.Map<Long, List<ArticleTechStackJpaEntity>> techStackMap = allTechStacks.stream()
                .collect(Collectors.groupingBy(ts -> ts.getArticle().getId()));
        
        // DTO 변환 시 techStack을 포함 (엔티티는 수정하지 않음)
        return page.map(entity -> {
            List<ArticleTechStackJpaEntity> techStacks = techStackMap.getOrDefault(entity.getId(), List.of());
            // 임시 엔티티 생성하여 매핑 (원본 엔티티는 수정하지 않음)
            ArticleJpaEntity entityWithTechStack = ArticleJpaEntity.builder()
                    .id(entity.getId())
                    .businessId(entity.getBusinessId())
                    .title(entity.getTitle())
                    .summary(entity.getSummary())
                    .content(entity.getContent())
                    .projectId(entity.getProjectId())
                    .category(entity.getCategory())
                    .tags(entity.getTags())
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
                    .techStack(techStacks)
                    .build();
            return mapper.toDomain(entityWithTechStack);
        });
    }

    /**
     * 필터 조건에 따른 Specification 생성
     * genpresso-admin-backend의 필터 패턴을 참고하여 구현
     */
    private Specification<ArticleJpaEntity> buildSpecification(ArticleFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 상태 필터 (발행된 것만)
            predicates.add(cb.equal(root.get("status"), "published"));

            // 카테고리 필터
            if (StringUtils.hasText(filter.getCategory())) {
                predicates.add(cb.equal(root.get("category"), filter.getCategory()));
            }

            // 프로젝트 필터
            if (filter.getProjectId() != null) {
                predicates.add(cb.equal(root.get("projectId"), filter.getProjectId()));
            }

            // 시리즈 필터
            if (StringUtils.hasText(filter.getSeriesId())) {
                predicates.add(cb.equal(root.get("seriesId"), filter.getSeriesId()));
            }

            // 추천 아티클 필터
            if (filter.getIsFeatured() != null) {
                predicates.add(cb.equal(root.get("isFeatured"), filter.getIsFeatured()));
            }

            // 검색어 필터 (제목, 요약, 내용)
            if (StringUtils.hasText(filter.getSearchKeyword())) {
                String searchPattern = "%" + filter.getSearchKeyword().toLowerCase() + "%";
                Predicate titlePredicate = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate summaryPredicate = cb.like(cb.lower(root.get("summary")), searchPattern);
                Predicate contentPredicate = cb.like(cb.lower(root.get("content")), searchPattern);
                predicates.add(cb.or(titlePredicate, summaryPredicate, contentPredicate));
            }

            // 날짜 범위 필터
            if (filter.getDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("publishedAt"), filter.getDateFrom()));
            }
            if (filter.getDateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("publishedAt"), filter.getDateTo()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    public void incrementViewCount(Long id) {
        jpaRepository.incrementViewCount(id);
    }

    @Override
    public String generateNextBusinessId() {
        Integer maxNumber = jpaRepository.findMaxBusinessIdNumber();
        int nextNumber = (maxNumber != null ? maxNumber : 0) + 1;
        return String.format("article-%03d", nextNumber);
    }

    @Override
    public ArticleStatistics getStatistics() {
        // 카테고리별 카운트
        Map<String, Long> categoryCounts = new HashMap<>();
        List<Object[]> categoryResults = jpaRepository.countByCategory();
        for (Object[] result : categoryResults) {
            String category = (String) result[0];
            Long count = ((Number) result[1]).longValue();
            categoryCounts.put(category, count);
        }

        // 프로젝트별 카운트
        List<Object[]> projectResults = jpaRepository.countByProjectId();
        List<ArticleStatistics.ProjectStatistics> projectStats = new ArrayList<>();
        for (Object[] result : projectResults) {
            Long projectId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            
            Optional<ProjectJpaEntity> projectOpt = projectJpaRepository.findById(projectId);
            if (projectOpt.isPresent()) {
                ProjectJpaEntity project = projectOpt.get();
                projectStats.add(new ArticleStatistics.ProjectStatistics(
                    project.getId(),
                    project.getBusinessId(),
                    project.getTitle(),
                    count
                ));
            }
        }

        // 시리즈별 카운트
        List<Object[]> seriesResults = jpaRepository.countBySeriesId();
        List<ArticleStatistics.SeriesStatistics> seriesStats = new ArrayList<>();
        for (Object[] result : seriesResults) {
            String seriesId = (String) result[0];
            Long count = ((Number) result[1]).longValue();
            
            ArticleSeriesJpaEntity series = seriesJpaRepository.findBySeriesId(seriesId);
            if (series != null) {
                seriesStats.add(new ArticleStatistics.SeriesStatistics(
                    series.getSeriesId(),
                    series.getTitle(),
                    count
                ));
            }
        }

        return new ArticleStatistics(categoryCounts, projectStats, seriesStats);
    }
}
