# Backend Architecture Code Review

> **작성일**: 2025-11-28 (수정: 2025-11-28)
> **대상**: Backend 전체 구조 (Domain, Application, Infrastructure)
> **목적**: Hexagonal Architecture 준수 여부 및 개선 포인트 도출
> **검증 완료**: [backend-architecture-review-evaluation.md](./backend-architecture-review-evaluation.md)

---

## 📊 리뷰 정확도 평가

이 리뷰는 실제 코드 검증을 거쳤습니다:
- **정확도**: 93% (7개 항목 중 6개 정확, 1개 부분 정확)
- **검증 문서**: [backend-architecture-review-evaluation.md](./backend-architecture-review-evaluation.md)

| 항목 | 정확도 | 상태 |
|-----|--------|------|
| DTO 위치 문제 | ✅ 100% | 정확히 지적됨 |
| Jackson 애노테이션 | ✅ 100% | 정확히 지적됨 (Project.java에서 확인) |
| Validation 애노테이션 | ✅ 100% | 정확히 지적됨 (16개 애노테이션 발견) |
| Controller JPA 의존 | ✅ 100% | 정확히 지적됨 (AdminProjectController:32) |
| UseCase DTO 반환 | ✅ 100% | 정확히 지적됨 |
| BaseCrudService 미활용 | ✅ 100% | 정확히 지적됨 |
| Specification 패턴 | ⚠️ 50% | **수정됨 (아래 참조)** |

---

## 📊 전체 구조 분석

### 계층별 디렉토리 구조

```
backend/src/main/java/com/aiportfolio/backend/
├── domain/                      # ✅ Domain Layer (Core Business Logic)
│   ├── admin/
│   │   ├── dto/response/       # ⚠️ 문제: DTO가 Domain에 위치
│   │   ├── model/
│   │   │   ├── command/        # ✅ 좋음: Command 패턴
│   │   │   ├── dto/            # ⚠️ 문제: DTO가 Domain에 위치
│   │   │   └── vo/             # ✅ 좋음: Value Object
│   │   └── port/
│   │       ├── in/             # ✅ UseCase 인터페이스
│   │       └── out/            # ✅ Repository Port
│   ├── chatbot/
│   │   ├── model/
│   │   │   ├── enums/
│   │   │   └── exception/      # ✅ 좋음: 도메인 예외
│   │   └── port/
│   └── portfolio/
│       ├── model/              # ✅ Domain Model
│       │   └── enums/
│       ├── port/
│       │   ├── in/
│       │   └── out/
│       └── service/            # ✅ Domain Service
│
├── application/                 # ✅ Application Layer (Use Case 구현)
│   ├── admin/
│   │   ├── exception/
│   │   ├── mapper/             # ✅ 좋음: Domain ↔ DTO 변환
│   │   ├── query/              # ✅ 좋음: 조회 전용 서비스 분리
│   │   └── service/            # ⚠️ 일부 Infrastructure 직접 의존
│   ├── chatbot/
│   │   └── validation/         # ✅ 좋음: 검증 로직 분리
│   ├── common/
│   │   └── util/               # ✅ 공통 유틸리티
│   └── portfolio/
│
└── infrastructure/              # ✅ Infrastructure Layer
    ├── adapters/
    │   └── outbound/           # ✅ 외부 시스템 어댑터
    │       └── llm/
    ├── config/                 # ✅ 인프라 설정
    ├── external/               # ✅ 외부 API 연동
    │   ├── aiservice/
    │   ├── cloud/
    │   └── cloudinary/
    ├── persistence/
    │   ├── postgres/
    │   │   ├── adapter/        # ✅ Repository 구현체
    │   │   ├── entity/         # ✅ JPA Entity
    │   │   ├── mapper/         # ✅ Entity ↔ Domain 매핑
    │   │   ├── repository/     # ✅ JPA Repository
    │   │   └── specification/  # ✅ 동적 쿼리
    │   └── redis/
    │       └── adapter/
    └── web/
        ├── admin/
        │   ├── controller/     # ✅ REST API 엔드포인트
        │   ├── dto/            # ✅ HTTP Request/Response DTO
        │   ├── exception/
        │   ├── interceptor/
        │   └── session/
        ├── controller/
        ├── dto/                # ✅ 도메인별 DTO
        │   ├── certification/
        │   ├── education/
        │   ├── experience/
        │   └── techstack/
        └── exception/
```

