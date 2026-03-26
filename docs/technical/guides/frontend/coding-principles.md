# 프론트엔드 코딩 원칙

이 프로젝트의 React + TypeScript + FSD 아키텍처 기반 프론트엔드에서
좋은 코드를 작성하기 위한 원칙과 노하우를 정리한다.

---

## 1. FSD 레이어 규칙

### 의존성 방향은 항상 아래로

```
app → pages → widgets → features → entities → shared
(위)                                          (아래)
```

- 위 레이어는 아래 레이어를 import할 수 있다
- 같은 레이어 간 import는 **금지**
- 아래 레이어가 위 레이어를 import하면 **순환 의존성**

### 위반 징후 체크리스트

- [ ] `entities/`에서 `features/`를 import하는가?
- [ ] `shared/`에서 `entities/`를 import하는가?
- [ ] `features/A/`에서 `features/B/`를 import하는가?
- [ ] 페이지 컴포넌트에 비즈니스 로직이 200라인 이상인가?

### 각 레이어의 책임

| 레이어 | 무엇을 하는가 | 무엇을 하지 않는가 |
|--------|-------------|----------------|
| **pages** | 데이터 페칭, 레이아웃 결정, 컴포넌트 조합 | 비즈니스 로직, 재사용 가능한 UI |
| **widgets** | 독립적인 UI 블록 렌더링 | API 호출, 전역 상태 변경 |
| **features** | 사용자 상호작용 로직 캡슐화 | 다른 feature에 의존 |
| **entities** | 도메인 모델 타입, API 호출, 쿼리 훅 | UI 렌더링 (display 컴포넌트 제외) |
| **shared** | 전역 유틸, 훅, 기본 UI, API 클라이언트 | 비즈니스 도메인 지식 |

---

## 2. 컴포넌트 설계

### 페이지 컴포넌트는 조합 역할만

```tsx
// 좋은 예: 페이지는 조합만 담당
const ProjectDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data: project } = useProjectQuery(id);

  return (
    <div>
      <ProjectDetailHeader project={project} />
      <ProjectDetailTOC containerRef={contentRef} />
      <ProjectContent project={project} />
      <ProjectNavigation project={project} />
    </div>
  );
};

// 나쁜 예: 페이지에 비즈니스 로직이 들어감 (560라인)
const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  // ... 300라인의 상태 관리, 이벤트 핸들러, useEffect ...
  return <div>{/* 200라인의 JSX */}</div>;
};
```

**기준**: 페이지 컴포넌트는 200라인을 넘기지 않는다.
넘기면 로직을 커스텀 훅이나 하위 컴포넌트로 추출한다.

### 컴포넌트 분리 기준

```
1. 독립적으로 테스트할 수 있는가? → 분리
2. 다른 곳에서 재사용될 수 있는가? → 분리
3. 200라인을 넘는가? → 분리
4. 단 한 곳에서만 쓰이고 50라인 이하인가? → 분리하지 않아도 됨
```

---

## 3. 커스텀 훅 설계

### 단일 책임

```tsx
// 좋은 예: 하나의 관심사만 다룸
function useScrollProgress(containerRef: RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => { /* ... */ };
    const el = containerRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  return progress;
}

// 나쁜 예: 여러 관심사가 혼재
function useChatEverything() {
  // 메시지 상태 + 스크롤 + 사용량 조회 + 이스터에그 + ...
}
```

### 훅 네이밍 규칙

| 접두사 | 용도 | 예시 |
|--------|------|------|
| `use{Entity}Query` | React Query 데이터 페칭 | `useProjectsQuery`, `useArticleQuery` |
| `use{Action}Mutation` | React Query 데이터 변경 | `useCreateProjectMutation` |
| `use{Feature}` | 기능 로직 캡슐화 | `useChatMessages`, `useEasterEggTrigger` |
| `use{UI관심사}` | UI 상태/동작 | `useScrollProgress`, `useDebounce`, `useResponsive` |

### 정리(cleanup) 필수

```tsx
// 반드시 cleanup을 반환
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);

  return () => window.removeEventListener('resize', handler);  // 필수
}, []);

// setTimeout/setInterval도 마찬가지
useEffect(() => {
  const timer = setTimeout(() => { /* ... */ }, 1000);
  return () => clearTimeout(timer);
}, [dependency]);
```

