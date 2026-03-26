# 프로젝트 디자인 패턴 분석

이 프로젝트에 적용된 디자인 패턴과 아키텍처 패턴을 정리한다.
코드 품질 개선, 리뷰, 온보딩 시 참고 자료로 활용한다.

---

## 백엔드 패턴

### 아키텍처 패턴

| 패턴 | 적용 위치 | 상태 |
|------|---------|------|
| Hexagonal Architecture | `domain/*/port/in`, `domain/*/port/out` | 잘 적용됨 |
| Inbound Port (UseCase) | `domain/*/port/in/*.java` (27개) | 잘 적용됨 |
| Outbound Port | `domain/*/port/out/*.java` | 잘 적용됨 |
| Layered Architecture | `domain` → `application` → `infrastructure` | 잘 적용됨 |

**Port/Adapter 흐름:**
```
Controller (Infrastructure)
  → UseCase Port (Domain)
    → ApplicationService (Application) implements UseCase
      → RepositoryPort (Domain)
        → JpaRepository Adapter (Infrastructure) implements Port
```

### GoF 생성 패턴

| 패턴 | 적용 위치 | 설명 |
|------|---------|------|
| Builder | 모든 도메인 모델 (`@Builder`) | `Project`, `Experience`, `Education` 등 복잡한 객체 생성 |
| Factory Method | `BusinessIdGenerator.generate()` | 비즈니스 ID 생성 (`prj-001`, `exp-001`) |
| Static Factory | `ApiResponse.success()`, `ApiResponse.error()` | 응답 래퍼 생성 |

### GoF 구조 패턴

| 패턴 | 적용 위치 | 설명 |
|------|---------|------|
| Adapter | `GeminiLLMAdapter`, `CloudinaryImageStorageAdapter` | 외부 시스템을 도메인 포트에 맞춤 |
| Adapter | `PostgresPortfolioRepository` | JPA를 도메인 Repository 포트에 맞춤 |
| Facade | `PortfolioApplicationService` | 여러 UseCase를 단일 서비스로 통합 |

### GoF 행동 패턴

| 패턴 | 적용 위치 | 설명 |
|------|---------|------|
| Template Method | `BaseCrudService` | `create()` → `validateForCreate()` → `beforeCreate()` → `save()` → `afterCreate()` 훅 체인 |
| Strategy | `ProjectFilter.matches()`, `getSortCriteria()` | 필터/정렬 기준별 다른 로직 |
| Command | `ProjectCreateCommand`, `ProjectUpdateCommand` | 불변 커맨드 객체로 의도 캡슐화 |

### Spring 특화 패턴

| 패턴 | 적용 위치 | 설명 |
|------|---------|------|
| 생성자 주입 | `@RequiredArgsConstructor` + `final` 필드 | 전 서비스에 일관 적용 |
| 조건부 Bean | `@ConditionalOnProperty`, `@ConditionalOnMissingBean` | DB 초기화, 캐시 매니저 폴백 |
| 선언적 캐싱 | `@Cacheable`, `@CacheEvict` | 포트폴리오(1일), GitHub(30분) TTL |
| 선언적 트랜잭션 | `@Transactional` | 관계 테이블 Merge 전략에서 활용 |
| 전역 예외 처리 | `@ControllerAdvice` + `@ExceptionHandler` | `GlobalExceptionHandler` |

### 데이터 접근 패턴

| 패턴 | 적용 위치 | 설명 |
|------|---------|------|
| Repository | `ProjectJpaRepository` extends `JpaRepository` | Spring Data JPA 표준 |
| Specification | `ProjectSpecification` | 동적 쿼리 (검색, 필터링, 정렬) |
| Mapper | `ProjectMapper.toDomain()`, `toJpaEntity()` | Entity ↔ Domain 양방향 변환 |
| DTO Mapper | `ProjectResponseMapper` | Domain → Response DTO |
| Merge Strategy | `ProjectRelationshipAdapter` | 다대다 관계에서 기존/신규 비교로 불필요한 DELETE/INSERT 최소화 |

**데이터 변환 흐름:**
```
HTTP Request → Web DTO → Domain Model → JPA Entity → DB
DB → JPA Entity → Domain Model → Response DTO → JSON
```

### 캐싱 전략

| 캐시 | TTL | 무효화 |
|------|-----|--------|
| portfolio | 1일 | `@CacheEvict` on 프로젝트 CRUD |
| github | 30분 | TTL 만료 |
| 메모리 폴백 | - | `@ConditionalOnMissingBean` (Redis 없을 때) |

---

## 프론트엔드 패턴

### 아키텍처 패턴

| 패턴 | 적용 위치 | 상태 |
|------|---------|------|
| Feature-Sliced Design | `app` → `pages` → `widgets` → `features` → `entities` → `shared` | 잘 적용됨 |
| 앱 분리 | `main/` (사용자) vs `admin/` (관리자) | 완벽 분리 |
| 디자인 시스템 | `design-system/components/` (56개) | 체계적 |

