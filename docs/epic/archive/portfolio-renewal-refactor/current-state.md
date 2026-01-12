# Current State Snapshot

> **작성일**: 2025-01-04  
> **목적**: 리뉴얼 전 현재 포트폴리오 사이트의 상태를 완전히 기록하여 비교 기준점 확보

---

## 1. 페이지 구조

### 1.1 라우팅

현재 사이트는 React Router를 사용하여 2개의 주요 페이지로 구성되어 있습니다.

| 경로 | 컴포넌트 | 역할 |
|------|----------|------|
| `/` | `HomePage` | 메인 랜딩 페이지 (Hero Section + Portfolio Section) |
| `/projects/:id` | `ProjectDetailPage` | 프로젝트 상세 페이지 |

**라우팅 파일 위치:**
- `frontend/src/main/App.tsx`

**특징:**
- React Router의 기본 스크롤 복원 기능이 비활성화되어 있음 (`scrollRestoration = 'manual'`)
- 프로젝트 상세 페이지에서 홈으로 돌아올 때 스크롤 위치 복원 기능 구현됨

### 1.2 페이지별 콘텐츠

#### HomePage (`/`)

**구성 요소:**
1. **HeroSection**
   - 이름 및 직업 표시 ("이정준", "Software Engineer")
   - 소개 문구 ("도전을 두려워하지 않는 개발자 이정준입니다.")
   - GitHub 링크 버튼
   - 이메일 문의 모달 버튼
   - TechStackTetris 애니메이션 배경
   - CoreTechStackSection (핵심 기술 스택 표시)

2. **PortfolioSection** (메인 콘텐츠)
   - 프로젝트 목록 (그리드 레이아웃)
   - 프로젝트 필터링 기능
   - 경력(Experience) 카드 목록
   - 교육(Education) 카드 목록
   - 자격증(Certification) 카드 목록
   - HistoryPanel (타임라인 패널, 좌측 슬라이드)

3. **Chatbot** (우측 슬라이드 패널)
   - AI 포트폴리오 비서
   - 프로젝트 관련 질문 답변
   - 사용량 제한 표시 (시간당/일일)

4. **ChatInputBar** (하단 고정)
   - 채팅 입력창
   - SpeedDialFab (빠른 액션 버튼)

**상태 관리:**
- `AppProvider`를 통해 전역 상태 관리
- React Query를 사용한 데이터 페칭 및 캐싱
- 로컬 스토리지에 캐시 저장

#### ProjectDetailPage (`/projects/:id`)

**구성 요소:**
1. **ProjectDetailHeader**
   - 프로젝트 제목
   - 프로젝트 메타데이터 (날짜, 상태 등)
   - GitHub/Live 링크 버튼

2. **메인 콘텐츠 영역** (max-w-4xl)
   - 썸네일 이미지
   - Overview 섹션 (`ProjectDetailOverview`)
   - TechStack 섹션 (`ProjectDetailTechStack`)
   - Gallery 섹션 (`ProjectDetailGallery`) - 스크린샷 갤러리
   - Contribution 섹션 (`ProjectDetailContribution`) - 팀 프로젝트인 경우
   - Detail 섹션 (`ProjectDetailContent`) - Markdown 렌더링

3. **ProjectDetailSidebar** (좌측 플로팅)
   - TOC (Table of Contents) - DOM 기반 자동 생성
   - 현재 섹션 하이라이트
   - 토글 가능

4. **Chatbot** (우측 슬라이드 패널)
   - HomePage와 동일한 챗봇 기능

**데이터 로딩:**
- `useProjectDetail` 훅을 사용하여 프로젝트 데이터 및 Markdown 콘텐츠 로드
- 로딩 중 스켈레톤 UI 표시
- 에러 발생 시 에러 메시지 및 재시도 버튼 표시

---

## 2. 주요 기능

### 2.1 핵심 기능 목록