---

## 4. 상태 관리 선택 기준

### 어떤 도구를 쓸 것인가

```
서버에서 오는 데이터인가?
  └─ Yes → React Query
  └─ No → 여러 컴포넌트가 공유하는가?
           └─ Yes → Context API (또는 Zustand)
           └─ No → useState
```

### React Query 패턴

```tsx
// 쿼리 키는 계층화
export const PROJECT_QUERY_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_QUERY_KEYS.all, 'list'] as const,
  detail: (id: string) => [...PROJECT_QUERY_KEYS.all, 'detail', id] as const,
};

// 쿼리 훅은 entities 레이어에
export function useProjectsQuery(filter?: ProjectFilter, options?: {}) {
  return useQuery({
    queryKey: PROJECT_QUERY_KEYS.lists(),
    queryFn: () => projectApi.getProjects(filter),
    staleTime: 5 * 60 * 1000,  // 5분
    ...options,
  });
}
```

**원칙:**
- `queryKey`는 반드시 계층 구조를 사용
- `staleTime`은 데이터 특성에 맞게 설정
- 뮤테이션 후 관련 쿼리 invalidate

### Context 사용 원칙

```tsx
// Context는 Provider + Hook 패턴으로 구성
const ThemeContext = createContext<ThemeValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
```

**원칙:**
- Provider 없이 Hook을 쓰면 에러를 던진다 (개발 시 빠른 발견)
- `value`는 `useMemo`로 감싸서 불필요한 리렌더 방지

---

## 5. API 통신 원칙

### 중앙화된 API 클라이언트

```tsx
// shared/api/apiClient.ts에서 공통 로직 처리
// - baseURL 관리
// - 인증 헤더 주입
// - 재시도 로직 (지수 백오프)
// - 에러 변환

// entities에서 도메인별 API 클래스 정의
class ProjectApi {
  async getProjects(): Promise<Project[]> {
    return apiClient.callApi<Project[]>('/api/projects');
  }
}
export const projectApi = new ProjectApi();
```

### 에러 처리 전략

```
API 에러 → apiClient에서 1차 처리 (재시도, 로깅)
         → React Query의 onError에서 2차 처리 (사용자 알림)
         → ErrorBoundary에서 최종 처리 (예기치 못한 에러)
```

**원칙:**
- 비즈니스 에러(Rate Limit, 유효성 실패)는 정상 응답으로 처리
- 네트워크 에러, 5xx는 재시도
- 4xx는 재시도하지 않음

---

## 6. 타입 관리

### 단일 진실 소스

```tsx
// 좋은 예: 한 곳에만 정의, 나머지는 import
// entities/project/model/project.types.ts
export interface Project { /* ... */ }

// 다른 곳에서
import { Project } from '@/main/entities/project';

// 나쁜 예: 같은 타입을 두 곳에서 정의
// apiClient.ts에도 ResponseType, types.ts에도 ResponseType
```

### 타입 위치 규칙

| 타입 종류 | 위치 | 이유 |
|---------|------|------|
| 도메인 모델 | `entities/*/model/*.types.ts` | 비즈니스 로직과 함께 |
| API 응답/요청 | `entities/*/api/` 또는 `shared/types/` | API 스펙에 종속 |
| 컴포넌트 Props | 컴포넌트 파일 내 | 컴포넌트와 함께 이동 |
| 유틸 타입 | `shared/types/` | 전역 재사용 |

### Barrel Export 규칙

```tsx
// entities/project/index.ts
export type { Project, ProjectFilter } from './model/project.types';
export { projectApi } from './api/projectApi';
export { useProjectsQuery } from './api/useProjectQuery';
// 내부 구조는 외부에 노출하지 않는다
```

---

## 7. 성능 최적화

### Code Splitting 기준

```
항상 즉시 필요한가?
  └─ Yes → 번들에 포함
  └─ No → lazy() + Suspense
```

| 대상 | 전략 | 이유 |
|------|------|------|
| 홈페이지 | 번들 포함 | 첫 진입점, 항상 필요 |
| 다른 페이지 | `lazy()` | 라우트 변경 시만 |
| Admin 앱 | `lazy()` | 관리자만 접근 |
| 무거운 라이브러리 | 동적 `import()` | 특정 페이지에서만 사용 시 |