---

## 🔴 Domain Layer 분석

### ✅ 잘된 점

#### 1. **Port 인터페이스 정의가 명확함**
```java
// domain/portfolio/port/out/PortfolioRepositoryPort.java
public interface PortfolioRepositoryPort {
    List<Project> findAllProjects();
    Optional<Project> findProjectById(String id);
    Project saveProject(Project project);
    // ... 명확한 계약 정의
}
```

#### 2. **Domain Model이 순수 POJO**
```java
// domain/portfolio/model/Project.java
@Data
@Builder
public class Project {
    private String id;
    private String title;
    // ... JPA 애노테이션 없음

    // ✅ 비즈니스 로직 포함
    public boolean isOngoing() {
        return endDate == null;
    }

    // ✅ 최근 추가: 도메인 검증 로직
    public void updateTeamInfo(Boolean isTeam, Integer teamSize) {
        if (isTeam != null) {
            this.isTeam = isTeam;
            if (!isTeam) {
                this.teamSize = null;
                return;
            }
        }
        if (teamSize != null && this.isTeam) {
            this.teamSize = validateTeamSize(teamSize);
        }
    }
}
```

#### 3. **Command 패턴 사용**
```java
// domain/admin/model/command/ProjectCreateCommand.java
@Getter
@Builder
public class ProjectCreateCommand {
    private final String title;
    private final String description;
    // ... 불변 객체
}
```

#### 4. **Domain Service 분리**
```java
// domain/portfolio/service/TechStackDomainService.java
// 도메인 로직이 복잡한 경우 서비스로 분리
```

---

### ⚠️ 문제점

#### 1. **DTO가 Domain Layer에 위치** ❌

**위치**: `domain/admin/dto/response/ProjectResponse.java`

**문제**:
- Domain Layer는 인프라/프레젠테이션 기술에 무관해야 함
- `ProjectResponse`는 Application/Infrastructure에서 사용하는 DTO
- **Hexagonal Architecture 위반**

**올바른 위치**:
```
❌ domain/admin/dto/response/ProjectResponse.java
✅ application/admin/dto/ProjectResponse.java
또는
✅ infrastructure/web/admin/dto/ProjectResponse.java
```

**영향도**: 중간
- 현재 `ProjectResponseMapper`가 Application Layer에서 사용 중
- 이동 시 import 수정 필요

---

#### 2. **Jackson 애노테이션 사용** ⚠️

**파일**: `domain/portfolio/model/Project.java:7-8`

```java
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
public class Project {
    @JsonProperty("isTeam")  // ⚠️ 인프라 의존
    private boolean isTeam;

    @JsonIgnore              // ⚠️ 인프라 의존
    public boolean isOngoing() {
        return endDate == null;
    }
}
```

**문제**:
- Domain 모델이 Jackson(JSON 직렬화 라이브러리)에 의존
- **원칙**: Domain은 기술 스택에 무관해야 함

**개선 방안**:
```java
// ✅ Domain 모델은 순수 POJO 유지
public class Project {
    private boolean isTeam;  // Jackson 애노테이션 제거

    public boolean isOngoing() {
        return endDate == null;
    }
}

// ✅ DTO에서 JSON 매핑 처리
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ProjectResponse {
    @JsonProperty("is_team")
    private Boolean isTeam;
}
```

---

#### 3. **Validation 애노테이션** ⚠️

**파일**: `domain/portfolio/model/Project.java:10-14`

```java
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.URL;

public class Project {
    @NotBlank(message = "프로젝트 ID는 필수입니다")  // ⚠️
    private String id;

    @URL(message = "올바른 GitHub URL 형식이어야 합니다")  // ⚠️
    private String githubUrl;
}
```