**FSD 레이어별 역할:**
```
app/       — 진입점, 라우팅, Provider 설정
pages/     — 전체 페이지 (데이터 페칭, 레이아웃 결정)
widgets/   — 독립적 UI 블록 (HeroSection, FeaturedProjectsSection)
features/  — 사용자 상호작용 (chatbot, easter-eggs, project-gallery)
entities/  — 비즈니스 모델 (project, article, experience)
shared/    — 전역 유틸, 훅, API, UI 컴포넌트
```

### 상태 관리 패턴

| 패턴 | 도구 | 용도 |
|------|------|------|
| 서버 상태 | React Query | API 데이터 캐싱, 쿼리 키 계층화, Persistence |
| 앱 전역 상태 | Context API | `AppProvider` (포트폴리오 데이터), `ThemeProvider` |
| 기능 전용 상태 | Context + 자체 Store | `EasterEggProvider` (이스터에그 상태) |
| 로컬 상태 | useState | 컴포넌트 전용 UI 상태 |

**React Query 키 계층 패턴:**
```typescript
PROJECT_QUERY_KEYS = {
  all: ['projects'],
  lists: () => [...all, 'list'],
  list: (filter) => [...lists(), filter],
  details: () => [...all, 'detail'],
  detail: (id) => [...details(), id],
}
```

### 컴포넌트 패턴

| 패턴 | 적용 위치 | 설명 |
|------|---------|------|
| Composition | `HomePage`, `ProjectCard` | 작은 컴포넌트 조합으로 복잡한 UI 구성 |
| Provider | `AppProvider`, `ThemeProvider`, `AuthProvider` | 다층 Provider 계층 |
| Barrel Export | 모든 `entities/*/index.ts` | 내부 구조 캡슐화, import 경로 단순화 |
| Custom Hook | `shared/hooks/`, `features/*/hooks/` | 로직 재사용 (15개 이상) |

### API 통신 패턴

| 패턴 | 적용 위치 | 설명 |
|------|---------|------|
| API Client 싱글턴 | `shared/api/apiClient.ts` | 재시도 로직, 에러 처리 중앙화 |
| 지수 백오프 재시도 | `ApiClient.callApi()` | 최대 3회, 1초 → 2초 → 4초 |
| Health Check Polling | `waitForBackendReady()` | 최대 30회, 2초 간격 |
| 엔티티별 API 클래스 | `entities/*/api/*Api.ts` | 도메인별 API 캡슐화 |

### 성능 패턴

| 패턴 | 적용 위치 | 설명 |
|------|---------|------|
| Code Splitting | Admin `lazy()`, 페이지 `lazy()` | 초기 번들 최소화 |
| Suspense | 모든 lazy 로드 경로 | 로딩 UI 표시 |
| 선택적 데이터 로딩 | `AppProvider` `enabled: !isHomePage` | 홈페이지에서 API 호출 지연 |
| 캐시 Persistence | `react-query-persist-client` + localStorage | 24시간 클라이언트 캐시 |
| 리소스 프리로딩 | `resourcePreloader` | 이스터에그 이미지/오디오 백그라운드 로드 |

### 타입 관리 전략

| 레벨 | 파일 위치 | 용도 |
|------|---------|------|
| Global | `shared/types/` | API 응답, 공통 인터페이스 |
| Entity | `entities/*/model/*.types.ts` | 비즈니스 도메인 모델 |
| Feature | `features/*/types.ts` | 기능 전용 타입 |
| Component | 컴포넌트 파일 내 | Props 인터페이스 |

### UI 인프라

| 패턴 | 적용 위치 | 설명 |
|------|---------|------|
| CSS Variables | `design-system/styles/variables.css` | 테마별 색상, 간격, 타이포그래피 |
| CSS Modules | `*.module.css` 전체 | 컴포넌트 스코프 스타일링 |
| Tailwind | `tailwind.config.js` | 유틸리티 클래스 보조 |
| Storybook | `.storybook/` | 컴포넌트 문서화/테스트 |

---

## 패턴 적용 현황 요약

### 잘 적용된 패턴
- Hexagonal Architecture (Port/Adapter)
- FSD (Feature-Sliced Design)
- React Query 서버 상태 관리
- 생성자 주입 (DI)
- Mapper/DTO 변환 레이어
- Code Splitting + Suspense
- 디자인 시스템 체계화

### 개선 필요 패턴
- ErrorBoundary: 구현은 있으나 실제 활용 부족
- GlobalExceptionHandler: 3개 핸들러만 정의
- 도메인 예외: `LLMException` 하나만 존재, 도메인별 예외 부족
- Container/Presentational: 명시적 분리 없음 (커스텀 훅으로 대체)

### 미적용 (향후 고려)
- Domain Event / Event Sourcing
- CQRS (읽기/쓰기 분리)
- `@Async` 비동기 처리
