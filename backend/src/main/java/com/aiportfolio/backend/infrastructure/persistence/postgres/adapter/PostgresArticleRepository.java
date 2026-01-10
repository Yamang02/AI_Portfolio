package com.aiportfolio.backend.infrastructure.persistence.postgres.adapter;

import com.aiportfolio.backend.domain.article.filter.ArticleFilter;
import com.aiportfolio.backend.domain.article.model.Article;
import com.aiportfolio.backend.domain.article.port.out.ArticleRepositoryPort;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleTechStackJpaEntity;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.ArticleMapper;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ArticleJpaRepository;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.ArticleTechStackJpaRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class PostgresArticleRepository implements ArticleRepositoryPort {

    private final ArticleJpaRepository jpaRepository;
    private final ArticleTechStackJpaRepository techStackRepository;
    private final ArticleMapper mapper;

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

            // 기술 스택 업데이트 (기존 삭제 후 재추가)
            entity.getTechStack().clear();
            if (article.getTechStack() != null) {
                List<ArticleTechStackJpaEntity> newTechStack = article.getTechStack().stream()
                        .map(ts -> ArticleTechStackJpaEntity.builder()
                                .article(entity)
                                .techName(ts.getTechName())
                                .isPrimary(ts.getIsPrimary())
                                .build())
                        .collect(Collectors.toList());
                entity.getTechStack().addAll(newTechStack);
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
        jpaRepository.deleteById(id);
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
        return jpaRepository.findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Article> findByFilter(ArticleFilter filter, Pageable pageable) {
        Specification<ArticleJpaEntity> spec = buildSpecification(filter);
        return jpaRepository.findAll(spec, pageable)
                .map(mapper::toDomain);
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
}