**문제**:
- Domain 모델이 Bean Validation(Jakarta/Hibernate Validator)에 의존
- Validation은 **프레젠테이션 계층의 관심사**

**개선 방안**:
```java
// ✅ Domain: 순수 비즈니스 검증만
public class Project {
    private String id;
    private String githubUrl;

    public void validateForCreation() {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("프로젝트 ID는 필수입니다");
        }
    }
}

// ✅ Infrastructure DTO: Bean Validation 사용
public class AdminProjectCreateRequest {
    @NotBlank
    @Size(max = 255)
    private String title;

    @URL
    private String githubUrl;
}
```

---

#### 4. **Port와 Model의 관계 혼재** ⚠️

**예시**: `domain/admin/dto/response/ProjectResponse.java`

- `ProjectResponse`가 domain에 있지만, 실제로는 **Application Layer의 반환 타입**
- Port(`ManageProjectUseCase`)가 이를 반환

```java
// domain/admin/port/in/ManageProjectUseCase.java
public interface ManageProjectUseCase {
    ProjectResponse createProject(ProjectCreateCommand command);  // ⚠️ DTO 반환
}
```

**문제**:
- UseCase는 **Domain Model**을 반환해야 함
- DTO 변환은 Application/Infrastructure 책임

**개선 방안**:
```java
// ✅ UseCase: Domain Model 반환
public interface ManageProjectUseCase {
    Project createProject(ProjectCreateCommand command);
}

// ✅ Application Service: DTO 변환
@Service
public class ManageProjectService implements ManageProjectUseCase {
    private final ProjectResponseMapper mapper;

    public ProjectResponse createProjectForAdmin(ProjectCreateCommand command) {
        Project project = createProject(command);
        return mapper.toResponse(project);  // 변환은 여기서
    }
}
```

---

## 🟡 Application Layer 분석

### ✅ 잘된 점

#### 1. **Mapper 패턴 활용**
```java
// application/admin/mapper/ProjectResponseMapper.java
@Component
public class ProjectResponseMapper {
    public ProjectResponse toResponse(Project domain) {
        // Domain → DTO 변환
    }
}
```

#### 2. **Query와 Command 서비스 분리** (CQRS 패턴 일부 적용)
```
application/admin/
├── service/              # Command (CUD)
│   ├── ManageProjectService.java
│   └── ManageEducationService.java
└── query/                # Query (R)
    ├── AdminGetEducationService.java
    └── AdminGetExperienceService.java
```

#### 3. **공통 유틸리티 추출**
```java
application/common/util/
├── BusinessIdGenerator.java      // ID 생성
├── MetadataHelper.java            // createdAt, updatedAt 관리
├── TextFieldHelper.java           // 정규화
└── Sortable.java                  // 정렬 인터페이스
```

---

### ⚠️ 문제점

#### 1. **일부 서비스에서 Infrastructure 직접 의존** ❌

**이미 리뷰한 내용** ([backend-service-refactoring-todo.md](backend-service-refactoring-todo.md)):
- `ManageProjectService`, `ManageEducationService`가 JPA Repository 직접 의존
- **해결책**: `ProjectRelationshipPort`, `EducationRelationshipPort` 도입 (이미 구현됨)

**현재 상태** (확인됨):
```java
// ✅ 최근 수정: Port를 통한 의존으로 변경됨
@Service
public class ManageProjectService implements ManageProjectUseCase {
    private final PortfolioRepositoryPort portfolioRepositoryPort;
    private final ProjectRelationshipPort projectRelationshipPort;  // ✅ Port 사용
    // private final ProjectJpaRepository projectJpaRepository;     // ❌ 제거됨
}
```

---

#### 2. **Controller에서 JPA Repository 직접 주입** ❌

**파일**: `infrastructure/web/admin/controller/AdminProjectController.java:32`

