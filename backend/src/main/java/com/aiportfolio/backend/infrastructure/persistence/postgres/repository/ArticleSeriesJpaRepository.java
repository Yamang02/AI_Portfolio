package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ArticleSeriesJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArticleSeriesJpaRepository extends JpaRepository<ArticleSeriesJpaEntity, Long> {

    /**
     * 시리즈 ID로 조회
     */
    ArticleSeriesJpaEntity findBySeriesId(String seriesId);

    /**
     * 제목으로 검색 (LIKE 검색, 대소문자 구분 없음)
     */
    @Query("SELECT s FROM ArticleSeriesJpaEntity s WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY s.title")
    List<ArticleSeriesJpaEntity> findByTitleContainingIgnoreCase(@Param("keyword") String keyword);
    
    /**
     * 시리즈 ID 존재 여부 확인
     */
    boolean existsBySeriesId(String seriesId);
    
    /**
     * 최대 시리즈 ID 번호 조회 (예: "article-series-001" -> 1)
     */
    @Query("SELECT MAX(CAST(SUBSTRING(s.seriesId, 16) AS integer)) FROM ArticleSeriesJpaEntity s WHERE s.seriesId LIKE 'article-series-%'")
    Integer findMaxSeriesIdNumber();
}
