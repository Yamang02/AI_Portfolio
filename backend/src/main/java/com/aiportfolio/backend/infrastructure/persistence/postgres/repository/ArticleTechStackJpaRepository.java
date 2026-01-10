package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleTechStackJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleTechStackJpaRepository extends JpaRepository<ArticleTechStackJpaEntity, Long> {
}
