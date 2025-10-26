package com.aiportfolio.backend.infrastructure.persistence.postgres;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.model.*;
import com.aiportfolio.backend.domain.admin.model.vo.ProjectFilter;

// 인프라 레이어 imports (와일드카드 사용)
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.*;

// 외부 라이브러리 imports
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Repository;

// Java 표준 라이브러리 imports
import java.util.*;
import java.util.stream.Collectors;

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
    private final ProjectTechStackJpaRepository projectTechStackJpaRepository;
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;

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
        return findAllExperiencesInternal();
    }
    
    @Override
    public List<Experience> findAllExperiencesWithoutCache() {
        return findAllExperiencesInternal();
    }
    
    /**
     * 경력 조회 (캐시 없이) - 어드민 전용
     */
    private List<Experience> findAllExperiencesInternal() {
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

    @Override
    public Experience saveExperience(Experience experience) {
        try {
            ExperienceJpaEntity jpaEntity = experienceMapper.toJpaEntity(experience);
            
            // 기존 엔티티가 있는지 확인 (업데이트 vs 생성 구분)
            Optional<ExperienceJpaEntity> existingEntity = experienceJpaRepository.findByBusinessId(experience.getId());
            
            if (existingEntity.isPresent()) {
                // 업데이트: 기존 엔티티를 직접 수정
                ExperienceJpaEntity existing = existingEntity.get();
                
                // 필드 업데이트 (DB ID와 createdAt은 유지)
                existing.setTitle(experience.getTitle());
                existing.setDescription(experience.getDescription());
                existing.setOrganization(experience.getOrganization());
                existing.setRole(experience.getRole());
                existing.setStartDate(experience.getStartDate());
                existing.setEndDate(experience.getEndDate());
                existing.setJobField(experience.getJobField());
                existing.setEmploymentType(experience.getEmploymentType());
                existing.setMainResponsibilities(experience.getMainResponsibilities());
                existing.setAchievements(experience.getAchievements());
                existing.setSortOrder(experience.getSortOrder());
                
                // updatedAt은 JPA @PreUpdate에서 자동 처리됨
                
                log.info("경력 업데이트 중: {}", experience.getTitle());
                ExperienceJpaEntity savedEntity = experienceJpaRepository.save(existing);
                return experienceMapper.toDomain(savedEntity);
            } else {
                // 생성: 새 엔티티
                log.info("경력 생성 중: {}", experience.getTitle());
                ExperienceJpaEntity savedEntity = experienceJpaRepository.save(jpaEntity);
                return experienceMapper.toDomain(savedEntity);
            }
        } catch (Exception e) {
            log.error("경력 저장 중 오류 발생: {}", experience.getTitle(), e);
            throw new RuntimeException("경력 저장에 실패했습니다", e);
        }
    }

    @Override
    public void deleteExperience(String id) {
        try {
            experienceJpaRepository.deleteByBusinessId(id);
            log.info("경력 삭제 완료: {}", id);
        } catch (Exception e) {
            log.error("경력 삭제 중 오류 발생: {}", id, e);
            throw new RuntimeException("경력 삭제에 실패했습니다", e);
        }
    }

    // === 교육 관련 구현 ===

    @Override
    @Cacheable(value = "portfolio", key = "'educations'")
    public List<Education> findAllEducations() {
        return findAllEducationsInternal();
    }
    
    @Override
    public List<Education> findAllEducationsWithoutCache() {
        return findAllEducationsInternal();
    }
    
    /**
     * 교육 조회 (캐시 없이) - 어드민 전용
     */
    private List<Education> findAllEducationsInternal() {
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

    @Override
    public Education saveEducation(Education education) {
        try {
            EducationJpaEntity jpaEntity = educationMapper.toJpaEntity(education);
            
            // 기존 엔티티가 있는지 확인 (업데이트 vs 생성 구분)
            Optional<EducationJpaEntity> existingEntity = educationJpaRepository.findByBusinessId(education.getId());
            
            if (existingEntity.isPresent()) {
                // 업데이트: 기존 엔티티를 직접 수정
                EducationJpaEntity existing = existingEntity.get();
                
                // 필드 업데이트 (DB ID와 createdAt은 유지)
                existing.setTitle(education.getTitle());
                existing.setDescription(education.getDescription());
                existing.setOrganization(education.getOrganization());
                existing.setDegree(education.getDegree());
                existing.setMajor(education.getMajor());
                existing.setStartDate(education.getStartDate());
                existing.setEndDate(education.getEndDate());
                existing.setGpa(education.getGpa());
                existing.setType(education.getType() != null ? education.getType().name() : null);
                existing.setSortOrder(education.getSortOrder());
                
                // updatedAt은 JPA @PreUpdate에서 자동 처리됨
                
                log.info("교육 업데이트 중: {}", education.getTitle());
                EducationJpaEntity savedEntity = educationJpaRepository.save(existing);
                return educationMapper.toDomain(savedEntity);
            } else {
                // 생성: 새 엔티티
                log.info("교육 생성 중: {}", education.getTitle());
                EducationJpaEntity savedEntity = educationJpaRepository.save(jpaEntity);
                return educationMapper.toDomain(savedEntity);
            }
        } catch (Exception e) {
            log.error("교육 저장 중 오류 발생: {}", education.getTitle(), e);
            throw new RuntimeException("교육 저장에 실패했습니다", e);
        }
    }

    @Override
    public void deleteEducation(String id) {
        try {
            educationJpaRepository.deleteByBusinessId(id);
            log.info("교육 삭제 완료: {}", id);
        } catch (Exception e) {
            log.error("교육 삭제 중 오류 발생: {}", id, e);
            throw new RuntimeException("교육 삭제에 실패했습니다", e);
        }
    }

    // === 자격증 관련 구현 ===

    @Override
    @Cacheable(value = "portfolio", key = "'certifications'")
    public List<Certification> findAllCertifications() {
        return findAllCertificationsInternal();
    }

    @Override
    public List<Certification> findAllCertificationsWithoutCache() {
        return findAllCertificationsInternal();
    }

    /**
     * 자격증 조회 (캐시 없이) - 어드민 전용
     */
    private List<Certification> findAllCertificationsInternal() {
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

    @Override
    public Certification saveCertification(Certification certification) {
        try {
            CertificationJpaEntity jpaEntity = certificationMapper.toJpaEntity(certification);

            // 기존 엔티티가 있는지 확인 (업데이트 vs 생성 구분)
            Optional<CertificationJpaEntity> existingEntity = certificationJpaRepository.findByBusinessId(certification.getId());

            if (existingEntity.isPresent()) {
                // 업데이트: 기존 엔티티를 직접 수정
                CertificationJpaEntity existing = existingEntity.get();

                // 필드 업데이트 (DB ID와 createdAt은 유지)
                existing.setName(certification.getName());
                existing.setIssuer(certification.getIssuer());
                existing.setDate(certification.getDate());
                existing.setExpiryDate(certification.getExpiryDate());
                existing.setCredentialId(certification.getCredentialId());
                existing.setCredentialUrl(certification.getCredentialUrl());
                existing.setDescription(certification.getDescription());
                existing.setCategory(certification.getCategory());
                existing.setSortOrder(certification.getSortOrder());

                // updatedAt은 JPA @PreUpdate에서 자동 처리됨

                log.info("자격증 업데이트 중: {}", certification.getName());
                CertificationJpaEntity savedEntity = certificationJpaRepository.save(existing);
                return certificationMapper.toDomain(savedEntity);
            } else {
                // 생성: 새 엔티티
                log.info("자격증 생성 중: {}", certification.getName());
                CertificationJpaEntity savedEntity = certificationJpaRepository.save(jpaEntity);
                return certificationMapper.toDomain(savedEntity);
            }
        } catch (Exception e) {
            log.error("자격증 저장 중 오류 발생: {}", certification.getName(), e);
            throw new RuntimeException("자격증 저장에 실패했습니다", e);
        }
    }

    @Override
    public void deleteCertification(String id) {
        try {
            Optional<CertificationJpaEntity> entity = certificationJpaRepository.findByBusinessId(id);
            if (entity.isPresent()) {
                certificationJpaRepository.delete(entity.get());
                log.info("자격증 삭제 완료: {}", id);
            } else {
                log.warn("삭제할 자격증을 찾을 수 없습니다: {}", id);
            }
        } catch (Exception e) {
            log.error("자격증 삭제 중 오류 발생: {}", id, e);
            throw new RuntimeException("자격증 삭제에 실패했습니다", e);
        }
    }

    @Override
    public int findMaxCertificationSortOrder() {
        Integer maxSortOrder = certificationJpaRepository.findMaxSortOrder();
        return maxSortOrder != null ? maxSortOrder : 0;
    }

    @Override
    public List<Certification> findCertificationsByCategory(String category) {
        try {
            List<CertificationJpaEntity> jpaEntities = certificationJpaRepository.findByCategory(category);
            return certificationMapper.toDomainList(jpaEntities);
        } catch (Exception e) {
            log.error("카테고리별 자격증 조회 중 오류 발생: {}", category, e);
            return new ArrayList<>();
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
    
    @Override
    public List<Project> findProjectsByTechStack(String techStackName) {
        log.debug("기술스택 '{}'을 사용하는 프로젝트 조회", techStackName);
        try {
            // 먼저 기술스택 이름으로 ID 조회
            Optional<TechStackMetadataJpaEntity> techStackEntity = techStackMetadataJpaRepository.findByName(techStackName);
            if (techStackEntity.isEmpty()) {
                log.debug("기술스택 '{}'을 찾을 수 없습니다", techStackName);
                return List.of();
            }
            
            Long techStackId = techStackEntity.get().getId();
            
            // ProjectTechStackJpaRepository를 통해 기술스택 ID별 프로젝트 매핑 조회
            List<ProjectTechStackJpaEntity> mappings = projectTechStackJpaRepository.findByTechStackId(techStackId);
            
            // 매핑에서 프로젝트 ID 추출
            List<Long> projectIds = mappings.stream()
                .map(mapping -> mapping.getProject().getId())
                .toList();
            
            if (projectIds.isEmpty()) {
                log.debug("기술스택 '{}'을 사용하는 프로젝트가 없습니다", techStackName);
                return List.of();
            }
            
            // 프로젝트 ID로 프로젝트 엔티티 조회
            List<ProjectJpaEntity> projectEntities = projectJpaRepository.findAllById(projectIds);
            List<Project> projects = projectMapper.toDomainList(projectEntities);
            
            log.info("기술스택 '{}'을 사용하는 프로젝트 {} 개 조회 완료", techStackName, projects.size());
            return projects;
        } catch (Exception e) {
            log.error("기술스택별 프로젝트 조회 중 오류 발생: {}", techStackName, e);
            return List.of();
        }
    }
    
    @Override
    public List<Project> findProjectsByTechStacks(List<String> techStackNames) {
        log.debug("기술스택 목록 {} 을 사용하는 프로젝트 조회", techStackNames);
        try {
            // 각 기술스택별로 프로젝트 조회 후 중복 제거
            List<Project> allProjects = techStackNames.stream()
                .flatMap(techStackName -> findProjectsByTechStack(techStackName).stream())
                .distinct() // 중복 제거 (Project의 equals/hashCode 구현 필요)
                .toList();
            
            log.info("기술스택 목록 {} 을 사용하는 프로젝트 {} 개 조회 완료", techStackNames, allProjects.size());
            return allProjects;
        } catch (Exception e) {
            log.error("기술스택 목록별 프로젝트 조회 중 오류 발생: {}", techStackNames, e);
            return List.of();
        }
    }
    
    // === 관리자 기능 구현 ===
    
    @Override
    public List<Project> findByFilter(ProjectFilter filter) {
        log.debug("Finding projects by filter: {}", filter);
        
        try {
            // 모든 프로젝트를 조회한 후 메모리에서 필터링
            // TODO: 향후 JPA Specification을 사용하여 DB 레벨에서 필터링 개선
            List<ProjectJpaEntity> entities = projectJpaRepository.findAllOrderedBySortOrderAndStartDate();
            
            return entities.stream()
                .map(projectMapper::toDomain)
                .filter(filter::matches)
                .sorted(filter.getSortCriteria())
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("프로젝트 필터링 조회 중 오류 발생", e);
            return List.of();
        }
    }
    
    @Override
    public boolean existsProjectById(String id) {
        log.debug("Checking if project exists: {}", id);
        
        try {
            return projectJpaRepository.existsByBusinessId(id);
        } catch (Exception e) {
            log.error("프로젝트 존재 여부 확인 중 오류 발생: {}", id, e);
            return false;
        }
    }
    
    @Override
    public Project updateProject(Project project) {
        log.debug("Updating project: {}", project.getId());
        
        try {
            // 기존 엔티티 조회
            Optional<ProjectJpaEntity> existingEntity = projectJpaRepository.findByBusinessId(project.getId());
            
            if (existingEntity.isPresent()) {
                // 업데이트: 기존 엔티티의 필드를 직접 수정
                ProjectJpaEntity existing = existingEntity.get();
                
                // 필드 업데이트
                existing.setTitle(project.getTitle());
                existing.setDescription(project.getDescription());
                existing.setReadme(project.getReadme());
                existing.setType(project.getType());
                existing.setStatus(project.getStatus());
                existing.setRole(project.getRole());
                existing.setStartDate(project.getStartDate());
                existing.setEndDate(project.getEndDate());
                existing.setImageUrl(project.getImageUrl());
                existing.setGithubUrl(project.getGithubUrl());
                existing.setLiveUrl(project.getLiveUrl());
                existing.setExternalUrl(project.getExternalUrl());
                existing.setMyContributions(project.getMyContributions());
                existing.setScreenshots(project.getScreenshots());
                existing.setIsTeam(project.isTeam());
                existing.setTeamSize(null); // 팀 사이즈는 별도 업데이트 필요 시 설정
                existing.setSortOrder(project.getSortOrder());
                
                ProjectJpaEntity savedEntity = projectJpaRepository.save(existing);
                log.debug("Project updated successfully: {}", savedEntity.getId());
                return projectMapper.toDomain(savedEntity);
            } else {
                // 프로젝트가 존재하지 않음
                throw new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + project.getId());
            }
        } catch (Exception e) {
            log.error("프로젝트 업데이트 중 오류 발생: {}", project.getId(), e);
            throw new RuntimeException("프로젝트 업데이트에 실패했습니다", e);
        }
    }
    
    // === 정렬 순서 관련 ===
    
    @Override
    public int findMaxExperienceSortOrder() {
        Integer maxSortOrder = experienceJpaRepository.findMaxSortOrder();
        return maxSortOrder != null ? maxSortOrder : 0;
    }
    
    @Override
    public int findMaxEducationSortOrder() {
        Integer maxSortOrder = educationJpaRepository.findMaxSortOrder();
        return maxSortOrder != null ? maxSortOrder : 0;
    }
}
