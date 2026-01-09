# Phase 7 — Cleanup & System Consolidation

## 개요

리뉴얼의 마지막 단계로, 프로젝트 전체의 기술 부채를 정리하고 디자인 시스템을 최종 정비합니다.

### 목표

```text
- frontend/src를 admin, design-system, main 3개 폴더로 구조 통합
- 미사용 컴포넌트 및 코드 제거
- 중복 컴포넌트 통합
- 디자인 시스템 정리 및 일관성 확보
- 컬러 시스템 하드코딩 제거
- 스토리북 정리
- Phase 6 남은 작업 완료
```

### 비범위

```text
- 새로운 기능 추가
- 브랜딩 변경
- 디자인 시스템 외 UI 추가
```

---

## 현황 분석

### 0. 폴더 구조 현황 (핵심)

#### 현재 구조 (문제점)

```
frontend/src/
├── admin/              # Admin 앱 ✅ 유지
├── app/                # ❌ 중복 - main/app과 역할 중복
│   └── config/
├── design-system/      # 디자인 시스템 ✅ 유지
├── entities/           # ❌ 분산 - main/entities와 중복
├── features/           # ❌ 분산 - 일부는 main으로 통합 필요
│   ├── chatbot/
│   ├── easter-eggs/
│   ├── introduction/
│   └── project-gallery/
├── hooks/              # ❌ 분산 - main/hooks로 통합 필요
├── main/               # Main 앱 ✅ 유지
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── entities/
│   ├── features/
│   ├── hooks/
│   ├── layout/
│   ├── pages/
│   ├── providers/
│   ├── services/
│   └── shared/
├── pages/              # ❌ 분산 - main/pages와 중복
│   ├── ChatPage/
│   ├── HomePage/
│   ├── ProfilePage/
│   ├── ProjectDetailPage/
│   └── ProjectsListPage/
├── shared/             # ❌ 분산 - main/shared로 통합 필요
├── stories/            # 스토리북 에셋 - 검토 필요
├── widgets/            # ❌ 분산 - main/layout으로 통합 필요
│   └── layout/
├── index.css           # → design-system/styles로 이동 검토
└── main.tsx            # 엔트리 포인트 ✅ 유지
```

#### 목표 구조 (3-Folder Architecture)

```
frontend/src/
├── admin/              # 🔵 Admin 앱 (독립)
│   ├── app/
│   ├── components/
│   ├── config/
│   ├── entities/
│   ├── features/
│   ├── hooks/
│   ├── pages/
│   ├── shared/
│   └── widgets/
│
├── design-system/      # 🟢 디자인 시스템 (공유)
│   ├── components/
│   ├── providers/
│   ├── styles/
│   └── tokens/
│
├── main/               # 🟡 Main 포트폴리오 앱
│   ├── app/            # 앱 설정, 라우터
│   ├── components/     # 재사용 컴포넌트
│   ├── config/         # 설정 파일
│   ├── entities/       # 도메인 엔티티
│   ├── features/       # 기능 모듈 (chatbot, easter-eggs 등)
│   ├── hooks/          # 커스텀 훅
│   ├── layout/         # 레이아웃 (Header, Footer 등)
│   ├── pages/          # 페이지 컴포넌트
│   ├── providers/      # Context Providers
│   ├── services/       # API 서비스
│   └── shared/         # 공유 유틸리티
│
├── stories/            # 📚 스토리북 에셋 (선택)
├── index.css           # 글로벌 CSS (또는 design-system/styles로 이동)
└── main.tsx            # 엔트리 포인트
```

#### 마이그레이션 매핑

| 현재 위치 | 목표 위치 | 조치 |
|-----------|-----------|------|
| `src/app/` | `src/main/app/` | 통합 (중복 확인 후) |
| `src/entities/` | `src/main/entities/` | 통합 (중복 확인 후) |
| `src/features/` | `src/main/features/` | 통합 |
| `src/hooks/` | `src/main/hooks/` | 통합 |
| `src/pages/` | `src/main/pages/` | 통합 |
| `src/shared/` | `src/main/shared/` | 통합 |
| `src/widgets/layout/` | `src/main/layout/` | 통합 |
| `src/index.css` | 유지 또는 `design-system/styles/` | 검토 |

