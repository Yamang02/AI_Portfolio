# 백엔드 코딩 원칙

이 프로젝트의 Spring Boot + 헥사고날 아키텍처 기반 백엔드에서
좋은 코드를 작성하기 위한 원칙과 노하우를 정리한다.

---

## 1. 레이어 경계 원칙

### 의존성 방향은 항상 안쪽으로

```
Infrastructure → Application → Domain
(밖)                           (안)
```

- **Domain**: 어떤 프레임워크도 import하지 않는다. 순수 Java.
- **Application**: Domain의 Port를 구현하고, 비즈니스 흐름을 조율한다.
- **Infrastructure**: Spring, JPA, 외부 API 등 기술 의존성을 여기서만 다룬다.

### 위반 징후 체크리스트

- [ ] Controller에서 JpaRepository를 직접 주입받고 있는가?
- [ ] Domain 모델에 `@Entity`, `@Column` 같은 JPA 어노테이션이 있는가?
- [ ] Application Service에서 `HttpServletRequest`를 참조하는가?
- [ ] Domain Port에 Spring 어노테이션(`@Repository`, `@Service`)이 있는가?

**위반 시**: UseCase 포트를 통해 위임하도록 수정한다.

---

## 2. Port/Adapter 설계

### Inbound Port (UseCase)

```java
// 좋은 예: 구체적인 행위를 나타내는 이름
public interface GetProjectsUseCase {
    List<Project> getProjects();
    Project getProjectById(String id);
}

// 나쁜 예: 포괄적인 이름
public interface ProjectService {
    // 이건 Port가 아니라 구현체에 가까운 이름
}
```

**원칙:**
- UseCase 하나당 관련 있는 행위들만 묶는다
- 이름은 동사 + 도메인 객체 + UseCase (예: `ManageProjectUseCase`)
- Read/Write UseCase를 구분하면 CQRS 전환이 쉬워진다

### Outbound Port

```java
// 좋은 예: 도메인 관점의 추상화
public interface PortfolioRepositoryPort {
    Project save(Project project);
    Optional<Project> findById(String id);
}

// 나쁜 예: 기술 구현이 노출된 이름
public interface ProjectJpaPort {
    ProjectJpaEntity saveEntity(ProjectJpaEntity entity);
}
```

**원칙:**
- Port는 도메인 모델만 주고받는다 (JPA Entity가 아님)
- 기술 이름(Jpa, Sql, Redis)을 Port 이름에 넣지 않는다

---

## 3. 도메인 모델

### 풍부한 도메인 모델

```java
// 좋은 예: 비즈니스 로직이 모델 안에 있음
@Builder
public class Project {
    public boolean isOngoing() {
        return endDate == null;
    }

    public long getDurationInMonths() {
        return ChronoUnit.MONTHS.between(startDate, LocalDate.now());
    }

    public void updateTeamInfo(Boolean isTeam, Integer teamSize) {
        if (isTeam != null && isTeam && teamSize == null) {
            throw new IllegalArgumentException("팀 프로젝트는 팀 규모가 필요합니다");
        }
        this.isTeam = isTeam;
        this.teamSize = teamSize;
    }
}

// 나쁜 예: 빈혈 도메인 모델 (getter/setter만)
public class Project {
    private String title;
    // getter, setter만...
    // 비즈니스 로직은 전부 Service에
}
```

**원칙:**
- 유효성 검증은 도메인 모델 내부에서 한다
- "이 데이터는 항상 이 규칙을 만족한다"는 불변식(invariant)을 모델이 보장한다
- `@Builder`로 생성하되, 비즈니스 메서드는 직접 정의한다

### Value Object 활용

```java
// Enum을 Value Object로 활용
public enum ProjectType {
    BUILD, LAB, MAINTENANCE;

    public boolean isProductionLevel() {
        return this == BUILD;
    }
}
```

---

## 4. Application Service

### Template Method 활용 (BaseCrudService)

