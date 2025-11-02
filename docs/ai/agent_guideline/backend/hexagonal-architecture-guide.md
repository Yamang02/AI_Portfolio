# Backend 개발 가이드라인 - Hexagonal Architecture

## 📚 목차
1. [아키텍처 개요](#아키텍처-개요)
2. [계층별 역할 및 책임](#계층별-역할-및-책임)
3. [디렉토리 구조 규칙](#디렉토리-구조-규칙)
4. [패턴 (Best Practices)](#패턴-best-practices)
5. [안티패턴 (Anti-Patterns)](#안티패턴-anti-patterns)
6. [코드 예시](#코드-예시)
7. [체크리스트](#체크리스트)

---

## 아키텍처 개요

이 프로젝트는 **Hexagonal Architecture (Ports and Adapters)** 패턴을 따릅니다.

### 핵심 원칙
1. **의존성 역전 원칙 (DIP)**: 모든 의존성은 안쪽(도메인)을 향합니다
2. **비즈니스 로직 격리**: 도메인 계층은 외부 기술에 독립적입니다
3. **포트를 통한 통신**: 계층 간 통신은 인터페이스(포트)를 통해서만 이루어집니다

### 의존성 방향
```
Infrastructure (Adapters)
    ↓ (의존)
Application (Use Cases)
    ↓ (의존)
Domain (Ports + Models)
```

### 참고 예시
- ✅ **좋은 예시**: `domain.portfolio` 패키지 (잘 설계된 기존 구조)
- ❌ **나쁜 예시**: 현재 `application.admin` 일부 (직접 JPA 의존)

---

## 계층별 역할 및 책임

### 1️⃣ Domain Layer (`domain/`)

**역할**: 비즈니스 로직과 규칙을 정의합니다.

#### 포함 요소
- **Model**: 도메인 엔티티, 값 객체 (Value Object)
- **Port (In)**: Use Case 인터페이스 - "무엇을 할 수 있는가"
- **Port (Out)**: Repository 인터페이스 - "무엇이 필요한가"
- **DTO**: 도메인 계층의 데이터 전송 객체

#### 의존성 규칙
- ✅ **의존 가능**: JDK 표준 라이브러리, Lombok
- ❌ **의존 금지**: Spring Framework, JPA, Redis, Cloudinary 등 모든 인프라 기술

#### 디렉토리 구조
```
domain/{도메인명}/
├── model/              // 도메인 모델
│   ├── {Entity}.java
│   └── vo/             // 값 객체
│       ├── {ValueObject}.java
│       └── ...
├── dto/                // 도메인 DTO
│   ├── request/
│   │   └── ...
│   └── response/
│       └── ...
└── port/
    ├── in/             // Use Case 인터페이스 (관심사별 디렉토리)
    │   ├── {기능}/
    │   │   ├── {Action}UseCase.java
    │   │   └── ...
    │   └── ...
    └── out/            // Repository 포트
        ├── {Entity}RepositoryPort.java
        └── ...
```

---

### 2️⃣ Application Layer (`application/`)

**역할**: Use Case를 구현하고 비즈니스 플로우를 조율합니다.

#### 포함 요소
- Use Case 구현체 (Service)
- 트랜잭션 관리
- 도메인 객체 조합 및 조율

#### 의존성 규칙
- ✅ **의존 가능**: Domain Layer, Spring Framework (DI, @Transactional)
- ❌ **의존 금지**: Infrastructure 구체 클래스 (어댑터)
  - ❌ JPA Repository 직접 사용
  - ❌ Cloudinary SDK 직접 사용
  - ❌ RedisTemplate 직접 사용

#### 디렉토리 구조
```
application/{도메인명}/
├── {기능1}/
│   ├── {Action1}Service.java    // {Action1}UseCase 구현
│   └── {Action2}Service.java    // {Action2}UseCase 구현
├── {기능2}/
│   └── ...
└── ...
```

---

### 3️⃣ Infrastructure Layer (`infrastructure/`)

**역할**: 외부 시스템과의 연동 및 기술적 구현을 담당합니다.

#### 포함 요소
- **Persistence**: DB 연동 (JPA, Redis 등)
- **External**: 외부 API 연동 (Cloudinary, GitHub API 등)
- **Web**: REST API 컨트롤러

#### 의존성 규칙
- ✅ **의존 가능**: Domain Layer, Application Layer, 모든 인프라 기술
- ❌ **의존 금지**: 다른 Infrastructure 어댑터 간 직접 의존

#### 디렉토리 구조
```
infrastructure/
├── persistence/                    // 영속성 어댑터
│   ├── postgres/
│   │   ├── adapter/                // Port 구현체
│   │   │   ├── {Entity}RepositoryAdapter.java
│   │   │   └── ...
│   │   ├── entity/                 // JPA 엔티티
│   │   │   └── {Entity}JpaEntity.java
│   │   ├── repository/             // Spring Data JPA Repository
│   │   │   └── {Entity}JpaRepository.java
│   │   └── mapper/                 // 도메인 ↔ JPA 매퍼
│   │       └── {Entity}Mapper.java
│   └── redis/
│       └── adapter/
│           └── ...
├── external/                       // 외부 서비스 어댑터
│   ├── cloudinary/
│   │   └── CloudinaryImageStorageAdapter.java
│   └── github/
│       └── ...
└── web/                            // 웹 어댑터 (컨트롤러)
    ├── controller/
    │   └── {도메인명}/
    │       └── {Feature}Controller.java
    ├── dto/                        // Web 계층 전용 DTO (선택)
    └── util/
        └── ...
```

---

## 디렉토리 구조 규칙

### 규칙 1: 도메인별 패키지 분리
각 도메인은 독립적인 패키지로 분리합니다.

```
✅ Good
domain/
├── admin/
├── portfolio/
└── chatbot/

❌ Bad
domain/
└── model/
    ├── AdminUser.java
    └── Portfolio.java
```

### 규칙 2: 관심사별 하위 디렉토리
Use Case는 관심사(기능)별로 디렉토리를 나눕니다.

```
✅ Good
application/admin/
├── auth/
│   ├── LoginService.java
│   └── LogoutService.java
├── project/
│   ├── ProjectManagementService.java
│   └── ProjectSearchService.java
└── media/
    └── ImageUploadService.java

❌ Bad
application/admin/
├── AdminAuthService.java
├── AdminProjectService.java
└── AdminMediaService.java
```

### 규칙 3: DTO 위치
- **도메인 DTO**: `domain/{도메인}/dto/`
- **Web 전용 DTO**: `infrastructure/web/dto/` (필요시만)

```
✅ Good
domain/admin/dto/
├── request/
│   ├── ProjectCreateRequest.java
│   └── ProjectUpdateRequest.java
└── response/
    └── ProjectResponse.java

❌ Bad
infrastructure/web/dto/admin/
├── ProjectCreateRequest.java   // 도메인 DTO가 인프라에 위치
└── ProjectUpdateRequest.java
```

### 규칙 4: 포트 인터페이스 명명 규칙

#### In Port (Use Case)
```java
// 패턴: {Action}UseCase
// 위치: domain/{도메인}/port/in/{기능}/

✅ Good
ManageProjectUseCase.java
SearchProjectsUseCase.java
UploadImageUseCase.java

❌ Bad
ProjectService.java          // 구현체 느낌
IProjectManager.java         // I 접두사 지양
ProjectUseCaseInterface.java // 불필요한 접미사
```

#### Out Port (Repository)
```java
// 패턴: {기술명}{Entity}Port 또는 {Entity}RepositoryPort
// 위치: domain/{도메인}/port/out/

✅ Good
ProjectManagementPort.java
ImageStoragePort.java
CacheManagementPort.java
AdminUserRepositoryPort.java

❌ Bad
ProjectRepository.java           // JPA Repository와 혼동
ProjectDao.java                  // DAO 패턴 아님
IProjectRepository.java          // I 접두사 지양
```

---

## 패턴 (Best Practices)

### Pattern 1: 값 객체 활용

필터, 정렬 조건 등 도메인 개념을 값 객체로 표현합니다.

```java
// ✅ Good: 값 객체로 도메인 개념 표현
// domain/admin/model/vo/ProjectFilter.java
@Value
public class ProjectFilter {
    String searchQuery;
    Boolean isTeam;
    ProjectType projectType;
    String status;
    List<String> selectedTechs;
    SortCriteria sortCriteria;

    public boolean matches(Project project) {
        if (hasSearchFilter() && !matchesSearch(project)) {
            return false;
        }
        if (hasTeamFilter() && !matchesTeam(project)) {
            return false;
        }
        return true;
    }

    private boolean hasSearchFilter() {
        return searchQuery != null && !searchQuery.isEmpty();
    }

    private boolean matchesSearch(Project project) {
        return project.getTitle().contains(searchQuery) ||
               project.getDescription().contains(searchQuery);
    }
}

// ❌ Bad: 원시 타입 파라미터 나열
public List<Project> findProjects(
    String search,
    Boolean isTeam,
    String type,
    String status,
    List<String> techs,
    String sortBy,
    String sortOrder
) { ... }
```

### Pattern 2: 포트를 통한 의존성 역전

```java
// ✅ Good: 포트 인터페이스 정의 및 사용
// domain/admin/port/out/ProjectManagementPort.java
public interface ProjectManagementPort {
    Project save(Project project);
    Optional<Project> findById(String id);
    List<Project> findByFilter(ProjectFilter filter);
    void delete(String id);
}

// application/admin/project/ProjectManagementService.java
@Service
@RequiredArgsConstructor
public class ProjectManagementService implements ManageProjectUseCase {

    private final ProjectManagementPort projectManagementPort;  // 포트 의존

    @Override
    public ProjectResponse createProject(ProjectCreateRequest request) {
        Project project = Project.from(request);
        Project saved = projectManagementPort.save(project);
        return ProjectResponse.from(saved);
    }
}

// infrastructure/persistence/postgres/adapter/PostgresProjectManagementAdapter.java
@Component
@RequiredArgsConstructor
public class PostgresProjectManagementAdapter implements ProjectManagementPort {

    private final ProjectJpaRepository jpaRepository;
    private final ProjectMapper mapper;

    @Override
    public Project save(Project project) {
        ProjectJpaEntity entity = mapper.toEntity(project);
        ProjectJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}
```

```java
// ❌ Bad: 직접 JPA Repository 의존
// application/admin/AdminProjectService.java
@Service
@RequiredArgsConstructor
public class AdminProjectService {

    private final ProjectJpaRepository jpaRepository;  // 직접 의존 ❌
    private final ProjectMapper mapper;

    public ProjectResponse createProject(ProjectCreateRequest request) {
        ProjectJpaEntity entity = mapper.toEntity(request);
        ProjectJpaEntity saved = jpaRepository.save(entity);
        return mapper.toResponse(saved);
    }
}
```

### Pattern 3: Use Case 단일 책임 분리

각 Use Case는 하나의 관심사만 담당합니다.

```java
// ✅ Good: 관심사별 Use Case 분리
// domain/admin/port/in/project/ManageProjectUseCase.java
public interface ManageProjectUseCase {
    ProjectResponse createProject(ProjectCreateRequest request);
    ProjectResponse updateProject(String id, ProjectUpdateRequest request);
    void deleteProject(String id);
}

// domain/admin/port/in/project/SearchProjectsUseCase.java
public interface SearchProjectsUseCase {
    List<ProjectResponse> searchProjects(ProjectFilter filter);
    ProjectResponse getProjectById(String id);
}

// domain/admin/port/in/project/UpdateProjectSortOrderUseCase.java
public interface UpdateProjectSortOrderUseCase {
    void updateSortOrder(List<ProjectSortOrderUpdate> updates);
}
```

```java
// ❌ Bad: 모든 기능을 하나의 Use Case에 통합
public interface ProjectUseCase {
    ProjectResponse createProject(...);
    ProjectResponse updateProject(...);
    void deleteProject(...);
    List<ProjectResponse> searchProjects(...);
    ProjectResponse getProjectById(...);
    void updateSortOrder(...);
    void updateTechnologies(...);
    void uploadImage(...);
    // ... 계속 추가됨
}
```

### Pattern 4: 도메인 객체에서 비즈니스 로직 처리

```java
// ✅ Good: 도메인 모델에 비즈니스 로직 포함
// domain/admin/model/Project.java
public class Project {
    private String id;
    private String title;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;

    public void complete() {
        if (this.endDate == null) {
            throw new IllegalStateException("완료일이 설정되지 않은 프로젝트는 완료할 수 없습니다.");
        }
        this.status = "completed";
    }

    public boolean isInProgress() {
        return "in_progress".equals(this.status);
    }

    public void update(ProjectUpdateRequest request) {
        if (request.getTitle() != null) {
            this.title = request.getTitle();
        }
        if (request.getStatus() != null) {
            validateStatusTransition(this.status, request.getStatus());
            this.status = request.getStatus();
        }
    }

    private void validateStatusTransition(String from, String to) {
        // 상태 전이 규칙 검증
    }
}

// application/admin/project/ProjectManagementService.java
@Service
public class ProjectManagementService implements ManageProjectUseCase {

    @Override
    public ProjectResponse completeProject(String id) {
        Project project = projectManagementPort.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));

        project.complete();  // 도메인 객체의 메서드 호출

        Project updated = projectManagementPort.save(project);
        return ProjectResponse.from(updated);
    }
}
```

```java
// ❌ Bad: 서비스에서 비즈니스 로직 처리
@Service
public class ProjectService {

    public ProjectResponse completeProject(String id) {
        Project project = projectManagementPort.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));

        // 비즈니스 로직이 서비스에 존재 ❌
        if (project.getEndDate() == null) {
            throw new IllegalStateException("완료일이 설정되지 않은 프로젝트는 완료할 수 없습니다.");
        }
        project.setStatus("completed");

        Project updated = projectManagementPort.save(project);
        return ProjectResponse.from(updated);
    }
}
```

### Pattern 5: 인프라 서비스는 어댑터로 분리

```java
// ✅ Good: 외부 서비스를 포트로 추상화
// domain/admin/port/out/ImageStoragePort.java
public interface ImageStoragePort {
    String uploadImage(byte[] imageData, String folder, ImageMetadata metadata);
    List<String> uploadImages(List<byte[]> imagesData, String folder, ImageMetadata metadata);
    void deleteImage(String publicId);
}

// infrastructure/external/cloudinary/CloudinaryImageStorageAdapter.java
@Component
@RequiredArgsConstructor
public class CloudinaryImageStorageAdapter implements ImageStoragePort {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(byte[] imageData, String folder, ImageMetadata metadata) {
        Map<String, Object> params = buildUploadParams(folder, metadata);
        Map<?, ?> result = cloudinary.uploader().upload(imageData, params);
        return (String) result.get("secure_url");
    }
}

// application/admin/media/ImageUploadService.java
@Service
@RequiredArgsConstructor
public class ImageUploadService implements UploadImageUseCase {

    private final ImageStoragePort imageStoragePort;  // 포트 의존

    @Override
    public ImageUploadResponse uploadImage(MultipartFile file, String folder) {
        byte[] imageData = file.getBytes();
        ImageMetadata metadata = ImageMetadata.from(file);

        String url = imageStoragePort.uploadImage(imageData, folder, metadata);

        return new ImageUploadResponse(url);
    }
}
```

```java
// ❌ Bad: Application에서 직접 Cloudinary 사용
// application/admin/CloudinaryService.java
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;  // 직접 의존 ❌

    public String uploadImage(MultipartFile file, String folder) {
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), params);
        return (String) result.get("secure_url");
    }
}
```

### Pattern 6: 매퍼를 통한 계층 간 변환

```java
// ✅ Good: 매퍼 클래스로 변환 로직 분리
// infrastructure/persistence/postgres/mapper/ProjectMapper.java
@Component
public class ProjectMapper {

    public ProjectJpaEntity toEntity(Project domain) {
        return ProjectJpaEntity.builder()
            .id(domain.getId())
            .title(domain.getTitle())
            .description(domain.getDescription())
            .status(domain.getStatus())
            .build();
    }

    public Project toDomain(ProjectJpaEntity entity) {
        return Project.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .status(entity.getStatus())
            .build();
    }

    public List<Project> toDomainList(List<ProjectJpaEntity> entities) {
        return entities.stream()
            .map(this::toDomain)
            .collect(Collectors.toList());
    }
}
```

```java
// ❌ Bad: 엔티티와 도메인 모델이 동일
public class Project {
    @Id
    private String id;

    @Column
    private String title;

    // JPA 어노테이션이 도메인 모델에 침투 ❌
}
```

---

## 안티패턴 (Anti-Patterns)

### Anti-Pattern 1: 계층 우회 (Layer Skipping)

```java
// ❌ Bad: 컨트롤러에서 직접 Repository 접근
@RestController
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectJpaRepository projectRepository;  // 계층 우회 ❌

    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable String id) {
        ProjectJpaEntity entity = projectRepository.findById(id)
            .orElseThrow();
        return ResponseEntity.ok(ProjectResponse.from(entity));
    }
}

// ✅ Good: Use Case를 통한 접근
@RestController
@RequiredArgsConstructor
public class ProjectController {

    private final SearchProjectsUseCase searchProjectsUseCase;  // Use Case 의존

    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable String id) {
        ProjectResponse response = searchProjectsUseCase.getProjectById(id);
        return ResponseEntity.ok(response);
    }
}
```

### Anti-Pattern 2: 도메인 로직이 컨트롤러에 존재

```java
// ❌ Bad: 컨트롤러에서 비즈니스 로직 처리
@RestController
public class ProjectController {

    @PostMapping("/projects/{id}/complete")
    public ResponseEntity<ProjectResponse> completeProject(@PathVariable String id) {
        Project project = projectService.getById(id);

        // 비즈니스 로직이 컨트롤러에 존재 ❌
        if (project.getEndDate() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!project.getStatus().equals("in_progress")) {
            return ResponseEntity.badRequest().build();
        }

        project.setStatus("completed");
        projectService.update(project);

        return ResponseEntity.ok(ProjectResponse.from(project));
    }
}

// ✅ Good: Use Case에 위임
@RestController
@RequiredArgsConstructor
public class ProjectController {

    private final ManageProjectUseCase manageProjectUseCase;

    @PostMapping("/projects/{id}/complete")
    public ResponseEntity<ProjectResponse> completeProject(@PathVariable String id) {
        ProjectResponse response = manageProjectUseCase.completeProject(id);
        return ResponseEntity.ok(response);
    }
}
```

### Anti-Pattern 3: God Service (신 객체)

```java
// ❌ Bad: 모든 기능을 하나의 서비스에 집중
@Service
public class AdminService {

    // 인증
    public AdminUserInfo login(String username, String password) { ... }
    public void logout() { ... }

    // 프로젝트 관리
    public ProjectResponse createProject(ProjectCreateRequest request) { ... }
    public ProjectResponse updateProject(String id, ProjectUpdateRequest request) { ... }
    public void deleteProject(String id) { ... }
    public List<ProjectResponse> searchProjects(ProjectFilter filter) { ... }

    // 이미지 업로드
    public String uploadImage(MultipartFile file) { ... }

    // 캐시 관리
    public void flushCache() { ... }

    // ... 계속 추가됨
}

// ✅ Good: 관심사별로 서비스 분리
application/admin/
├── auth/
│   ├── LoginService.java
│   └── LogoutService.java
├── project/
│   ├── ProjectManagementService.java
│   └── ProjectSearchService.java
├── media/
│   └── ImageUploadService.java
└── cache/
    └── CacheManagementService.java
```

### Anti-Pattern 4: DTO 남용 및 과도한 변환

```java
// ❌ Bad: 불필요한 DTO 변환 체인
// Web DTO → Domain DTO → Entity → Domain Model → Domain DTO → Web DTO

@RestController
public class ProjectController {

    @PostMapping("/projects")
    public ResponseEntity<ProjectWebResponse> createProject(
            @RequestBody ProjectWebRequest webRequest) {

        // 1. Web DTO → Domain DTO
        ProjectCreateRequest domainRequest = webRequest.toDomainRequest();

        // 2. Service 호출
        ProjectDomainResponse domainResponse = service.createProject(domainRequest);

        // 3. Domain DTO → Web DTO
        ProjectWebResponse webResponse = ProjectWebResponse.from(domainResponse);

        return ResponseEntity.ok(webResponse);
    }
}

// ✅ Good: 필요한 경우에만 Web DTO 사용
@RestController
public class ProjectController {

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectCreateRequest request) {  // 도메인 DTO 직접 사용

        ProjectResponse response = manageProjectUseCase.createProject(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

### Anti-Pattern 5: 인프라 기술이 도메인에 침투

```java
// ❌ Bad: 도메인 모델에 JPA 어노테이션
// domain/admin/model/AdminUser.java
@Entity
@Table(name = "admin_users")
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @OneToMany(mappedBy = "admin")
    private List<Project> projects;
}

// ✅ Good: 도메인 모델과 JPA 엔티티 분리
// domain/admin/model/AdminUser.java
public class AdminUser {
    private Long id;
    private String username;
    private List<Project> projects;
}

// infrastructure/persistence/postgres/entity/AdminUserJpaEntity.java
@Entity
@Table(name = "admin_users")
public class AdminUserJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @OneToMany(mappedBy = "admin")
    private List<ProjectJpaEntity> projects;
}
```

### Anti-Pattern 6: 순환 의존성

```java
// ❌ Bad: 서비스 간 순환 의존
@Service
public class ProjectService {

    @Autowired
    private TechStackService techStackService;  // ProjectService → TechStackService

    public void updateProject(String id, ProjectUpdateRequest request) {
        techStackService.updateTechStack(id, request.getTechnologies());
    }
}

@Service
public class TechStackService {

    @Autowired
    private ProjectService projectService;  // TechStackService → ProjectService ❌ 순환!

    public void updateTechStack(String projectId, List<String> techs) {
        Project project = projectService.getById(projectId);
        // ...
    }
}

// ✅ Good: 포트를 통한 의존성 분리
@Service
@RequiredArgsConstructor
public class ProjectManagementService implements ManageProjectUseCase {

    private final ProjectManagementPort projectManagementPort;  // 포트 의존
    private final TechStackManagementPort techStackManagementPort;  // 포트 의존

    @Override
    public void updateProject(String id, ProjectUpdateRequest request) {
        Project project = projectManagementPort.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));

        project.update(request);

        if (request.getTechnologies() != null) {
            techStackManagementPort.updateTechStack(id, request.getTechnologies());
        }

        projectManagementPort.save(project);
    }
}
```

### Anti-Pattern 7: 트랜잭션 경계 오류

```java
// ❌ Bad: 컨트롤러에서 트랜잭션 관리
@RestController
public class ProjectController {

    @PostMapping("/projects")
    @Transactional  // 컨트롤러에서 트랜잭션 ❌
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectCreateRequest request) {
        // ...
    }
}

// ✅ Good: 서비스(Use Case 구현)에서 트랜잭션 관리
@Service
@RequiredArgsConstructor
@Transactional
public class ProjectManagementService implements ManageProjectUseCase {

    @Override
    public ProjectResponse createProject(ProjectCreateRequest request) {
        // 트랜잭션 경계
    }
}
```

---

## 코드 예시

### 완전한 예시: 프로젝트 생성 기능

#### 1. Domain Layer

```java
// domain/admin/model/Project.java
@Getter
@Builder
public class Project {
    private String id;
    private String title;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;

    public static Project from(ProjectCreateRequest request) {
        return Project.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .status("draft")
            .startDate(request.getStartDate())
            .build();
    }

    public void update(ProjectUpdateRequest request) {
        if (request.getTitle() != null) {
            this.title = request.getTitle();
        }
        if (request.getDescription() != null) {
            this.description = request.getDescription();
        }
    }
}

// domain/admin/dto/request/ProjectCreateRequest.java
@Getter
@Builder
public class ProjectCreateRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;
}

// domain/admin/dto/response/ProjectResponse.java
@Getter
@Builder
public class ProjectResponse {
    private String id;
    private String title;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectResponse from(Project project) {
        return ProjectResponse.builder()
            .id(project.getId())
            .title(project.getTitle())
            .description(project.getDescription())
            .status(project.getStatus())
            .startDate(project.getStartDate())
            .endDate(project.getEndDate())
            .build();
    }
}

// domain/admin/port/in/project/ManageProjectUseCase.java
public interface ManageProjectUseCase {
    ProjectResponse createProject(ProjectCreateRequest request);
    ProjectResponse updateProject(String id, ProjectUpdateRequest request);
    void deleteProject(String id);
}

// domain/admin/port/out/ProjectManagementPort.java
public interface ProjectManagementPort {
    Project save(Project project);
    Optional<Project> findById(String id);
    void delete(String id);
}
```

#### 2. Application Layer

```java
// application/admin/project/ProjectManagementService.java
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProjectManagementService implements ManageProjectUseCase {

    private final ProjectManagementPort projectManagementPort;

    @Override
    public ProjectResponse createProject(ProjectCreateRequest request) {
        log.info("Creating new project: {}", request.getTitle());

        Project project = Project.from(request);
        Project saved = projectManagementPort.save(project);

        log.info("Project created successfully: {}", saved.getId());
        return ProjectResponse.from(saved);
    }

    @Override
    public ProjectResponse updateProject(String id, ProjectUpdateRequest request) {
        log.info("Updating project: {}", id);

        Project project = projectManagementPort.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));

        project.update(request);
        Project updated = projectManagementPort.save(project);

        log.info("Project updated successfully: {}", updated.getId());
        return ProjectResponse.from(updated);
    }

    @Override
    public void deleteProject(String id) {
        log.info("Deleting project: {}", id);

        if (!projectManagementPort.findById(id).isPresent()) {
            throw new ProjectNotFoundException(id);
        }

        projectManagementPort.delete(id);

        log.info("Project deleted successfully: {}", id);
    }
}
```

#### 3. Infrastructure Layer

```java
// infrastructure/persistence/postgres/entity/ProjectJpaEntity.java
@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at", updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;
}

