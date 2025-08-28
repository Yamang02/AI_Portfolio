package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.CertificationJpaEntity;

// 외부 라이브러리 imports
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

// Java 표준 라이브러리 imports
import java.util.List;
import java.util.Optional;

/**
 * Certification JPA Repository
 */
@Repository
public interface CertificationJpaRepository extends JpaRepository<CertificationJpaEntity, Long> {

    /**
     * 비즈니스 ID로 자격증 조회
     */
    Optional<CertificationJpaEntity> findByBusinessId(String businessId);

    /**
     * 발급기관별 자격증 조회
     */
    List<CertificationJpaEntity> findByIssuer(String issuer);

    /**
     * 카테고리별 자격증 조회
     */
    List<CertificationJpaEntity> findByCategory(String category);

    /**
     * 정렬 순서와 취득일 기준으로 모든 자격증 조회
     */
    @Query("SELECT c FROM CertificationJpaEntity c ORDER BY c.sortOrder ASC, c.date DESC")
    List<CertificationJpaEntity> findAllOrderedBySortOrderAndDate();
}