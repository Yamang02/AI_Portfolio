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
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

// Java 표준 라이브러리 imports
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

    // === 프로젝트 관련 구현 ===

    @Override
    @Cacheable(value = "portfolio", key = "'projects'")
    public List<Project> findAllProjects() {
        log.info("PostgreSQL에서 프로젝트 데이터를 조회합니다.");
        try {
            List<ProjectJpaEntity> jpaEntities = projectJpaRepository.findAllOrderedBySortOrderAndStartDate();
            List<Project> projects = projectMapper.toDomainList(jpaEntities);
            log.info("프로젝트 {} 개를 성공적으로 조회했습니다.", projects.size());
            return projects;
        } catch (Exception e) {
            log.error("프로젝트 조회 중 오류 발생", e);
            return new ArrayList<>();
        }
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
    @Cacheable(value = "portfolio", key = "'experiences'")
    public List<Experience> findAllExperiences() {
        log.info("PostgreSQL에서 경력 데이터를 조회합니다.");
        try {
            List<ExperienceJpaEntity> jpaEntities = experienceJpaRepository.findAllOrderedBySortOrderAndStartDate();
            List<Experience> experiences = experienceMapper.toDomainList(jpaEntities);
            log.info("경력 {} 개를 성공적으로 조회했습니다.", experiences.size());
            return experiences;
        } catch (Exception e) {
            log.error("경력 조회 중 오류 발생", e);
            return new ArrayList<>();
        }
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
    @Cacheable(value = "portfolio", key = "'educations'")
    public List<Education> findAllEducations() {
        log.info("PostgreSQL에서 교육 데이터를 조회합니다.");
        try {
            List<EducationJpaEntity> jpaEntities = educationJpaRepository.findAllOrderedBySortOrderAndStartDate();
            List<Education> educations = educationMapper.toDomainList(jpaEntities);
            log.info("교육 {} 개를 성공적으로 조회했습니다.", educations.size());
            return educations;
        } catch (Exception e) {
            log.error("교육 조회 중 오류 발생", e);
            return new ArrayList<>();
        }
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
    @Cacheable(value = "portfolio", key = "'certifications'")
    public List<Certification> findAllCertifications() {
        log.info("PostgreSQL에서 자격증 데이터를 조회합니다.");
        try {
            List<CertificationJpaEntity> jpaEntities = certificationJpaRepository
                    .findAllOrderedBySortOrderAndDate();
            List<Certification> certifications = certificationMapper.toDomainList(jpaEntities);
            log.info("자격증 {} 개를 성공적으로 조회했습니다.", certifications.size());
            return certifications;
        } catch (Exception e) {
            log.error("자격증 조회 중 오류 발생", e);
            return new ArrayList<>();
        }
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
    
    // === Admin Dashboard용 메서드 ===
    
    @Override
    public Project saveProject(Project project) {
        try {
            // Project를 JPA Entity로 변환하여 저장
            ProjectJpaEntity jpaEntity = projectMapper.toJpaEntity(project);
            ProjectJpaEntity savedEntity = projectJpaRepository.save(jpaEntity);
            return projectMapper.toDomain(savedEntity);
        } catch (Exception e) {
            log.error("프로젝트 저장 중 오류 발생: {}", project.getTitle(), e);
            throw new RuntimeException("프로젝트 저장에 실패했습니다", e);
        }
    }
    
    @Override
    public void deleteProject(String id) {
        try {
            projectJpaRepository.deleteByBusinessId(id);
            log.info("프로젝트 삭제 완료: {}", id);
        } catch (Exception e) {
            log.error("프로젝트 삭제 중 오류 발생: {}", id, e);
            throw new RuntimeException("프로젝트 삭제에 실패했습니다", e);
        }
    }
}
