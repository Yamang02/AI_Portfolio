package com.aiportfolio.backend.infrastructure.persistence.postgres;

// 도메인 모델 imports
import com.aiportfolio.backend.domain.portfolio.port.out.PortfolioRepositoryPort;
import com.aiportfolio.backend.domain.portfolio.model.*;
import com.aiportfolio.backend.domain.admin.model.vo.ProjectFilter;

// 인프라 레이어 imports (와일드카드 사용)
import com.aiportfolio.backend.infrastructure.persistence.postgres.entity.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.mapper.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.repository.*;
import com.aiportfolio.backend.infrastructure.persistence.postgres.specification.ProjectSpecification;

// 외부 라이브러리 imports
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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
    private final ProjectScreenshotJpaRepository projectScreenshotJpaRepository;

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
            
            // 기술스택을 명시적으로 로드 (N+1 문제 방지 및 LAZY 로딩 트리거)
            // 스크린샷은 ID 배열 기반으로 별도 조회하므로 여기서는 로드하지 않음
            jpaEntities.forEach(entity -> {
                if (entity.getProjectTechStacks() != null) {
                    entity.getProjectTechStacks().size(); // LAZY 로딩 트리거
                }
            });
            
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
            Optional<ProjectJpaEntity> jpaEntityOpt = projectJpaRepository.findByBusinessId(id);
            if (jpaEntityOpt.isPresent()) {
                ProjectJpaEntity jpaEntity = jpaEntityOpt.get();
                // 기술스택을 명시적으로 로드
                if (jpaEntity.getProjectTechStacks() != null) {
                    jpaEntity.getProjectTechStacks().size(); // LAZY 로딩 트리거
                }
                
                // 상세 조회이므로 스크린샷 조회
                Project project = projectMapper.toDomain(jpaEntity);
                if (project != null && jpaEntity.getScreenshots() != null && !jpaEntity.getScreenshots().isEmpty()) {
                    List<String> screenshotUrls = projectMapper.getScreenshotUrlsFromIds(jpaEntity);
                    project.setScreenshots(screenshotUrls);
                }
                
                return Optional.of(project);
            }
            return Optional.empty();
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
            
            // 스크린샷은 관계 테이블에 저장하고 ID 배열을 projects.screenshots에 저장
            if (project.getScreenshots() != null && !project.getScreenshots().isEmpty()) {
                List<ProjectScreenshotJpaEntity> screenshotEntities = new ArrayList<>();
                for (int i = 0; i < project.getScreenshots().size(); i++) {
                    String screenshotUrl = project.getScreenshots().get(i);
                    if (screenshotUrl != null && !screenshotUrl.isEmpty()) {
                        ProjectScreenshotJpaEntity screenshot = ProjectScreenshotJpaEntity.builder()
                                .project(savedEntity)
                                .imageUrl(screenshotUrl)
                                .displayOrder(i)
                                .build();
                        screenshotEntities.add(screenshot);
                    }
                }
                if (!screenshotEntities.isEmpty()) {
                    // 관계 테이블에 저장
                    List<ProjectScreenshotJpaEntity> savedScreenshots = projectScreenshotJpaRepository.saveAll(screenshotEntities);
                    
                    // 저장된 스크린샷의 ID 배열 추출
                    List<Long> screenshotIds = savedScreenshots.stream()
                            .map(ProjectScreenshotJpaEntity::getId)
                            .collect(Collectors.toList());
                    
                    // 프로젝트 엔티티의 screenshots 필드에 ID 배열 저장
                    savedEntity.setScreenshots(screenshotIds);
                    savedEntity = projectJpaRepository.save(savedEntity);
                }
            }
            
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
            // Specification 생성 (필터 조건을 쿼리 레벨로 내림)
            Specification<ProjectJpaEntity> spec = ProjectSpecification.withFilter(filter);

            // 정렬 조건 생성
            Sort sort = createSortFromFilter(filter);
            
            // 페이지네이션 적용
            Integer page = filter.getPage() != null ? filter.getPage() : 0;
            Integer size = filter.getSize() != null ? filter.getSize() : 20;
            Pageable pageable = PageRequest.of(page, size, sort);

            // 필터링된 프로젝트 조회 (쿼리 레벨에서 필터링 및 정렬 수행)
            Page<ProjectJpaEntity> entityPage = projectJpaRepository.findAll(spec, pageable);
            List<ProjectJpaEntity> entities = entityPage.getContent();

            // 기술스택을 명시적으로 로드 (N+1 문제 방지)
            // 스크린샷은 ID 배열 기반으로 별도 조회하므로 여기서는 로드하지 않음
            entities.forEach(entity -> {
                if (entity.getProjectTechStacks() != null) {
                    entity.getProjectTechStacks().size(); // LAZY 로딩 트리거
                }
            });

            // 도메인 모델로 변환 (필터링은 이미 쿼리에서 수행됨)
            return entities.stream()
                .map(projectMapper::toDomain)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("프로젝트 필터링 조회 중 오류 발생", e);
            return List.of();
        }
    }

    /**
     * ProjectFilter로부터 Sort 객체를 생성합니다.
     * 
     * @param filter 필터 조건
     * @return Sort 객체
     */
    private Sort createSortFromFilter(ProjectFilter filter) {
        String sortBy = filter.getSortBy();
        if (sortBy == null || "sortOrder".equals(sortBy)) {
            sortBy = "sortOrder";
        }
        
        // 필드명 매핑 (도메인 필드명 -> JPA 엔티티 필드명)
        String jpaFieldName;
        switch (sortBy) {
            case "startDate":
                jpaFieldName = "startDate";
                break;
            case "endDate":
                jpaFieldName = "endDate";
                break;
            case "title":
                jpaFieldName = "title";
                break;
            case "status":
                jpaFieldName = "status";
                break;
            case "type":
                jpaFieldName = "type";
                break;
            case "sortOrder":
            default:
                jpaFieldName = "sortOrder";
                break;
        }
        
        // 기본 정렬: sortOrder ASC, startDate DESC (sortOrder가 같을 때)
        Sort.Direction direction = filter.isAscending() ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        if ("sortOrder".equals(sortBy)) {
            // sortOrder 정렬 시 startDate를 보조 정렬로 추가
            return Sort.by(direction, jpaFieldName)
                .and(Sort.by(Sort.Direction.DESC, "startDate"));
        } else {
            // 다른 정렬 기준 사용 시 sortOrder를 보조 정렬로 추가
            return Sort.by(direction, jpaFieldName)
                .and(Sort.by(Sort.Direction.ASC, "sortOrder"))
                .and(Sort.by(Sort.Direction.DESC, "startDate"));
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
                
                // 필드 업데이트 - null이 아닌 경우에만 업데이트
                if (project.getTitle() != null) existing.setTitle(project.getTitle());
                if (project.getDescription() != null) existing.setDescription(project.getDescription());
                if (project.getReadme() != null) existing.setReadme(project.getReadme());
                if (project.getType() != null) existing.setType(project.getType());
                if (project.getStatus() != null) existing.setStatus(project.getStatus());
                if (project.getRole() != null) existing.setRole(project.getRole());
                if (project.getStartDate() != null) existing.setStartDate(project.getStartDate());
                if (project.getEndDate() != null) existing.setEndDate(project.getEndDate());
                // 이미지 URL은 빈 문자열도 허용 (null이 아닌 경우 업데이트)
                if (project.getImageUrl() != null) existing.setImageUrl(project.getImageUrl().isEmpty() ? null : project.getImageUrl());
                // URL 필드들은 빈 문자열을 null로 변환하여 검증 문제 방지
                if (project.getGithubUrl() != null) existing.setGithubUrl(project.getGithubUrl().isEmpty() ? null : project.getGithubUrl());
                if (project.getLiveUrl() != null) existing.setLiveUrl(project.getLiveUrl().isEmpty() ? null : project.getLiveUrl());
                if (project.getExternalUrl() != null) existing.setExternalUrl(project.getExternalUrl().isEmpty() ? null : project.getExternalUrl());
                if (project.getMyContributions() != null) existing.setMyContributions(project.getMyContributions());
                if (project.getSortOrder() != null) existing.setSortOrder(project.getSortOrder());
                // isTeam은 boolean이므로 null 체크 불필요
                existing.setIsTeam(project.isTeam());
                
                // 스크린샷은 관계 테이블에 저장하고 ID 배열을 projects.screenshots에 저장
                if (project.getScreenshots() != null) {
                    // 기존 스크린샷 삭제
                    projectScreenshotJpaRepository.deleteByProjectId(existing.getId());
                    
                    // 새로운 스크린샷 추가
                    List<ProjectScreenshotJpaEntity> newScreenshotEntities = new ArrayList<>();
                    for (int i = 0; i < project.getScreenshots().size(); i++) {
                        String screenshotUrl = project.getScreenshots().get(i);
                        if (screenshotUrl != null && !screenshotUrl.isEmpty()) {
                            ProjectScreenshotJpaEntity screenshot = ProjectScreenshotJpaEntity.builder()
                                    .project(existing)
                                    .imageUrl(screenshotUrl)
                                    .displayOrder(i)
                                    .build();
                            newScreenshotEntities.add(screenshot);
                        }
                    }
                    
                    if (!newScreenshotEntities.isEmpty()) {
                        // 관계 테이블에 저장
                        List<ProjectScreenshotJpaEntity> savedScreenshots = projectScreenshotJpaRepository.saveAll(newScreenshotEntities);
                        
                        // 저장된 스크린샷의 ID 배열 추출
                        List<Long> screenshotIds = savedScreenshots.stream()
                                .map(ProjectScreenshotJpaEntity::getId)
                                .collect(Collectors.toList());
                        
                        // 프로젝트 엔티티의 screenshots 필드에 ID 배열 저장
                        existing.setScreenshots(screenshotIds);
                    } else {
                        // 빈 배열인 경우
                        existing.setScreenshots(new ArrayList<>());
                    }
                }
                
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
    
    @Override
    public Optional<String> findLastBusinessIdByPrefix(String prefix) {
        try {
            return projectJpaRepository.findLastBusinessIdByPrefix(prefix);
        } catch (Exception e) {
            log.error("프로젝트 비즈니스 ID 조회 중 오류 발생: prefix={}", prefix, e);
            return Optional.empty();
        }
    }
}