### 불필요한 데이터 로딩 방지

```tsx
// 좋은 예: 필요한 페이지에서만 로드
const ProfilePage: React.FC = () => {
  const { data: experiences } = useExperiencesQuery();  // 이 페이지에서만
  // ...
};

// 나쁜 예: 모든 페이지에서 선제 로딩
const AppProvider = () => {
  // /chat 페이지에서도 experiences를 로딩...
  const { data: experiences } = useExperiencesQuery();
};
```

### 리렌더 최적화

```tsx
// Context value는 useMemo로 감싼다
const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

// 무거운 계산은 useMemo
const filteredProjects = useMemo(
  () => projects.filter(p => filter.matches(p)),
  [projects, filter]
);

// 이벤트 핸들러는 useCallback (리스트 아이템에 전달 시)
const handleClick = useCallback((id: string) => {
  navigate(`/projects/${id}`);
}, [navigate]);
```

---

## 8. 스타일링 원칙

### CSS Modules + CSS Variables

```css
/* 컴포넌트.module.css */
.container {
  background: var(--color-background);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

/* 테마 변경은 CSS Variables만으로 */
.dark {
  --color-background: #1a1a1a;
}
```

**원칙:**
- 하드코딩된 색상/간격 금지 → CSS Variables 사용
- 컴포넌트 스코프 스타일은 CSS Modules (`.module.css`)
- 전역 스타일은 `design-system/styles/` 에서만 정의
- Tailwind는 보조적으로만 사용 (레이아웃 유틸리티)

### 반응형 설계

```tsx
// 훅으로 브레이크포인트 관리
const { isMobile, isTablet, isDesktop } = useResponsive();

// CSS에서는 미디어 쿼리
@media (max-width: 768px) {
  .container { flex-direction: column; }
}
```

---

## 9. 에러 처리 계층

### 3단계 에러 처리

```
1단계: API Client     → 네트워크 에러 재시도, 로깅
2단계: React Query    → onError 콜백에서 토스트/알림
3단계: ErrorBoundary  → 예기치 못한 런타임 에러 포착
```

### ErrorBoundary 적용 범위

```tsx
// 페이지 단위로 감싸기
<ErrorBoundary fallback={<ErrorPage />}>
  <Suspense fallback={<LoadingScreen />}>
    <ProjectDetailPage />
  </Suspense>
</ErrorBoundary>
```

**원칙:**
- 에러가 한 페이지에서 발생해도 앱 전체가 깨지지 않아야 한다
- ErrorBoundary + Suspense는 항상 함께 사용
- 에러 발생 시 "새로고침" 또는 "돌아가기" 옵션 제공

---

## 10. 테스트 작성 기준

### 어디에 테스트를 작성하는가

| 대상 | 도구 | 무엇을 검증하는가 |
|------|------|----------------|
| 커스텀 훅 | Vitest + React Testing Library | 상태 변화, 반환 값 |
| 서비스 클래스 | Vitest | API 호출, 에러 처리 |
| 핵심 유틸 | Vitest | 입출력 정확성 |
| 사용자 시나리오 | Playwright | E2E 흐름 (메시지 전송 → 응답) |

### 테스트 네이밍

```typescript
describe('useChatMessages', () => {
  it('메시지 전송 시 목록에 추가된다', () => { ... });
  it('초기화 시 메시지 목록이 비워진다', () => { ... });
  it('에러 응답 시 에러 메시지가 표시된다', () => { ... });
});
```

---

## 11. 보안 체크리스트

### XSS 방지

- [ ] `dangerouslySetInnerHTML` 사용 시 sanitize 적용했는가?
- [ ] 마크다운 렌더링 시 `rehype-sanitize` 적용했는가?
- [ ] 사용자 입력을 URL에 직접 삽입하지 않는가?

### 인증 토큰

- [ ] 토큰을 localStorage에 저장하지 않는가? (httpOnly cookie 권장)
- [ ] API 요청에 인증 헤더가 자동 주입되는가?

### 의존성

- [ ] `npm audit`로 취약점이 없는가?
- [ ] 사용하지 않는 의존성이 `package.json`에 남아있지 않는가?
- [ ] `dependencies`에 서버 전용 패키지가 섞여있지 않는가?