- [x] **프로젝트 목록 표시**
  - 그리드 레이아웃 (반응형: 1열/2열/3열)
  - 프로젝트 카드 클릭 시 상세 페이지 이동
  - 자격증 프로젝트는 별도로 표시

- [x] **프로젝트 필터링**
  - 검색어 필터 (프로젝트명 기반)
  - 팀/개인 필터
  - 프로젝트 타입 필터 (BUILD, LAB, MAINTENANCE)
  - 상태 필터 (completed, in_progress, maintenance)
  - 기술 스택 필터 (다중 선택)
  - 정렬 옵션 (시작일, 종료일, 제목, 상태, 정렬순서, 타입)
  - 정렬 방향 (오름차순/내림차순)

- [x] **프로젝트 상세 보기**
  - 프로젝트 헤더 정보
  - 개요 설명
  - 기술 스택 표시
  - 스크린샷 갤러리
  - 기여도 정보 (팀 프로젝트)
  - Markdown 상세 설명
  - TOC 자동 생성 및 네비게이션

- [x] **AI 챗봇**
  - 프로젝트 관련 질문 답변
  - 사용량 제한 (시간당 15회, 일일 45회)
  - 프로젝트 선택 버튼 (와이드 스크린에서만)
  - 채팅 초기화 기능
  - 이메일 문의 버튼 (특정 상황에서 표시)

- [x] **히스토리 패널**
  - 프로젝트/경력/교육 통합 타임라인
  - 시각적 타임라인 바 (색상 구분)
  - 바 클릭 시 해당 카드로 스크롤
  - 마우스 오버 시 하이라이트
  - 범례 표시

- [x] **이스터에그**
  - 특정 키워드 입력 시 이스터에그 트리거
  - Matrix 테마
  - Demon Slayer 테마
  - 이스터에그 모드에서 히스토리 패널이 이스터에그 목록 패널로 변경

- [x] **스크롤 위치 복원**
  - 프로젝트 상세 페이지에서 홈으로 돌아올 때 스크롤 위치 복원
  - 전역 변수(`window.__homeScrollPosition`)를 사용하여 위치 저장

- [x] **키보드 단축키**
  - ESC 키: 열린 패널(챗봇/히스토리) 닫기

### 2.2 기능별 세부 사항

#### 프로젝트 필터링 로직
- 필터 옵션은 `PortfolioSection` 컴포넌트에서 상태 관리
- 필터 변경 시 `applyFilters` 함수가 호출되어 실시간 필터링
- 자격증 프로젝트는 필터와 관계없이 항상 표시

#### 챗봇 동작 방식
1. 프론트엔드 사전 검증 (`processQuestion`)
2. 즉시 응답 가능한 경우 프론트엔드에서 처리
3. 백엔드 전송이 필요한 경우 API 호출
4. 응답 타입에 따라 UI 다르게 표시 (에러, 제한, 성공 등)

#### 히스토리 패널 타임라인
- 모든 프로젝트/경력/교육을 날짜 기준으로 통합
- 타임라인 높이는 전체 기간에 비례하여 계산 (1개월당 40px)
- 바 위치: 교육(20%), 경력(40%), 프로젝트(60%)
- 진행 중인 항목은 특별한 스타일로 표시

---

## 3. UI 컴포넌트 인벤토리

### 3.1 레이아웃 컴포넌트

| 컴포넌트 | 위치 | 역할 |
|----------|------|------|
| `Header` | `frontend/src/main/layout/components/Header.tsx` | 헤더 (현재 사용되지 않음) |
| `HeroSection` | `frontend/src/main/layout/components/HeroSection.tsx` | 히어로 섹션 (이름, 소개, 기술 스택) |
| `HomePage` | `frontend/src/main/layout/components/HomePage.tsx` | 홈 페이지 컨테이너 |

### 3.2 프로젝트 관련 컴포넌트

