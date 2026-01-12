# [FEATURE] 구조 개선: 페이지 라이프사이클 통일 및 main/ 통합

**에픽**: [프론트엔드 구조 최적화](../../epic/frontend-structure-optimization.md)

## 제안 배경

Phase 6 완료 후, 루트 레벨에서 개발 중인 파일들을 `main/` 구조로 통합하고, 페이지별 공통 로직을 일관되게 관리하기 위한 구조 개선 작업입니다.

**현재 상황**:
- Phase 6 진행 중 (Profile, Chat 페이지 개발)
- 공통 인프라 구축 완료 (`usePageLifecycle`, `pageConfig`)
- 루트 레벨 파일들이 `main/`으로 통합 예정
- 페이지별 스크롤 관리 로직이 일관되지 않음

**목표**:
- 모든 페이지가 동일한 라이프사이클 패턴 사용
- 공통 로직 재사용으로 코드 중복 제거
- `main/` 구조로의 통합 준비 완료
- 유지보수성 및 확장성 향상

## 요구사항

### 필수

1. **루트 레벨 페이지에 공통 훅 적용**
   - ChatPage: `usePageLifecycle` 적용하여 스크롤 로직 단순화
   - HomePage: 스크롤 관리 통일
   - ProjectsListPage: 페이지 라이프사이클 훅 적용
   - ProfilePage: 훅 적용 (이미 `main/entities` 의존)
   - ProjectDetailPage: 훅 적용 (이미 `main/entities` 의존)

2. **상태 관리 분리**
   - `DataProvider` 생성: 데이터 상태만 관리
   - `UIProvider` 생성: UI 상태만 관리
   - 기존 `AppProvider` 리팩토링

3. **MainApp 단순화**
   - 전역 로직을 별도 Provider로 분리
   - MainApp은 라우팅만 담당
   - 각 Provider의 책임 명확화

4. **루트 레벨 파일들을 main/으로 통합**
   - 공통 인프라: `shared/hooks/` → `main/shared/hooks/`
   - 공통 설정: `app/config/` → `main/app/config/`
   - 페이지: `pages/` → `main/pages/`
   - 기능: `features/` → `main/features/` (중복 제거)
   - 엔티티: `entities/` → `main/entities/` (중복 제거)
   - 공유 코드: `shared/` → `main/shared/` (중복 제거)

5. **import 경로 수정**
   - 루트 레벨 import → `main/` 내부 import로 변경
   - TypeScript path alias 업데이트
   - 모든 파일의 import 경로 일괄 수정

### 선택

- `useScrollRestoration` 훅 추가 (필요 시)
- 마이그레이션 스크립트 작성 (자동화)
- Storybook 문서 업데이트

## 대안 비교

### A안: 단계적 적용 (권장) ✅
- **방식**: 페이지별로 순차적으로 훅 적용 후 통합
- **장점**:
  - 각 단계에서 동작 확인 가능
  - 리스크 분산
  - Phase 6와 병행 가능
- **단점**: 시간이 다소 소요됨

### B안: 일괄 적용
- **방식**: 모든 페이지에 동시 적용 후 통합
- **장점**: 빠른 완료
- **단점**: 높은 리스크, 디버깅 어려움

**선택 이유**: A안 선택. Phase 6 완료 후 안정적으로 진행 가능하며, 각 단계에서 검증 가능.

## 설계 메모

### 페이지 라이프사이클 훅 사용 예시

```typescript
// ChatPage.tsx
import { usePageLifecycle } from '@/shared/hooks';
import { getPageConfig } from '@/app/config/pageConfig';

const ChatPage = () => {
  const location = useLocation();
  const config = getPageConfig(location.pathname);
  
  usePageLifecycle({
    ...config,
    onMount: () => {
      // 챗봇 특화 초기화
      restoreChatHistory();
    },
  });
  
  // 페이지 로직...
};
```

### 상태 관리 분리 구조

```typescript
// main/app/providers/DataProvider.tsx
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

// main/app/providers/UIProvider.tsx
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

### 통합 순서

1. **공통 인프라 먼저 이동** (의존성 최소)
   - `shared/hooks/usePageLifecycle.ts` → `main/shared/hooks/`
   - `app/config/pageConfig.ts` → `main/app/config/`

2. **페이지 이동** (의존성 확인 후)
   - `pages/ChatPage/` → `main/pages/ChatPage/`
   - `pages/HomePage/` → `main/pages/HomePage/`
   - `pages/ProfilePage/` → `main/pages/ProfilePage/`
   - `pages/ProjectsListPage/` → `main/pages/ProjectsListPage/`
   - `pages/ProjectDetailPage/` → `main/pages/ProjectDetailPage/`

3. **기능 및 엔티티 통합** (중복 제거)
   - `features/` → `main/features/` (중복 확인 및 제거)
   - `entities/` → `main/entities/` (중복 확인 및 제거)
   - `shared/` → `main/shared/` (앱 전용만)

## 완료 기준

### Phase 2: 루트 레벨 페이지에 공통 훅 적용
- [ ] ChatPage에 `usePageLifecycle` 적용 완료
- [ ] HomePage 스크롤 관리 통일 완료
- [ ] ProjectsListPage에 훅 적용 완료
- [ ] ProfilePage에 훅 적용 완료
- [ ] ProjectDetailPage에 훅 적용 완료
- [ ] 모든 페이지에서 중복 스크롤 로직 제거
- [ ] 페이지 전환 시 일관된 동작 확인

### Phase 4: 상태 관리 분리
- [ ] `DataProvider` 생성 및 적용 완료
- [ ] `UIProvider` 생성 및 적용 완료
- [ ] 기존 `AppProvider` 리팩토링 완료
- [ ] 모든 컴포넌트에서 새 Provider 사용 확인

### Phase 5: MainApp 단순화
- [ ] 전역 로직을 별도 Provider로 분리 완료
- [ ] MainApp이 라우팅만 담당하도록 단순화
- [ ] 각 Provider의 책임 명확화 완료

### Phase 6: 루트 레벨 파일들을 main/으로 통합
- [ ] 공통 인프라 이동 완료 (`shared/` → `main/shared/`)
- [ ] 모든 페이지 이동 완료 (`pages/` → `main/pages/`)
- [ ] 기능 및 엔티티 통합 완료 (`features/`, `entities/` → `main/`)
- [ ] 중복 파일 제거 완료
- [ ] 모든 import 경로 수정 완료
- [ ] TypeScript 컴파일 에러 0개
- [ ] 빌드 성공 확인

### Phase 7: 루트 레벨 정리
- [ ] 루트 레벨의 빈 디렉토리 제거 완료
- [ ] 모든 import 경로 `main/` 기준으로 통일 완료
- [ ] 문서화 완료
- [ ] 통합 완료 확인

### 전체 검증
- [ ] 모든 페이지 정상 렌더링
- [ ] 페이지 전환 애니메이션 정상 작동
- [ ] 스크롤 관리 정상 작동
- [ ] 개발 서버 정상 실행
- [ ] 프로덕션 빌드 성공

---

**작성일**: 2026-01-07  
**작성자**: AI Agent  
**우선순위**: Medium  
**예상 시작 시점**: Phase 6 완료 후  
**예상 소요 시간**: 10-15일  
**참고 문서**: 
- [구조 분석 및 개선 방안](../../technical/architecture/structure-analysis-and-improvements.md)
- [Phase 6 설계 문서](../../epic/portfolio-renewal-refactor/phase-6-design.md)
