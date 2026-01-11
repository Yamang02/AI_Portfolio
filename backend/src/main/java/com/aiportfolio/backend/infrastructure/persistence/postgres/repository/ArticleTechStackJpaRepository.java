package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleTechStackJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArticleTechStackJpaRepository extends JpaRepository<ArticleTechStackJpaEntity, Long> {
    @Query("SELECT ts FROM ArticleTechStackJpaEntity ts WHERE ts.article.id IN :articleIds")
    List<ArticleTechStackJpaEntity> findByArticleIdIn(@Param("articleIds") List<Long> articleIds);
    
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM ArticleTechStackJpaEntity ts WHERE ts.article.id = :articleId")
    void deleteByArticleId(@Param("articleId") Long articleId);
}
