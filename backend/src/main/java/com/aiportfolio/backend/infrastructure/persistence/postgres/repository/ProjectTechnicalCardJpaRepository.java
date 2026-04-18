package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectTechnicalCardJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectTechnicalCardJpaRepository extends JpaRepository<ProjectTechnicalCardJpaEntity, Long> {

    List<ProjectTechnicalCardJpaEntity> findByArticleId(Long articleId);
}