---

### 1. 컴포넌트 구조 현황

#### 디자인 시스템 컴포넌트 (`design-system/components/`)

**현재 등록된 컴포넌트** (19개):
| 컴포넌트 | 스토리북 | 사용 위치 | 상태 |
|----------|----------|-----------|------|
| Button | ✅ | 전역 | 유지 |
| TextLink | ✅ | 전역 | 유지 |
| SectionTitle | ✅ | 전역 | 유지 |
| Divider | ✅ | 전역 | 유지 |
| Badge | ✅ | 프로젝트 상세 | 유지 |
| TeamBadge | ✅ | 프로젝트 카드 | 유지 |
| ProjectTypeBadge | ✅ | 프로젝트 카드 | 유지 |
| DateBadge | ✅ | 프로필 | 유지 |
| RoleBadge | ✅ | 프로필 | 유지 |
| Card | ✅ | 전역 | 유지 |
| ProjectCard | ✅ | 프로젝트 목록 | 유지 |
| EmptyCard | ❌ | 목록 빈 상태 | 유지 |
| Skeleton | ✅ | 로딩 상태 | 유지 |
| SkeletonCard | ❌ | 로딩 상태 | 유지 |
| Spinner | ❌ | 로딩 상태 | 유지 |
| Tooltip | ✅ | 전역 | 유지 |
| Modal | ❌ | 연락처 모달 | 유지 |
| SocialIcon | ✅ | Footer | 유지 |
| ProjectIcon | ✅ | 프로젝트 링크 | 유지 |
| ChatBubble | ✅ | Chat 페이지 | 유지 |
| Input | ❌ | Admin 로그인 | 유지 |
| Text | ❌ | 전역 | 유지 |
| ProjectThumbnailCarousel | ✅ | 프로젝트 상세 | 유지 |
| ProjectDetailHeader | ✅ | 프로젝트 상세 | 유지 |
| TableOfContents | ✅ | 프로젝트 상세 | 유지 |
| ProjectNavigation | ✅ | 프로젝트 상세 | 유지 |

#### 중복/레거시 컴포넌트 (`shared/ui/`)

| 컴포넌트 | 위치 | 중복 여부 | 조치 |
|----------|------|-----------|------|
| SpeedDialFab | `shared/ui/` | ❌ 고유 | 검토 필요 |
| ChatInputBar | `shared/ui/chat/` | ❌ 고유 | 검토 필요 |
| LoadingScreen | `shared/ui/LoadingScreen/` | ⚠️ Spinner와 중복 가능 | 통합 검토 |
| LoadingState | `shared/ui/LoadingState/` | ⚠️ Spinner와 중복 가능 | 통합 검토 |
| MarkdownRenderer | `shared/ui/markdown/` | ❌ 고유 | 유지 |
| ContactModal | `shared/ui/modal/` | ⚠️ Modal 활용 | 검토 필요 |
| SkeletonCard | `shared/ui/skeleton/` | ⚠️ design-system과 중복 | 제거 예정 |
| TechStackBadge | `shared/ui/tech-stack/` | ❌ 고유 | 유지 |
| TechStackList | `shared/ui/tech-stack/` | ❌ 고유 | 유지 |
| Tooltip | `shared/ui/tooltip/` | ⚠️ design-system과 중복 | 제거 예정 |
| DateRangeWithOngoing | `shared/ui/date-range/` | ❌ 고유 | 유지 |
| ProjectIcons | `shared/ui/icon/` | ⚠️ design-system과 중복 | 검토 필요 |

#### features 내 레거시 컴포넌트

