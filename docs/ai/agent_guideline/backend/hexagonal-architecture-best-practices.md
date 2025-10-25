# 헥사고날 아키텍처 베스트 프랙티스 가이드

## 📚 목차
1. [헥사고날 아키텍처 개요](#헥사고날-아키텍처-개요)
2. [계층별 역할 및 책임](#계층별-역할-및-책임)
3. [포트와 어댑터 패턴](#포트와-어댑터-패턴)
4. [실제 구현 예시](#실제-구현-예시)
5. [안티패턴 및 개선 방안](#안티패턴-및-개선-방안)
6. [리팩토링 가이드](#리팩토링-가이드)
7. [체크리스트](#체크리스트)

---

## 헥사고날 아키텍처 개요

### 핵심 원칙
1. **의존성 역전**: 도메인 계층이 외부 계층에 의존하지 않음
2. **포트와 어댑터**: 인터페이스를 통한 느슨한 결합
3. **계층 분리**: 각 계층의 명확한 책임과 경계
4. **테스트 용이성**: 포트를 통한 모킹 가능

### 계층 구조
```
┌─────────────────────────────────────┐
│           Infrastructure            │ ← 외부 세계와의 연결
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Web       │ │  Database   │   │
│  │ Adapters    │ │ Adapters    │   │
│  └─────────────┘ └─────────────┘   │
└─────────────────────────────────────┘
                    ↕ (Ports)
┌─────────────────────────────────────┐
│          Application                │ ← Use Case 구현
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Services  │ │   Use      │   │
│  │             │ │   Cases    │   │
│  └─────────────┘ └─────────────┘   │
└─────────────────────────────────────┘
                    ↕ (Ports)
┌─────────────────────────────────────┐
│            Domain                   │ ← 비즈니스 로직
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Models    │ │   Ports    │   │
│  │   & VO      │ │            │   │
│  └─────────────┘ └─────────────┘   │
└─────────────────────────────────────┘
```

---

## 계층별 역할 및 책임

### 1️⃣ Domain Layer (도메인 계층)

**역할**: 비즈니스 로직과 규칙의 핵심

#### 포함 요소
- **Entity**: 비즈니스 엔티티
- **Value Object**: 불변 값 객체
- **Domain Service**: 도메인 로직
- **Port Interface**: 외부와의 계약
- **Domain Exception**: 도메인 예외

#### 디렉토리 구조
```
domain/
├── {bounded-context}/
│   ├── model/
│   │   ├── {Entity}.java
│   │   ├── vo/                    // Value Objects
│   │   │   ├── {ValueObject}.java
│   │   │   └── {Criteria}.java
│   │   └── exception/
│   │       └── {DomainException}.java
│   ├── service/                   // Domain Services
│   │   └── {DomainService}.java
│   ├── port/
│   │   ├── in/                    // Inbound Ports (Use Cases)
│   │   │   ├── {UseCase}.java
│   │   │   └── {QueryUseCase}.java
│   │   └── out/                   // Outbound Ports (Repositories)
│   │       ├── {RepositoryPort}.java
│   │       └── {ExternalServicePort}.java
│   └── dto/                       // Domain DTOs
│       ├── request/
│       │   └── {RequestDto}.java
│       └── response/
│           └── {ResponseDto}.java
```

#### 예시
```java
// domain/project/model/Project.java
@Entity
public class Project {
    private ProjectId id;
    private ProjectTitle title;
    private ProjectDescription description;
    private ProjectStatus status;
    private TechStack techStack;
    
    // 비즈니스 로직
    public void updateTitle(ProjectTitle newTitle) {
        if (newTitle.isBlank()) {
            throw new InvalidProjectTitleException("제목은 비어있을 수 없습니다");
        }
        this.title = newTitle;
    }
    
    public boolean isCompleted() {
        return status == ProjectStatus.COMPLETED;
    }
}

// domain/project/model/vo/ProjectFilter.java
@Value
public class ProjectFilter {
    String searchQuery;
    ProjectType type;
    ProjectStatus status;
    List<String> technologies;
    SortCriteria sortCriteria;
    
    // 비즈니스 로직 포함
    public boolean matches(Project project) {
        return matchesSearch(project) &&
               matchesType(project) &&
               matchesStatus(project) &&
               matchesTechnologies(project);
    }
    
    public Comparator<Project> getComparator() {
        return sortCriteria.getComparator();
    }
}

// domain/project/port/in/ManageProjectUseCase.java
public interface ManageProjectUseCase {
    ProjectResponse createProject(CreateProjectRequest request);
    ProjectResponse updateProject(ProjectId id, UpdateProjectRequest request);
    void deleteProject(ProjectId id);
}

// domain/project/port/out/ProjectRepositoryPort.java
public interface ProjectRepositoryPort {
    Project save(Project project);
    Optional<Project> findById(ProjectId id);
    List<Project> findByFilter(ProjectFilter filter);
    void delete(ProjectId id);
}
```

### 2️⃣ Application Layer (애플리케이션 계층)

**역할**: Use Case 구현 및 애플리케이션 서비스

#### 포함 요소
- **Use Case Implementation**: 포트 인터페이스 구현
- **Application Service**: 트랜잭션 관리, 도메인 조합
- **DTO Mapping**: 도메인 ↔ 외부 DTO 변환

#### 디렉토리 구조
```
application/
├── {bounded-context}/
│   ├── service/
│   │   ├── {UseCase}Service.java
│   │   └── {QueryUseCase}Service.java
│   ├── mapper/
│   │   └── {Entity}Mapper.java
│   └── dto/
│       ├── request/
│       └── response/
```

#### 예시
```java
// application/project/service/ProjectManagementService.java
@Service
@Transactional
@RequiredArgsConstructor
public class ProjectManagementService implements ManageProjectUseCase {
    
    private final ProjectRepositoryPort projectRepositoryPort;
    private final ProjectMapper projectMapper;
    
    @Override
    public ProjectResponse createProject(CreateProjectRequest request) {
        // 도메인 객체 생성
        Project project = Project.builder()
            .title(ProjectTitle.of(request.getTitle()))
            .description(ProjectDescription.of(request.getDescription()))
            .status(ProjectStatus.DRAFT)
            .build();
        
        // 비즈니스 로직 실행
        project.validateForCreation();
        
        // 저장
        Project savedProject = projectRepositoryPort.save(project);
        
        // 응답 변환
        return projectMapper.toResponse(savedProject);
    }
    
    @Override
    public ProjectResponse updateProject(ProjectId id, UpdateProjectRequest request) {
        Project project = projectRepositoryPort.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));
        
        // 도메인 로직 실행
        project.updateTitle(ProjectTitle.of(request.getTitle()));
        project.updateDescription(ProjectDescription.of(request.getDescription()));
        
        Project updatedProject = projectRepositoryPort.save(project);
        return projectMapper.toResponse(updatedProject);
    }
}
```

### 3️⃣ Infrastructure Layer (인프라 계층)

**역할**: 외부 시스템과의 연결 및 기술적 구현

#### 포함 요소
- **Web Adapters**: REST API, GraphQL 등
- **Database Adapters**: JPA, MyBatis 등
- **External Service Adapters**: 외부 API 연동
- **Configuration**: 설정 및 빈 구성

#### 디렉토리 구조
```
infrastructure/
├── web/
│   ├── controller/
│   │   └── {Entity}Controller.java
│   ├── dto/
│   │   └── {WebDto}.java
│   └── config/
│       └── WebConfig.java
├── persistence/
│   ├── {database}/
│   │   ├── adapter/
│   │   │   └── {Database}{Entity}Repository.java
│   │   ├── entity/
│   │   │   └── {Entity}JpaEntity.java
│   │   ├── mapper/
│   │   │   └── {Entity}Mapper.java
│   │   └── repository/
│   │       └── {Entity}JpaRepository.java
│   └── config/
│       └── PersistenceConfig.java
├── external/
│   ├── {service}/
│   │   ├── adapter/
│   │   │   └── {Service}Adapter.java
│   │   └── config/
│   │       └── {Service}Config.java
└── config/
    └── InfrastructureConfig.java
```

#### 예시
```java
// infrastructure/web/controller/ProjectController.java
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    
    private final ManageProjectUseCase manageProjectUseCase;
    private final SearchProjectsUseCase searchProjectsUseCase;
    
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse response = manageProjectUseCase.createProject(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> searchProjects(
            @ModelAttribute ProjectFilterRequest filterRequest) {
        ProjectFilter filter = ProjectFilter.from(filterRequest);
        List<ProjectResponse> projects = searchProjectsUseCase.searchProjects(filter);
        return ResponseEntity.ok(projects);
    }
}

// infrastructure/persistence/postgres/adapter/PostgresProjectRepository.java
@Repository
@RequiredArgsConstructor
public class PostgresProjectRepository implements ProjectRepositoryPort {
    
    private final ProjectJpaRepository jpaRepository;
    private final ProjectMapper mapper;
    
    @Override
    public Project save(Project project) {
        ProjectJpaEntity entity = mapper.toEntity(project);
        ProjectJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }
    
    @Override
    public Optional<Project> findById(ProjectId id) {
        return jpaRepository.findById(id.getValue())
            .map(mapper::toDomain);
    }
    
    @Override
    public List<Project> findByFilter(ProjectFilter filter) {
        List<ProjectJpaEntity> entities = jpaRepository.findAll();
        return entities.stream()
            .map(mapper::toDomain)
            .filter(filter::matches)
            .sorted(filter.getComparator())
            .collect(Collectors.toList());
    }
}
```

---

## 포트와 어댑터 패턴

### 포트 (Port) 정의

포트는 도메인과 외부 세계 사이의 계약을 정의합니다.

#### Inbound Port (들어오는 포트)
```java
// 도메인에서 정의하는 Use Case 인터페이스
public interface ManageProjectUseCase {
    ProjectResponse createProject(CreateProjectRequest request);
    ProjectResponse updateProject(ProjectId id, UpdateProjectRequest request);
    void deleteProject(ProjectId id);
}
```

#### Outbound Port (나가는 포트)
```java
// 도메인에서 정의하는 Repository 인터페이스
public interface ProjectRepositoryPort {
    Project save(Project project);
    Optional<Project> findById(ProjectId id);
    List<Project> findByFilter(ProjectFilter filter);
    void delete(ProjectId id);
}
```

### 어댑터 (Adapter) 구현

어댑터는 포트를 구현하여 외부 시스템과 연결합니다.

#### Primary Adapter (주 어댑터)
```java
// 웹 컨트롤러가 Use Case를 호출
@RestController
public class ProjectController {
    private final ManageProjectUseCase manageProjectUseCase; // Inbound Port
    
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody CreateProjectRequest request) {
        ProjectResponse response = manageProjectUseCase.createProject(request);
        return ResponseEntity.ok(response);
    }
}
```

#### Secondary Adapter (보조 어댑터)
```java
// Repository 구현체가 Outbound Port를 구현
@Repository
public class PostgresProjectRepository implements ProjectRepositoryPort {
    private final ProjectJpaRepository jpaRepository;
    
    @Override
    public Project save(Project project) {
        // JPA 구현
    }
}
```

---

## 실제 구현 예시

### 완전한 예시: 프로젝트 관리 시스템

#### 1. Domain Layer

```java
// domain/project/model/Project.java
@Entity
public class Project {
    private ProjectId id;
    private ProjectTitle title;
    private ProjectDescription description;
    private ProjectStatus status;
    private TechStack techStack;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 비즈니스 로직
    public void updateTitle(ProjectTitle newTitle) {
        if (newTitle.isBlank()) {
            throw new InvalidProjectTitleException("제목은 비어있을 수 없습니다");
        }
        this.title = newTitle;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void markAsCompleted() {
        if (this.status == ProjectStatus.COMPLETED) {
            throw new ProjectAlreadyCompletedException("이미 완료된 프로젝트입니다");
        }
        this.status = ProjectStatus.COMPLETED;
        this.updatedAt = LocalDateTime.now();
    }
    
    public boolean isCompleted() {
        return status == ProjectStatus.COMPLETED;
    }
    
    public boolean matchesSearch(String searchQuery) {
        if (searchQuery == null || searchQuery.isBlank()) {
            return true;
        }
        String query = searchQuery.toLowerCase();
        return title.getValue().toLowerCase().contains(query) ||
               description.getValue().toLowerCase().contains(query);
    }
}

// domain/project/model/vo/ProjectFilter.java
@Value
public class ProjectFilter {
    String searchQuery;
    ProjectType type;
    ProjectStatus status;
    List<String> technologies;
    SortCriteria sortCriteria;
    
    public boolean matches(Project project) {
        return matchesSearch(project) &&
               matchesType(project) &&
               matchesStatus(project) &&
               matchesTechnologies(project);
    }
    
    private boolean matchesSearch(Project project) {
        if (searchQuery == null || searchQuery.isBlank()) {
            return true;
        }
        return project.matchesSearch(searchQuery);
    }
    
    private boolean matchesType(Project project) {
        if (type == null) return true;
        return project.getType() == type;
    }
    
    private boolean matchesStatus(Project project) {
        if (status == null) return true;
        return project.getStatus() == status;
    }
    
    private boolean matchesTechnologies(Project project) {
        if (technologies == null || technologies.isEmpty()) {
            return true;
        }
        return project.getTechStack().containsAny(technologies);
    }
    
    public Comparator<Project> getComparator() {
        return sortCriteria.getComparator();
    }
}

// domain/project/port/in/ManageProjectUseCase.java
public interface ManageProjectUseCase {
    ProjectResponse createProject(CreateProjectRequest request);
    ProjectResponse updateProject(ProjectId id, UpdateProjectRequest request);
    void deleteProject(ProjectId id);
}

// domain/project/port/in/SearchProjectsUseCase.java
public interface SearchProjectsUseCase {
    List<ProjectResponse> searchProjects(ProjectFilter filter);
    ProjectResponse getProjectById(ProjectId id);
}

// domain/project/port/out/ProjectRepositoryPort.java
public interface ProjectRepositoryPort {
    Project save(Project project);
    Optional<Project> findById(ProjectId id);
    List<Project> findByFilter(ProjectFilter filter);
    void delete(ProjectId id);
    boolean existsById(ProjectId id);
}
```

#### 2. Application Layer

```java
// application/project/service/ProjectManagementService.java
@Service
@Transactional
@RequiredArgsConstructor
public class ProjectManagementService implements ManageProjectUseCase {
    
    private final ProjectRepositoryPort projectRepositoryPort;
    private final ProjectMapper projectMapper;
    
    @Override
    public ProjectResponse createProject(CreateProjectRequest request) {
        // 도메인 객체 생성
        Project project = Project.builder()
            .id(ProjectId.generate())
            .title(ProjectTitle.of(request.getTitle()))
            .description(ProjectDescription.of(request.getDescription()))
            .status(ProjectStatus.DRAFT)
            .techStack(TechStack.of(request.getTechnologies()))
            .createdAt(LocalDateTime.now())
            .build();
        
        // 비즈니스 로직 실행
        project.validateForCreation();
        
        // 저장
        Project savedProject = projectRepositoryPort.save(project);
        
        // 응답 변환
        return projectMapper.toResponse(savedProject);
    }
    
    @Override
    public ProjectResponse updateProject(ProjectId id, UpdateProjectRequest request) {
        Project project = projectRepositoryPort.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));
        
        // 도메인 로직 실행
        if (request.getTitle() != null) {
            project.updateTitle(ProjectTitle.of(request.getTitle()));
        }
        if (request.getDescription() != null) {
            project.updateDescription(ProjectDescription.of(request.getDescription()));
        }
        if (request.getStatus() != null) {
            project.updateStatus(ProjectStatus.valueOf(request.getStatus()));
        }
        
        Project updatedProject = projectRepositoryPort.save(project);
        return projectMapper.toResponse(updatedProject);
    }
    
    @Override
    public void deleteProject(ProjectId id) {
        if (!projectRepositoryPort.existsById(id)) {
            throw new ProjectNotFoundException(id);
        }
        projectRepositoryPort.delete(id);
    }
}

// application/project/service/ProjectSearchService.java
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ProjectSearchService implements SearchProjectsUseCase {
    
    private final ProjectRepositoryPort projectRepositoryPort;
    private final ProjectMapper projectMapper;
    
    @Override
    public List<ProjectResponse> searchProjects(ProjectFilter filter) {
        List<Project> projects = projectRepositoryPort.findByFilter(filter);
        return projects.stream()
            .map(projectMapper::toResponse)
            .collect(Collectors.toList());
    }
    
    @Override
    public ProjectResponse getProjectById(ProjectId id) {
        Project project = projectRepositoryPort.findById(id)
            .orElseThrow(() -> new ProjectNotFoundException(id));
        return projectMapper.toResponse(project);
    }
}
```

#### 3. Infrastructure Layer

```java
// infrastructure/web/controller/ProjectController.java
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Validated
public class ProjectController {
    
    private final ManageProjectUseCase manageProjectUseCase;
    private final SearchProjectsUseCase searchProjectsUseCase;
    
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse response = manageProjectUseCase.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable String id) {
        ProjectId projectId = ProjectId.of(id);
        ProjectResponse response = searchProjectsUseCase.getProjectById(projectId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> searchProjects(
            @ModelAttribute ProjectFilterRequest filterRequest) {
        ProjectFilter filter = ProjectFilter.from(filterRequest);
        List<ProjectResponse> projects = searchProjectsUseCase.searchProjects(filter);
        return ResponseEntity.ok(projects);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable String id,
            @Valid @RequestBody UpdateProjectRequest request) {
        ProjectId projectId = ProjectId.of(id);
        ProjectResponse response = manageProjectUseCase.updateProject(projectId, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        ProjectId projectId = ProjectId.of(id);
        manageProjectUseCase.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }
}

// infrastructure/persistence/postgres/adapter/PostgresProjectRepository.java
@Repository
@RequiredArgsConstructor
public class PostgresProjectRepository implements ProjectRepositoryPort {
    
    private final ProjectJpaRepository jpaRepository;
    private final ProjectMapper mapper;
    
    @Override
    public Project save(Project project) {
        ProjectJpaEntity entity = mapper.toEntity(project);
        ProjectJpaEntity savedEntity = jpaRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }
    
    @Override
    public Optional<Project> findById(ProjectId id) {
        return jpaRepository.findById(id.getValue())
            .map(mapper::toDomain);
    }
    
    @Override
    public List<Project> findByFilter(ProjectFilter filter) {
        List<ProjectJpaEntity> entities = jpaRepository.findAll();
        return entities.stream()
            .map(mapper::toDomain)
            .filter(filter::matches)
            .sorted(filter.getComparator())
            .collect(Collectors.toList());
    }
    
    @Override
    public void delete(ProjectId id) {
        jpaRepository.deleteById(id.getValue());
    }
    
    @Override
    public boolean existsById(ProjectId id) {
        return jpaRepository.existsById(id.getValue());
    }
}
```

---

## 안티패턴 및 개선 방안

### 1️⃣ 계층 우회 (Layer Violation)

**문제점:**
```java
// ❌ Bad: 애플리케이션 계층이 인프라 계층을 직접 의존
@Service
public class ProjectService {
    private final ProjectJpaRepository jpaRepository;  // ❌ JPA 직접 의존
    private final ProjectMapper mapper;                 // ❌ 인프라 매퍼 직접 의존
    
    public List<ProjectResponse> getProjects() {
        List<ProjectJpaEntity> entities = jpaRepository.findAll();  // ❌
        return entities.stream()
            .map(mapper::toResponse)
            .collect(Collectors.toList());
    }
}
```

**개선 방안:**
```java
// ✅ Good: 포트를 통한 의존성 역전
@Service
public class ProjectService implements ManageProjectUseCase {
    private final ProjectRepositoryPort repositoryPort;  // ✅ 포트에만 의존
    
    @Override
    public List<ProjectResponse> getProjects() {
        List<Project> projects = repositoryPort.findAll();
        return projects.stream()
            .map(ProjectResponse::from)
            .collect(Collectors.toList());
    }
}
```

### 2️⃣ DTO 위치 문제

**문제점:**
```
❌ 현재 구조
infrastructure/web/dto/
├── ProjectCreateRequest.java    // 도메인 DTO가 인프라에 위치
├── ProjectUpdateRequest.java
└── ProjectResponse.java
```

**개선 방안:**
```
✅ 개선된 구조
domain/project/dto/
├── request/
│   ├── CreateProjectRequest.java    // 도메인 계층으로 이동
│   └── UpdateProjectRequest.java
└── response/
    └── ProjectResponse.java

infrastructure/web/dto/
└── ProjectWebRequest.java          // 웹 계층 전용 DTO만
```

### 3️⃣ 비즈니스 로직 분산

**문제점:**
```java
// ❌ Bad: 비즈니스 로직이 서비스에 직접 구현
@Service
public class ProjectService {
    public List<ProjectResponse> searchProjects(ProjectFilter filter) {
        List<Project> projects = repositoryPort.findAll();
        
        // 필터링 로직이 서비스에 직접 구현 ❌
        List<Project> filtered = projects.stream()
            .filter(p -> p.getTitle().contains(filter.getSearchQuery()))
            .filter(p -> p.getStatus() == filter.getStatus())
            .collect(Collectors.toList());
            
        // 정렬 로직도 서비스에 직접 구현 ❌
        filtered.sort((p1, p2) -> p1.getTitle().compareTo(p2.getTitle()));
        
        return filtered.stream()
            .map(ProjectResponse::from)
            .collect(Collectors.toList());
    }
}
```

**개선 방안:**
```java
// ✅ Good: 비즈니스 로직을 도메인 객체에 포함
@Value
public class ProjectFilter {
    String searchQuery;
    ProjectStatus status;
    SortCriteria sortCriteria;
    
    // 비즈니스 로직을 도메인 객체에 포함
    public boolean matches(Project project) {
        return matchesSearch(project) && matchesStatus(project);
    }
    
    public Comparator<Project> getComparator() {
        return sortCriteria.getComparator();
    }
}

// ✅ Good: 서비스는 단순 위임
@Service
public class ProjectService implements SearchProjectsUseCase {
    private final ProjectRepositoryPort repositoryPort;
    
    @Override
    public List<ProjectResponse> searchProjects(ProjectFilter filter) {
        List<Project> projects = repositoryPort.findAll();
        return projects.stream()
            .filter(filter::matches)           // 도메인 로직 위임
            .sorted(filter.getComparator())   // 도메인 로직 위임
            .map(ProjectResponse::from)
            .collect(Collectors.toList());
    }
}
```

### 4️⃣ 인프라 서비스 위치 문제

**문제점:**
```java
// ❌ Bad: 인프라 서비스가 애플리케이션 계층에 위치
@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;  // 외부 서비스 직접 의존
    
    public String uploadImage(MultipartFile file) {
        // Cloudinary SDK 직접 사용
    }
}
```

**개선 방안:**
```java
// ✅ Good: 포트 인터페이스 정의
public interface ImageStoragePort {
    String uploadImage(byte[] imageData, String folder);
    void deleteImage(String publicId);
}

// ✅ Good: 인프라 어댑터 구현
@Component
public class CloudinaryImageStorageAdapter implements ImageStoragePort {
    private final Cloudinary cloudinary;
    
    @Override
    public String uploadImage(byte[] imageData, String folder) {
        // Cloudinary 구현
    }
}
```

---

## 리팩토링 가이드

### 단계별 리팩토링 프로세스

#### Step 1: 포트 인터페이스 도입
1. **Outbound Port 정의**
   ```java
   // domain/project/port/out/ProjectRepositoryPort.java
   public interface ProjectRepositoryPort {
       Project save(Project project);
       Optional<Project> findById(ProjectId id);
       List<Project> findByFilter(ProjectFilter filter);
   }
   ```

2. **기존 서비스 수정**
   ```java
   // application/project/service/ProjectService.java
   @Service
   public class ProjectService {
       private final ProjectRepositoryPort repositoryPort;  // 포트 의존
       
       public ProjectResponse createProject(CreateProjectRequest request) {
           Project project = Project.from(request);
           Project saved = repositoryPort.save(project);
           return ProjectResponse.from(saved);
       }
   }
   ```

#### Step 2: 어댑터 구현
```java
// infrastructure/persistence/postgres/adapter/PostgresProjectRepository.java
@Repository
public class PostgresProjectRepository implements ProjectRepositoryPort {
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

#### Step 3: DTO 이동
1. **도메인 DTO 이동**
   ```
   infrastructure/web/dto/admin/ → domain/admin/dto/
   ```

2. **값 객체 추출**
   ```java
   // domain/admin/model/vo/ProjectFilter.java
   @Value
   public class ProjectFilter {
       // 필터링 로직 포함
   }
   ```

#### Step 4: Use Case 분리
```java
// domain/project/port/in/ManageProjectUseCase.java
public interface ManageProjectUseCase {
    ProjectResponse createProject(CreateProjectRequest request);
    ProjectResponse updateProject(ProjectId id, UpdateProjectRequest request);
    void deleteProject(ProjectId id);
}

// application/project/service/ProjectManagementService.java
@Service
public class ProjectManagementService implements ManageProjectUseCase {
    // 구현
}
```

### 리팩토링 체크리스트

#### ✅ 도메인 계층
- [ ] 비즈니스 로직이 도메인 모델에 포함되어 있는가?
- [ ] 값 객체(Value Object)가 적절히 사용되고 있는가?
- [ ] 포트 인터페이스가 명확하게 정의되어 있는가?
- [ ] 도메인 DTO가 도메인 계층에 위치하는가?
- [ ] 도메인 예외가 정의되어 있는가?

#### ✅ 애플리케이션 계층
- [ ] Use Case 인터페이스가 정의되어 있는가?
- [ ] 서비스가 포트에만 의존하는가?
- [ ] 인프라 구현체를 직접 의존하지 않는가?
- [ ] 비즈니스 로직이 도메인에 위임되는가?
- [ ] 트랜잭션 관리가 적절한가?

#### ✅ 인프라 계층
- [ ] 포트 인터페이스를 구현하는 어댑터가 있는가?
- [ ] 외부 서비스가 인프라 계층에 위치하는가?
- [ ] 웹 컨트롤러가 Use Case에만 의존하는가?
- [ ] 데이터베이스 매퍼가 인프라에 위치하는가?
- [ ] 설정이 적절히 분리되어 있는가?

---

## 체크리스트

### 새로운 기능 개발 시

#### ✅ 도메인 계층
- [ ] 엔티티에 비즈니스 로직이 포함되어 있는가?
- [ ] 값 객체가 불변성을 보장하는가?
- [ ] 포트 인터페이스가 명확하게 정의되어 있는가?
- [ ] 도메인 예외가 적절히 정의되어 있는가?

#### ✅ 애플리케이션 계층
- [ ] Use Case 인터페이스가 정의되어 있는가?
- [ ] 서비스가 포트에만 의존하는가?
- [ ] 트랜잭션 경계가 적절한가?
- [ ] DTO 매핑이 명확한가?

#### ✅ 인프라 계층
- [ ] 어댑터가 포트를 올바르게 구현하는가?
- [ ] 외부 의존성이 인프라에만 있는가?
- [ ] 설정이 적절히 분리되어 있는가?

### 기존 코드 리팩토링 시

#### ✅ 문제 파악
- [ ] 계층 우회가 있는가?
- [ ] 비즈니스 로직이 잘못된 계층에 있는가?
- [ ] DTO 위치가 적절한가?
- [ ] 포트 인터페이스가 누락되었는가?

#### ✅ 리팩토링 순서
1. [ ] 포트 인터페이스 정의
2. [ ] 도메인 로직 도메인 계층으로 이동
3. [ ] DTO 적절한 계층으로 이동
4. [ ] 어댑터 구현
5. [ ] Use Case 분리
6. [ ] 테스트 작성

---

## 참고 자료

### 헥사고날 아키텍처 관련
- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Ports and Adapters Pattern](https://martinfowler.com/articles/ports-and-adapters.html)

### Spring Boot 관련
- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
- [Spring Data JPA Documentation](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)

### 테스트 관련
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)

---

**작성일**: 2025-01-25
**버전**: 1.0
**작성자**: AI Agent (Claude)
