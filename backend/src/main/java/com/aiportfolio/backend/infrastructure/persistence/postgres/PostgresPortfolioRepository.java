package com.aiportfolio.backend.infrastructure.persistence.postgres;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.model.*;

// 인프라 레이어 imports (와일드카드 사용)
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.*;

// 외부 라이브러리 imports
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;
import com.aiportfolio.backend.infrastructure.cache.CacheService;

// Java 표준 라이브러리 imports
import java.time.LocalDateTime;
import java.util.*;

/**
 * PostgreSQL 기반 PortfolioRepository 구현체
 * 헥사고날 아키텍처의 어댑터(Adapter) 역할
 * 현재는 JSON 파일 기반으로 구현되어 있으며, 향후 PostgreSQL로 마이그레이션 예정
 */
@Slf4j
@Repository
@Primary
@RequiredArgsConstructor
public class PostgresPortfolioRepository implements PortfolioRepositoryPort {

    // JPA Repository들 (Spring Data JPA 인터페이스)
    private final ProjectJpaRepository projectJpaRepository;
    private final ExperienceJpaRepository experienceJpaRepository;
    private final EducationJpaRepository educationJpaRepository;
    private final CertificationJpaRepository certificationJpaRepository;

    // 매퍼들 (도메인 ↔ JPA 엔티티 변환)
    private final ProjectMapper projectMapper;
    private final ExperienceMapper experienceMapper;
    private final EducationMapper educationMapper;
    private final CertificationMapper certificationMapper;

    // Redis 캐시 서비스 (선택적 의존성)
    private final Optional<CacheService> cacheService;

    // 캐시 관련 필드
    private List<Project> cachedProjects;
    private List<Experience> cachedExperiences;
    private List<Education> cachedEducations;
    private List<Certification> cachedCertifications;
    private LocalDateTime lastCacheTime;
    private static final long CACHE_DURATION_MINUTES = 60; // 1시간 캐시

    // === 프로젝트 관련 구현 ===

    @Override
    @Cacheable(cacheNames = "projects", key = "'all'")
    public List<Project> findAllProjects() {
        if (cachedProjects == null || !isCacheValid()) {
            log.info("PostgreSQL에서 프로젝트 데이터를 조회합니다.");
            try {
                List<ProjectJpaEntity> jpaEntities = projectJpaRepository.findAllOrderedBySortOrderAndStartDate();
                cachedProjects = projectMapper.toDomainList(jpaEntities);
                updateCacheTime();
                log.info("프로젝트 {} 개를 성공적으로 조회했습니다.", cachedProjects.size());
            } catch (Exception e) {
                log.error("프로젝트 조회 중 오류 발생", e);
                cachedProjects = new ArrayList<>();
            }
        }
        return cachedProjects;
    }

    @Override
    public Optional<Project> findProjectById(String id) {
        try {
            Optional<ProjectJpaEntity> jpaEntity = projectJpaRepository.findByBusinessId(id);
            return jpaEntity.map(projectMapper::toDomain);
        } catch (Exception e) {
            log.error("프로젝트 ID로 조회 중 오류 발생: {}", id, e);
            return Optional.empty();
        }
    }

    @Override
    public Optional<Project> findProjectByTitle(String title) {
        try {
            Optional<ProjectJpaEntity> jpaEntity = projectJpaRepository.findByTitle(title);
            return jpaEntity.map(projectMapper::toDomain);
        } catch (Exception e) {
            log.error("프로젝트 제목으로 조회 중 오류 발생: {}", title, e);
            return Optional.empty();
        }
    }