| 컴포넌트 | 위치 | 상태 | 조치 |
|----------|------|------|------|
| Chatbot | `features/chatbot/` | Chat 페이지로 이전됨 | 검토 필요 |
| ProjectCard | `features/project-gallery/` | ⚠️ design-system과 중복 | 제거 예정 |
| ProjectFilter | `features/project-gallery/` | ❓ 사용 여부 확인 | 검토 필요 |
| HistoryPanel | `features/project-gallery/` | ❓ 사용 여부 확인 | 검토 필요 |
| PanelToggle | `features/project-gallery/` | ❓ 사용 여부 확인 | 검토 필요 |
| PortfolioSection | `features/project-gallery/` | ❓ 사용 여부 확인 | 검토 필요 |
| ExperienceCard | `features/project-gallery/` | ⚠️ ProfilePage 컴포넌트와 중복 | 검토 필요 |
| EducationCard | `features/project-gallery/` | ⚠️ ProfilePage 컴포넌트와 중복 | 검토 필요 |
| CertificationCard | `features/project-gallery/` | ⚠️ ProfilePage 컴포넌트와 중복 | 검토 필요 |

### 2. 컬러 시스템 현황

#### 하드코딩된 컬러 위치 (HARDCODED_COLORS_REPORT.md 기반)

**우선순위 중간** (수정 필요):
- `shared/ui/tech-stack/TechStackBadge.tsx`: `hover:border-[#7FAF8A]`

**우선순위 낮음** (스토리북 파일):
- `design-system/tokens/Tokens.stories.tsx`: 다수의 하드코딩 컬러
- `design-system/components/Icon/SocialIcon.stories.tsx`: `#666`
- `design-system/components/Icon/ProjectIcon.stories.tsx`: `#666`
- `design-system/components/Card/Card.stories.tsx`: `#666`, `#7FAF8A`
- `design-system/components/Button/Button.stories.tsx`: `#666`, `#f5f5f5`
- `design-system/components/Badge/Badge.stories.tsx`: `#666`

### 3. 스토리북 현황

**스토리 파일** (23개):
- `design-system/tokens/` (3개): AllColors, Colors.mdx, Tokens
- `design-system/components/` (19개): 대부분의 컴포넌트
- `widgets/layout/` (1개): Header

**미작성 스토리**:
- Input, PasswordInput
- EmptyCard
- SkeletonCard
- Spinner
- Modal
- Text

### 4. Phase 6 남은 작업

1. HomePage에서 Chatbot 패널 제거
2. HomePage에서 ChatInputBar를 `/chat` 링크로 변경
3. AppProvider에서 `isChatbotOpen` 상태 제거
4. Footer에 네비게이션 링크 추가
5. Input 컴포넌트 Storybook 작성 (선택)

---

## Task 7.1: Phase 6 남은 작업 완료

### Subtask 7.1.1: HomePage Chatbot 패널 제거

**작업 내용**:
- `HomePage.tsx`에서 Chatbot 컴포넌트 import 및 사용 제거
- `isChatbotOpen` 관련 상태 및 로직 제거
- ChatInputBar 클릭 시 `/chat` 페이지로 이동하도록 변경

**파일**:
- `src/pages/HomePage/HomePage.tsx`
- `src/main/layout/components/` (관련 파일)

### Subtask 7.1.2: AppProvider 상태 정리

**작업 내용**:
- `isChatbotOpen` 상태 제거
- `setChatbotOpen` 함수 제거
- 관련 Context 정리

**파일**:
- `src/main/providers/` 또는 `src/shared/providers/`
- `src/main/app/MainApp.tsx`

### Subtask 7.1.3: Footer 네비게이션 추가

**작업 내용**:
- Footer에 네비게이션 링크 추가
  - Home (/)
  - Profile (/profile)
  - Projects (/projects)
  - Chat (/chat)
- 디자인 시스템 TextLink 컴포넌트 사용

**파일**:
- `src/widgets/layout/Footer/Footer.tsx`
- `src/widgets/layout/Footer/Footer.module.css`

---