// infrastructure/persistence/postgres/repository/ProjectJpaRepository.java
@Repository
public interface ProjectJpaRepository extends JpaRepository<ProjectJpaEntity, String> {

    List<ProjectJpaEntity> findAllByOrderBySortOrderAscStartDateDesc();
}

// infrastructure/persistence/postgres/mapper/ProjectMapper.java
@Component
public class ProjectMapper {

    public ProjectJpaEntity toEntity(Project domain) {
        return ProjectJpaEntity.builder()
            .id(domain.getId())
            .title(domain.getTitle())
            .description(domain.getDescription())
            .status(domain.getStatus())
            .startDate(domain.getStartDate())
            .endDate(domain.getEndDate())
            .build();
    }

    public Project toDomain(ProjectJpaEntity entity) {
        return Project.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .description(entity.getDescription())
            .status(entity.getStatus())
            .startDate(entity.getStartDate())
            .endDate(entity.getEndDate())
            .build();
    }
}

// infrastructure/persistence/postgres/adapter/PostgresProjectManagementAdapter.java
@Component
@RequiredArgsConstructor
public class PostgresProjectManagementAdapter implements ProjectManagementPort {

    private final ProjectJpaRepository jpaRepository;
    private final ProjectMapper mapper;

    @Override
    public Project save(Project project) {
        ProjectJpaEntity entity = mapper.toEntity(project);
        ProjectJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Project> findById(String id) {
        return jpaRepository.findById(id)
            .map(mapper::toDomain);
    }

    @Override
    public void delete(String id) {
        jpaRepository.deleteById(id);
    }
}

// infrastructure/web/controller/admin/AdminProjectController.java
@RestController
@RequestMapping("/api/admin/projects")
@RequiredArgsConstructor
@Slf4j
public class AdminProjectController {