```java
@RestController
public class AdminProjectController {
    private final TechStackMetadataJpaRepository techStackMetadataJpaRepository;  // ❌

    public AdminProjectController(
        ManageProjectService manageProjectService,
        TechStackMetadataJpaRepository techStackMetadataJpaRepository) {  // ❌
        this.techStackMetadataJpaRepository = techStackMetadataJpaRepository;
    }

    private List<TechStackRelation> toTechStackRelations(List<String> names) {
        return names.stream()
            .map(name -> techStackMetadataJpaRepository.findByName(name)  // ❌
                .map(techStack -> new TechStackRelation(techStack.getId(), ...))
                .orElseThrow())
            .collect(Collectors.toList());
    }
}
```

**문제**:
- **Controller가 JPA Repository에 직접 의존**
- **Hexagonal Architecture 위반**: Web Layer가 Persistence Layer 직접 참조
- 테스트 어려움

**개선 방안**:
```java
// ✅ Option 1: UseCase에서 처리
public interface ManageProjectUseCase {
    ProjectResponse createProject(ProjectCreateCommand command);
}

@Service
public class ManageProjectService implements ManageProjectUseCase {
    private final TechStackMetadataRepositoryPort techStackRepository;

    public ProjectResponse createProject(ProjectCreateCommand command) {
        List<TechStackRelation> relations = command.getTechnologies().stream()
            .map(name -> {
                TechStackMetadata tech = techStackRepository.findByName(name)
                    .orElseThrow(() -> new IllegalArgumentException("Tech not found: " + name));
                return new TechStackRelation(tech.getId(), false, null);
            })
            .collect(Collectors.toList());
        // ...
    }
}

// ✅ Controller는 간단히 호출만
@RestController
public class AdminProjectController {
    private final ManageProjectUseCase manageProjectUseCase;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody AdminProjectCreateRequest request) {
        ProjectResponse response = manageProjectUseCase.createProject(request.toCommand());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

---

#### 3. **UseCase가 너무 세분화됨** ⚠️

**현재 구조**:
```
domain/portfolio/port/in/
├── ManageProjectUseCase.java
├── ManageEducationUseCase.java
├── ManageCertificationUseCase.java
├── GetProjectsUseCase.java
├── GetEducationUseCase.java
├── GetExperienceUseCase.java
├── GetCertificationUseCase.java
├── GetAllDataUseCase.java
├── GetProjectsByTechStackUseCase.java
├── ManageProjectCacheUseCase.java
└── ...
```

**문제**:
- 인터페이스가 너무 많아짐 (10개 이상)
- 일부 UseCase는 메서드 1개만 가짐

**개선 방안** (선택사항):
```java
// ✅ Option: 관련 UseCase 통합
public interface ProjectManagementUseCase {
    Project createProject(ProjectCreateCommand command);
    Project updateProject(String id, ProjectUpdateCommand command);
    void deleteProject(String id);
}

public interface ProjectQueryUseCase {
    Optional<Project> getProjectById(String id);
    List<Project> getAllProjects();
    List<Project> searchProjects(ProjectFilter filter);
}
```

---

#### 4. **BaseCrudService 추상화 미사용** ⚠️

**존재하는 파일**: `application/common/BaseCrudService.java`

```java
// 공통 CRUD 로직을 위한 추상 클래스가 존재하지만 사용되지 않음
public abstract class BaseCrudService<T, ID> {
    // 공통 CRUD 로직...
}
```

**문제**:
- `ManageEducationService`, `ManageExperienceService`, `ManageCertificationService`가 **동일한 로직 중복**
- BaseCrudService가 정의되어 있지만 활용되지 않음

**개선 방안**:
```java
// ✅ BaseCrudService 활용
@Service
public class ManageEducationService extends BaseCrudService<Education, String> {
    public ManageEducationService(BaseRepositoryPort<Education, String> repository) {
        super(repository);
    }