| 컴포넌트 | 위치 | 주요 Props | 역할 |
|----------|------|------------|------|
| `PortfolioSection` | `frontend/src/features/project-gallery/components/PortfolioSection.tsx` | projects, experiences, educations, certifications, loadingStates, isHistoryPanelOpen, onHistoryPanelToggle | 포트폴리오 메인 섹션 |
| `ProjectCard` | `frontend/src/features/project-gallery/components/ProjectCard.tsx` | project, onMouseEnter, onMouseLeave, isHighlighted, onLongHover | 프로젝트 카드 |
| `ProjectFilter` | `frontend/src/features/project-gallery/components/ProjectFilter.tsx` | projects, filterOptions, onFilterOptionsChange | 프로젝트 필터 UI |
| `ProjectDetailPage` | `frontend/src/main/pages/ProjectDetail/ProjectDetailPage.tsx` | - | 프로젝트 상세 페이지 |
| `ProjectDetailHeader` | `frontend/src/main/pages/ProjectDetail/components/ProjectDetailHeader.tsx` | project | 프로젝트 상세 헤더 |
| `ProjectDetailOverview` | `frontend/src/main/pages/ProjectDetail/components/ProjectDetailOverview.tsx` | description | 프로젝트 개요 |
| `ProjectDetailTechStack` | `frontend/src/main/pages/ProjectDetail/components/ProjectDetailTechStack.tsx` | technologies | 기술 스택 표시 |
| `ProjectDetailContribution` | `frontend/src/main/pages/ProjectDetail/components/ProjectDetailContribution.tsx` | project | 기여도 정보 |
| `ProjectDetailGallery` | `frontend/src/main/pages/ProjectDetail/components/ProjectDetailGallery.tsx` | screenshots, projectTitle | 스크린샷 갤러리 |
| `ProjectDetailContent` | `frontend/src/main/pages/ProjectDetail/components/ProjectDetailContent.tsx` | content, project, containerRef | Markdown 콘텐츠 렌더링 |
| `ProjectDetailSidebar` | `frontend/src/main/pages/ProjectDetail/components/ProjectDetailSidebar.tsx` | project, tocItems, activeSection, isOpen, onToggle | TOC 사이드바 |
| `ProjectDetailSidebarToggle` | `frontend/src/main/pages/ProjectDetail/components/ProjectDetailSidebarToggle.tsx` | isOpen, onToggle | 사이드바 토글 버튼 |

### 3.3 히스토리 관련 컴포넌트

| 컴포넌트 | 위치 | 주요 Props | 역할 |
|----------|------|------------|------|
| `HistoryPanel` | `frontend/src/features/project-gallery/components/HistoryPanel.tsx` | projects, experiences, educations, isOpen, onToggle, highlightedItemId, onItemHover, scrollToItemId | 타임라인 패널 |
| `ExperienceCard` | `frontend/src/main/features/projects/components/ExperienceCard.tsx` | experience, onMouseEnter, onMouseLeave, isHighlighted, onLongHover | 경력 카드 |
| `EducationCard` | `frontend/src/main/features/projects/components/EducationCard.tsx` | education, onMouseEnter, onMouseLeave, isHighlighted, onLongHover | 교육 카드 |
| `CertificationCard` | `frontend/src/main/features/projects/components/CertificationCard.tsx` | certification, onMouseEnter, onMouseLeave | 자격증 카드 |

### 3.4 공통 UI 컴포넌트