    private final ManageProjectUseCase manageProjectUseCase;
    private final AdminAuthChecker adminAuthChecker;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectCreateRequest request,
            HttpServletRequest httpRequest) {

        adminAuthChecker.requireAuthentication(httpRequest);

        log.info("Creating new project: {}", request.getTitle());

        ProjectResponse project = manageProjectUseCase.createProject(request);
        return ResponseEntity.ok(ApiResponse.success(project, "프로젝트 생성 성공"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable String id,
            @Valid @RequestBody ProjectUpdateRequest request,
            HttpServletRequest httpRequest) {

        adminAuthChecker.requireAuthentication(httpRequest);

        log.info("Updating project: {}", id);

        ProjectResponse project = manageProjectUseCase.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.success(project, "프로젝트 수정 성공"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable String id,
            HttpServletRequest request) {

        adminAuthChecker.requireAuthentication(request);

        log.info("Deleting project: {}", id);

        manageProjectUseCase.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success(null, "프로젝트 삭제 성공"));
    }
}
```

---

## 체크리스트

### 새로운 기능 개발 시

#### ✅ Domain Layer
- [ ] 도메인 모델은 순수 Java 객체인가? (인프라 의존성 없음)
- [ ] 비즈니스 로직이 도메인 모델에 있는가?
- [ ] DTO는 `domain/{도메인}/dto/`에 위치하는가?
- [ ] Use Case 인터페이스(In Port)가 정의되어 있는가?
- [ ] Repository 포트(Out Port)가 정의되어 있는가?
- [ ] 값 객체가 적절히 활용되었는가?

#### ✅ Application Layer
- [ ] Use Case 인터페이스를 구현하는가?
- [ ] 포트를 통해서만 Infrastructure에 의존하는가?
- [ ] JPA, Redis, Cloudinary 등 인프라 기술에 직접 의존하지 않는가?
- [ ] 트랜잭션 경계가 적절한가?
- [ ] 관심사별로 서비스가 분리되어 있는가?

#### ✅ Infrastructure Layer
- [ ] 어댑터가 포트 인터페이스를 구현하는가?
- [ ] JPA 엔티티와 도메인 모델이 분리되어 있는가?
- [ ] 매퍼를 통해 엔티티 ↔ 도메인 변환이 이루어지는가?
- [ ] 컨트롤러는 Use Case에만 의존하는가?
- [ ] 컨트롤러에 비즈니스 로직이 없는가?

#### ✅ 의존성 방향
- [ ] 의존성이 안쪽(도메인)을 향하는가?
- [ ] Domain → Application 의존이 없는가?
- [ ] Domain → Infrastructure 의존이 없는가?
- [ ] Application → Infrastructure 구체 클래스 의존이 없는가?

#### ✅ 명명 규칙
- [ ] Use Case 인터페이스: `{Action}UseCase`
- [ ] Out Port: `{Entity}RepositoryPort` 또는 `{기능}Port`
- [ ] Service: `{Feature}Service` (Use Case 구현)
- [ ] Adapter: `{기술}{Entity}Adapter` (e.g., `PostgresProjectManagementAdapter`)

### 기존 코드 리팩토링 시

#### ✅ 문제 파악
- [ ] 서비스가 JPA Repository에 직접 의존하는가?
- [ ] DTO가 `infrastructure/web/dto/`에 있는가?
- [ ] 인프라 서비스가 `application/` 패키지에 있는가?
- [ ] 도메인 모델에 JPA 어노테이션이 있는가?
- [ ] 컨트롤러에 비즈니스 로직이 있는가?

#### ✅ 리팩토링 순서
1. [ ] 포트 인터페이스 정의 (In Port, Out Port)
2. [ ] DTO를 `domain/{도메인}/dto/`로 이동
3. [ ] 어댑터 구현 (PostgresAdapter, CloudinaryAdapter 등)
4. [ ] 서비스가 포트를 의존하도록 수정
5. [ ] 도메인 모델과 JPA 엔티티 분리
6. [ ] 매퍼 구현
7. [ ] 컨트롤러가 Use Case만 의존하도록 수정

---

## 참고 자료

### 기존 잘 설계된 코드 예시
- ✅ `domain.portfolio` 패키지
- ✅ `application.portfolio.PortfolioService`
- ✅ `infrastructure.persistence.postgres.PostgresPortfolioRepository`

### 개선이 필요한 코드 예시
- ❌ `application.admin.AdminProjectService` (직접 JPA 의존)
- ❌ `application.admin.CloudinaryService` (인프라 서비스가 application에 위치)
- ❌ `infrastructure.web.dto.admin.*` (도메인 DTO가 인프라에 위치)

### 추가 학습 자료
- [Hexagonal Architecture 원문](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DDD (Domain-Driven Design) 기초](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

**작성일**: 2025-01-25
**버전**: 1.0
**작성자**: AI Agent (Claude)
