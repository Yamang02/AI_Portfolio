# PostgreSQL 구현 설계 문서

## 아키텍처 원칙

### 거시적 설계 원칙
1. **헥사고날 아키텍처 유지**: 현재 잘 구현된 구조 그대로 활용
2. **바운디드 컨텍스트 분리**: Portfolio와 Chatbot 도메인 독립성 유지
3. **포트 & 어댑터 패턴**: 인터페이스 기반 의존성 역전

### 미시적 설계 원칙
1. **엔티티 분리**: 도메인 모델과 JPA 엔티티 완전 분리
2. **매퍼 패턴**: 도메인 ↔ 엔티티 변환 전담 클래스
3. **순수 도메인**: 인프라 기술에 오염되지 않는 도메인 모델

## 엔티티 분리 설계

### 현재 구조 문제점
```java
// 현재: 도메인 모델에 JPA 어노테이션 혼재 (안티패턴)
@Data  // 도메인 로직
@Entity  // 인프라 기술
public class Project {
    @Id  // JPA 어노테이션
    private String id;
    
    public boolean isOngoing() {  // 도메인 로직
        return endDate == null;
    }
}
```

### 개선된 구조 (새로운 네이밍 컨벤션 적용)
```java
// 1. 도메인 엔티티 (기존 Project → ProjectEntity로 리네임)
package com.aiportfolio.backend.domain.portfolio.model;

public class ProjectEntity {
    private String id;
    private String title;
    // ... 순수 비즈니스 로직만
    
    public boolean isOngoing() {
        return endDate == null;
    }
}

// 2. JPA 엔티티 (새로 생성)
package com.aiportfolio.backend.infrastructure.persistence.postgres.entity;

@Entity
@Table(name = "projects")
public class ProjectJpaEntity {
    @Id
    private String id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 2000)
    private String description;
    
    @ElementCollection
    @CollectionTable(name = "project_technologies")
    private List<String> technologies;
    
    // JPA 관련 설정만
}

// 3. 매퍼 (새로 생성)
package com.aiportfolio.backend.infrastructure.persistence.postgres.mapper;

@Component
public class ProjectMapper {
    
    public ProjectEntity toDomain(ProjectJpaEntity jpaEntity) {
        return ProjectEntity.builder()
            .id(jpaEntity.getId())
            .title(jpaEntity.getTitle())
            .description(jpaEntity.getDescription())
            .technologies(jpaEntity.getTechnologies())
            .build();
    }
    
    public ProjectJpaEntity toJpaEntity(ProjectEntity domainEntity) {
        ProjectJpaEntity jpaEntity = new ProjectJpaEntity();
        jpaEntity.setId(domainEntity.getId());
        jpaEntity.setTitle(domainEntity.getTitle());
        jpaEntity.setDescription(domainEntity.getDescription());
        jpaEntity.setTechnologies(domainEntity.getTechnologies());
        return jpaEntity;
    }
}
```

## Repository 구현 설계

### Portfolio 통합 Repository 구조
```java
// 1. 도메인 포트 (기존 유지 - 모든 엔티티 관리)
package com.aiportfolio.backend.domain.portfolio.port.out;

public interface PortfolioRepositoryPort {
    // Project 관련
    List<Project> findAllProjects();
    Optional<Project> findProjectById(String id);
    List<Project> findProjectsByType(String type);
    
    // Experience 관련
    List<Experience> findAllExperiences();
    Optional<Experience> findExperienceById(String id);
    
    // Education 관련
    List<Education> findAllEducations();
    Optional<Education> findEducationById(String id);
    
    // Certification 관련
    List<Certification> findAllCertifications();
    Optional<Certification> findCertificationById(String id);
    
    // 캐시 관리
    void invalidateCache();
    boolean isCacheValid();
}

// 2. JPA Repository들 (각 엔티티별로 분리)
package com.aiportfolio.backend.infrastructure.persistence.postgres.repository;

@Repository
public interface ProjectJpaRepository extends JpaRepository<ProjectJpaEntity, String> {
    List<ProjectJpaEntity> findByType(String type);
    List<ProjectJpaEntity> findBySource(String source);
    List<ProjectJpaEntity> findByIsTeam(boolean isTeam);
}

@Repository
public interface ExperienceJpaRepository extends JpaRepository<ExperienceJpaEntity, String> {
    List<ExperienceJpaEntity> findByOrderByStartDateDesc();
}

@Repository
public interface EducationJpaRepository extends JpaRepository<EducationJpaEntity, String> {
    List<EducationJpaEntity> findByOrderByStartDateDesc();
}

@Repository
public interface CertificationJpaRepository extends JpaRepository<CertificationJpaEntity, String> {
    List<CertificationJpaEntity> findByOrderByIssueDateDesc();
}

// 3. 통합 어댑터 구현체 (모든 엔티티 관리)
package com.aiportfolio.backend.infrastructure.persistence.postgres;

@Repository
@Primary
@RequiredArgsConstructor
public class PostgresPortfolioRepository implements PortfolioRepositoryPort {
    
    // JPA Repository들
    private final ProjectJpaRepository projectJpaRepository;
    private final ExperienceJpaRepository experienceJpaRepository;
    private final EducationJpaRepository educationJpaRepository;
    private final CertificationJpaRepository certificationJpaRepository;
    
    // 매퍼들
    private final ProjectMapper projectMapper;
    private final ExperienceMapper experienceMapper;
    private final EducationMapper educationMapper;
    private final CertificationMapper certificationMapper;
    
    // 캐시 관리
    private LocalDateTime lastCacheTime;
    private static final long CACHE_DURATION_MINUTES = 60;
    
    // === Project 관련 구현 ===
    @Override
    public List<Project> findAllProjects() {
        List<ProjectJpaEntity> jpaEntities = projectJpaRepository.findAll();
        return projectMapper.toDomainList(jpaEntities);
    }
    
    @Override
    public Optional<Project> findProjectById(String id) {
        return projectJpaRepository.findById(id)
            .map(projectMapper::toDomain);
    }
    
    @Override
    public List<Project> findProjectsByType(String type) {
        List<ProjectJpaEntity> jpaEntities = projectJpaRepository.findByType(type);
        return projectMapper.toDomainList(jpaEntities);
    }
    
    // === Experience 관련 구현 ===
    @Override
    public List<Experience> findAllExperiences() {
        List<ExperienceJpaEntity> jpaEntities = experienceJpaRepository.findByOrderByStartDateDesc();
        return experienceMapper.toDomainList(jpaEntities);
    }
    
    @Override
    public Optional<Experience> findExperienceById(String id) {
        return experienceJpaRepository.findById(id)
            .map(experienceMapper::toDomain);
    }
    
    // === Education 관련 구현 ===
    @Override
    public List<Education> findAllEducations() {
        List<EducationJpaEntity> jpaEntities = educationJpaRepository.findByOrderByStartDateDesc();
        return educationMapper.toDomainList(jpaEntities);
    }
    
    @Override
    public Optional<Education> findEducationById(String id) {
        return educationJpaRepository.findById(id)
            .map(educationMapper::toDomain);
    }
    
    // === Certification 관련 구현 ===
    @Override
    public List<Certification> findAllCertifications() {
        List<CertificationJpaEntity> jpaEntities = certificationJpaRepository.findByOrderByIssueDateDesc();
        return certificationMapper.toDomainList(jpaEntities);
    }
    
    @Override
    public Optional<Certification> findCertificationById(String id) {
        return certificationJpaRepository.findById(id)
            .map(certificationMapper::toDomain);
    }
    
    // === 캐시 관리 ===
    @Override
    public void invalidateCache() {
        lastCacheTime = null;
        log.info("Portfolio 캐시가 무효화되었습니다.");
    }
    
    @Override
    public boolean isCacheValid() {
        if (lastCacheTime == null) {
            return false;
        }
        return LocalDateTime.now().minusMinutes(CACHE_DURATION_MINUTES).isBefore(lastCacheTime);
    }
}
```

