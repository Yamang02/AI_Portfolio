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
    
    /**
     * 같은 시리즈의 최대 series_order 조회
     */
    @Query("SELECT MAX(a.seriesOrder) FROM ArticleJpaEntity a WHERE a.seriesId = :seriesId")
    Integer findMaxSeriesOrderBySeriesId(@Param("seriesId") String seriesId);
    
    /**
     * 같은 시리즈의 특정 순서보다 큰 순서를 가진 아티클들의 순서를 1씩 감소
     * (아티클 삭제 시 시리즈 순서 재정렬용)
     */
    @Modifying
    @Query("UPDATE ArticleJpaEntity a SET a.seriesOrder = a.seriesOrder - 1 WHERE a.seriesId = :seriesId AND a.seriesOrder > :deletedOrder")
    void decreaseSeriesOrderAfter(@Param("seriesId") String seriesId, @Param("deletedOrder") Integer deletedOrder);
}
