package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ArticleJpaRepository extends JpaRepository<ArticleJpaEntity, Long>, JpaSpecificationExecutor<ArticleJpaEntity> {

    Optional<ArticleJpaEntity> findByBusinessId(String businessId);

    @Modifying
    @Query("UPDATE ArticleJpaEntity a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Query("SELECT MAX(CAST(SUBSTRING(a.businessId, 9) AS integer)) FROM ArticleJpaEntity a WHERE a.businessId LIKE 'article-%'")
    Integer findMaxBusinessIdNumber();
}
