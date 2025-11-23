package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

// 인프라 레이어 imports
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.ProjectJpaEntity;

// 외부 라이브러리 imports
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

// Java 표준 라이브러리 imports
import java.util.List;
import java.util.Optional;

/**
 * Project JPA Repository
 * Spring Data JPA를 사용한 데이터 액세스 레이어
 */
@Repository
public interface ProjectJpaRepository extends JpaRepository<ProjectJpaEntity, Long>, JpaSpecificationExecutor<ProjectJpaEntity> {
    
    /**
     * 비즈니스 ID로 프로젝트 조회
     * @param businessId 비즈니스 ID (PJT001, PJT002 등)
     * @return 프로젝트 엔티티
     */
    Optional<ProjectJpaEntity> findByBusinessId(String businessId);
    
    /**
     * 제목으로 프로젝트 조회
     * @param title 프로젝트 제목
     * @return 프로젝트 엔티티
     */
    Optional<ProjectJpaEntity> findByTitle(String title);
    
    /**
     * 타입별 프로젝트 조회
     * @param type 프로젝트 타입
     * @return 프로젝트 엔티티 리스트
     */
    List<ProjectJpaEntity> findByType(String type);
    
    /**
     * 소스별 프로젝트 조회
     * @param source 프로젝트 소스
     * @return 프로젝트 엔티티 리스트
     */
    List<ProjectJpaEntity> findBySource(String source);
    
    /**
     * 팀 프로젝트 여부로 조회
     * @param isTeam 팀 프로젝트 여부
     * @return 프로젝트 엔티티 리스트
     */
    List<ProjectJpaEntity> findByIsTeam(Boolean isTeam);
    
    /**
     * 상태별 프로젝트 조회
     * @param status 프로젝트 상태
     * @return 프로젝트 엔티티 리스트
     */
    List<ProjectJpaEntity> findByStatus(String status);
    
    /**
     * 진행중인 프로젝트 조회 (end_date가 null인 프로젝트)
     * @return 진행중인 프로젝트 엔티티 리스트
     */
    @Query("SELECT p FROM ProjectJpaEntity p WHERE p.endDate IS NULL")
    List<ProjectJpaEntity> findOngoingProjects();
    
    /**
     * 특정 기술을 사용하는 프로젝트 조회
     * @param technology 기술명
     * @return 프로젝트 엔티티 리스트
     */
    @Query(value = "SELECT * FROM projects WHERE :technology = ANY(technologies)", nativeQuery = true)
    List<ProjectJpaEntity> findByTechnology(@Param("technology") String technology);
    
    /**
     * 정렬 순서와 시작일 기준으로 모든 프로젝트 조회
     * @return 정렬된 프로젝트 엔티티 리스트
     */
    @Query("SELECT p FROM ProjectJpaEntity p ORDER BY p.sortOrder ASC, p.startDate DESC")
    List<ProjectJpaEntity> findAllOrderedBySortOrderAndStartDate();

    /**
     * 페이지네이션을 지원하는 모든 프로젝트 조회 (Admin용)
     * @param pageable 페이지 정보
     * @return 페이지네이션된 프로젝트 엔티티 리스트
     */
    @Query("SELECT p FROM ProjectJpaEntity p ORDER BY p.sortOrder ASC, p.startDate DESC")
    Page<ProjectJpaEntity> findAllWithPagination(Pageable pageable);
    
    /**
     * GitHub URL이 있는 프로젝트만 조회
     * @return GitHub URL이 있는 프로젝트 엔티티 리스트
     */
    @Query("SELECT p FROM ProjectJpaEntity p WHERE p.githubUrl IS NOT NULL AND p.githubUrl != ''")
    List<ProjectJpaEntity> findProjectsWithGithubUrl();
    
    /**
     * 라이브 URL이 있는 프로젝트만 조회
     * @return 라이브 URL이 있는 프로젝트 엔티티 리스트
     */
    @Query("SELECT p FROM ProjectJpaEntity p WHERE p.liveUrl IS NOT NULL AND p.liveUrl != ''")
    List<ProjectJpaEntity> findProjectsWithLiveUrl();
    
    /**
     * 비즈니스 ID로 프로젝트 삭제 (Admin Dashboard용)
     * @param businessId 비즈니스 ID
     */
    void deleteByBusinessId(String businessId);
    
    /**
     * 비즈니스 ID로 프로젝트 존재 여부 확인 (Admin Dashboard용)
     * @param businessId 비즈니스 ID
     * @return 존재 여부
     */
    boolean existsByBusinessId(String businessId);
    
    /**
     * 특정 prefix를 가진 마지막 비즈니스 ID를 조회합니다 (ID 생성용)
     * @param prefix 비즈니스 ID prefix (예: "prj-")
     * @return 마지막 비즈니스 ID (예: "prj-010")
     */
    @Query(value = "SELECT p.business_id FROM projects p WHERE p.business_id LIKE :prefix || '%' ORDER BY p.business_id DESC LIMIT 1", nativeQuery = true)
    Optional<String> findLastBusinessIdByPrefix(@Param("prefix") String prefix);
    
    /**
     * 최대 정렬 순서 조회
     * @return 최대 정렬 순서
     */
    @Query("SELECT MAX(p.sortOrder) FROM ProjectJpaEntity p")
    Integer findMaxSortOrder();
}