## Task 7.2: 중복 컴포넌트 통합 및 제거

### Subtask 7.2.1: shared/ui 중복 컴포넌트 제거

**제거 대상**:
```
src/shared/ui/
├── skeleton/SkeletonCard.tsx  → design-system/components/Skeleton 사용
├── tooltip/Tooltip.tsx        → design-system/components/Tooltip 사용
```

**작업 내용**:
1. 사용처 확인 및 import 경로 변경
2. 중복 파일 삭제
3. shared/ui/index.ts 업데이트

### Subtask 7.2.2: features/project-gallery 레거시 컴포넌트 정리

**검토 대상**:
```
src/features/project-gallery/components/
├── ProjectCard.tsx      # design-system/components/Card/ProjectCard와 중복
├── ExperienceCard.tsx   # ProfilePage 컴포넌트와 중복
├── EducationCard.tsx    # ProfilePage 컴포넌트와 중복
├── CertificationCard.tsx # ProfilePage 컴포넌트와 중복
├── ProjectFilter.tsx    # 사용 여부 확인
├── HistoryPanel.tsx     # 사용 여부 확인
├── PanelToggle.tsx      # 사용 여부 확인
├── PortfolioSection.tsx # 사용 여부 확인
```

**작업 내용**:
1. 각 컴포넌트의 실제 사용 여부 확인 (grep 검색)
2. 미사용 컴포넌트 제거
3. 중복 컴포넌트는 design-system 컴포넌트로 교체

### Subtask 7.2.3: features/chatbot 정리

**검토 대상**:
```
src/features/chatbot/
├── components/
│   ├── Chatbot.tsx      # ChatPage로 이전됨, 사용 여부 확인
│   └── ChatMessage.tsx  # 사용 여부 확인
├── services/
│   └── chatbotService.ts # 유지 (서비스 로직)
├── types.ts              # 유지
└── utils/
    └── questionValidator.ts # 유지
```

**작업 내용**:
1. Chatbot.tsx, ChatMessage.tsx 사용 여부 확인
2. ChatPage에서 직접 구현되었으면 제거
3. 서비스/유틸은 유지

### Subtask 7.2.4: LoadingScreen/LoadingState 통합 검토

**현황**:
- `shared/ui/LoadingScreen/` - 전체 화면 로딩
- `shared/ui/LoadingState/` - 부분 로딩
- `design-system/components/Spinner/` - 스피너

**결정 필요**:
- 세 컴포넌트가 모두 필요한지 검토
- 역할이 명확히 다르면 유지, 중복이면 통합

---

## Task 7.3: 컬러 시스템 정리

### Subtask 7.3.1: 하드코딩 컬러 제거 (우선순위 중간)

**대상 파일**:
- `src/shared/ui/tech-stack/TechStackBadge.tsx`

**작업 내용**:
- `hover:border-[#7FAF8A]` → CSS 변수 또는 Tailwind 설정 사용
- Tailwind 설정에 primary 색상이 정의되어 있으면 `hover:border-primary` 사용

### Subtask 7.3.2: 스토리북 하드코딩 컬러 정리

**대상 파일**:
- `design-system/tokens/Tokens.stories.tsx`
- `design-system/components/*/\*.stories.tsx`

**작업 내용**:
1. 하드코딩된 컬러를 디자인 시스템 토큰으로 교체
2. grayScale, brandScale 등 참조 사용
3. 또는 스토리북 전용 상수로 분리

### Subtask 7.3.3: globals.css 정리

**검토 항목**:
- 미사용 CSS 변수 제거
- 중복 정의 정리
- 다크 모드 변수 일관성 확인

---

## Task 7.4: 스토리북 정리

### Subtask 7.4.1: 누락된 스토리 작성 (선택)

**작성 대상** (선택적):
- Input.stories.tsx
- PasswordInput.stories.tsx
- Modal.stories.tsx
- Text.stories.tsx
- Spinner.stories.tsx