| 컴포넌트 | 위치 | 역할 |
|----------|------|------|
| `Chatbot` | `frontend/src/features/chatbot/components/Chatbot.tsx` | AI 챗봇 패널 |
| `ChatMessage` | `frontend/src/features/chatbot/components/ChatMessage.tsx` | 채팅 메시지 표시 |
| `ChatInputBar` | `frontend/src/main/shared/ui/ChatInputBar.tsx` | 하단 고정 채팅 입력창 |
| `SpeedDialFab` | `frontend/src/main/shared/ui/SpeedDialFab.tsx` | 빠른 액션 버튼 |
| `ContactModal` | `frontend/src/main/components/common/Modal/ContactModal.tsx` | 이메일 문의 모달 |
| `ProjectModal` | `frontend/src/main/components/common/Modal/ProjectModal.tsx` | 프로젝트 모달 (현재 사용되지 않음) |
| `TechStackBadge` | `frontend/src/main/components/common/TechStackBadge/TechStackBadge.tsx` | 기술 스택 배지 |
| `TechStackList` | `frontend/src/main/components/common/TechStack/TechStackList.tsx` | 기술 스택 목록 |
| `TechStackTetris` | `frontend/src/main/components/common/TechStackTetris/TechStackTetris.tsx` | 테트리스 애니메이션 배경 |
| `SkeletonCard` | `frontend/src/main/components/common/SkeletonCard.tsx` | 로딩 스켈레톤 카드 |
| `MarkdownRenderer` | `frontend/src/main/components/common/Markdown/MarkdownRenderer.tsx` | Markdown 렌더링 |
| `ErrorBoundary` | `frontend/src/main/components/common/ErrorBoundary.tsx` | 에러 바운더리 |

### 3.5 컴포넌트 의존 관계

```
App
├── AppProvider (전역 상태 관리)
└── Routes
    ├── HomePage
    │   ├── HeroSection
    │   │   ├── CoreTechStackSection
    │   │   ├── TechStackTetris
    │   │   └── ContactModal
    │   └── PortfolioSection
    │       ├── ProjectCard
    │       ├── ProjectFilter
    │       ├── ExperienceCard
    │       ├── EducationCard
    │       ├── CertificationCard
    │       └── HistoryPanel
    ├── Chatbot
    └── ChatInputBar
        └── SpeedDialFab
    └── ProjectDetailPage
        ├── ProjectDetailHeader
        ├── ProjectDetailOverview
        ├── ProjectDetailTechStack
        ├── ProjectDetailGallery
        ├── ProjectDetailContribution
        ├── ProjectDetailContent
        ├── ProjectDetailSidebar
        └── Chatbot
```

---

## 4. 디자인 시스템 현황

### 4.1 색상 체계

**CSS 변수 기반 색상 시스템** (`frontend/src/index.css`)

#### 라이트 모드
```css
--color-background: #ffffff
--color-background-secondary: #f9fafb
--color-surface: #ffffff
--color-surface-elevated: #f9fafb
--color-text-primary: #111827
--color-text-secondary: #374151
--color-text-muted: #6b7280
--color-border: #e5e7eb
--color-border-light: #f3f4f6
```

#### 다크 모드
```css
--color-background: #0f172a
--color-background-secondary: #1e293b
--color-surface: #1e293b
--color-surface-elevated: #334155
--color-text-primary: #f1f5f9
--color-text-secondary: #cbd5e1
--color-text-muted: #94a3b8
--color-border: #334155
--color-border-light: #475569
```