```java
// 공통 흐름은 부모가 정의
public abstract class BaseCrudService<T, ID> {
    public T create(T entity) {
        validateForCreate(entity);   // 훅: 하위 클래스 오버라이드
        beforeCreate(entity);        // 훅
        T saved = getRepository().save(entity);
        afterCreate(saved);          // 훅
        return saved;
    }
}

// 하위 클래스는 필요한 훅만 오버라이드
@Service
public class ProjectService extends BaseCrudService<Project, String> {
    @Override
    protected void validateForCreate(Project project) {
        if (project.getTitle() == null) {
            throw new IllegalArgumentException("제목은 필수입니다");
        }
    }
}
```

**원칙:**
- 공통 CRUD 흐름을 Template Method로 정의하면 일관성이 보장된다
- 훅 메서드는 빈 구현(no-op)을 기본으로 하여, 하위 클래스가 필요할 때만 오버라이드
- 훅이 5개 이상이면 Template Method가 아니라 Strategy 패턴을 고려

### 트랜잭션 경계

```java
// 좋은 예: Application Service에서 트랜잭션 경계 설정
@Service
@Transactional(readOnly = true)  // 읽기 기본
public class ProjectApplicationService {

    @Transactional  // 쓰기 시 명시
    public Project createProject(ProjectCreateCommand command) {
        // ...
    }
}

// 나쁜 예: Repository나 Controller에서 @Transactional
```

---

## 5. Mapper 작성 원칙

### Entity ↔ Domain 양방향 변환

```java
public class ProjectMapper {
    // Infrastructure → Domain
    public static Project toDomain(ProjectJpaEntity entity) {
        return Project.builder()
                .id(entity.getBusinessId())
                .title(entity.getTitle())
                // ...
                .build();
    }

    // Domain → Infrastructure
    public static ProjectJpaEntity toJpaEntity(Project project) {
        return ProjectJpaEntity.builder()
                .businessId(project.getId())
                .title(project.getTitle())
                // ...
                .build();
    }
}
```

**원칙:**
- Mapper는 Infrastructure 레이어에 위치한다 (JPA Entity를 아니까)
- 정적 메서드로 충분하다 (상태 없음)
- 관계 테이블(다대다)은 Mapper가 아닌 별도 Adapter에서 처리
- `null` 안전하게 처리: 필드가 `null`이면 기본값 또는 빈 컬렉션 반환

---

## 6. 예외 처리

### 도메인 예외 계층

```java
// 도메인별 예외를 정의
public class ProjectNotFoundException extends RuntimeException {
    public ProjectNotFoundException(String id) {
        super("프로젝트를 찾을 수 없습니다: " + id);
    }
}

// GlobalExceptionHandler에서 통일 처리
@ExceptionHandler(ProjectNotFoundException.class)
public ResponseEntity<ApiResponse<Object>> handleNotFound(ProjectNotFoundException e) {
    return ResponseEntity.status(404)
        .body(ApiResponse.error(e.getMessage()));
}
```

**원칙:**
- 도메인 예외는 `domain/` 패키지에 정의
- 비즈니스 로직 위반 → `IllegalArgumentException` 또는 도메인 예외
- 외부 시스템 오류 → 도메인 예외로 래핑 (Adapter에서)
- `GlobalExceptionHandler`에 모든 예외 타입을 등록

### 예외 정의 원칙

```
하나의 예외 클래스는 하나의 의미만 가진다.
예외 이름만으로 무슨 일이 일어났는지 알 수 있어야 한다.
```

---

## 7. API 응답 일관성

### 공통 응답 래퍼 사용

```java
// 모든 API는 ApiResponse<T>로 감싼다
@GetMapping("/projects")
public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects() {
    List<ProjectResponse> projects = service.getProjects();
    return ResponseEntity.ok(ApiResponse.success(projects, "조회 성공"));
}

// 에러도 동일한 형식
return ResponseEntity.status(500)
    .body(ApiResponse.error("내부 서버 오류"));
```

**응답 구조:**
```json
{
  "success": true,
  "message": "조회 성공",
  "data": { ... },
  "error": null
}
```

---

## 8. 의존성 주입 규칙

### 생성자 주입만 사용

