# P03: 캐시 무효화 전략 세분화

## 목표

`allEntries=true`로 인한 전체 캐시 플러시를 제거하고,
변경된 데이터의 키만 정확하게 무효화하는 세분화된 전략을 도입한다.
아울러 캐시 키 문자열을 상수로 통합 관리한다.

## 문제 상세

### 현재 전략의 문제

```java
// ManageExperienceService, ManageEducationService, ManageProjectService 등 공통 패턴
@CacheEvict(value = "portfolio", allEntries = true)
public void createExperience(CreateExperienceCommand command) { ... }
```

`allEntries = true`는 `portfolio` 캐시의 **모든 키**를 제거한다:
- experiences:all
- educations:all
- certifications:all
- projects:all

즉, Experience 하나를 추가해도 Education 캐시까지 지워지는 구조.
트래픽이 많은 시간대에 캐시 콜드 스타트가 집중될 수 있다.

### 캐시 키 문자열 분산

현재 캐시 키 문자열(`"experiences:all"`, `"portfolio"` 등)이 서비스 파일마다 분산되어 있어
오타나 불일치가 발생해도 컴파일 시 감지 불가.

## 구현 상세

### 1. CacheKeys 상수 클래스 생성

**새 파일:**  
`backend/src/main/java/com/aiportfolio/backend/infrastructure/config/CacheKeys.java`

```java
public final class CacheKeys {
    private CacheKeys() {}

    // 캐시 이름 (value= 파라미터)
    public static final String PORTFOLIO = "portfolio";
    public static final String GITHUB = "github";

    // 포트폴리오 캐시 키
    public static final String EXPERIENCES_ALL = "experiences:all";
    public static final String EDUCATIONS_ALL = "educations:all";
    public static final String CERTIFICATIONS_ALL = "certifications:all";
    public static final String PROJECTS_ALL = "projects:all";

    // GitHub 캐시 키
    public static final String GITHUB_PROJECTS = "projects";
    public static final String GITHUB_PROJECT_PREFIX = "project:";

    // 기타
    public static final String FRONTEND_CACHE_VERSION = "frontend:cache:version";
}
```

### 2. PortfolioService @Cacheable 키 교체

**변경 파일:** `application/portfolio/PortfolioService.java`

```java
// Before
@Cacheable(value = "portfolio", key = "'experiences:all'")

// After
@Cacheable(value = CacheKeys.PORTFOLIO, key = "'" + CacheKeys.EXPERIENCES_ALL + "'")
```

4개 메서드 모두 적용 (experiences, educations, certifications, projects).

### 3. 각 Manage 서비스 @CacheEvict 세분화

**변경 파일 목록:**
- `ManageExperienceService.java`
- `ManageEducationService.java`
- `ManageCertificationService.java`
- `ManageProjectService.java`
- `ManageArticleService.java`
- `ManageTechStackMetadataService.java`

**패턴 변경:**
```java
// Before (ManageExperienceService)
@CacheEvict(value = "portfolio", allEntries = true)
public void createExperience(...) { ... }

// After — 해당 데이터 타입 키만 무효화
@CacheEvict(value = CacheKeys.PORTFOLIO, key = "'" + CacheKeys.EXPERIENCES_ALL + "'")
public void createExperience(...) { ... }
```

**매핑 기준:**
| 서비스 | 무효화 대상 키 |
|---|---|
| ManageExperienceService | `experiences:all` |
| ManageEducationService | `educations:all` |
| ManageCertificationService | `certifications:all` |
| ManageProjectService | `projects:all` |
| ManageArticleService | `projects:all` (Article은 Project 하위) |
| ManageTechStackMetadataService | `projects:all` (기술 스택은 프로젝트 캐시에 포함) |

**주의:** `ManageArticleService`와 `ManageTechStackMetadataService`가 `portfolio` 캐시의 어떤 키에 영향을 주는지 실제 데이터 구조 확인 후 결정. 불확실하면 해당 서비스는 `allEntries=true` 유지.

### 4. refreshCache() 메서드 정리

`ProjectApplicationService.refreshCache()`가 `{"portfolio", "github"}` 전체를 evict하는 것은 
관리자 수동 실행 용도이므로 유지. 단, 키 문자열은 상수로 교체:

```java
@Caching(evict = {
    @CacheEvict(value = CacheKeys.PORTFOLIO, allEntries = true),
    @CacheEvict(value = CacheKeys.GITHUB, allEntries = true)
})
public void refreshCache() { ... }
```

## 완료 기준 (체크리스트)

- [x] `CacheKeys.java` 생성, 모든 캐시 이름/키 상수 정의
- [x] `PortfolioService`: `@Cacheable` 4개·`refreshProjectsCache`·`refreshCache`에 상수/`@Caching` 적용
- [x] `ProjectApplicationService`: 동일 (`ManageProjectCacheUseCase` 구현체)
- [x] `ManageExperienceService`: `experiences:all` 키 단위 evict
- [x] `ManageEducationService`: `educations:all` 키 단위 evict
- [x] `ManageCertificationService`: `certifications:all` 키 단위 evict
- [x] `ManageProjectService`: `projects:all` 키 단위 evict
- [x] `ManageArticleService`: `projects:all` 키 단위 evict (프로젝트·아티클 연동)
- [x] `ManageTechStackMetadataService` / `UpdateTechStackSortOrderService`: `projects:all` 키 단위 evict
- [x] `GitHubIntegrationService`: `github` 캐시 이름·키 프리픽스 상수화
- [x] `CacheConfig`: 캐시 이름 등록에 `CacheKeys` 사용
- [x] Docker `backend`에서 `mvn test` 성공
- [ ] 로컬에서 관리자 변경 시 해당 키만 무효화되는지 스모크 (선택)