#### Primary 색상 (Tailwind)
- Primary 50-950: 보라색 계열 (#f5f3ff ~ #2e1065)
- 주요 사용: Primary 500-700

#### 특수 테마
- **Matrix 테마**: 검은 배경 + 초록색 텍스트
- **Demon Slayer 테마**: 어두운 배경 + 따뜻한 오렌지/레드 톤

### 4.2 타이포그래피

**폰트 패밀리:**
- Pretendard (한글 최적화 폰트)
- Fallback: 시스템 폰트 스택

**제목 스타일:**
- H1: `text-3xl md:text-4xl font-extrabold` (Hero Section)
- H2: `text-3xl font-bold` (섹션 제목)
- H3: `text-[1.95rem] font-semibold` (서브 섹션)

**본문 텍스트:**
- 기본: `text-base`
- Secondary: `text-text-secondary`
- Muted: `text-text-muted`

### 4.3 간격(Spacing) 체계

**Tailwind 기본 간격 사용:**
- Container: `px-4 py-8 md:py-12`
- Section 간격: `mb-12`, `mb-8`
- 카드 간격: `gap-8` (그리드)
- 컴포넌트 내부: `p-4`, `p-6`

**컨테이너 최대 너비:**
- 메인 콘텐츠: `max-w-4xl mx-auto`
- Hero Section: `max-w-4xl mx-auto`

### 4.4 반응형 브레이크포인트

**Tailwind 기본 브레이크포인트:**
- Mobile: 기본 (< 768px)
- Tablet: `md:` (≥ 768px)
- Desktop: `lg:` (≥ 1024px)

**커스텀 브레이크포인트:**
- Wide Screen: `> 2400px` (히스토리 패널 자동 열림, 챗봇 프로젝트 버튼 표시)

**그리드 레이아웃:**
- Mobile: `grid-cols-1`
- Tablet: `md:grid-cols-2`
- Desktop: `lg:grid-cols-3`

---

## 5. 콘텐츠 구조

### 5.1 프로젝트 데이터 구조

```typescript
interface Project extends BaseItem {
  id: string;                    // 고유 ID (P001 등)
  title: string;                  // 프로젝트명
  description: string;            // 설명
  technologies: string[];         // 기술 스택 배열
  startDate: string;              // YYYY-MM 형식
  endDate?: string | null;        // YYYY-MM 형식, null이면 진행 중
  githubUrl?: string;             // GitHub 링크
  liveUrl?: string;               // 라이브 데모 링크
  readme: string;                 // README 내용
  imageUrl: string;               // 썸네일 이미지 URL
  source: 'github' | 'local' | 'certification';
  type: 'BUILD' | 'LAB' | 'MAINTENANCE';
  status?: string;                // completed, in_progress, maintenance
  sortOrder?: number;             // 정렬 순서
  issuer?: string;                // 자격증 발급 기관
  externalUrl?: string;           // 자격증 외부 링크
  isTeam: boolean;                // 팀 프로젝트 여부
  myContributions?: string[];      // 내 기여 내용
  teamSize?: number;              // 팀원 수
  role?: string;                  // 내 역할
  screenshots?: string[];          // 스크린샷 URL 배열
  metadata?: { [key: string]: any };
}
```

### 5.2 경력 데이터 구조

```typescript
interface Experience extends BaseItem {
  id: string;                     // 고유 ID (E001 등)
  title: string;                  // 직책/역할
  description: string;            // 설명
  technologies: string[];          // 사용 기술
  startDate: string;              // YYYY-MM 형식
  endDate?: string | null;        // YYYY-MM 형식, null이면 진행 중
  organization: string;           // 회사/조직명
  role?: string;                  // 역할
  location?: string;              // 위치
  type: 'career';
  mainResponsibilities?: string[]; // 주요 담당 업무
  achievements?: string[];        // 주요 성과
  projects?: string[];            // 담당 프로젝트명들
}
```

### 5.3 교육 데이터 구조

```typescript
interface Education extends BaseItem {
  id: string;                     // 고유 ID
  title: string;                  // 교육명
  description: string;            // 설명
  technologies: string[];         // 학습 기술
  startDate: string;              // YYYY-MM 형식
  endDate?: string | null;        // YYYY-MM 형식
  organization: string;           // 교육 기관
  degree?: string;                // 학위
  location?: string;              // 위치
  type: 'education';
  projects?: string[];            // 교육 중 진행한 프로젝트들
}
```

### 5.4 자격증 데이터 구조

```typescript
interface Certification {
  id: string;                    // 고유 ID
  name: string;                   // 자격증명 (title 대신 name 사용)
  description: string;            // 설명
  issuer: string;                 // 발급 기관
  date: string;                   // 취득 날짜 (startDate 대신 date 사용)
  credentialUrl: string;          // 인증서 URL
}
```

### 5.5 콘텐츠 표시 우선순위

**HomePage:**
1. Hero Section (첫 화면)
2. 프로젝트 목록 (스크롤 후)
3. 경력 목록
4. 교육 목록
5. 자격증 목록

**ProjectDetailPage:**
1. 헤더 (프로젝트명, 메타데이터)
2. 썸네일 이미지
3. 개요 (Overview)
4. 기술 스택
5. 갤러리 (스크린샷)
6. 기여도 (팀 프로젝트인 경우)
7. 상세 설명 (Markdown)

---

## 6. 사용자 동선

### 6.1 주요 사용자 플로우

```
1. 첫 방문
   └─> Hero Section (이름, 소개, 기술 스택)
   └─> 스크롤 다운
   └─> 프로젝트 목록 탐색
       ├─> 필터 사용 (선택)
       ├─> 프로젝트 카드 클릭
       │   └─> 프로젝트 상세 페이지
       │       ├─> TOC로 섹션 이동
       │       ├─> 챗봇으로 질문
       │       └─> 뒤로가기 → 홈 (스크롤 위치 복원)
       └─> 히스토리 패널 열기 (선택)
           └─> 타임라인에서 항목 클릭 → 해당 카드로 스크롤

2. 챗봇 사용
   └─> 하단 입력창 클릭 또는 SpeedDialFab
   └─> 챗봇 패널 자동 열림
   └─> 질문 입력
   └─> AI 응답 확인
   └─> ESC 키 또는 X 버튼으로 닫기

3. 히스토리 패널 탐색
   └─> SpeedDialFab 또는 직접 토글
   └─> 타임라인에서 항목 호버 → 하이라이트
   └─> 바 클릭 → 해당 카드로 스크롤
```

### 6.2 상호작용 요소

**클릭 가능한 요소:**
- 프로젝트 카드 → 상세 페이지 이동
- 히스토리 패널 바 → 해당 카드로 스크롤
- 챗봇 프로젝트 버튼 → 해당 프로젝트 질문
- GitHub/Live 링크 버튼 → 외부 링크
- TOC 항목 → 해당 섹션으로 스크롤

**호버 효과:**
- 프로젝트 카드: `hover:scale-105`, 그림자 효과
- 히스토리 패널 바: 색상 변경, 하이라이트
- 버튼: 배경색 변경

**키보드 단축키:**
- `ESC`: 열린 패널(챗봇/히스토리) 닫기

**스크롤 연동:**
- 프로젝트 상세 페이지 TOC: 현재 섹션 자동 하이라이트
- 히스토리 패널에서 항목 클릭 시 해당 카드로 부드러운 스크롤

---

## 7. 기술적 구조

### 7.1 상태 관리

**전역 상태 (AppProvider):**
- `projects`: 프로젝트 목록
- `experiences`: 경력 목록
- `educations`: 교육 목록
- `certifications`: 자격증 목록
- `isLoading`: 전체 로딩 상태
- `loadingStates`: 개별 데이터 로딩 상태
- `isChatbotOpen`: 챗봇 열림 상태
- `isHistoryPanelOpen`: 히스토리 패널 열림 상태
- `isWideScreen`: 와이드 스크린 여부 (> 2400px)

**로컬 상태:**
- 필터 옵션 (`PortfolioSection`)
- 챗봇 메시지 (`Chatbot`)
- 사이드바 열림 상태 (`ProjectDetailPage`)

**React Query 캐싱:**
- `useProjectsQuery`: 프로젝트 데이터
- `useExperiencesQuery`: 경력 데이터
- `useEducationQuery`: 교육 데이터
- `useCertificationsQuery`: 자격증 데이터
- 로컬 스토리지에 캐시 저장

### 7.2 데이터 페칭

**API 엔드포인트:**
- `GET /api/projects` - 프로젝트 목록
- `GET /api/projects/:id` - 프로젝트 상세
- `GET /api/experiences` - 경력 목록
- `GET /api/educations` - 교육 목록
- `GET /api/certifications` - 자격증 목록
- `POST /api/chatbot` - 챗봇 응답
- `GET /api/chatbot/usage` - 사용량 제한 상태

**API 클라이언트:**
- 위치: `frontend/src/shared/api/apiClient.ts`
- 재시도 로직 포함 (최대 3회, 지수 백오프)
- 헬스 체크 기능 (백엔드 준비 대기)

**로딩 상태 처리:**
- 스켈레톤 UI (`SkeletonCard`, `SkeletonSection`)
- 개별 데이터 로딩 상태 표시
- 전체 로딩 중 스피너 표시

**에러 처리:**
- `ErrorBoundary` 컴포넌트
- 에러 메시지 및 재시도 버튼
- 네트워크 오류 시 재시도

### 7.3 라우팅 및 네비게이션

**페이지 전환:**
- React Router `useNavigate` 사용
- 프로젝트 카드 클릭 시 `/projects/:id`로 이동

**스크롤 위치 저장/복원:**
- `window.__homeScrollPosition` 전역 변수 사용
- 프로젝트 상세 페이지 진입 시 현재 스크롤 위치 저장
- 홈으로 돌아올 때 저장된 위치로 복원

**뒤로가기 처리:**
- 브라우저 기본 동작 사용
- 스크롤 위치 복원 기능과 연동

---

## 8. 스크린샷

**스크린샷 저장 위치**: `docs/epic/portfolio-renewal-refactor/screenshots/before/`  
**촬영 방법**: Playwright를 사용한 자동 촬영 (`npm run screenshots`)

### 촬영된 스크린샷:

1. **homepage-full.png** - 홈페이지 전체 (전체 페이지 스크롤)
   ![홈페이지 전체](screenshots/before/homepage-full.png)

2. **homepage-hero.png** - Hero Section (첫 화면)
   ![Hero Section](screenshots/before/homepage-hero.png)

3. **homepage-projects.png** - 프로젝트 목록 영역
   ![프로젝트 목록](screenshots/before/homepage-projects.png)

4. **history-panel-open.png** - 히스토리 패널 열린 상태
   ![히스토리 패널](screenshots/before/history-panel-open.png)

5. **chatbot-open.png** - 챗봇 열린 상태
   ![챗봇](screenshots/before/chatbot-open.png)

6. **project-detail-full.png** - 프로젝트 상세 페이지 전체
   ![프로젝트 상세](screenshots/before/project-detail-full.png)

7. **project-detail-sidebar.png** - 프로젝트 상세 페이지 (사이드바 포함)
   ![프로젝트 상세 사이드바](screenshots/before/project-detail-sidebar.png)

8. **responsive-mobile.png** - 모바일 뷰 (375px)
   ![모바일 뷰](screenshots/before/responsive-mobile.png)

9. **responsive-tablet.png** - 태블릿 뷰 (768px)
   ![태블릿 뷰](screenshots/before/responsive-tablet.png)

---

## 9. 현재 문제점 및 개선 필요 사항

### 9.1 정보 과부하 영역

1. **홈페이지 첫 화면**
   - Hero Section + TechStackTetris 애니메이션 + 프로젝트 목록이 한 화면에 모두 보임
   - 스크롤 없이도 많은 정보가 노출됨

2. **프로젝트 필터**
   - 필터 옵션이 많음 (검색, 팀/개인, 타입, 상태, 기술 스택, 정렬)
   - 필터 섹션이 기본적으로 닫혀있지만, 열면 많은 옵션이 표시됨

3. **히스토리 패널**
   - 타임라인에 모든 프로젝트/경력/교육이 표시되어 복잡함
   - 바와 라벨이 겹치는 경우가 있음

### 9.2 불명확한 사용자 동선

1. **프로젝트 탐색 경로**
   - 필터를 사용해야 하는지, 직접 스크롤해야 하는지 불명확
   - 히스토리 패널과 프로젝트 목록의 관계가 명확하지 않음

2. **챗봇 사용 시점**
   - 언제 챗봇을 사용해야 하는지 명확하지 않음
   - 프로젝트 상세 페이지에서도 챗봇이 열리지만, 홈페이지와 동일한 기능

3. **프로젝트 상세 페이지 진입 이유**
   - 프로젝트 카드에서 어떤 정보를 얻을 수 있는지 불명확
   - TOC가 있지만, 어떤 내용이 있는지 미리 알 수 없음

### 9.3 불필요하거나 혼란스러운 UI 요소

1. **이스터에그 기능**
   - 일반 사용자에게는 불필요한 기능
   - 이스터에그 모드에서 UI가 완전히 변경되어 혼란스러울 수 있음

2. **SpeedDialFab**
   - 히스토리 패널과 챗봇 두 가지 기능만 있어서 SpeedDial의 필요성이 낮음
   - 단순히 버튼 두 개로 표시하는 것이 더 명확할 수 있음

3. **프로젝트 카드 배지**
   - 팀/개인 배지가 호버 시에만 텍스트가 표시되어 인지하기 어려움

4. **히스토리 패널 범례**
   - 범례가 패널 하단에 있어서 처음 사용하는 사용자가 놓칠 수 있음

### 9.4 디자인 일관성 문제

1. **색상 사용**
   - 프로젝트(파란색), 경력(주황색), 교육(초록색)으로 구분하지만, 일관된 색상 체계가 없음
   - Primary 색상(보라색)이 거의 사용되지 않음

2. **간격 체계**
   - 섹션 간 간격이 일관되지 않음 (mb-12, mb-8 혼용)
   - 카드 내부 여백도 다양함

3. **타이포그래피**
   - 제목 크기가 일관되지 않음 (text-3xl, text-[1.95rem] 등)

### 9.5 Phase 1 이후 작업을 위한 인사이트

1. **콘텐츠 구조화 필요**
   - 프로젝트 설명이 Markdown으로 되어 있어 추출이 용이함
   - 각 프로젝트의 핵심 정보(문제, 해결, 결과)를 명확히 구분할 필요

2. **페이지 구조 단순화**
   - 현재는 홈페이지에 모든 것이 집중되어 있음
   - Landing / Profile / Archive로 분리하면 정보 과부하 해소 가능

3. **기능 제거 검토**
   - 이스터에그 기능은 제거 고려
   - 히스토리 패널의 복잡한 타임라인은 단순화 필요

4. **디자인 시스템 정리**
   - CSS 변수 기반 색상 시스템은 유지하되, 사용 색상 축소
   - 간격 및 타이포그래피 토큰 명확히 정의 필요

---

## 10. 추가 정보

### 10.1 개발 환경

- **프론트엔드**: React 19.1.2, TypeScript, Vite
- **스타일링**: Tailwind CSS 3.4.17
- **라우팅**: React Router 7.9.3
- **상태 관리**: React Query 5.59.0
- **마크다운**: react-markdown 10.1.0

### 10.2 주요 라이브러리

- `@tanstack/react-query`: 데이터 페칭 및 캐싱
- `@tanstack/react-query-persist-client`: 로컬 스토리지 캐싱
- `react-router-dom`: 라우팅
- `react-markdown`: Markdown 렌더링
- `highlight.js`: 코드 하이라이팅
- `@dnd-kit/*`: 드래그 앤 드롭 (현재 사용되지 않음)

### 10.3 파일 구조

```
frontend/src/
├── main/
│   ├── App.tsx                    # 라우팅 정의
│   ├── app/
│   │   └── providers/
│   │       └── AppProvider.tsx    # 전역 상태 관리
│   ├── layout/
│   │   └── components/            # 레이아웃 컴포넌트
│   ├── pages/
│   │   └── ProjectDetail/        # 프로젝트 상세 페이지
│   ├── features/                  # 기능별 컴포넌트
│   ├── entities/                  # 엔티티별 타입 및 API
│   ├── components/                # 공통 컴포넌트
│   └── shared/                     # 공유 유틸리티
├── features/                      # 재사용 가능한 기능
└── shared/                        # 공유 리소스
```

---

**작성 완료일**: 2025-01-04  
**다음 단계**: Phase 1 - Content Inventory (콘텐츠 정리)
