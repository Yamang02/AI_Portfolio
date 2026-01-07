# 전체 구조 분석 및 개선 방안

## 📋 목차
1. [현재 구조 분석](#현재-구조-분석)
2. [주요 문제점](#주요-문제점)
3. [개선 방안](#개선-방안)
4. [구현 계획](#구현-계획)
5. [마이그레이션 전략](#마이그레이션-전략)

---

## 현재 구조 분석

### 1. 디렉토리 구조

#### 현재 상태: 개발 중인 구조와 최종 구조
```
frontend/src/
├── main/              # 최종 구조 (목표)
│   ├── app/           # AppProvider, MainApp (최종)
│   ├── pages/         # 레거시 페이지들 (대체 예정)
│   ├── features/      # 기능들
│   ├── entities/      # 엔티티들 (최종)
│   └── shared/        # 공통 코드 (최종)
│
├── pages/             # 개발 중인 페이지들 (→ main/pages로 이동 예정)
│   ├── HomePage/
│   ├── ProfilePage/   # main/entities 의존 중
│   ├── ProjectDetailPage/  # main/entities 의존 중
│   ├── ProjectsListPage/
│   └── ChatPage/
│
├── features/          # 개발 중인 기능들 (→ main/features로 이동 예정)
├── entities/          # 개발 중인 엔티티들 (→ main/entities로 이동 예정)
└── shared/            # 개발 중인 공통 코드 (→ main/shared로 이동 예정)
```

**현재 상황**: 
- `main/` = 최종 구조 (목표)
- 루트 레벨 = 임시 개발 공간
- `main/app/MainApp.tsx`가 이미 루트 레벨 페이지들을 import 중
- 루트 레벨 파일들이 완성되면 `main/`으로 통합 예정
- 일부 페이지가 `main/entities`에 의존 중 (의도된 구조)

### 2. 상태 관리 구조

#### AppProvider의 책임 과다
```typescript
// 현재: 데이터 상태 + UI 상태 혼재
interface AppContextValue {
  // 데이터 상태
  projects: Project[];
  experiences: Experience[];
  // ...
  
  // UI 상태 (혼재)
  isChatbotOpen: boolean;
  isHistoryPanelOpen: boolean;
  isWideScreen: boolean;
}
```

**문제**: 
- 데이터 상태와 UI 상태가 섞여있음
- 전역 상태가 필요한지 불명확한 UI 상태들
- 페이지별 상태 관리가 일관되지 않음

### 3. 페이지별 로직 분산

#### 스크롤 관리가 각 페이지마다 다름
- **HomePage**: `window.__homeScrollPosition` 전역 변수 사용
- **ChatPage**: localStorage 사용 + 복잡한 복원 로직
- **ProjectDetailPage**: 단순히 `window.scrollTo(0, 0)`
- **ProfilePage**: 스크롤 관리 없음

**문제**: 공통 로직이 각 페이지에 중복 구현됨

### 4. MainApp의 책임 과다

```typescript
// MainApp에 모든 것이 집중됨
const MainAppContent = () => {
  // 이스터에그 로직
  useEasterEggEscapeKey();
  useKeyboardTrigger(...);
  useScrollTrigger(...);
  
  // 키보드 이벤트 처리
  useEffect(() => { /* ESC 키 처리 */ });
  
  // 스크롤 복원 비활성화
  useEffect(() => { /* scrollRestoration */ });
  
  // 챗봇/히스토리 패널 토글
  const handleChatbotToggle = () => { ... };
  const handleHistoryPanelToggle = () => { ... };
  
  // 로딩 상태 처리
  if (isInitialLoading) { ... }
  
  // 레이아웃 렌더링
  return <PageLayout>...</PageLayout>;
};
```

**문제**: 
- 단일 책임 원칙 위반
- 테스트 어려움
- 재사용 불가능

### 5. 페이지 전환 로직

#### AnimatedRoutes의 복잡성
- 애니메이션 관리
- 스크롤 정책 관리
- 높이 추적 (제거됨)
- 페이지별 예외 처리

**문제**: 여러 책임이 하나의 컴포넌트에 집중

---

## 주요 문제점

### 1. **책임 분리 부족**
- 공통 로직과 페이지별 로직이 혼재
- 단일 컴포넌트에 여러 책임 집중
- 상태 관리가 일관되지 않음

### 2. **코드 중복**
- 스크롤 관리 로직이 각 페이지마다 다름
- 초기화 로직이 분산됨
- 유사한 패턴이 반복됨

### 3. **의존성 혼란**
- `main/`과 루트 레벨의 중복 구조
- import 경로가 일관되지 않음
- 순환 의존성 가능성

### 4. **확장성 부족**
- 새로운 페이지 추가 시 일관성 유지 어려움
- 공통 로직 재사용 어려움
- 테스트 작성 어려움

---

## 개선 방안

### 1. 페이지 라이프사이클 훅 패턴 도입 ✅ (구현 완료)

**구현 위치**: 
- 현재: `frontend/src/shared/hooks/usePageLifecycle.ts` (루트 레벨)
- 통합 후: `frontend/src/main/shared/hooks/usePageLifecycle.ts` (최종)

**주요 기능**:
- 스크롤 정책 관리 (`window`, `internal`, `preserve`, `top`)
- 스크롤 위치 저장/복원
- 페이지 마운트/언마운트 콜백 지원

**사용 예시**:
```typescript
// HomePage.tsx - 스크롤 위치 보존
import { usePageLifecycle } from '@/shared/hooks';

const HomePage = () => {
  usePageLifecycle({
    scrollPolicy: 'preserve',
    restoreScroll: true,
    pageKey: 'home',
  });
  
  // 페이지별 로직만 집중
  return <div>...</div>;
};

// ChatPage.tsx - 내부 스크롤 + 특화 초기화
const ChatPage = () => {
  usePageLifecycle({
    scrollPolicy: 'internal',
    onMount: () => {
      // 챗봇 특화 초기화
      restoreChatHistory();
      return () => {
        // 정리 로직
      };
    },
  });
  
  return <div>...</div>;
};

// ProfilePage.tsx - 기본 (상단으로 스크롤)
const ProfilePage = () => {
  usePageLifecycle({ scrollPolicy: 'top' });
  
  return <div>...</div>;
};
```

### 2. 상태 관리 분리

```typescript
// app/providers/DataProvider.tsx - 데이터 상태만
export const DataProvider = ({ children }) => {
  const projects = useProjectsQuery();
  const experiences = useExperiencesQuery();
  // ...
  
  return (
    <DataContext.Provider value={{ projects, experiences, ... }}>
      {children}
    </DataContext.Provider>
  );
};

// app/providers/UIProvider.tsx - UI 상태만
export const UIProvider = ({ children }) => {
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  // ...
  
  return (
    <UIContext.Provider value={{ isChatbotOpen, setChatbotOpen, ... }}>
      {children}
    </UIContext.Provider>
  );
};
```

### 3. 페이지별 설정 중앙화 ✅ (구현 완료)

**구현 위치**: 
- 현재: `frontend/src/app/config/pageConfig.ts` (루트 레벨)
- 통합 후: `frontend/src/main/app/config/pageConfig.ts` (최종)

**주요 기능**:
- 모든 페이지 설정을 한 곳에서 관리
- `getPageConfig()` 함수로 경로별 설정 조회
- 동적 경로 지원 (`/projects/:id`)

**현재 설정**:
```typescript
export const PAGE_CONFIG = {
  '/': {
    scrollPolicy: 'preserve',
    restoreScroll: true,
    showFooter: true,
    pageKey: 'home',
  },
  '/chat': {
    scrollPolicy: 'internal',
    restoreScroll: false,
    showFooter: false,
    pageKey: 'chat',
  },
  '/profile': {
    scrollPolicy: 'top',
    restoreScroll: false,
    showFooter: true,
    pageKey: 'profile',
  },
  // ...
} as const;
```

**사용 예시**:
```typescript
import { getPageConfig } from '@/app/config/pageConfig';
import { usePageLifecycle } from '@/shared/hooks';

const SomePage = () => {
  const location = useLocation();
  const config = getPageConfig(location.pathname);
  
  usePageLifecycle(config);
  
  return <div>...</div>;
};
```

### 4. 공통 로직 추출

```typescript
// shared/hooks/useScrollRestoration.ts
export const useScrollRestoration = (pageKey: string) => {
  const location = useLocation();
  
  useEffect(() => {
    // 스크롤 위치 저장
    const scrollY = window.scrollY;
    sessionStorage.setItem(`scroll_${pageKey}`, scrollY.toString());
    
    return () => {
      // 복원 로직
      const saved = sessionStorage.getItem(`scroll_${pageKey}`);
      if (saved) {
        window.scrollTo({ top: parseInt(saved, 10), behavior: 'auto' });
      }
    };
  }, [location.pathname]);
};
```

### 5. MainApp 단순화

```typescript
// app/MainApp.tsx - 단순화된 버전
const MainAppContent = () => {
  return (
    <PageLayout>
      <AnimatedRoutes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
        {/* ... */}
      </AnimatedRoutes>
    </PageLayout>
  );
};

// app/providers/GlobalProviders.tsx - 전역 로직 분리
export const GlobalProviders = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <UIProvider>
          <EasterEggProvider>
            <KeyboardShortcutsProvider>
              {children}
            </KeyboardShortcutsProvider>
          </EasterEggProvider>
        </UIProvider>
      </DataProvider>
    </QueryClientProvider>
  );
};
```

---

## 구현 계획

### Phase 1: 공통 인프라 구축 ✅ (완료)
1. ✅ `usePageLifecycle` 훅 생성 (`frontend/src/shared/hooks/usePageLifecycle.ts`)
2. ✅ 페이지별 설정 파일 생성 (`frontend/src/app/config/pageConfig.ts`)
3. ✅ 문서화 완료

**완료일**: 2026-01-07  
**상태**: Phase 6 진행 중이므로 Step 3까지만 완료, 이후 작업은 Phase 6 완료 후 진행 예정

### Phase 2: 루트 레벨 페이지에 공통 훅 적용 ⏳ (Phase 6 완료 후)
1. ChatPage에 `usePageLifecycle` 적용
2. HomePage에 스크롤 관리 통일
3. ProjectsListPage에 페이지 라이프사이클 훅 적용
4. ProfilePage에 훅 적용 (이미 `main/entities` 의존)
5. ProjectDetailPage에 훅 적용 (이미 `main/entities` 의존)

### Phase 3: 통합 준비 ✅ (완료)
1. ✅ 루트 레벨 파일들이 `main/` 구조와 호환되도록 정리
2. ✅ import 경로를 `main/` 기준으로 변경 가능하도록 준비
3. ✅ 중복 코드 제거 및 통합 계획 수립

**현재 상태**: Phase 6 진행 중이므로 여기까지 완료. 이후 작업은 Phase 6 완료 후 진행 예정.

---

## Phase 6 완료 후 진행할 작업

다음 작업들은 Phase 6 완료 후 백로그에서 진행할 예정입니다.

### Phase 4: 상태 관리 분리 (백로그)
- `DataProvider` 분리
- `UIProvider` 분리
- 기존 `AppProvider` 리팩토링

### Phase 5: MainApp 단순화 (백로그)
- 전역 로직을 별도 Provider로 분리
- MainApp은 라우팅만 담당
- 각 Provider의 책임 명확화

### Phase 6: 루트 레벨 파일들을 main/으로 통합 (백로그)
- 공통 인프라 이동 (`shared/` → `main/shared/`)
- 페이지 이동 (`pages/` → `main/pages/`)
- 기능 및 엔티티 이동 (`features/`, `entities/` → `main/`)
- import 경로 수정

### Phase 7: 루트 레벨 정리 (백로그)
- 루트 레벨의 빈 디렉토리 제거
- 모든 import 경로 `main/` 기준으로 통일
- 문서화 및 통합 완료 확인

---

## 예상 효과

### 1. 코드 일관성
- 모든 페이지가 동일한 패턴 사용
- 공통 로직 재사용
- 유지보수 용이

### 2. 확장성
- 새로운 페이지 추가 시 설정만 추가
- 공통 로직 변경 시 한 곳만 수정
- 테스트 작성 용이

### 3. 가독성
- 각 컴포넌트의 책임 명확
- 복잡한 로직이 훅으로 추상화
- 코드 이해 용이

### 4. 유지보수성
- 버그 수정 시 영향 범위 최소화
- 리팩토링 용이
- 문서화 용이

---

## 마이그레이션 전략

### 현재 의존성 상태

#### `main/` 구조 의존 중인 페이지 (의도된 구조) ✅
- **ProfilePage**: `main/entities/experience`, `main/entities/education` ✅
- **ProjectDetailPage**: `main/entities/project` ✅
- **MainApp**: 루트 레벨 `pages/` import 중 ✅

#### 루트 레벨에서 독립적으로 개발 중
- **ProjectsListPage**: `@/entities/project` 사용 (나중에 `main/entities`로 통합)
- **ChatPage**: 독립적 (나중에 `main/pages`로 이동)
- **HomePage**: 독립적 (나중에 `main/pages`로 이동)

### 통합 전략

#### Step 1: 공통 인프라 구축 ✅ (완료)
- ✅ `usePageLifecycle` 훅 생성 (`shared/hooks/`)
- ✅ `pageConfig.ts` 생성 (`app/config/`)
- **목적**: 루트 레벨에서 개발, 나중에 `main/`으로 이동

#### Step 2: 루트 레벨 페이지에 공통 훅 적용 ⏳ (Phase 6 완료 후)
- ChatPage: 페이지 라이프사이클 훅 적용
- HomePage: 스크롤 관리 통일
- ProjectsListPage: 페이지 라이프사이클 훅 적용
- ProfilePage: 훅 적용 (이미 `main/entities` 의존)
- ProjectDetailPage: 훅 적용 (이미 `main/entities` 의존)

#### Step 3: 통합 준비 ✅ (완료)
- ✅ 루트 레벨 파일들이 `main/` 구조와 호환되도록 정리
- ✅ import 경로를 `main/` 기준으로 변경 가능하도록 준비
- ✅ 중복 코드 제거 및 통합 계획 수립

#### Step 4: `main/`으로 통합 ⏳ (Phase 6 완료 후)
- 공통 인프라: `shared/` → `main/shared/`
- 페이지: `pages/` → `main/pages/`
- 기능: `features/` → `main/features/` (중복 제거)
- 엔티티: `entities/` → `main/entities/` (중복 제거)
- import 경로 수정: 루트 레벨 → `main/` 내부

#### Step 5: 루트 레벨 정리 ⏳ (Phase 6 완료 후)
- 빈 디렉토리 제거
- 모든 코드가 `main/` 구조로 통합 완료

---

## 현재 상태 및 다음 단계

### ✅ 완료된 작업 (Step 1-3)

1. ✅ **공통 인프라 구축**: `usePageLifecycle` 훅 및 `pageConfig` 생성 완료
2. ✅ **통합 준비**: 루트 레벨 파일들이 `main/` 구조와 호환되도록 정리 완료
3. ✅ **문서화**: 구조 분석 및 개선 방안 문서 작성 완료

### ⏳ Phase 6 완료 후 진행할 작업

**백로그 위치**: `docs/backlog/features/structure-improvement-after-phase6.md`

**주요 작업**:
1. 루트 레벨 페이지에 공통 훅 적용
2. 상태 관리 분리 (DataProvider, UIProvider)
3. MainApp 단순화
4. 루트 레벨 파일들을 `main/`으로 통합
5. 루트 레벨 정리

**예상 시작 시점**: Phase 6 완료 후  
**예상 소요 시간**: 10-15일

### 📝 참고 문서

- [구조 개선 백로그](../../backlog/features/structure-improvement-after-phase6.md)
- [Phase 6 설계 문서](../../epic/portfolio-renewal-refactor/phase-6-design.md)
- [Phase 6 체크리스트](../../epic/portfolio-renewal-refactor/phase-6-checklist.md)
