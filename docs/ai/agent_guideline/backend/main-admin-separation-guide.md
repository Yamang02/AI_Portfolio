# Main/Admin 앱 분리 가이드

**작성일**: 2025-01-26  
**목적**: Main 앱과 Admin 앱의 명확한 분리 및 캐시 관리  
**대상**: 백엔드 개발자, AI Agent

---

## 📋 목차

1. [개요](#개요)
2. [아키텍처 결정사항](#아키텍처-결정사항)
3. [캐시 관리 전략](#캐시-관리-전략)
4. [디렉토리 구조](#디렉토리-구조)
5. [적용 가이드라인](#적용-가이드라인)

---

## 개요

### 핵심 개념

프로젝트는 두 가지 앱으로 구성됩니다:

- **Main 앱**: 포트폴리오 사이트 (데이터 조회 전용)
  - Redis 캐시를 사용하여 빠른 응답 제공
  - `/api/data/*` 엔드포인트 제공

- **Admin 앱**: 관리자 대시보드 (데이터 관리 전용)
  - Redis 캐시 없이 실시간 데이터 조회
  - CUD 작업 시 자동으로 캐시 무효화
  - `/api/admin/*` 엔드포인트 제공

### 공유 원칙

**공유하는 것**:
- Domain Model (Education, Experience, Project, TechStackMetadata 등)
- Repository Port 인터페이스
- Domain Service (비즈니스 로직 검증)

**분리하는 것**:
- Application Service (조회/관리 로직)
- Controller (엔드포인트)
- Bean 이름 (Spring 의존성 주입)

---

## 아키텍처 결정사항

### 결정 1: 패키지 구조

```
application/
├── portfolio/                    # Main 앱 전용
│   ├── GetEducationService.java      # 캐시 사용 (조회)
│   ├── GetExperienceService.java     # 캐시 사용 (조회)
│   └── TechStackMetadataService.java  # 캐시 사용 (조회)
│
├── admin/                        # Admin 앱 전용
│   ├── service/                      # 관리 서비스
│   │   ├── ManageEducationService.java
│   │   ├── ManageExperienceService.java
│   │   └── ManageTechStackMetadataService.java
│   │
│   └── query/                        # Admin 전용 조회
│       ├── AdminGetEducationService.java    # 캐시 없음
│       └── AdminGetExperienceService.java   # 캐시 없음
│
└── chatbot/                      # 독립 도메인
    └── ChatApplicationService.java
```

### 결정 2: Bean 이름 규칙

**Main 앱 Service**:
```java
@Service("getEducationService")
public class GetEducationService implements GetEducationUseCase { ... }

@Service("getExperienceService")
public class GetExperienceService implements GetExperienceUseCase { ... }
```

**Admin 앱 Service**:
```java
@Service("adminGetEducationService")
public class AdminGetEducationService implements GetEducationUseCase { ... }

@Service("manageEducationService")
public class ManageEducationService implements ManageEducationUseCase { ... }
```

**패턴**: Main은 `get{Entity}Service`, Admin은 `admin{Action}{Entity}Service` 또는 `manage{Entity}Service`

### 결정 3: 캐시 전략

**캐시 계층**:
1. Repository 레벨: `@Cacheable` (Main 앱 조회 시 자동 캐시)
2. Service 레벨: `@CacheEvict` (Admin CUD 시 자동 캐시 무효화)

**메서드 분리**:
- `PortfolioRepositoryPort`에 두 개의 메서드 존재:
  - `findAllEducations()` → 캐시 사용 (Main 앱)
  - `findAllEducationsWithoutCache()` → 캐시 없음 (Admin 앱)

### 결정 4: UseCase 위치 원칙

**도메인 로직 UseCase** → `domain/portfolio/port/in/`
- Education, Experience, Project, TechStack 관련
- Main이 사용하든 Admin이 사용하든 Portfolio 도메인

**인프라 UseCase** → `domain/admin/port/in/`
- 캐시 관리, 이미지 업로드 등 시스템 관리 기능

---

## 캐시 관리 전략

### 캐시 흐름

#### 1. Main 앱 조회 시

```java
// DataController
@GetMapping("/api/data/education")
public ResponseEntity<ApiResponse<List<EducationDto>>> getEducation() {
    // GetEducationService 호출
    List<Education> educations = getEducationUseCase.getAllEducations();
    // ↓
    // Repository의 findAllEducations() 호출
    // ↓
    // @Cacheable이 작동하여 캐시 확인
    // - Cache Hit: Redis에서 즉시 반환
    // - Cache Miss: DB 조회 후 Redis에 저장
}
```

#### 2. Admin 앱 조회 시

```java
// AdminEducationController
@GetMapping("/api/admin/educations")
public ResponseEntity<ApiResponse<List<EducationDto>>> getAllEducations() {
    // AdminGetEducationService 호출
    List<Education> educations = adminGetEducationUseCase.getAllEducations();
    // ↓
    // Repository의 findAllEducationsWithoutCache() 호출
    // ↓
    // 캐시를 우회하여 항상 DB에서 실시간 조회
}
```

#### 3. Admin 앱 수정 시

```java
// ManageEducationService
@CacheEvict(value = "portfolio", allEntries = true)
public Education updateEducation(String id, Education education) {
    // 1. DB에 저장
    Education updated = portfolioRepositoryPort.saveEducation(education);
    
    // 2. @CacheEvict가 작동하여 관련 캐시 모두 무효화
    // - "portfolio" 캐시의 모든 키 삭제
    // - Main 앱의 다음 조회는 DB에서 새로운 데이터 가져옴
    
    return updated;
}
```

### 캐시 관리 서비스 위치

**Admin 전용 수동 캐시 관리** (`application/admin/service/`):
```java
@Service
public class CacheManagementService implements ManageCacheUseCase {
    // 관리자가 수동으로 캐시 제어 (디버깅/모니터링용)
    void flushAllCache();
    Map<String, Object> getCacheStats();
    void evictCacheByPattern(String pattern);
}
```

**자동 캐시 관리** (각 Service 메서드):
```java
// Main 앱 조회 Service
@Cacheable(value = "portfolio", key = "'educations'")
public List<Education> findAllEducations() { ... }

// Admin 앱 관리 Service
@CacheEvict(value = "portfolio", allEntries = true)
public Education updateEducation(...) { ... }
```

---

## 디렉토리 구조

### 전체 구조

```
backend/src/main/java/com/aiportfolio/backend/
│
├── domain/                                # 도메인 계층 (공유)
│   ├── portfolio/
│   │   ├── model/                         # 도메인 모델
│   │   │   ├── Education.java
│   │   │   ├── Experience.java
│   │   │   ├── Project.java
│   │   │   └── TechStackMetadata.java
│   │   │
│   │   ├── port/
│   │   │   ├── in/                        # UseCase 인터페이스
│   │   │   │   ├── GetEducationUseCase.java
│   │   │   │   ├── ManageEducationUseCase.java
│   │   │   │   └── ManageTechStackMetadataUseCase.java
│   │   │   │
│   │   │   └── out/                        # Repository Port
│   │   │       ├── PortfolioRepositoryPort.java
│   │   │       └── TechStackMetadataRepositoryPort.java
│   │   │
│   │   └── service/                        # Domain Service
│   │       └── TechStackDomainService.java
│   │
│   └── admin/
│       ├── model/                         # Admin 전용 DTO/VO
│       │   ├── dto/request/ProjectCreateRequest.java
│       │   └── vo/ProjectFilter.java
│       │
│       └── port/in/                       # Admin 인프라 UseCase
│           ├── ManageCacheUseCase.java
│           └── UploadImageUseCase.java
│
├── application/                           # 애플리케이션 계층
│   ├── portfolio/                         # Main 앱 (조회 전용)
│   │   ├── GetEducationService.java       # Bean: "getEducationService"
│   │   ├── GetExperienceService.java      # Bean: "getExperienceService"
│   │   └── TechStackMetadataService.java  # Bean: "getTechStackMetadataService"
│   │
│   ├── admin/                             # Admin 앱
│   │   ├── service/                       # 관리 서비스 (CUD)
│   │   │   ├── ManageEducationService.java    # Bean: "manageEducationService"
│   │   │   ├── ManageExperienceService.java    # Bean: "manageExperienceService"
│   │   │   ├── ManageTechStackMetadataService.java
│   │   │   ├── UpdateTechStackSortOrderService.java
│   │   │   ├── ProjectManagementService.java
│   │   │   ├── CacheManagementService.java
│   │   │   └── ImageUploadService.java
│   │   │
│   │   └── query/                        # Admin 전용 조회
│   │       ├── AdminGetEducationService.java     # Bean: "adminGetEducationService"
│   │       └── AdminGetExperienceService.java    # Bean: "adminGetExperienceService"
│   │
│   └── chatbot/                          # 독립 도메인
│       └── ChatApplicationService.java
│
└── infrastructure/                        # 인프라 계층
    ├── persistence/                      # DB 연동
    │   ├── postgres/
    │   │   ├── entity/
    │   │   ├── repository/
    │   │   └── adapter/
    │   └── redis/
    │       └── adapter/
    │
    └── web/                              # 웹 계층
        ├── controller/                   # Main 앱
        │   └── DataController.java
        │
        └── admin/controller/             # Admin 앱
            ├── AdminEducationController.java
            ├── AdminExperienceController.java
            └── AdminProjectController.java
```

### 주요 디렉토리 설명

| 경로 | 역할 | 공유 여부 |
|------|------|----------|
| `domain/*/model/` | 도메인 모델 | ✅ Main/Admin 공유 |
| `domain/*/port/` | UseCase, Repository 인터페이스 | ✅ Main/Admin 공유 |
| `application/portfolio/` | Main 앱 조회 Service | ❌ Main 전용 |
| `application/admin/service/` | Admin 관리 Service | ❌ Admin 전용 |
| `application/admin/query/` | Admin 조회 Service | ❌ Admin 전용 |
| `infrastructure/web/controller/` | Main 앱 엔드포인트 | ❌ Main 전용 |
| `infrastructure/web/admin/controller/` | Admin 앱 엔드포인트 | ❌ Admin 전용 |

---

## 적용 가이드라인

### 1. 새로운 도메인 추가 시

**Main 앱 (조회 전용)**:
```java
// application/portfolio/Get{Entity}Service.java
@Service("get{Entity}Service")
@Transactional(readOnly = true)
public class Get{Entity}Service implements Get{Entity}UseCase {
    
    private final {Entity}RepositoryPort repositoryPort;
    
    @Override
    public List<{Entity}> getAll{Entities}() {
        // 캐시된 데이터 조회 (Repository의 @Cacheable 사용)
        return repositoryPort.findAll{Entities}();
    }
}
```

**Admin 앱 (조회 전용, 캐시 없음)**:
```java
// application/admin/query/AdminGet{Entity}Service.java
@Service("adminGet{Entity}Service")
@Transactional(readOnly = true)
public class AdminGet{Entity}Service implements Get{Entity}UseCase {
    
    private final {Entity}RepositoryPort repositoryPort;
    
    @Override
    public List<{Entity}> getAll{Entities}() {
        // 캐시 없이 실시간 조회
        return repositoryPort.findAll{Entities}WithoutCache();
    }
}
```

**Admin 앱 (관리 전용, 캐시 무효화)**:
```java
// application/admin/service/Manage{Entity}Service.java
@Service("manage{Entity}Service")
@Transactional
public class Manage{Entity}Service implements Manage{Entity}UseCase {
    
    private final {Entity}RepositoryPort repositoryPort;
    
    @CacheEvict(value = "portfolio", allEntries = true)
    @Override
    public {Entity} create{Entity}({Entity} entity) {
        // DB에 저장 후 캐시 자동 무효화
        return repositoryPort.save{Entity}(entity);
    }
    
    @CacheEvict(value = "portfolio", allEntries = true)
    @Override
    public {Entity} update{Entity}(String id, {Entity} entity) {
        return repositoryPort.save{Entity}(entity);
    }
    
    @CacheEvict(value = "portfolio", allEntries = true)
    @Override
    public void delete{Entity}(String id) {
        repositoryPort.delete{Entity}(id);
    }
}
```

### 2. Controller 작성 시

**Main 앱 Controller**:
```java
@RestController
@RequestMapping("/api/data/{entity}")
public class {Entity}Controller {
    
    private final Get{Entity}UseCase get{Entity}UseCase;
    
    public {Entity}Controller(
            @Qualifier("get{Entity}Service") Get{Entity}UseCase get{Entity}UseCase) {
        this.get{Entity}UseCase = get{Entity}UseCase;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<{Entity}Dto>>> getAll{Entities}() {
        List<{Entity}> entities = get{Entity}UseCase.getAll{Entities}();
        return ResponseEntity.ok(ApiResponse.success(convertToDto(entities)));
    }
}
```

**Admin 앱 Controller**:
```java
@RestController
@RequestMapping("/api/admin/{entities}")
public class Admin{Entity}Controller {
    
    private final Get{Entity}UseCase adminGet{Entity}UseCase;
    private final Manage{Entity}UseCase manage{Entity}UseCase;
    
    public Admin{Entity}Controller(
            @Qualifier("adminGet{Entity}Service") Get{Entity}UseCase adminGet{Entity}UseCase,
            @Qualifier("manage{Entity}Service") Manage{Entity}UseCase manage{Entity}UseCase,
            AdminAuthChecker adminAuthChecker) {
        this.adminGet{Entity}UseCase = adminGet{Entity}UseCase;
        this.manage{Entity}UseCase = manage{Entity}UseCase;
        this.adminAuthChecker = adminAuthChecker;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<{Entity}Dto>>> getAll{Entities}(
            HttpServletRequest request) {
        adminAuthChecker.requireAuthentication(request);
        
        List<{Entity}> entities = adminGet{Entity}UseCase.getAll{Entities}();
        return ResponseEntity.ok(ApiResponse.success(convertToDto(entities)));
    }
}
```

### 3. Repository Port 메서드 작성 시

**캐시 사용/미사용 메서드 분리**:
```java
public interface {Entity}RepositoryPort {
    
    /**
     * Main 앱용: 캐시 사용 (Repository 레벨에서 @Cacheable)
     */
    List<{Entity}> findAll{Entities}();
    
    /**
     * Admin 앱용: 캐시 없음 (실시간 조회)
     */
    List<{Entity}> findAll{Entities}WithoutCache();
    
    // ... 기타 메서드
}
```

**Repository 구현체**:
```java
@Override
@Cacheable(value = "portfolio", key = "'{entities}'")
public List<{Entity}> findAll{Entities}() {
    log.info("Fetching {entities} with cache");
    List<{Entity}JpaEntity> entities = jpaRepository.findAll();
    return mapper.toDomainList(entities);
}

@Override
public List<{Entity}> findAll{Entities}WithoutCache() {
    log.info("Fetching {entities} without cache (admin)");
    List<{Entity}JpaEntity> entities = jpaRepository.findAll();
    return mapper.toDomainList(entities);
}
```

---

## 관련 문서

- [`crud-template-guide.md`](./crud-template-guide.md): CRUD 템플릿 및 패턴 가이드
- [`hexagonal-architecture-guide.md`](./hexagonal-architecture-guide.md): 헥사고날 아키텍처 가이드
- [`IMPORT_ORGANIZATION_GUIDE.md`](./IMPORT_ORGANIZATION_GUIDE.md): Import 정리 가이드

## 변경 사항

**2025-01-26**: 최초 작성
- Main/Admin 앱 분리 원칙 정립
- 캐시 관리 전략 문서화
- Bean 이름 규칙 정립

---

**작성자**: AI Agent (Claude)  
**검토자**: 개발팀  
**버전**: 1.0