```java
// 좋은 예
@Service
@RequiredArgsConstructor
public class ChatApplicationService {
    private final LLMPort llmPort;                    // final 필수
    private final PortfolioRepositoryPort repository;  // final 필수
}

// 나쁜 예
@Service
public class ChatApplicationService {
    @Autowired  // 필드 주입 금지
    private LLMPort llmPort;
}
```

**이유:**
- `final` 필드로 불변성 보장
- 필수 의존성 누락 시 컴파일 타임에 발견
- 테스트에서 Mock 주입이 자연스러움

---

## 9. 캐싱 전략

### 캐시 적용 기준

| 조건 | 캐시 적용 |
|------|---------|
| 읽기 빈도 >> 쓰기 빈도 | O |
| 데이터가 자주 변경됨 | X (또는 짧은 TTL) |
| 외부 API 호출 결과 | O (API 비용 절약) |
| 사용자별로 다른 데이터 | 캐시 키에 사용자 식별자 포함 |

### 캐시 무효화 원칙

```java
// 데이터를 변경하는 메서드에서 반드시 캐시 무효화
@CacheEvict(value = "portfolio", allEntries = true)
@Transactional
public Project updateProject(String id, ProjectUpdateCommand command) {
    // ...
}
```

- `@Cacheable`과 `@CacheEvict`는 같은 Service에 위치
- 캐시 키 네이밍: `{도메인}:{식별자}` (예: `portfolio:prj-001`)
- TTL은 데이터 특성에 맞게 차별화 (포트폴리오 1일, GitHub 30분)

---

## 10. 관계 테이블 관리

### Merge 전략

```java
// 나쁜 예: DELETE ALL + INSERT ALL
repository.deleteAllByProjectId(projectId);
for (Long techStackId : newTechStackIds) {
    repository.save(new ProjectTechStack(projectId, techStackId));
}

// 좋은 예: 변경분만 처리 (Merge)
Set<Long> existing = getCurrentIds(projectId);
Set<Long> requested = new HashSet<>(newTechStackIds);

Set<Long> toDelete = difference(existing, requested);
Set<Long> toAdd = difference(requested, existing);

repository.deleteByIds(toDelete);
repository.saveAll(toAdd.stream().map(...).toList());
```

**이유:**
- 불필요한 DELETE/INSERT를 줄여 DB 부하 감소
- Duplicate Key 에러 방지
- 변경 이력 추적이 가능해짐

---

## 11. 테스트 작성 기준

### 어디에 테스트를 작성하는가

| 레이어 | 테스트 종류 | Mock 대상 |
|--------|---------|---------|
| Domain Model | 단위 테스트 | 없음 (순수 Java) |
| Application Service | 단위 테스트 | Outbound Port를 Mock |
| Infrastructure Adapter | 통합 테스트 | DB, 외부 API (Testcontainers) |
| Controller | 슬라이스 테스트 | `@WebMvcTest` + Service Mock |

### 테스트 네이밍

```java
// 한글로 명확하게
@Test
void 팀프로젝트는_팀규모가_필수이다() { ... }

@Test
void 진행중인_프로젝트의_종료일은_null이다() { ... }

// given-when-then 구조
@Test
void 스팸_패턴_입력시_거부된다() {
    // given
    String spamInput = "buy cheap tickets now";

    // when
    boolean result = validator.isValid(spamInput);

    // then
    assertThat(result).isFalse();
}
```

---

## 12. 보안 체크리스트

### 입력 검증

- [ ] 모든 사용자 입력에 길이 제한이 있는가?
- [ ] SQL Injection 방지: JPA Parameterized Query 사용하는가?
- [ ] XSS 방지: 사용자 입력을 HTML에 직접 출력하지 않는가?
- [ ] Path Traversal 방지: 파일 경로에 사용자 입력을 사용하지 않는가?

### 인증/인가

- [ ] Admin 엔드포인트에 인증이 적용되어 있는가?
- [ ] Session Fixation 방지가 설정되어 있는가?
- [ ] CORS 설정이 필요한 도메인만 허용하는가?

### 의존성

- [ ] SonarQube 또는 OWASP Dependency-Check로 취약점 스캔이 가능한가?
- [ ] 사용하지 않는 의존성이 `pom.xml`에 남아있지 않는가?