## 데이터베이스 스키마 설계

### 통합 Portfolio 테이블 구조
```sql
-- 프로젝트 메인 테이블
CREATE TABLE projects (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    image_url VARCHAR(500),
    readme TEXT,
    type VARCHAR(50) NOT NULL,
    source VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_team BOOLEAN DEFAULT FALSE,
    external_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 경력 테이블
CREATE TABLE experiences (
    id VARCHAR(255) PRIMARY KEY,
    company VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 교육 테이블
CREATE TABLE educations (
    id VARCHAR(255) PRIMARY KEY,
    institution VARCHAR(200) NOT NULL,
    degree VARCHAR(200),
    major VARCHAR(200),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    gpa VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 자격증 테이블
CREATE TABLE certifications (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    issuer VARCHAR(200) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    credential_id VARCHAR(200),
    credential_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 프로젝트 기술스택 (다대다 관계)
CREATE TABLE project_technologies (
    project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
    technology VARCHAR(100) NOT NULL,
    PRIMARY KEY (project_id, technology)
);

-- 프로젝트 기여도 (일대다 관계)
CREATE TABLE project_contributions (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) REFERENCES projects(id) ON DELETE CASCADE,
    contribution TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- 경력 기술스택 (다대다 관계)
CREATE TABLE experience_technologies (
    experience_id VARCHAR(255) REFERENCES experiences(id) ON DELETE CASCADE,
    technology VARCHAR(100) NOT NULL,
    PRIMARY KEY (experience_id, technology)
);
```

## 데이터 마이그레이션 전략

### 1. JSON 파일 구조 분석
```java
@Component
public class JsonDataAnalyzer {
    
    public void analyzeJsonStructure() {
        // 기존 JSON 파일들의 구조와 데이터 타입 분석
        // 누락된 필드나 불일치 데이터 식별
    }
}
```

### 2. 단계별 마이그레이션
```java
@Service
@Transactional
public class DataMigrationService {
    
    public void migrateAllData() {
        // 1단계: 프로젝트 데이터 마이그레이션
        migrateProjects();
        
        // 2단계: 경력 데이터 마이그레이션  
        migrateExperiences();
        
        // 3단계: 교육 데이터 마이그레이션
        migrateEducations();
        
        // 4단계: 자격증 데이터 마이그레이션
        migrateCertifications();
        
        // 5단계: 데이터 검증
        validateMigration();
    }
    
    private void migrateProjects() {
        List<Project> projects = jsonFileReader.readProjects();
        
        for (Project project : projects) {
            ProjectEntity entity = projectMapper.toEntity(project);
            projectJpaRepository.save(entity);
        }
    }
}
```

## 성능 최적화 전략

### 1. 인덱스 전략
```sql
-- 자주 조회되는 필드에 인덱스 생성
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_source ON projects(source);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_is_team ON projects(is_team);
```

### 2. 쿼리 최적화
```java
// N+1 문제 해결을 위한 fetch join
@Query("SELECT p FROM ProjectEntity p LEFT JOIN FETCH p.technologies WHERE p.type = :type")
List<ProjectEntity> findByTypeWithTechnologies(@Param("type") String type);
```

### 3. 캐싱 전략
```java
@Cacheable(value = "projects", key = "#type")
public List<Project> findProjectsByType(String type) {
    // 자주 조회되는 데이터는 캐싱
}
```

이 설계로 진행하면 깔끔하게 도메인과 인프라가 분리되면서도 빠르게 구현할 수 있습니다!