    @Override
    public List<Project> findProjectsByType(String type) {
        try {
            if (type == null) {
                return findAllProjects();
            }
            List<ProjectJpaEntity> jpaEntities = projectJpaRepository.findByType(type);
            return projectMapper.toDomainList(jpaEntities);
        } catch (Exception e) {
            log.error("프로젝트 타입으로 조회 중 오류 발생: {}", type, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Project> findProjectsBySource(String source) {
        try {
            if (source == null) {
                return findAllProjects();
            }
            List<ProjectJpaEntity> jpaEntities = projectJpaRepository.findBySource(source);
            return projectMapper.toDomainList(jpaEntities);
        } catch (Exception e) {
            log.error("프로젝트 소스로 조회 중 오류 발생: {}", source, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Project> findProjectsByTeamStatus(boolean isTeam) {
        try {
            List<ProjectJpaEntity> jpaEntities = projectJpaRepository.findByIsTeam(isTeam);
            return projectMapper.toDomainList(jpaEntities);
        } catch (Exception e) {
            log.error("프로젝트 팀 상태로 조회 중 오류 발생: {}", isTeam, e);
            return new ArrayList<>();
        }
    }

    // === 경력 관련 구현 ===

    @Override
    public List<Experience> findAllExperiences() {
        if (cachedExperiences == null || !isCacheValid()) {
            log.info("PostgreSQL에서 경력 데이터를 조회합니다.");
            try {
                List<ExperienceJpaEntity> jpaEntities = experienceJpaRepository.findAllOrderedBySortOrderAndStartDate();
                cachedExperiences = experienceMapper.toDomainList(jpaEntities);
                updateCacheTime();
                log.info("경력 {} 개를 성공적으로 조회했습니다.", cachedExperiences.size());
            } catch (Exception e) {
                log.error("경력 조회 중 오류 발생", e);
                cachedExperiences = new ArrayList<>();
            }
        }
        return cachedExperiences;
    }

    @Override
    public Optional<Experience> findExperienceById(String id) {
        try {
            Optional<ExperienceJpaEntity> jpaEntity = experienceJpaRepository.findByBusinessId(id);
            return jpaEntity.map(experienceMapper::toDomain);
        } catch (Exception e) {
            log.error("경력 ID로 조회 중 오류 발생: {}", id, e);
            return Optional.empty();
        }
    }

    // === 교육 관련 구현 ===

    @Override
    public List<Education> findAllEducations() {
        if (cachedEducations == null || !isCacheValid()) {
            log.info("PostgreSQL에서 교육 데이터를 조회합니다.");
            try {
                List<EducationJpaEntity> jpaEntities = educationJpaRepository.findAllOrderedBySortOrderAndStartDate();
                cachedEducations = educationMapper.toDomainList(jpaEntities);
                updateCacheTime();
                log.info("교육 {} 개를 성공적으로 조회했습니다.", cachedEducations.size());
            } catch (Exception e) {
                log.error("교육 조회 중 오류 발생", e);
                cachedEducations = new ArrayList<>();
            }
        }
        return cachedEducations;
    }

    @Override
    public Optional<Education> findEducationById(String id) {
        try {
            Optional<EducationJpaEntity> jpaEntity = educationJpaRepository.findByBusinessId(id);
            return jpaEntity.map(educationMapper::toDomain);
        } catch (Exception e) {
            log.error("교육 ID로 조회 중 오류 발생: {}", id, e);
            return Optional.empty();
        }
    }

    // === 자격증 관련 구현 ===

    @Override
    public List<Certification> findAllCertifications() {
        if (cachedCertifications == null || !isCacheValid()) {
            log.info("PostgreSQL에서 자격증 데이터를 조회합니다.");
            try {
                List<CertificationJpaEntity> jpaEntities = certificationJpaRepository
                        .findAllOrderedBySortOrderAndDate();
                cachedCertifications = certificationMapper.toDomainList(jpaEntities);
                updateCacheTime();
                log.info("자격증 {} 개를 성공적으로 조회했습니다.", cachedCertifications.size());
            } catch (Exception e) {
                log.error("자격증 조회 중 오류 발생", e);
                cachedCertifications = new ArrayList<>();
            }
        }
        return cachedCertifications;
    }

    @Override
    public Optional<Certification> findCertificationById(String id) {
        try {
            Optional<CertificationJpaEntity> jpaEntity = certificationJpaRepository.findByBusinessId(id);
            return jpaEntity.map(certificationMapper::toDomain);
        } catch (Exception e) {
            log.error("자격증 ID로 조회 중 오류 발생: {}", id, e);
            return Optional.empty();
        }
    }

    // === 캐시 관리 ===

    @Override
    @CacheEvict(cacheNames = {"projects", "experiences", "educations", "certifications"}, allEntries = true)
    public void invalidateCache() {
        // 메모리 캐시 무효화
        cachedProjects = null;
        cachedExperiences = null;
        cachedEducations = null;
        cachedCertifications = null;
        lastCacheTime = null;
        
        // Redis 캐시 무효화 (있는 경우)
        cacheService.ifPresent(CacheService::invalidatePortfolioCache);
        
        log.info("모든 캐시(메모리 + Redis)가 무효화되었습니다.");
    }

    @Override
    public boolean isCacheValid() {
        if (lastCacheTime == null) {
            return false;
        }
        return LocalDateTime.now().minusMinutes(CACHE_DURATION_MINUTES).isBefore(lastCacheTime);
    }

    private void updateCacheTime() {
        lastCacheTime = LocalDateTime.now();
    }
}
