# 백엔드 아키텍처 가이드

**작성일**: 2025-10-28  
**목적**: 백엔드 개발 시 참고할 수 있는 표준화된 구조 및 패턴 가이드  
**대상**: 백엔드 개발자, AI Agent

---

## 📋 목차

1. [아키텍처 개요](#아키텍처-개요)
2. [Admin/Main 분리 원칙](#adminmain-분리-원칙)
3. [레이어별 구현 가이드](#레이어별-구현-가이드)
4. [패턴 및 컨벤션](#패턴-및-컨벤션)
5. [에러 처리 표준](#에러-처리-표준)
6. [DTO 변환 가이드](#dto-변환-가이드)
7. [Mapper 패턴 가이드](#mapper-패턴-가이드)
8. [관계형 테이블 처리 및 DTO 변환 가이드](#관계형-테이블-처리-및-dto-변환-가이드)
9. [안티패턴 및 피해야 할 패턴](#안티패턴-및-피해야-할-패턴)
10. [새 도메인 추가 가이드](#새-도메인-추가-가이드)
11. [향후 개선 사항](#향후-개선-사항)

---

## 아키텍처 개요

### 기술 스택

- **언어**: Java (Spring Boot)
- **아키텍처**: Hexagonal Architecture (포트 앤 어댑터)
- **데이터베이스**: PostgreSQL (JPA/Hibernate)
- **캐시**: Redis
- **빌드 도구**: Maven

### Hexagonal Architecture

프로젝트는 **Hexagonal Architecture (포트 앤 어댑터)**를 채택하고 있습니다.

```
┌─────────────────────────────────────┐
│   Infrastructure Layer              │
│   - Controller (Web Adapter)        │
│   - Repository (Persistence Adapter)│
│   - External Service Adapter        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Application Layer                  │
│   - Application Service              │
│   - UseCase 구현                     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Domain Layer                       │
│   - Domain Model                     │
│   - Port (UseCase Interface)         │
│   - Domain Service                   │
└─────────────────────────────────────┘
```

### 프로젝트 구조

```
backend/src/main/java/com/aiportfolio/backend/
├── domain/              # 도메인 계층 (비즈니스 로직)
│   ├── portfolio/      # 포트폴리오 도메인
│   ├── admin/          # Admin 도메인
│   └── chatbot/        # 챗봇 도메인
│
├── application/         # 애플리케이션 계층 (유스케이스 구현)
│   ├── portfolio/      # Main 앱 전용
│   ├── admin/          # Admin 앱 전용
│   └── common/         # 공통 유틸리티
│
└── infrastructure/      # 인프라 계층 (외부 시스템 연동)
    ├── persistence/    # DB 연동
    ├── web/           # 웹 계층
    └── external/      # 외부 서비스 연동
```

### 핵심 원칙

1. **단일 책임 원칙**: 각 클래스는 하나의 책임만 가짐
2. **의존성 역전 원칙**: Domain Layer는 외부에 의존하지 않음
3. **포트 앤 어댑터**: Port 인터페이스로 도메인과 인프라 분리
4. **Admin/Main 분리**: 두 앱을 명확히 분리하여 관리

---

## Admin/Main 분리 원칙

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
- ✅ Domain Model (`domain/portfolio/model/`)
- ✅ Repository Port 인터페이스 (`domain/portfolio/port/out/`)
- ✅ Domain Service (`domain/portfolio/service/`)

**분리하는 것**:
- ✅ Application Service (`application/portfolio/` vs `application/admin/`)
- ✅ Controller (`infrastructure/web/controller/` vs `infrastructure/web/admin/controller/`)
- ✅ DTO (`infrastructure/web/dto/` vs `infrastructure/web/admin/dto/`)
- ✅ Exception Handler (`GlobalExceptionHandler` vs `AdminApiExceptionHandler`)

### Bean 이름 규칙

**Main 앱 Service**:
```java
@Service("getEducationService")
public class GetEducationService implements GetEducationUseCase { ... }
```

**Admin 앱 Service**:
```java
@Service("adminGetEducationService")
public class AdminGetEducationService implements GetEducationUseCase { ... }

@Service("manageEducationService")
public class ManageEducationService implements ManageEducationUseCase { ... }
```

**패턴**: Main은 `get{Entity}Service`, Admin은 `admin{Action}{Entity}Service` 또는 `manage{Entity}Service`

### 캐시 전략

**Main 앱 조회**: Repository 레벨에서 `@Cacheable` 사용
```java
@Cacheable(value = "portfolio", key = "'educations'")
public List<Education> findAllEducations() { ... }
```

**Admin 앱 조회**: 캐시 없이 실시간 조회
```java
public List<Education> findAllEducationsWithoutCache() { ... }
```

**Admin 앱 CUD**: Service 레벨에서 `@CacheEvict` 사용
```java
@CacheEvict(value = "portfolio", allEntries = true)
public Education updateEducation(...) { ... }
```

**상세 내용**: [`main-admin-separation-guide.md`](../ai/agent_guideline/backend/main-admin-separation-guide.md) 참고

---

## 레이어별 구현 가이드

### 1. Domain Layer

#### Domain Model 작성 가이드

**위치**: `domain/{domain}/model/`

**원칙**:
- ✅ 순수 Java 클래스 (JPA 의존성 없음)
- ✅ 비즈니스 로직 포함 가능
- ✅ Builder 패턴 사용 (Lombok `@Builder`)

**예시**:
```java
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    private String id;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    
    // 비즈니스 로직 메서드
    public boolean isOngoing() {
        return endDate == null;
    }
}
```

#### Port 인터페이스 작성 가이드

**Inbound Port (UseCase)**:
- 위치: `domain/{domain}/port/in/`
- 역할: 비즈니스 로직 인터페이스 정의

**예시**:
```java
public interface GetEducationUseCase {
    List<Education> getAllEducations();
    Optional<Education> getEducationById(String id);
}
```

**Outbound Port (Repository)**:
- 위치: `domain/{domain}/port/out/`
- 역할: 데이터 접근 인터페이스 정의

**예시**:
```java
public interface PortfolioRepositoryPort {
    List<Education> findAllEducations();
    List<Education> findAllEducationsWithoutCache();
    Optional<Education> findEducationById(String id);
    Education saveEducation(Education education);
    void deleteEducation(String id);
}
```

### 2. Application Layer

#### Application Service 작성 가이드

**Main 앱 Service**:
- 위치: `application/portfolio/`
- Bean 이름: `get{Entity}Service`
- 특징: 캐시 사용, 읽기 전용 트랜잭션

**예시**:
```java
@Service("getEducationService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class GetEducationService implements GetEducationUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    
    @Override
    public List<Education> getAllEducations() {
        log.debug("Fetching all educations (main - with cache)");
        return portfolioRepositoryPort.findAllEducations();
    }
}
```

**Admin 앱 Service (조회)**:
- 위치: `application/admin/query/`
- Bean 이름: `adminGet{Entity}Service`
- 특징: 캐시 없음, 읽기 전용 트랜잭션

**예시**:
```java
@Service("adminGetEducationService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AdminGetEducationService implements GetEducationUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    
    @Override
    public List<Education> getAllEducations() {
        log.debug("Fetching all educations (admin - without cache)");
        return portfolioRepositoryPort.findAllEducationsWithoutCache();
    }
}
```

**Admin 앱 Service (관리)**:
- 위치: `application/admin/service/`
- Bean 이름: `manage{Entity}Service`
- 특징: 캐시 무효화, 쓰기 트랜잭션

**예시**:
```java
@Service("manageEducationService")
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ManageEducationService implements ManageEducationUseCase {
    
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    
    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Education createEducation(EducationCreateCommand command) {
        log.info("Creating new education: {}", command.getTitle());
        Education education = Education.builder()
                .id(generateId())
                .title(command.getTitle())
                .build();
        return portfolioRepositoryPort.saveEducation(education);
    }
    
    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public Education updateEducation(String id, EducationUpdateCommand command) {
        log.info("Updating education: {}", id);
        Education education = portfolioRepositoryPort.findEducationById(id)
                .orElseThrow(() -> new IllegalArgumentException("Education not found: " + id));
        education.setTitle(command.getTitle());
        return portfolioRepositoryPort.saveEducation(education);
    }
    
    @Override
    @CacheEvict(value = "portfolio", allEntries = true)
    public void deleteEducation(String id) {
        log.info("Deleting education: {}", id);
        portfolioRepositoryPort.deleteEducation(id);
    }
}
```

### 3. Infrastructure Layer

#### Controller 작성 가이드

**Main 앱 Controller**:
- 위치: `infrastructure/web/controller/`
- 엔드포인트: `/api/data/*`

**예시**:
```java
@RestController
@RequestMapping("/api/data/education")
@RequiredArgsConstructor
@Slf4j
public class EducationController {
    
    private final GetEducationUseCase getEducationUseCase;
    
    public EducationController(
            @Qualifier("getEducationService") GetEducationUseCase getEducationUseCase) {
        this.getEducationUseCase = getEducationUseCase;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<EducationDto>>> getAllEducations() {
        // 예외는 전파하여 Exception Handler에서 처리
        List<Education> educations = getEducationUseCase.getAllEducations();
        List<EducationDto> dtos = educations.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "교육 목록 조회 성공"));
    }
    
    private EducationDto toDto(Education education) {
        return EducationDto.builder()
                .id(education.getId())
                .title(education.getTitle())
                .build();
    }
}
```

**Admin 앱 Controller**:
- 위치: `infrastructure/web/admin/controller/`
- 엔드포인트: `/api/admin/*`

**예시**:
```java
@RestController
@RequestMapping("/api/admin/educations")
@RequiredArgsConstructor
@Slf4j
public class AdminEducationController {
    
    private final GetEducationUseCase adminGetEducationUseCase;
    private final ManageEducationUseCase manageEducationUseCase;
    
    public AdminEducationController(
            @Qualifier("adminGetEducationService") GetEducationUseCase adminGetEducationUseCase,
            @Qualifier("manageEducationService") ManageEducationUseCase manageEducationUseCase) {
        this.adminGetEducationUseCase = adminGetEducationUseCase;
        this.manageEducationUseCase = manageEducationUseCase;
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<EducationDto>>> getAllEducations() {
        // 예외는 전파하여 Exception Handler에서 처리
        List<Education> educations = adminGetEducationUseCase.getAllEducations();
        List<EducationDto> dtos = educations.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos, "교육 목록 조회 성공"));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<EducationDto>> createEducation(
            @Valid @RequestBody AdminEducationCreateRequest request) {
        // 예외는 전파하여 Exception Handler에서 처리
        EducationCreateCommand command = request.toCommand();
        Education education = manageEducationUseCase.createEducation(command);
        EducationDto dto = toDto(education);
        return ResponseEntity.ok(ApiResponse.success(dto, "교육 생성 성공"));
    }
    
    private EducationDto toDto(Education education) {
        return EducationDto.builder()
                .id(education.getId())
                .title(education.getTitle())
                .build();
    }
}
```

#### Repository 구현 가이드

**Adapter 구현**:
- 위치: `infrastructure/persistence/postgres/`
- 역할: Port 인터페이스 구현

**예시**:
```java
@Repository
@Primary
@RequiredArgsConstructor
public class PostgresPortfolioRepository implements PortfolioRepositoryPort {
    
    private final EducationJpaRepository educationJpaRepository;
    private final EducationMapper educationMapper;
    
    @Override
    @Cacheable(value = "portfolio", key = "'educations'")
    public List<Education> findAllEducations() {
        log.info("Fetching educations with cache");
        List<EducationJpaEntity> entities = educationJpaRepository.findAll();
        return educationMapper.toDomainList(entities);
    }
    
    @Override
    public List<Education> findAllEducationsWithoutCache() {
        log.info("Fetching educations without cache (admin)");
        List<EducationJpaEntity> entities = educationJpaRepository.findAll();
        return educationMapper.toDomainList(entities);
    }
    
    @Override
    public Optional<Education> findEducationById(String id) {
        return educationJpaRepository.findByBusinessId(id)
                .map(educationMapper::toDomain);
    }
    
    @Override
    public Education saveEducation(Education education) {
        EducationJpaEntity entity = educationMapper.toEntity(education);
        EducationJpaEntity saved = educationJpaRepository.save(entity);
        return educationMapper.toDomain(saved);
    }
    
    @Override
    public void deleteEducation(String id) {
        educationJpaRepository.deleteByBusinessId(id);
    }
}
```

---

## 패턴 및 컨벤션

### 네이밍 컨벤션

**Service**:
- Main 앱 조회: `Get{Entity}Service`
- Admin 앱 조회: `AdminGet{Entity}Service`
- Admin 앱 관리: `Manage{Entity}Service`

**Controller**:
- Main 앱: `{Entity}Controller`
- Admin 앱: `Admin{Entity}Controller`

**Repository Port**:
- `{Entity}RepositoryPort`
- `{Domain}RepositoryPort` (여러 Entity 포함 시)

**Mapper**:
- `{Entity}Mapper`

### 트랜잭션 관리

**읽기 전용**:
```java
@Transactional(readOnly = true)
```

**쓰기 작업**:
```java
@Transactional
```

### 캐시 관리

**캐시 사용 (Main 앱)**:
```java
@Cacheable(value = "portfolio", key = "'{entities}'")
```

**캐시 무효화 (Admin 앱 CUD)**:
```java
@CacheEvict(value = "portfolio", allEntries = true)
```

### 로깅

**레벨별 사용**:
- `log.debug()`: 상세 디버깅 정보
- `log.info()`: 중요한 비즈니스 이벤트 (생성, 수정, 삭제)
- `log.warn()`: 경고 상황
- `log.error()`: 에러 상황

---

## 에러 처리 표준

### 예외 전파 및 전역 처리 (프로젝트 표준)

**핵심 원칙**: Controller는 예외를 전파하고, Exception Handler에서 전역적으로 처리합니다.

**Controller 패턴**:
```java
@GetMapping
public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects(...) {
    // try-catch 없이 예외를 전파
    List<ProjectResponse> projects = searchProjectsUseCase.searchProjects(filter)
            .stream()
            .map(projectResponseMapper::toDetailedResponse)
            .collect(Collectors.toList());
    
    return ResponseEntity.ok(ApiResponse.success(projects, "프로젝트 목록 조회 성공"));
}
```

**Exception Handler에서 전역 처리**:
- `GlobalExceptionHandler`: Main 앱 전역 예외 처리
- `AdminApiExceptionHandler`: Admin 앱 전역 예외 처리

**Exception Handler 구현**:
```java
@RestControllerAdvice(basePackages = "com.aiportfolio.backend.infrastructure.web.admin")
@Slf4j
public class AdminApiExceptionHandler {
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(exception.getMessage(), "잘못된 요청"));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception exception) {
        log.error("Unexpected admin API error", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("관리자 API 처리 중 오류가 발생했습니다.", "서버 오류"));
    }
}
```

**에러 응답 형식**:
```java
// 성공
ApiResponse.success(data, "성공 메시지")

// 에러
ApiResponse.error("에러 메시지", "에러 타입")
```

**예외 타입별 처리**:
- `IllegalArgumentException`: 400 Bad Request (잘못된 요청)
- `AdminAuthenticationException`: 401 Unauthorized (인증 필요)
- `MethodArgumentNotValidException`: 400 Bad Request (검증 오류)
- `Exception`: 500 Internal Server Error (서버 오류)

**참고**: 현재 일부 Controller에서 try-catch를 직접 사용하고 있지만, 점진적으로 Exception Handler 패턴으로 개선할 예정입니다.

---

## DTO 변환 가이드

### 권장 패턴

**Controller에서 DTO 변환**:
```
Request DTO → Command/Domain Model 변환 (Controller)
Domain Model → Response DTO 변환 (Controller)
```

**예시**:
```java
@PostMapping
public ResponseEntity<ApiResponse<EducationDto>> createEducation(
        @Valid @RequestBody AdminEducationCreateRequest request) {
    // Request DTO → Command 변환
    EducationCreateCommand command = request.toCommand();
    
    // UseCase 호출 (Domain Model 반환)
    Education education = manageEducationUseCase.createEducation(command);
    
    // Domain Model → Response DTO 변환
    EducationDto dto = toDto(education);
    
    return ResponseEntity.ok(ApiResponse.success(dto, "교육 생성 성공"));
}

private EducationDto toDto(Education education) {
    return EducationDto.builder()
            .id(education.getId())
            .title(education.getTitle())
            .build();
}
```

**Service에서 DTO 변환 (선택적)**:
- 복잡한 변환 로직이 필요한 경우에만 Service에서 DTO 변환
- 예: 여러 Domain Model 조합, 복잡한 계산 등

**Mapper 클래스 활용**:
- DTO 변환 로직이 복잡한 경우 Mapper 클래스 사용 권장
- 예: `ProjectResponseMapper`, `EducationMapper`

---

## Mapper 패턴 가이드

### Repository Mapper

**위치**: `infrastructure/persistence/postgres/mapper/`

**역할**: JPA Entity ↔ Domain Model 변환

**예시**:
```java
@Component
public class EducationMapper {
    
    public Education toDomain(EducationJpaEntity entity) {
        return Education.builder()
                .id(entity.getBusinessId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .build();
    }
    
    public List<Education> toDomainList(List<EducationJpaEntity> entities) {
        return entities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
    
    public EducationJpaEntity toEntity(Education domain) {
        EducationJpaEntity entity = new EducationJpaEntity();
        entity.setBusinessId(domain.getId());
        entity.setTitle(domain.getTitle());
        entity.setDescription(domain.getDescription());
        return entity;
    }
}
```

### Response Mapper (선택적)

**위치**: `application/admin/mapper/` 또는 `infrastructure/web/admin/dto/response/`

**역할**: Domain Model → Response DTO 변환

**예시**:
```java
@Component
public class ProjectResponseMapper {
    
    public ProjectResponse toDetailedResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .build();
    }
}
```

**권장 사항**:
- ✅ 새 Repository 작성 시 Mapper 패턴 사용
- ✅ 기존 Repository는 리팩토링 기회 있을 때 점진적 개선

---

## 새 도메인 추가 가이드

### 1단계: Domain Layer 생성

```java
// domain/{domain}/model/{Entity}.java
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class {Entity} {
    private String id;
    // 필드 정의
}

// domain/{domain}/port/in/Get{Entity}UseCase.java
public interface Get{Entity}UseCase {
    List<{Entity}> getAll{Entities}();
}

// domain/{domain}/port/out/{Domain}RepositoryPort.java
public interface {Domain}RepositoryPort {
    List<{Entity}> findAll{Entities}();
    List<{Entity}> findAll{Entities}WithoutCache();
}
```

### 2단계: Application Layer 생성

```java
// application/portfolio/Get{Entity}Service.java
@Service("get{Entity}Service")
@Transactional(readOnly = true)
public class Get{Entity}Service implements Get{Entity}UseCase {
    // Main 앱 조회 로직
}

// application/admin/query/AdminGet{Entity}Service.java
@Service("adminGet{Entity}Service")
@Transactional(readOnly = true)
public class AdminGet{Entity}Service implements Get{Entity}UseCase {
    // Admin 앱 조회 로직 (캐시 없음)
}

// application/admin/service/Manage{Entity}Service.java
@Service("manage{Entity}Service")
@Transactional
public class Manage{Entity}Service implements Manage{Entity}UseCase {
    // Admin 앱 관리 로직 (캐시 무효화)
}
```

### 3단계: Infrastructure Layer 생성

```java
// infrastructure/persistence/postgres/{Entity}Mapper.java
@Component
public class {Entity}Mapper {
    // Entity ↔ Domain 변환
}

// infrastructure/persistence/postgres/Postgres{Domain}Repository.java
@Repository
@Primary
public class Postgres{Domain}Repository implements {Domain}RepositoryPort {
    // Port 구현
}

// infrastructure/web/controller/{Entity}Controller.java
@RestController
@RequestMapping("/api/data/{entities}")
public class {Entity}Controller {
    // Main 앱 Controller
}

// infrastructure/web/admin/controller/Admin{Entity}Controller.java
@RestController
@RequestMapping("/api/admin/{entities}")
public class Admin{Entity}Controller {
    // Admin 앱 Controller
}
```

---

## 관계형 테이블 처리 및 DTO 변환 가이드

### 관계형 테이블 컨트롤러 처리 방식

**현재 프로젝트**: 이미 `ProjectRelationshipPort`, `EducationRelationshipPort` 등의 Port 인터페이스가 존재합니다.

**권장 방식**:

#### 1. 단순 CRUD 작업: Repository Port 직접 사용

```java
@RestController
@RequestMapping("/api/admin/projects/{id}")
public class AdminProjectRelationshipController {
    private final ProjectRelationshipPort projectRelationshipPort; // ✅ Port 사용
    
    @PutMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<Void>> replaceTechStacks(
            @PathVariable String id,
            @RequestBody BulkTechStackRelationshipRequest request) {
        
        // DTO를 Port의 record로 변환
        List<ProjectRelationshipPort.TechStackRelation> relations = request.getTechStackRelationships()
                .stream()
                .map(item -> new ProjectRelationshipPort.TechStackRelation(
                        item.getTechStackId(),
                        item.getIsPrimary() != null ? item.getIsPrimary() : false,
                        item.getUsageDescription()
                ))
                .collect(Collectors.toList());
        
        // Port를 통해 관계 교체
        projectRelationshipPort.replaceTechStacks(id, relations);
        
        return ResponseEntity.ok(ApiResponse.success(null, "기술스택 관계 업데이트 성공"));
    }
}
```

**주의사항**:
- ❌ Controller에서 JPA Repository 직접 사용 금지
- ❌ Controller에 `@Transactional` 사용 금지 (Service 레벨에서 관리)
- ✅ Repository Port 사용
- ✅ 예외는 Exception Handler로 전파

#### 2. 복잡한 비즈니스 로직: UseCase 인터페이스 사용

비즈니스 로직이 복잡하거나 여러 Repository 조합이 필요한 경우:

```java
// Domain Layer: UseCase 인터페이스 정의
public interface ManageProjectRelationshipUseCase {
    List<TechStackRelationshipDto> getTechStackRelationships(String projectId);
    void replaceTechStackRelationships(String projectId, List<TechStackRelationshipRequest> requests);
}

// Application Layer: UseCase 구현
@Service("manageProjectRelationshipService")
@Transactional
public class ManageProjectRelationshipService implements ManageProjectRelationshipUseCase {
    private final ProjectRelationshipPort projectRelationshipPort;
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    // ...
}
```

### DTO 변환 위치

**권장 방식**: **Controller에서 DTO 변환** (현재 프로젝트 방식)

```java
@RestController
public class ProjectController {
    private final ManageProjectUseCase manageProjectUseCase;
    private final ProjectResponseMapper projectResponseMapper;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @RequestBody ProjectCreateRequest request) {
        // 1. Request DTO → Command 변환
        ProjectCreateCommand command = request.toCommand();
        
        // 2. UseCase 호출 (Domain Model 반환)
        Project project = manageProjectUseCase.createProject(command);
        
        // 3. Domain Model → Response DTO 변환 (Controller에서)
        ProjectResponse response = projectResponseMapper.toResponse(project);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

**이유**:
- ✅ Service는 Domain Model만 다룸 (순수성 유지)
- ✅ Service 재사용성 높음 (다양한 인터페이스에서 사용 가능)
- ✅ Spring Boot Best Practice와 일치

**예외 케이스**: 편의 메서드(`createProjectWithRelations()` 등)는 Service에서 DTO 반환 가능하나, 일관성을 위해 점진적 개선 권장.

---

## 안티패턴 및 피해야 할 패턴

> ⚠️ **주의**: 아래 예시들은 피해야 할 패턴입니다. 실제 코드에서 발견되면 개선이 필요합니다.

### 🔴 심각한 안티패턴

#### 1. Controller에서 JPA Repository 직접 사용

**❌ 잘못된 예시**:
```java
@RestController
public class SomeController {
    private final SomeJpaRepository jpaRepository; // ❌ Controller에서 JPA Repository 직접 사용
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<SomeDto>>> getData() {
        List<SomeJpaEntity> entities = jpaRepository.findAll(); // ❌ 인프라 레이어 직접 접근
        // ...
    }
}
```

**문제점**:
- Hexagonal Architecture 위반: Controller가 Infrastructure Layer에 직접 의존
- 레이어 분리 원칙 위반: Controller는 UseCase만 사용해야 함
- 테스트 어려움: JPA Repository를 Mock해야 함

**✅ 올바른 패턴**:
```java
@RestController
public class SomeController {
    private final GetSomeUseCase getSomeUseCase; // ✅ UseCase 인터페이스 사용
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<SomeDto>>> getData() {
        List<SomeDomain> domains = getSomeUseCase.getAll(); // ✅ UseCase를 통한 접근
        // ...
    }
}
```

---

#### 2. Controller에 @Transactional 사용

**❌ 잘못된 예시**:
```java
@RestController
@Transactional  // ❌ Controller에 트랜잭션 관리
public class SomeController {
    // ...
}
```

**문제점**:
- 책임 분리 원칙 위반: Controller는 HTTP 처리만 담당해야 함
- 트랜잭션 경계 불명확: Service 레벨에서 관리해야 함

**✅ 올바른 패턴**:
```java
@RestController  // ✅ @Transactional 없음
public class SomeController {
    private final ManageSomeUseCase manageSomeUseCase;
    // ...
}

@Service
@Transactional  // ✅ Service 레벨에서 트랜잭션 관리
public class ManageSomeService implements ManageSomeUseCase {
    // ...
}
```

---

#### 3. Mapper에서 JPA Repository 사용

**❌ 잘못된 예시**:
```java
@Component
public class SomeMapper {
    private final SomeJpaRepository jpaRepository; // ❌ Mapper에서 JPA Repository 사용
    
    public SomeDto toDto(SomeDomain domain) {
        Long id = jpaRepository.findByName(domain.getName()) // ❌ 외부 의존성 사용
                .map(entity -> entity.getId())
                .orElse(null);
        // ...
    }
}
```

**문제점**:
- Mapper의 순수성 위반: Mapper는 변환만 담당해야 함
- 의존성 순환 가능성: Mapper → Repository → Service → Mapper

**✅ 올바른 패턴**:
```java
@Component
public class SomeMapper {
    // ✅ 외부 의존성 없음
    
    public SomeDto toDto(SomeDomain domain) {
        // ✅ Domain Model에 이미 필요한 데이터가 포함되어 있음
        return SomeDto.builder()
                .id(domain.getId()) // ✅ Domain Model에서 직접 사용
                .name(domain.getName())
                // ...
                .build();
    }
}
```

**참고**: Domain Model에 필요한 데이터가 없다면, Repository Adapter에서 매핑 시 포함하도록 수정해야 합니다.

---

### ⚠️ 일관성 문제 (점진적 개선 권장)

#### 4. Controller에서 try-catch 직접 사용

**❌ 피해야 할 패턴**:
```java
@GetMapping
public ResponseEntity<ApiResponse<List<SomeDto>>> getData() {
    try {  // ❌ Controller에서 try-catch 사용
        List<SomeDomain> domains = getSomeUseCase.getAll();
        return ResponseEntity.ok(ApiResponse.success(dtos));
    } catch (Exception e) {
        return ResponseEntity.internalServerError()
                .body(ApiResponse.error("에러 메시지"));
    }
}
```

**문제점**:
- Exception Handler 패턴 미준수
- 코드 중복: 모든 Controller에서 동일한 에러 처리 반복

**✅ 올바른 패턴**:
```java
@GetMapping
public ResponseEntity<ApiResponse<List<SomeDto>>> getData() {
    // ✅ try-catch 없이 예외를 전파
    List<SomeDomain> domains = getSomeUseCase.getAll();
    List<SomeDto> dtos = domains.stream()
            .map(someMapper::toDto)
            .collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(dtos));
}

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        // ✅ 전역 예외 처리
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("에러 메시지", "에러 타입"));
    }
}
```

**예외 케이스**: 파일 업로드 등 보상 트랜잭션(Compensating Transaction)이 필요한 경우는 Controller에서 try-catch 사용 가능.

---

#### 5. Service에서 DTO 반환

**❌ 피해야 할 패턴**:
```java
@Service
public class ManageSomeService {
    public SomeDto createSome(CreateCommand command) {  // ❌ Service에서 DTO 반환
        SomeDomain domain = createDomain(command);
        return someMapper.toDto(domain); // ❌ DTO 변환
    }
}
```

**문제점**:
- 책임 혼재: Service가 DTO 변환까지 담당
- 가이드와 불일치: Controller에서 DTO 변환 권장

**✅ 올바른 패턴**:
```java
@Service
public class ManageSomeService {
    public SomeDomain createSome(CreateCommand command) {  // ✅ Domain Model 반환
        return createDomain(command);
    }
}

@RestController
public class SomeController {
    public ResponseEntity<ApiResponse<SomeDto>> create(@RequestBody CreateRequest request) {
        CreateCommand command = requestToCommandMapper.toCommand(request);
        SomeDomain domain = manageSomeUseCase.createSome(command);
        SomeDto dto = someMapper.toDto(domain); // ✅ Controller에서 DTO 변환
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
```

**참고**: 편의 메서드로 Service에서 DTO를 반환하는 경우도 있지만, 가이드와의 일관성을 위해 점진적 개선 권장.

---

#### 6. ApiResponse 래퍼 미사용

**❌ 피해야 할 패턴**:
```java
@GetMapping
public ResponseEntity<SomeDto> getData() {  // ❌ ApiResponse 래퍼 없음
    SomeDto dto = getSomeUseCase.getData();
    return ResponseEntity.ok(dto);
}
```

**문제점**:
- 일관성 부족: 다른 API는 모두 `ApiResponse` 사용
- 에러 처리 불일치: Exception Handler와 일관성 없음

**✅ 올바른 패턴**:
```java
@GetMapping
public ResponseEntity<ApiResponse<SomeDto>> getData() {  // ✅ ApiResponse 래핑
    SomeDto dto = getSomeUseCase.getData();
    return ResponseEntity.ok(ApiResponse.success(dto, "조회 성공"));
}
```

---

## 향후 개선 사항

### 📝 점진적 개선 (우선순위: 중)

#### 1. Controller 에러 처리 일관성
- **현재 상태**: 일부 Controller에서 try-catch를 직접 사용
- **권장 방향**: 모든 Controller에서 예외를 전파하고 Exception Handler에서 처리
- **실행 계획**: 새 코드 작성 시 가이드 따르기, 기존 코드는 리팩토링 기회 있을 때 점진적 개선

#### 2. DTO 변환 위치 일관성
- **현재 상태**: 일부는 Controller에서 변환, 일부는 Service에서 변환
- **권장 방향**: 가이드에 명시된 패턴 따르기 (Controller에서 변환)
- **실행 계획**: 새 코드 작성 시 가이드 따르기, 기존 코드는 리팩토링 기회 있을 때 점진적 개선

#### 3. Mapper 패턴 일관성
- **현재 상태**: 일부 Repository는 Mapper 사용, 일부는 직접 변환
- **권장 방향**: 모든 Repository에서 Mapper 패턴 사용
- **실행 계획**: 새 Repository 작성 시 Mapper 사용, 기존 Repository는 점진적 개선

### 🔄 선택적 개선 (프로젝트 확장 시 고려)

#### 4. BaseRepository/BaseService 활용
- **현재 상태**: `BaseCrudService.java`, `BaseRepositoryPort.java` 존재하지만 미사용
- **권장 방향**: 현재 프로젝트 규모에서는 불필요, 프로젝트가 더 커지면 (50+ Service) 고려
- **이유**: YAGNI 원칙 (You Aren't Gonna Need It)


---

## 참고 자료

- [Main/Admin 분리 가이드](../ai/agent_guideline/backend/main-admin-separation-guide.md) - 상세한 분리 원칙 및 캐시 전략

---

**작성자**: AI Agent (Claude)  
**검토 필요**: 개발팀  
**버전**: 1.0