**작업 내용**:
- 기본 사용 예시
- Props 변형 (size, variant 등)
- 상태별 스토리 (disabled, error 등)

### Subtask 7.4.2: 스토리북 정리

**작업 내용**:
1. 미사용/레거시 스토리 제거
2. 스토리 카테고리 정리 (토큰, 컴포넌트, 위젯)
3. 스토리북 설정 파일 정리

---

## Task 7.5: 폴더 구조 통합 (3-Folder Architecture)

> **핵심 목표**: `frontend/src/`를 `admin`, `design-system`, `main` 3개 폴더로 정리

### Subtask 7.5.1: pages/ 폴더 통합

**현재 상태**:
- `src/pages/` - 실제 페이지 컴포넌트 위치
- `src/main/pages/` - 존재하지만 다른 용도일 수 있음

**작업 내용**:
1. `src/main/pages/` 현재 내용 확인
2. `src/pages/*` → `src/main/pages/`로 이동
3. 모든 import 경로 업데이트
4. `src/pages/` 폴더 삭제

**이동 대상**:
```
src/pages/
├── ChatPage/          → src/main/pages/ChatPage/
├── HomePage/          → src/main/pages/HomePage/
├── ProfilePage/       → src/main/pages/ProfilePage/
├── ProjectDetailPage/ → src/main/pages/ProjectDetailPage/
└── ProjectsListPage/  → src/main/pages/ProjectsListPage/
```

### Subtask 7.5.2: widgets/ 폴더 통합

**현재 상태**:
- `src/widgets/layout/` - Header, Footer, PageLayout 등
- `src/main/layout/` - 존재 여부 확인 필요

**작업 내용**:
1. `src/main/layout/` 현재 내용 확인
2. `src/widgets/layout/*` → `src/main/layout/`로 통합
3. 모든 import 경로 업데이트
4. `src/widgets/` 폴더 삭제

**이동 대상**:
```
src/widgets/layout/
├── Header/            → src/main/layout/Header/
├── Footer/            → src/main/layout/Footer/
├── HomePageLayout/    → src/main/layout/HomePageLayout/
└── PageLayout/        → src/main/layout/PageLayout/
```

### Subtask 7.5.3: shared/ 폴더 통합

**현재 상태**:
- `src/shared/` - 공유 유틸리티, UI, 훅 등
- `src/main/shared/` - 존재 여부 확인 필요

**작업 내용**:
1. `src/main/shared/` 현재 내용 확인
2. 중복 파일 식별 및 병합 전략 결정
3. `src/shared/*` → `src/main/shared/`로 통합
4. 모든 import 경로 업데이트
5. `src/shared/` 폴더 삭제

**이동 대상**:
```
src/shared/
├── api/               → src/main/shared/api/
├── config/            → src/main/shared/config/
├── hooks/             → src/main/shared/hooks/
├── lib/               → src/main/shared/lib/
├── providers/         → src/main/shared/providers/
├── services/          → src/main/shared/services/
├── types/             → src/main/shared/types/
├── ui/                → src/main/shared/ui/
└── utils/             → src/main/shared/utils/
```

### Subtask 7.5.4: features/ 폴더 통합

**현재 상태**:
- `src/features/` - chatbot, easter-eggs, introduction, project-gallery
- `src/main/features/` - 존재 여부 확인 필요

**작업 내용**:
1. `src/main/features/` 현재 내용 확인
2. `src/features/*` → `src/main/features/`로 통합
3. 미사용 features 정리 (Task 7.2에서 식별된 것들)
4. 모든 import 경로 업데이트
5. `src/features/` 폴더 삭제

**이동 대상**:
```
src/features/
├── chatbot/           → src/main/features/chatbot/
├── easter-eggs/       → src/main/features/easter-eggs/
├── introduction/      → 사용 여부 확인 후 결정
└── project-gallery/   → 사용 여부 확인 후 결정 (레거시 가능성)
```

### Subtask 7.5.5: entities/, hooks/, app/ 폴더 통합

