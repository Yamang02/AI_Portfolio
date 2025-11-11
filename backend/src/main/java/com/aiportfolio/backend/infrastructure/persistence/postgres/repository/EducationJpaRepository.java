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
     * 정렬 순서와 시작일 기준으로 모든 교육 조회 (기술 스택 포함)
     */
    @Query("SELECT DISTINCT e FROM EducationJpaEntity e LEFT JOIN FETCH e.educationTechStacks et LEFT JOIN FETCH et.techStack ORDER BY e.sortOrder ASC, e.startDate DESC")
    List<EducationJpaEntity> findAllOrderedBySortOrderAndStartDate();
    
    /**
     * 최대 정렬 순서 조회
     * @return 최대 정렬 순서
     */
    @Query("SELECT COALESCE(MAX(e.sortOrder), 0) FROM EducationJpaEntity e")
    Integer findMaxSortOrder();

    /**
     * 특정 접두사로 시작하는 마지막 비즈니스 ID 조회
     * @param prefix 접두사 (예: "edu-")
     * @return 마지막 비즈니스 ID (예: "edu-010")
     */
    @Query(value = "SELECT e.business_id FROM education e WHERE e.business_id LIKE :prefix || '%' ORDER BY e.business_id DESC LIMIT 1", nativeQuery = true)
    Optional<String> findLastBusinessIdByPrefix(@Param("prefix") String prefix);
}