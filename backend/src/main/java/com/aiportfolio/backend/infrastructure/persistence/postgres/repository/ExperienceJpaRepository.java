package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ExperienceJpaEntity;

// 외부 라이브러리 imports
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

// Java 표준 라이브러리 imports
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Experience JPA Repository
 * Spring Data JPA를 사용한 데이터 액세스 레이어
 */
@Repository
public interface ExperienceJpaRepository extends JpaRepository<ExperienceJpaEntity, Long> {
    
    /**
     * 비즈니스 ID로 경력 조회
     * @param businessId 비즈니스 ID (EXP001, EXP002 등)
     * @return 경력 엔티티
     */
    Optional<ExperienceJpaEntity> findByBusinessId(String businessId);

    /**
     * 비즈니스 ID로 경력 삭제
     * @param businessId 비즈니스 ID
     */
    void deleteByBusinessId(String businessId);

    /**
     * 조직명으로 경력 조회
     * @param organization 조직명
     * @return 경력 엔티티 리스트
     */
    List<ExperienceJpaEntity> findByOrganization(String organization);
    
    /**
     * 타입별 경력 조회
     * @param type 경력 타입
     * @return 경력 엔티티 리스트
     */
    List<ExperienceJpaEntity> findByType(String type);
    
    /**
     * 현재 재직중인 경력 조회 (end_date가 null인 경력)
     * @return 현재 재직중인 경력 엔티티 리스트
     */
    @Query("SELECT e FROM ExperienceJpaEntity e WHERE e.endDate IS NULL")
    List<ExperienceJpaEntity> findCurrentExperiences();
    
    /**
     * 특정 기간 내 경력 조회
     * @param startDate 시작일
     * @param endDate 종료일
     * @return 해당 기간 내 경력 엔티티 리스트
     */
    @Query("SELECT e FROM ExperienceJpaEntity e WHERE e.startDate <= :endDate AND (e.endDate IS NULL OR e.endDate >= :startDate)")
    List<ExperienceJpaEntity> findExperiencesByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    /**
     * 특정 기술을 사용한 경력 조회
     * @param technology 기술명
     * @return 경력 엔티티 리스트
     */
    @Query(value = "SELECT * FROM experiences WHERE :technology = ANY(technologies)", nativeQuery = true)
    List<ExperienceJpaEntity> findByTechnology(@Param("technology") String technology);
    
    /**
     * 정렬 순서와 시작일 기준으로 모든 경력 조회 (기술 스택 포함)
     * @return 정렬된 경력 엔티티 리스트
     */
    @Query("SELECT DISTINCT e FROM ExperienceJpaEntity e LEFT JOIN FETCH e.experienceTechStacks et LEFT JOIN FETCH et.techStack ORDER BY e.sortOrder ASC, e.startDate DESC")
    List<ExperienceJpaEntity> findAllOrderedBySortOrderAndStartDate();
    
    /**
     * 조직명에 특정 키워드가 포함된 경력 조회
     * @param keyword 검색 키워드
     * @return 경력 엔티티 리스트
     */
    @Query("SELECT e FROM ExperienceJpaEntity e WHERE LOWER(e.organization) LIKE LOWER('%' || :keyword || '%')")
    List<ExperienceJpaEntity> findByOrganizationContaining(@Param("keyword") String keyword);
    
    /**
     * 역할에 특정 키워드가 포함된 경력 조회
     * @param keyword 검색 키워드
     * @return 경력 엔티티 리스트
     */
    @Query("SELECT e FROM ExperienceJpaEntity e WHERE LOWER(e.role) LIKE LOWER('%' || :keyword || '%')")
    List<ExperienceJpaEntity> findByRoleContaining(@Param("keyword") String keyword);
}