**작업 내용**:

1. **entities/ 통합**:
   - `src/entities/` → `src/main/entities/`
   - 중복 파일 확인 및 병합

2. **hooks/ 통합**:
   - `src/hooks/` → `src/main/hooks/`
   - 중복 파일 확인 및 병합

3. **app/ 통합**:
   - `src/app/` 내용 확인
   - `src/main/app/`과 중복 시 병합
   - `src/app/` 폴더 삭제

### Subtask 7.5.6: 미사용 폴더/파일 제거

**검토 대상**:
```
src/
├── stories/assets/            # 스토리북 에셋 - 사용 여부 확인
├── shared/ui/button/          # 빈 폴더 - 제거
├── shared/ui/page-transition/ # 빈 폴더 - 제거
└── features/introduction/     # 사용 여부 확인
```

### Subtask 7.5.7: index.ts 정리 및 경로 별칭 업데이트

**작업 내용**:
1. 각 폴더의 index.ts에서 미사용 export 제거
2. 순환 참조 확인 및 수정
3. `tsconfig.json` 경로 별칭 업데이트 (필요 시)
4. `vite.config.ts` 경로 별칭 업데이트 (필요 시)

**경로 별칭 예시**:
```json
{
  "paths": {
    "@admin/*": ["src/admin/*"],
    "@design-system/*": ["src/design-system/*"],
    "@/*": ["src/main/*"]
  }
}
```

---

## Task 7.6: 최종 검증

### Subtask 7.6.1: 빌드 및 린트 검증

**작업 내용**:
```bash
npm run build
npm run lint
npm run type-check
```

### Subtask 7.6.2: 스토리북 빌드 검증

**작업 내용**:
```bash
npm run storybook:build
```

### Subtask 7.6.3: 기능 테스트

**테스트 항목**:
- [ ] 홈페이지 정상 렌더링
- [ ] 프로필 페이지 정상 렌더링
- [ ] 프로젝트 목록 정상 렌더링
- [ ] 프로젝트 상세 정상 렌더링
- [ ] 챗 페이지 정상 렌더링
- [ ] Admin 로그인 정상 동작
- [ ] 다크 모드 전환 정상 동작
- [ ] 반응형 레이아웃 정상 동작

---

## 작업 우선순위

### 높음 (핵심) - 구조 통합
1. **Task 7.5: 폴더 구조 통합 (3-Folder Architecture)** ⭐ 최우선
   - 7.5.1: pages/ 통합
   - 7.5.2: widgets/ 통합
   - 7.5.3: shared/ 통합
   - 7.5.4: features/ 통합
   - 7.5.5: entities/, hooks/, app/ 통합
2. Task 7.1: Phase 6 남은 작업 완료
3. Task 7.2: 중복 컴포넌트 제거 (통합 과정에서 함께 처리)

### 중간
4. Task 7.3.1: 하드코딩 컬러 제거
5. Task 7.5.6: 미사용 폴더/파일 제거
6. Task 7.5.7: index.ts 및 경로 별칭 정리

### 낮음 (선택)
7. Task 7.3.2: 스토리북 하드코딩 컬러 정리
8. Task 7.4.1: 누락된 스토리 작성
9. Task 7.4.2: 스토리북 정리

---

## 예상 산출물

### 파일 변경
- **이동**: 약 50~80개 파일 (폴더 구조 통합)
- **삭제**: 약 20~30개 파일 (중복/미사용 컴포넌트)
- **수정**: 약 30~50개 파일 (import 경로 변경)

### 최종 구조 (3-Folder Architecture)

