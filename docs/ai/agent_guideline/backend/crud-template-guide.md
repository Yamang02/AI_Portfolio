# 백엔드 CRUD 템플릿 가이드

**작성일**: 2025-10-26  
**목적**: Hexagonal Architecture 기반 CRUD 개발 가이드  
**버전**: 2.0

---

## 📋 목차

1. [개요](#개요)
2. [핵심 패턴](#핵심-패턴)
3. [실용 패턴](#실용-패턴)
4. [공통 유틸리티](#공통-유틸리티)
5. [적용 가이드라인](#적용-가이드라인)

---

## 개요

### Hexagonal Architecture 계층 구조

```
Domain Layer      → 순수 도메인 모델, UseCase 인터페이스, Repository Port
Application Layer → UseCase 구현체, 트랜잭션 관리
Infrastructure    → JPA Entity, Mapper, Adapter, Controller
```

### 템플릿화 가능한 요소

| 계층 | 템플릿화 가능 | 커스텀 필요 |
|------|-------------|-----------|
| **Backend** | UseCase 구조, Service 패턴, Repository Port, Adapter, Controller 구조, Mapper 패턴 | 도메인 모델 필드, 비즈니스 규칙, 검증 로직, 쿼리 메서드 |

---

## 핵심 패턴

### 1. Domain Layer (도메인 계층)

#### 1.1 도메인 모델

```java
// domain/portfolio/model/Experience.java
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Experience {
    private String id;
    
    @NotBlank
    private String title;
    private String organization;
    private String role;
    
    // 메타데이터
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer sortOrder;
}
```

#### 1.2 UseCase 인터페이스

```java
// domain/portfolio/port/in/ManageExperienceUseCase.java
public interface ManageExperienceUseCase {
    Experience createExperience(Experience experience);
    Experience updateExperience(String id, Experience experience);
    void deleteExperience(String id);
    void updateExperienceSortOrder(Map<String, Integer> sortOrderUpdates);
}
```

#### 1.3 Repository Port

```java
// domain/portfolio/port/out/PortfolioRepositoryPort.java
public interface PortfolioRepositoryPort {
    Experience saveExperience(Experience experience);
    Optional<Experience> findExperienceById(String id);
    List<Experience> findAllExperiences();
    void deleteExperience(String id);
    int findMaxExperienceSortOrder(); // 정렬 순서용
}
```

---

### 2. Application Layer (애플리케이션 계층)

#### 2.1 Service 구현

```java
// application/admin/service/ManageExperienceService.java
@Service("manageExperienceService")
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ManageExperienceService implements ManageExperienceUseCase {

    private final PortfolioRepositoryPort portfolioRepositoryPort;

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Experience createExperience(Experience experience) {
        // 정렬 순서 자동 할당
        if (experience.getSortOrder() == null) {
            int max = portfolioRepositoryPort.findMaxExperienceSortOrder();
            experience.setSortOrder(max + 1);
        }
        
        // 메타데이터 설정
        experience.setCreatedAt(MetadataHelper.setupCreatedAt(experience.getCreatedAt()));
        experience.setUpdatedAt(MetadataHelper.setupUpdatedAt());
        
        return portfolioRepositoryPort.saveExperience(experience);
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Experience updateExperience(String id, Experience experience) {
        // 존재 확인
        Experience existing = portfolioRepositoryPort.findExperienceById(id)
            .orElseThrow(() -> new IllegalArgumentException("Not found: " + id));
        
        // 메타데이터 유지
        experience.setId(existing.getId());
        experience.setCreatedAt(existing.getCreatedAt());
        experience.setUpdatedAt(MetadataHelper.setupUpdatedAt());
        
        return portfolioRepositoryPort.saveExperience(experience);
    }

    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void deleteExperience(String id) {
        if (!portfolioRepositoryPort.existsExperienceById(id)) {
            throw new IllegalArgumentException("Not found: " + id);
        }
        portfolioRepositoryPort.deleteExperience(id);
    }
}
```

#### 2.2 정렬 순서 재정렬 (중간 삽입)

```java
@Override
@CacheEvict(value = "portfolio", allEntries = true)
public void updateExperienceSortOrder(Map<String, Integer> sortOrderUpdates) {
    // 모든 Experience 조회
    List<Experience> allExperiences = portfolioRepositoryPort.findAllExperiencesWithoutCache();
    
    for (Map.Entry<String, Integer> entry : sortOrderUpdates.entrySet()) {
        String id = entry.getKey();
        Integer newSortOrder = entry.getValue();
        
        Experience target = allExperiences.stream()
            .filter(e -> e.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Not found: " + id));
        
        Integer oldSortOrder = target.getSortOrder();
        
        // 자동 재정렬
        List<Experience> reordered = reorderExperiences(
            allExperiences, target, oldSortOrder, newSortOrder);
        
        // 저장
        for (Experience exp : reordered) {
            exp.setUpdatedAt(MetadataHelper.setupUpdatedAt());
            portfolioRepositoryPort.saveExperience(exp);
        }
        
        allExperiences = reordered;
    }
}

private List<Experience> reorderExperiences(
        List<Experience> allExperiences,
        Experience target,
        Integer oldSortOrder,
        Integer newSortOrder) {
    
    List<Experience> result = new ArrayList<>();
    String targetId = target.getId();
    
    if (oldSortOrder < newSortOrder) {
        // 뒤로 이동: 3→7 → [1,2,4,5,6,7,3]
        for (Experience exp : allExperiences) {
            if (exp.getId().equals(targetId)) {
                result.add(createUpdated(exp, newSortOrder));
            } else if (exp.getSortOrder() != null &&
                      exp.getSortOrder() > oldSortOrder &&
                      exp.getSortOrder() <= newSortOrder) {
                result.add(createUpdated(exp, exp.getSortOrder() - 1));
            } else {
                result.add(exp);
            }
        }
    } else {
        // 앞으로 이동: 7→3 → [1,2,3,7,4,5,6]
        for (Experience exp : allExperiences) {
            if (exp.getId().equals(targetId)) {
                result.add(createUpdated(exp, newSortOrder));
            } else if (exp.getSortOrder() != null &&
                      exp.getSortOrder() >= newSortOrder &&
                      exp.getSortOrder() < oldSortOrder) {
                result.add(createUpdated(exp, exp.getSortOrder() + 1));
            } else {
                result.add(exp);
            }
        }
    }
    
    return result;
}

private Experience createUpdatedExperience(Experience original, Integer newSortOrder) {
    original.setSortOrder(newSortOrder);
    original.setUpdatedAt(MetadataHelper.setupUpdatedAt());
    return original;
}
```

---

### 3. Infrastructure Layer (인프라 계층)

#### 3.1 JPA Entity

```java
// infrastructure/persistence/postgres/entity/ExperienceJpaEntity.java
@Entity
@Table(name = "experiences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceJpaEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "business_id", unique = true)
    private String businessId;
    
    @Column(nullable = false)
    private String title;
    private String organization;
    private String role;
    
    @Column(name = "sort_order")
    private Integer sortOrder;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

#### 3.2 Repository Interface

```java
// infrastructure/persistence/postgres/repository/ExperienceJpaRepository.java
@Repository
public interface ExperienceJpaRepository extends JpaRepository<ExperienceJpaEntity, UUID> {
    
    Optional<ExperienceJpaEntity> findByBusinessId(String businessId);
    boolean existsByBusinessId(String businessId);
    
    @Query("SELECT COALESCE(MAX(e.sortOrder), 0) FROM ExperienceJpaEntity e")
    Integer findMaxSortOrder();
}
```

#### 3.3 Repository Adapter (업데이트 처리)

```java
// infrastructure/persistence/postgres/PostgresPortfolioRepository.java
@Override
public Experience saveExperience(Experience experience) {
    try {
        ExperienceJpaEntity jpaEntity = experienceMapper.toJpaEntity(experience);
        
        Optional<ExperienceJpaEntity> existing = experienceJpaRepository
            .findByBusinessId(experience.getId());
        
        if (existing.isPresent()) {
            // UPDATE: 기존 엔티티 수정
            ExperienceJpaEntity existingEntity = existing.get();
            existingEntity.setTitle(experience.getTitle());
            existingEntity.setOrganization(experience.getOrganization());
            existingEntity.setRole(experience.getRole());
            existingEntity.setSortOrder(experience.getSortOrder());
            existingEntity.setUpdatedAt(experience.getUpdatedAt());
            
            ExperienceJpaEntity saved = experienceJpaRepository.save(existingEntity);
            return experienceMapper.toDomain(saved);
        } else {
            // INSERT: 새 엔티티 생성
            ExperienceJpaEntity saved = experienceJpaRepository.save(jpaEntity);
            return experienceMapper.toDomain(saved);
        }
    } catch (Exception e) {
        log.error("경력 저장 중 오류 발생", e);
        throw new RuntimeException("경력 저장에 실패했습니다", e);
    }
}
```

---

## 실용 패턴

### 1. 정렬 순서 관리

#### Repository에 추가
```java
// 최대 정렬 순서 조회
@Query("SELECT COALESCE(MAX(e.sortOrder), 0) FROM ExperienceJpaEntity e")
Integer findMaxSortOrder();
```

#### Service에서 사용
```java
// 생성 시
if (entity.getSortOrder() == null) {
    int max = repositoryPort.findMaxSortOrder();
    entity.setSortOrder(max + 1);
}
```

### 2. 업데이트와 생성 구분

```java
// 기존 엔티티 찾기
Optional<JpaEntity> existing = jpaRepository.findByBusinessId(domain.getId());

if (existing.isPresent()) {
    // UPDATE: setter 사용
    JpaEntity entity = existing.get();
    entity.setField(domain.getField());
    jpaRepository.save(entity);
} else {
    // INSERT: 새 엔티티 생성
    jpaRepository.save(mapper.toEntity(domain));
}
```

### 3. 메타데이터 처리

```java
// 유틸리티 사용
entity.setCreatedAt(MetadataHelper.setupCreatedAt(entity.getCreatedAt()));
entity.setUpdatedAt(MetadataHelper.setupUpdatedAt());
```

---

## 공통 유틸리티

### MetadataHelper

```java
// application/common/util/MetadataHelper.java
public final class MetadataHelper {
    
    public static LocalDateTime setupCreatedAt(LocalDateTime createdAt) {
        return createdAt == null ? LocalDateTime.now() : createdAt;
    }
    
    public static LocalDateTime setupUpdatedAt() {
        return LocalDateTime.now();
    }
}
```

**사용법:**
```java
entity.setCreatedAt(MetadataHelper.setupCreatedAt(entity.getCreatedAt()));
entity.setUpdatedAt(MetadataHelper.setupUpdatedAt());
```

### 정렬 순서 처리 패턴

#### 패턴 1: 자동 할당 (생성 시)
```java
// Repository에 findMaxSortOrder() 추가
if (entity.getSortOrder() == null) {
    int max = repositoryPort.findMaxSortOrder();
    entity.setSortOrder(max + 1);
}
```

#### 패턴 2: 자동 재정렬 (중간 삽입)
```java
// 오름차순 이동: 3→7 → [1,2,4,5,6,7,3]
// 내림차순 이동: 7→3 → [1,2,3,7,4,5,6]
// 자동으로 중간 항목들 재배치
```

---

## 적용 가이드라인

### 새 도메인 추가 시

#### 1. Domain Layer (외부 의존성 없음)
- [ ] 도메인 모델 정의
- [ ] UseCase 인터페이스 정의
- [ ] Repository Port 정의

#### 2. Application Layer
- [ ] Service 구현 (`@Transactional`, `@CacheEvict`)
- [ ] 메타데이터 처리 (`MetadataHelper` 사용)
- [ ] 정렬 순서 자동 할당/재정렬

#### 3. Infrastructure Layer
- [ ] JPA Entity 작성
- [ ] Repository Interface 작성 (`findMaxSortOrder` 추가)
- [ ] Mapper 작성 (Entity ↔ Domain 변환)
- [ ] Repository Adapter 작성 (UPDATE/INSERT 구분)
- [ ] Controller 작성

---

## 디렉토리 구조

### 전체 구조

```
backend/src/main/java/com/aiportfolio/backend/

├── domain/                                    # 도메인 계층 (순수 비즈니스 로직)
│   └── portfolio/
│       ├── model/                           # 도메인 모델
│       │   ├── Experience.java
│       │   ├── Education.java
│       │   ├── Project.java
│       │   └── TechStack.java
│       ├── port/                             # 포트 (인터페이스)
│       │   ├── in/                          # Use Case (입력)
│       │   │   ├── ManageExperienceUseCase.java
│       │   │   ├── ManageEducationUseCase.java
│       │   │   └── ManageTechStackUseCase.java
│       │   └── out/                         # Repository (출력)
│       │       └── PortfolioRepositoryPort.java
│       └── service/                          # 도메인 서비스 (선택적)
│           └── ExperienceDomainService.java
│
├── application/                              # 애플리케이션 계층 (Use Case 구현)
│   ├── admin/                               # Admin UseCase
│   │   └── service/
│   │       ├── ManageExperienceService.java
│   │       ├── ManageEducationService.java
│   │       └── ManageTechStackService.java
│   ├── portfolio/                           # Portfolio UseCase
│   │   └── service/
│   │       └── GetPortfolioService.java
│   └── common/                               # 공통 모듈
│       ├── config/                          # 설정
│       └── util/                            # 유틸리티
│           ├── MetadataHelper.java
│           └── SortOrderHelper.java
│
└── infrastructure/                           # 인프라 계층 (외부 의존성)
    ├── persistence/postgres/                 # PostgreSQL 영속성
    │   ├── entity/                         # JPA 엔티티
    │   │   ├── ExperienceJpaEntity.java
    │   │   ├── EducationJpaEntity.java
    │   │   └── ProjectJpaEntity.java
    │   ├── repository/                     # JPA Repository
    │   │   ├── ExperienceJpaRepository.java
    │   │   ├── EducationJpaRepository.java
    │   │   └── ProjectJpaRepository.java
    │   ├── mapper/                         # Mapper (Entity ↔ Domain)
    │   │   ├── ExperienceMapper.java
    │   │   ├── EducationMapper.java
    │   │   └── ProjectMapper.java
    │   └── PostgresPortfolioRepository.java # Adapter
    │
    ├── persistence/redis/                   # Redis (캐시, 세션)
    │   └── adapter/
    │       └── RedisSessionAdapter.java
    │
    └── web/                                 # 웹 계층
        ├── controller/                     # Public API
        │   └── PortfolioController.java
        ├── admin/controller/               # Admin API
        │   ├── AdminExperienceController.java
        │   ├── AdminEducationController.java
        │   └── AdminTechStackController.java
        └── dto/                            # DTO
            ├── portfolio/
            │   └── ExperienceDto.java
            └── admin/
                └── ExperienceCreateRequest.java
```

### Experience 도메인 구조

```
domain/portfolio/model/Experience.java          # 도메인 모델
domain/portfolio/port/in/ManageExperienceUseCase.java  # UseCase 인터페이스
domain/portfolio/port/out/PortfolioRepositoryPort.java # Repository Port

application/admin/service/ManageExperienceService.java  # UseCase 구현

infrastructure/persistence/postgres/
  ├── entity/ExperienceJpaEntity.java         # JPA 엔티티
  ├── repository/ExperienceJpaRepository.java # Repository 인터페이스
  ├── mapper/ExperienceMapper.java            # Entity ↔ Domain 변환
  └── PostgresPortfolioRepository.java        # Port 구현

infrastructure/web/admin/controller/
  └── AdminExperienceController.java          # REST API
```

### 계층별 역할

| 계층 | 역할 | 의존성 |
|------|------|--------|
| **Domain** | 비즈니스 로직, UseCase 인터페이스 | 순수 Java, Validation API |
| **Application** | UseCase 구현, 트랜잭션 관리 | Domain, Spring (트랜잭션) |
| **Infrastructure** | 데이터 저장, 웹 요청 처리 | Application, JPA, Spring MVC |

### 파일 명명 규칙

- **Domain Model**: `{Entity}.java` (예: `Experience.java`)
- **UseCase**: `{Action}{Entity}UseCase.java` (예: `ManageExperienceUseCase.java`)
- **Service**: `{Action}{Entity}Service.java` (예: `ManageExperienceService.java`)
- **JPA Entity**: `{Entity}JpaEntity.java` (예: `ExperienceJpaEntity.java`)
- **Repository**: `{Entity}JpaRepository.java` (예: `ExperienceJpaRepository.java`)
- **Mapper**: `{Entity}Mapper.java` (예: `ExperienceMapper.java`)
- **Controller**: `Admin{Entity}Controller.java` (예: `AdminExperienceController.java`)

---

## 주의사항

### 1. UPDATE/INSERT 구분
- **기존 엔티티 찾기**: `findByBusinessId()` 사용
- **UPDATE**: 기존 엔티티의 setter 사용
- **INSERT**: 새로운 엔티티 생성

### 2. 정렬 순서 처리
- **생성 시**: `findMaxSortOrder()`로 자동 할당
- **수정 시**: 재정렬 로직으로 중간 항목 재배치

### 3. 메타데이터
- **생성 시**: `createdAt` 유지, `updatedAt` 현재 시간
- **수정 시**: `createdAt` 유지, `updatedAt` 현재 시간

### 4. 캐시 처리

**메인 앱 (Public API)** - 캐시 사용 ✅
- 조회 데이터는 캐시를 사용해 성능 최적화
- `GetPortfolioService`에 `@Cacheable` 적용
- 자주 변경되지 않는 포트폴리오 데이터를 Redis에 캐싱

**어드민 앱 (Admin API)** - 캐시 사용 안 함 ❌
- 조회는 캐시 없이 실시간 DB 조회 (`findAllWithoutCache`)
- Mutation은 캐시 무효화로 메인 앱 캐시 갱신
- 데이터 수정 시 변경사항이 즉시 반영되어야 함

```java
// Main App - 캐시 사용
@Cacheable(value = "portfolio")
public Portfolio getPortfolio() {
    // Redis 캐시에서 조회, 없으면 DB 조회
}

// Admin App - 캐시 없이 조회
public List<Experience> findAllExperiencesWithoutCache() {
    // 직접 DB 조회
}

// Admin App - 캐시 무효화
@CacheEvict(value = "portfolio", allEntries = true)
public Experience createExperience(Experience experience) {
    // 메인 앱 캐시 무효화
}
```

**캐시 전략**
| 앱 | 조회 | 수정 |
|----|------|------|
| **Main** | ✅ 캐시 사용 | ❌ 수정 불가 |
| **Admin** | ❌ 캐시 없음 | ✅ 캐시 무효화 |

---

## FAQ

**Q: 왜 정렬 순서를 자동으로 재정렬하나요?**  
A: 사용자가 임의로 값을 입력할 수 없도록 하고, 항상 연속적인 순서를 보장하기 위함입니다.

**Q: UPDATE와 INSERT를 어떻게 구분하나요?**  
A: `businessId`로 기존 엔티티를 조회해서, 있으면 UPDATE, 없으면 INSERT로 처리합니다.

**Q: MetadataHelper를 꼭 사용해야 하나요?**  
A: 선택사항이지만, 코드 중복을 줄이고 일관성을 보장하기 위해 사용하는 것을 권장합니다.

**Q: 왜 어드민에서는 캐시를 사용하지 않나요?**  
A: 어드민은 데이터 수정 작업이 많고, 수정 후 즉시 변경사항을 확인해야 하기 때문에 캐시 없이 DB를 직접 조회합니다. 대신 수정 시 `@CacheEvict`로 메인 앱의 캐시를 무효화합니다.

**Q: Main 앱과 Admin 앱의 캐시 전략이 다른가요?**  
A: 네, Main 앱은 조회 성능을 위해 캐시를 사용하고, Admin은 실시간성과 정확성을 위해 캐시를 사용하지 않습니다.

---

**작성일**: 2025-01-26  
**버전**: 2.0  
**작성자**: AI Agent (Claude)
