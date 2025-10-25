package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.EducationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Education JPA Repository
 */
@Repository
public interface EducationJpaRepository extends JpaRepository<EducationJpaEntity, Long> {
    
    /**
     * 비즈니스 ID로 교육 조회
     */
    Optional<EducationJpaEntity> findByBusinessId(String businessId);

    /**
     * 비즈니스 ID로 교육 삭제
     */
    void deleteByBusinessId(String businessId);

    /**
     * 교육기관명으로 조회
     */
    List<EducationJpaEntity> findByOrganization(String organization);
    
    /**
     * 타입별 교육 조회
     */
    List<EducationJpaEntity> findByType(String type);
    
    /**
     * 특정 기술을 사용한 교육 조회
     */
    @Query(value = "SELECT * FROM education WHERE :technology = ANY(technologies)", nativeQuery = true)
    List<EducationJpaEntity> findByTechnology(@Param("technology") String technology);
    
    /**
     * 정렬 순서와 시작일 기준으로 모든 교육 조회
     */
    @Query("SELECT e FROM EducationJpaEntity e ORDER BY e.sortOrder ASC, e.startDate DESC")
    List<EducationJpaEntity> findAllOrderedBySortOrderAndStartDate();
}