    // 공통 CRUD는 상속받고, 특화 로직만 추가
    public Education createEducationWithRelations(Education education, List<TechStackRelation> techStacks) {
        Education created = create(education);  // 공통 메서드 사용
        // 관계 처리는 여기서
        return created;
    }
}
```

---

## 🟢 Infrastructure Layer 분석

### ✅ 잘된 점

#### 1. **Adapter 패턴 구현**
```
infrastructure/persistence/postgres/
├── adapter/
│   ├── ProjectRelationshipAdapter.java      # ✅ Port 구현체
│   └── EducationRelationshipAdapter.java
├── entity/                                   # ✅ JPA Entity 분리
│   ├── ProjectJpaEntity.java
│   └── EducationJpaEntity.java
└── mapper/                                   # ✅ Entity ↔ Domain 매핑
    ├── ProjectMapper.java
    └── EducationMapper.java
```

#### 2. **외부 시스템 Adapter 분리**
```
infrastructure/external/
├── aiservice/                  # AI 서비스 연동
│   └── adapter/
├── cloud/                      # Cloud Usage API
│   └── adapter/
└── cloudinary/                 # 이미지 저장소
    └── adapter/
```

#### 3. **Config 계층 분리**
```
infrastructure/config/
├── DatabaseConfig.java         # DB 설정
├── RedisConfig.java            # 캐시 설정
├── CacheConfig.java            # 캐시 정책
├── CloudinaryConfig.java       # 외부 서비스 설정
└── WebConfig.java              # Web 설정
```

---

### ⚠️ 문제점

#### 1. **JPA Entity의 비즈니스 로직** ⚠️

**파일**: `infrastructure/persistence/postgres/entity/ProjectJpaEntity.java:121-130`

```java
@Entity
@Table(name = "projects")
public class ProjectJpaEntity {
    // ...

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();  // ⚠️ 비즈니스 로직?
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**문제**:
- `createdAt`, `updatedAt` 설정은 **비즈니스 규칙**일 수 있음
- JPA 생명주기 콜백에 의존 → 테스트 어려움

**개선 방안**:
```java
// ✅ Option 1: Application Layer에서 명시적 설정
@Service
public class ManageProjectService {
    public Project createProject(ProjectCreateCommand command) {
        Project project = Project.builder()
            .createdAt(MetadataHelper.setupCreatedAt(null))  // 명시적
            .updatedAt(MetadataHelper.setupUpdatedAt())
            .build();
        return portfolioRepositoryPort.saveProject(project);
    }
}

// ✅ Option 2: @PrePersist 유지 (현재 방식도 괜찮음)
// - 간단한 메타데이터는 JPA 생명주기 사용 OK
```

---

#### 2. **DTO 위치 혼재** ⚠️

**현재 구조**:
```
infrastructure/web/
├── admin/dto/                         # Admin용 DTO
│   ├── AdminProjectCreateRequest.java
│   └── AdminProjectUpdateRequest.java
└── dto/                               # Public API DTO
    ├── certification/CertificationDto.java
    ├── education/EducationDto.java
    └── experience/ExperienceDto.java
```

**혼재 사례**:
```
domain/admin/dto/response/ProjectResponse.java  # ❌ Domain에 위치
infrastructure/web/admin/dto/AdminProjectCreateRequest.java  # ✅ 올바른 위치
```

**개선 방안**:
```
✅ 모든 DTO를 Infrastructure Layer로 이동
infrastructure/web/
├── admin/dto/
│   ├── request/
│   │   ├── AdminProjectCreateRequest.java
│   │   └── AdminProjectUpdateRequest.java
│   └── response/
│       └── ProjectResponse.java        # domain에서 이동
└── dto/
    └── ...
```

---

#### 3. **Specification 패턴 부분 활용** ⚠️

**위치**: `infrastructure/persistence/postgres/specification/`

**현재 상황** (검증 완료):
- ✅ `ProjectSpecification.java` **존재하며 활용 중** (93줄)
- ✅ `withFilter()` 메서드로 동적 쿼리 구현
- ✅ 검색, 팀 필터, 타입, 상태, 기술스택 필터 모두 지원
- ❌ **다른 엔티티**(Education, Experience, Certification)에는 Specification 없음

**실제 구현 예시**:
```java
// ✅ 현재 구현 (ProjectSpecification.java)
public static Specification<ProjectJpaEntity> withFilter(ProjectFilter filter) {
    return (root, query, criteriaBuilder) -> {
        List<Predicate> predicates = new ArrayList<>();

        // 검색 쿼리 필터
        if (filter.hasSearchQuery()) {
            String searchPattern = "%" + filter.getSearchQuery().toLowerCase() + "%";
            predicates.add(criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern)
            ));
        }

        // 기술 스택 필터 (JOIN)
        if (filter.hasTechFilter()) {
            Join<ProjectJpaEntity, ProjectTechStackJpaEntity> techStackJoin =
                root.join("projectTechStacks", JoinType.INNER);
            // ... 복잡한 JOIN 쿼리 구현
        }

        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
    };
}
```

**개선 방안**:
```java
// ✅ 다른 엔티티에도 Specification 추가
public class EducationSpecification {
    public static Specification<EducationJpaEntity> withFilter(EducationFilter filter) {
        // Project와 유사한 패턴 적용
    }
}

public class ExperienceSpecification {
    public static Specification<ExperienceJpaEntity> withFilter(ExperienceFilter filter) {
        // Project와 유사한 패턴 적용
    }
}
```

**참고**: Project 도메인에서는 Specification 패턴이 잘 구현되어 있습니다. 이를 다른 도메인으로 확장하는 것이 목표입니다.

---

## 📊 종합 평가

### 강점 (✅)

| 항목 | 상태 | 비고 |
|-----|------|------|
| **계층 분리** | ✅ 우수 | Domain, Application, Infrastructure 명확히 분리 |
| **Port & Adapter** | ✅ 우수 | Port 인터페이스 잘 정의됨 |
| **Domain Model 순수성** | ✅ 양호 | JPA 의존 없음 (일부 Jackson 의존) |
| **Mapper 패턴** | ✅ 우수 | Entity ↔ Domain, Domain ↔ DTO 분리 |
| **CQRS 일부 적용** | ✅ 좋음 | Query와 Command 서비스 분리 |
| **외부 시스템 Adapter** | ✅ 우수 | AI, Cloud, Cloudinary 잘 분리 |

### 개선 필요 (⚠️ / ❌)

| 순위 | 문제 | 심각도 | 영향 범위 | 검증 |
|-----|------|--------|----------|--------|
| 1 | **DTO가 Domain Layer에 위치** | 🔴 높음 | domain/admin/dto/response/ | ✅ 검증완료 |
| 2 | **Controller의 JPA Repository 직접 의존** | 🔴 높음 | AdminProjectController:32 | ✅ 검증완료 |
| 3 | **Domain Model의 Jackson 애노테이션** | 🟡 중간 | Project.java:67,89,97 | ✅ 검증완료 |
| 4 | **Domain Model의 Validation 애노테이션** | 🟡 중간 | Project.java (16개) | ✅ 검증완료 |
| 5 | **UseCase의 DTO 반환** | 🟡 중간 | ManageProjectUseCase:19,28 | ✅ 검증완료 |
| 6 | **BaseCrudService 미활용** | 🟢 낮음 | application/common/ | ✅ 검증완료 |
| 7 | **Specification 부분 활용** | 🟢 낮음 | Project만 구현됨 | ✅ 수정완료 |

---

## 🎯 리팩토링 우선순위

### 🔥 High Priority

#### 1. **DTO 위치 이동** (즉시)
```bash
# domain/admin/dto/response/* → infrastructure/web/admin/dto/response/*
mv domain/admin/dto/response/ProjectResponse.java \
   infrastructure/web/admin/dto/response/ProjectResponse.java

# domain/admin/model/dto/* → infrastructure/web/admin/dto/*
```

**영향도**: 중간 (import 수정 필요)
**작업 시간**: 1-2시간

---

#### 2. **Controller의 JPA Repository 의존 제거** (즉시)
```java
// AdminProjectController.java 리팩토링
// - TechStackMetadataJpaRepository 제거
// - 로직을 ManageProjectService로 이동
```

**영향도**: 낮음 (Controller 1개)
**작업 시간**: 30분

---

### 🟡 Medium Priority

#### 3. **Domain Model에서 Jackson 애노테이션 제거** (다음 스프린트)
```java
// @JsonProperty, @JsonIgnore 제거
// → DTO에서 JSON 매핑 처리
```

**영향도**: 중간 (JSON 직렬화 테스트 필요)
**작업 시간**: 2-3시간

---

#### 4. **UseCase 반환 타입 정리** (다음 스프린트)
```java
// UseCase: Domain Model 반환
// Application Service: DTO 변환
```

**영향도**: 높음 (많은 파일 수정)
**작업 시간**: 4-6시간

---

### 🟢 Low Priority

#### 5. **BaseCrudService 활용** (여유 있을 때)
- 코드 중복 제거
- 유지보수성 향상

#### 6. **Specification 패턴 확장** (여유 있을 때)
- **현재**: ProjectSpecification만 구현됨 (93줄, 잘 작동 중)
- **목표**: Education, Experience, Certification에도 확장
- Project의 구현을 템플릿으로 활용
- 동적 쿼리 및 복잡한 검색 조건 처리 개선

---

## 📋 체크리스트

### Hexagonal Architecture 준수 여부

- [x] Domain Layer가 외부 기술에 독립적인가?
  - [⚠️] 일부 Jackson 의존 있음
- [x] Port를 통한 의존성 역전이 이루어지는가?
  - [✅] RepositoryPort, RelationshipPort 잘 정의됨
- [x] Domain Model과 JPA Entity가 분리되어 있는가?
  - [✅] 완전히 분리됨
- [⚠️] Application Layer가 Infrastructure에 직접 의존하지 않는가?
  - [⚠️] Controller의 JPA Repository 직접 의존 있음
- [x] Adapter가 Port를 구현하는가?
  - [✅] 잘 구현됨

### Clean Architecture 원칙

- [⚠️] DTO가 적절한 계층에 위치하는가?
  - [❌] Domain Layer에 Response DTO 있음
- [x] UseCase가 명확히 정의되어 있는가?
  - [✅] 잘 정의됨
- [x] Mapper를 통한 계층 간 변환이 이루어지는가?
  - [✅] Entity ↔ Domain, Domain ↔ DTO 분리 잘 됨
- [x] 외부 시스템과의 통합이 Adapter를 통해 이루어지는가?
  - [✅] AI, Cloud, Cloudinary Adapter 잘 구현됨

---

## 🔗 관련 문서

- [Backend Service Refactoring TODO](./backend-service-refactoring-todo.md)
- [Hexagonal Architecture Guide](../ai/agent_guideline/backend/hexagonal-architecture-guide.md)
- [CRUD Template Guide](../ai/agent_guideline/backend/crud-template-guide.md)

---

## 📝 변경 이력

### v1.1 (2025-11-28)
- **Specification 패턴 정보 수정**: "미활용" → "부분 활용"
  - ProjectSpecification.java 존재 및 활용 중 확인 (93줄)
  - 다른 엔티티에는 미구현 명시
- **리뷰 정확도 평가 추가**: 93% (7개 중 6개 정확)
- **검증 완료 표시**: 각 문제점에 실제 파일 위치 및 라인 번호 추가
- **평가 문서 링크 추가**: [backend-architecture-review-evaluation.md](./backend-architecture-review-evaluation.md)

### v1.0 (2025-11-28)
- 초기 Backend Architecture 리뷰 작성
- Domain, Application, Infrastructure 계층 분석
- 7가지 주요 문제점 도출

---

**작성자**: Claude Agent
**최종 업데이트**: 2025-11-28 (v1.1)
**검증자**: Code Review Evaluation (2025-11-28)