```
frontend/src/
│
├── admin/                   # 🔵 Admin 앱 (독립)
│   ├── app/                 # Admin 앱 설정
│   ├── components/          # Admin 전용 컴포넌트
│   ├── config/              # Admin 설정
│   ├── entities/            # Admin 도메인 엔티티
│   ├── features/            # Admin 기능 모듈
│   ├── hooks/               # Admin 커스텀 훅
│   ├── pages/               # Admin 페이지
│   ├── shared/              # Admin 공유 유틸리티
│   └── widgets/             # Admin 위젯
│
├── design-system/           # 🟢 디자인 시스템 (공유)
│   ├── components/          # UI 컴포넌트
│   │   ├── Badge/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── ChatBubble/
│   │   ├── Divider/
│   │   ├── Icon/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Skeleton/
│   │   ├── Spinner/
│   │   ├── Text/
│   │   ├── TextLink/
│   │   ├── Tooltip/
│   │   └── ...
│   ├── providers/           # 테마 프로바이더
│   ├── styles/              # 글로벌 스타일, CSS 변수
│   └── tokens/              # 디자인 토큰 (색상, 타이포그래피 등)
│
├── main/                    # 🟡 Main 포트폴리오 앱
│   ├── app/                 # 앱 설정, 라우터
│   │   ├── MainApp.tsx
│   │   └── routes.ts
│   ├── components/          # 재사용 컴포넌트
│   ├── config/              # 설정 파일
│   │   ├── featuredProjects.config.ts
│   │   └── queryCacheConfig.ts
│   ├── entities/            # 도메인 엔티티 (타입, API)
│   │   ├── certification/
│   │   ├── education/
│   │   ├── experience/
│   │   ├── project/
│   │   └── tech-stack/
│   ├── features/            # 기능 모듈
│   │   ├── chatbot/         # 챗봇 서비스/유틸
│   │   └── easter-eggs/     # 이스터에그
│   ├── hooks/               # 커스텀 훅
│   ├── layout/              # 레이아웃 컴포넌트
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── PageLayout/
│   │   └── HomePageLayout/
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── ChatPage/
│   │   ├── HomePage/
│   │   ├── ProfilePage/
│   │   ├── ProjectDetailPage/
│   │   └── ProjectsListPage/
│   ├── providers/           # Context Providers
│   ├── services/            # API 서비스
│   └── shared/              # 공유 유틸리티
│       ├── api/
│       ├── config/
│       ├── hooks/
│       ├── lib/
│       ├── types/
│       ├── ui/              # 도메인 특화 UI
│       │   ├── chat/
│       │   ├── markdown/
│       │   └── tech-stack/
│       └── utils/
│
├── stories/                 # 📚 스토리북 에셋 (선택)
│   └── assets/
│
├── index.css                # 글로벌 CSS 엔트리
└── main.tsx                 # 앱 엔트리 포인트
```

### 삭제될 최상위 폴더

```
frontend/src/
├── app/        ❌ → main/app/로 통합
├── entities/   ❌ → main/entities/로 통합
├── features/   ❌ → main/features/로 통합
├── hooks/      ❌ → main/hooks/로 통합
├── pages/      ❌ → main/pages/로 통합
├── shared/     ❌ → main/shared/로 통합
└── widgets/    ❌ → main/layout/으로 통합
```

---

## Definition of Done

```text
- [ ] frontend/src가 admin, design-system, main 3개 폴더로 정리됨
- [ ] 모든 import 경로가 새 구조에 맞게 업데이트됨
- [ ] Phase 6 남은 작업 모두 완료
- [ ] 중복 컴포넌트가 제거되고 design-system으로 통합됨
- [ ] 하드코딩된 컬러가 디자인 시스템 토큰으로 교체됨
- [ ] 미사용 파일/폴더가 제거됨
- [ ] 빌드 및 린트 에러 없음
- [ ] 모든 페이지 정상 동작 확인
- [ ] 스토리북 빌드 성공
```

---

## 참고 문서

- [Phase 6 완료 보고서](./phase-6-completion.md)
- [Phase 3 디자인 시스템](./phase-3-design.md)
- [하드코딩 컬러 리포트](../../frontend/HARDCODED_COLORS_REPORT.md)
- [디자인 시스템 컬러 토큰](../../frontend/src/design-system/tokens/colors.ts)
