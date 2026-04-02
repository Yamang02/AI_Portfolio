# Phase 4 설계 문서: Wireframe (Low Fidelity)

**작성일**: 2025-01-04
**작성자**: AI Agent (Claude)
**상태**: 초안

---

## 📋 목차

1. [개요](#개요)
2. [목표](#목표)
3. [작업 범위](#작업-범위)
4. [와이어프레임 설계 원칙](#와이어프레임-설계-원칙)
5. [Landing (Home) Wireframe](#landing-home-wireframe)
6. [Archive (Projects List) Wireframe](#archive-projects-list-wireframe)
7. [공통 컴포넌트](#공통-컴포넌트)
8. [반응형 전략](#반응형-전략)
9. [구현 가이드](#구현-가이드)
10. [구현 결정사항 요약](#구현-결정사항-요약)
11. [검증 체크리스트](#검증-체크리스트)

---

## 개요

### Phase 4의 목적

Phase 4는 **Wireframe (Low Fidelity)** 단계로, Phase 2에서 정의한 페이지 구조를 바탕으로 **시각적 와이어프레임**을 설계합니다.

### Global Constraints 준수

```text
✅ 디자인은 최소화한다
✅ 새로운 기능을 만들지 않는다
✅ 기존 기능은 필요 시 제거한다
✅ 디자인 시스템을 벗어난 UI 추가 금지
```

### Phase 3에서 정의한 디자인 시스템 활용

Phase 4에서는 **Phase 3에서 구현한 디자인 시스템 7개 컴포넌트만 사용**합니다:

1. **Button** (Primary/Secondary)
2. **TextLink** (외부 링크, 밑줄 옵션)
3. **SectionTitle** (H1-H4)
4. **Divider** (Horizontal/Vertical)
5. **Badge** (기술스택 태그, 클릭 가능) ← NEW
6. **Skeleton** (로딩 상태) ← NEW
7. **Tooltip** (부가 설명) ← NEW

**새로운 컴포넌트 추가 금지** - 디자인 시스템 범위를 벗어난 UI 요소는 사용할 수 없습니다.

---

## 목표

### 핵심 목표

1. **정보 밀도 검증**
   - 첫 화면(Hero Section)이 과부하 없이 핵심 메시지 전달
   - 스크롤 길이 최소화 (각 페이지 2-3 스크롤 이내)

2. **페이지 이동 동선 명확화**
   - Landing → Archive → Detail 흐름 명확화
   - CTA 버튼 위치 및 레이블 최적화

3. **콘텐츠 계층 명확화**
   - 정보 우선순위에 따른 시각적 계층 구조
   - 불필요한 정보 제거

### DoD (Definition of Done)

```text
✅ Landing(Home) 와이어프레임 완성 (Desktop + Mobile)
✅ Archive(Projects List) 와이어프레임 완성 (Desktop + Mobile)
✅ 각 페이지 정보 밀도 검증 (스크롤 길이, 스캔 시간)
✅ 디자인 시스템 내 컴포넌트만 사용 (새 컴포넌트 없음)
✅ 반응형 전략 정의 (Breakpoints, 레이아웃 변화)
✅ 접근성 고려사항 정리 (키보드 네비게이션, 스크린 리더)
```

---

## 작업 범위

### 포함 사항

- [x] Landing(Home) 페이지 와이어프레임
  - Hero Section
  - About/Summary
  - Featured AX Projects (2-3개)
  - CTA Section
- [x] Archive(Projects List) 페이지 와이어프레임
  - 페이지 헤더
  - 필터/정렬 옵션 (최소화)
  - 프로젝트 카드 리스트
  - 페이지네이션 (필요 시)
- [x] 공통 컴포넌트
  - Navigation Header
  - Footer
- [x] 반응형 레이아웃 (Desktop, Tablet, Mobile)

### 제외 사항

- [ ] Profile 페이지 (향후 Phase에서 작업)
- [ ] Project Detail 페이지 (향후 Phase에서 작업)
- [ ] 실제 비주얼 디자인 (색상, 폰트는 Phase 3 토큰 사용)
- [ ] 인터랙션 애니메이션 (Global Constraints 위배)

---

## 와이어프레임 설계 원칙

### 1. 정보 최소화 (Information Minimalism)

```text
- 각 섹션은 5-10초 내 스캔 가능
- 불필요한 텍스트 제거 (중복 설명, 장황한 문구)
- 핵심 정보만 표시 (1차 정보 우선, 2차 정보는 클릭 후)
```

### 2. 명확한 시각적 계층

```text
- Primary 정보: H1-H2 (이름, 역할, 섹션 타이틀)
- Secondary 정보: H3-H4, Body text (설명, 메타데이터)
- Tertiary 정보: Small text (태그, 날짜)
- CTA: Primary Button (강조), Secondary Button (보조)
```

### 3. 스크롤 길이 제한

```text
- Landing: 최대 2-3 스크롤 (Desktop)
- Archive: 최대 3-4 스크롤 (1페이지 기준)
- Mobile: 각 섹션 간 명확한 구분 (Divider 사용)
```

### 4. 접근성 우선

```text
- 키보드 네비게이션 지원 (Tab 순서 명확)
- 스크린 리더 대응 (aria-label, semantic HTML)
- 충분한 터치 타겟 크기 (최소 44x44px)
```

---

## Landing (Home) Wireframe

### 페이지 목표

> "3초 안에 누구인지, 무엇을 하는지, 다음 액션이 무엇인지 명확히 전달"

### 사용자 여정

```text
[진입 (0-3초)]
  ↓
[Hero Section 스캔]
  - 이름, 역할 파악
  - "AI 적극 활용 개발자" 컨셉 인지
  ↓ (3-10초)
[About 섹션 확인]
  - AI 활용 방식 이해
  - 핵심 역량 파악
  ↓ (10-30초)
[Featured Projects 스캔]
  - AX 프로젝트 2-3개 훑어보기
  - 관심 프로젝트 선택
  ↓ (30초+)
[행동 결정]
  - Option A: 프로젝트 상세 보기 (클릭)
  - Option B: 전체 프로젝트 목록 보기
  - Option C: 연락하기
```

---

### Section 1: Navigation Header (공통)

**Desktop:**
```
┌──────────────────────────────────────────────────────────┐
│  [Logo/Name]              [Projects] [Contact]           │
└──────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌─────────────────────┐
│ [Logo]  [☰ Menu]    │
└─────────────────────┘
```

**컴포넌트:**
- Logo/Name: TextLink (href="/")
- Navigation Links: TextLink
- Mobile Menu: 햄버거 아이콘 (SVG, 클릭 시 드롭다운, 애니메이션 허용)

**레이아웃:**
- Container: max-width 1280px, padding 32px (desktop)
- Position: Sticky or Fixed (스크롤 시 유지)
- Height: 64px (desktop), 56px (mobile)
- Border-bottom: 1px solid var(--color-border-default)

---

### Section 2: Hero Section (Above the fold)

**Desktop:**
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                      [Name - H1]                         │
│                  [Role/Title - H2]                       │
│                                                          │
│              [One-line intro - paragraph]                │
│                                                          │
│         [Primary CTA]  [Secondary CTA]                   │
│                                                          │
│                   [Scroll indicator ↓]                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌─────────────────────┐
│                     │
│   [Name - H1]       │
│   [Role - H2]       │
│                     │
│   [One-line intro]  │
│                     │
│   [Primary CTA]     │
│   [Secondary CTA]   │
│                     │
│       [↓]           │
│                     │
└─────────────────────┘
```

**콘텐츠:**
- **Name (H1)**: "이준경" (SectionTitle level="h1")
- **Role (H2)**: "AI 적극 활용 개발자" (SectionTitle level="h2")
- **One-line intro**:
  ```
  "AI 도구를 적극 활용하여 개발 효율성과 사용자 경험을 개선하는 개발자입니다."
  ```
- **Primary CTA**: "프로젝트 보기" (Button variant="primary", href="/projects")
- **Secondary CTA**: "연락하기" (Button variant="secondary", href="#footer") - Footer의 Email 링크로 스크롤
- **Scroll Indicator**: 클릭 가능한 버튼 (Button variant="secondary", onClick으로 다음 섹션으로 스크롤)

**레이아웃:**
- Container: max-width 768px (콘텐츠 중앙 정렬)
- Padding: 80px 32px (desktop), 48px 24px (mobile)
- Text Alignment: center
- Gap between elements: 24px (componentGap.lg)

**정보 밀도:**
- Viewport 높이: 100vh (첫 화면 전체 활용)
- 스크롤 없이 모든 정보 표시
- 텍스트: 최대 3줄 (Name 1줄 + Role 1줄 + Intro 1줄)

---

### Section 3: About/Summary

**Desktop:**
```
┌──────────────────────────────────────────────────────────┐
│  [About - H2]                                            │
│                                                          │
│  [3-4 문장 요약]                                          │
│  - AI 활용 방식                                           │
│  - 개발 프로세스에서의 AI 역할                             │
│  - 제공 가치                                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌─────────────────────┐
│  [About - H2]       │
│                     │
│  [3-4 문장 요약]     │
│                     │
└─────────────────────┘
```

**콘텐츠:**
- **Section Title (H2)**: "About" (SectionTitle level="h2")
- **Summary (paragraph)**:
  ```
  저는 AI를 단순한 도구가 아닌 개발 파트너로 활용합니다.
  Cursor, Claude, ChatGPT 등을 프로젝트 설계부터 디버깅까지 전 과정에 적극 활용하며,
  AI의 도움으로 빠르게 프로토타입을 만들고 반복 개선합니다.
  이를 통해 개발 속도를 높이고, 더 나은 사용자 경험에 집중할 수 있습니다.
  ```

**레이아웃:**
- Container: max-width 768px
- Padding: 64px 32px (desktop), 48px 24px (mobile)
- Text Alignment: left or center (결정 필요)
- Line height: 1.75 (relaxed)
- Section 구분: Divider 컴포넌트 사용 (섹션 상단 또는 하단)

**정보 밀도:**
- 텍스트: 최대 4-5줄
- 스캔 시간: 5-10초

---

### Section 4: Featured AX Projects

**Desktop:**
```
┌──────────────────────────────────────────────────────────┐
│  [Projects - H2]                                         │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │ [Project 1]│  │ [Project 2]│  │ [Project 3]│         │
│  │            │  │            │  │            │         │
│  │ [Title-H3] │  │ [Title-H3] │  │ [Title-H3] │         │
│  │ [Summary]  │  │ [Summary]  │  │ [Summary]  │         │
│  │ [Tags]     │  │ [Tags]     │  │ [Tags]     │         │
│  │ [Link →]   │  │ [Link →]   │  │ [Link →]   │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│                                                          │
│              [View All Projects - TextLink]              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌─────────────────────┐
│  [Projects - H2]    │
│                     │
│  ┌───────────────┐  │
│  │ [Project 1]   │  │
│  │ [Title-H3]    │  │
│  │ [Summary]     │  │
│  │ [Tags]        │  │
│  │ [Link →]      │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ [Project 2]   │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ [Project 3]   │  │
│  └───────────────┘  │
│                     │
│  [View All →]       │
│                     │
└─────────────────────┘
```

**콘텐츠:**
- **Section Title (H2)**: "Featured Projects" (SectionTitle level="h2")
- **Project Cards** (3개):
  1. **Genpresso** (AI 기반 블로그 자동화)
  2. **AI Chatbot** (AI 채팅봇 서비스)
  3. **노루 ERP** (중소기업 ERP 시스템)

**각 Project Card 구조:**
```
┌─────────────────────────────────┐
│ [프로젝트명 - H3]                 │
│ [한 줄 요약 - paragraph]          │
│ [태그: AI활용, 웹개발, ... ]       │
│ [자세히 보기 →] (TextLink)        │
└─────────────────────────────────┘
```

**컴포넌트:**
- Project Title: SectionTitle level="h3"
- Summary: paragraph (1-2줄, 최대 100자)
- Tags: Badge 컴포넌트 사용 (variant="default" 또는 "outline", size="sm")
- Link: TextLink (href="/projects/{id}", underline=true)

**레이아웃:**
- Container: max-width 1280px
- Padding: 64px 32px
- Grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Gap between cards: 32px (desktop), 24px (mobile)
- Card padding: 24px
- Card border: 1px solid var(--color-border-default)
- Card border-radius: 8px (borderRadius.lg)
- Section 구분: Divider 컴포넌트 사용 (섹션 상단)

**정보 밀도:**
- 각 카드: 3-4줄 (Title 1줄 + Summary 1-2줄 + Tags 1줄)
- 전체 섹션 스캔 시간: 10-15초

---

**참고:** CTA는 Featured Projects 섹션 내부의 "전체 프로젝트 보기" 링크로 충분합니다. 별도의 CTA Section은 구현하지 않습니다.

---

### Section 6: Footer (공통)

**Desktop:**
```
┌──────────────────────────────────────────────────────────┐
│  © 2025 이준경 | [GitHub] [Email]                        │
└──────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌─────────────────────┐
│  © 2025 이준경       │
│  [GitHub] [Email]   │
└─────────────────────┘
```

**컴포넌트:**
- Links: TextLink (external=true)

**레이아웃:**
- Padding: 32px
- Border-top: 1px solid var(--color-border-default)
- Text Alignment: center
- Font Size: small (0.875rem)

---

### Landing 페이지 정보 밀도 검증

**Desktop (1920x1080):**
- Hero Section: 1 viewport (스크롤 없음)
- About: 0.5 viewport
- Featured Projects: 1 viewport
- CTA: 0.5 viewport
- **총 스크롤**: 약 2-2.5 viewport ✅

**Mobile (375x667):**
- Hero Section: 1.5 viewport
- About: 1 viewport
- Featured Projects: 3 viewport (카드 3개 세로 배치)
- CTA: 0.5 viewport
- **총 스크롤**: 약 5-6 viewport (허용 범위)

---

## Archive (Projects List) Wireframe

### 페이지 목표

> "프로젝트를 빠르게 스캔하고, 관심 있는 프로젝트를 쉽게 선택할 수 있도록"

### 사용자 여정

```text
[진입]
  ↓
[페이지 헤더 확인]
  - 전체 프로젝트 개수 파악
  - 필터/정렬 옵션 확인 (선택적)
  ↓
[프로젝트 카드 스캔]
  - 각 카드 3-5초 훑어보기
  - 제목, 요약, 태그 확인
  ↓
[관심 프로젝트 선택]
  - 카드 클릭 → Project Detail 페이지 이동
```

---

### Section 1: Page Header

**Desktop:**
```
┌──────────────────────────────────────────────────────────┐
│  [Projects - H1]                                         │
│                                                          │
│  [전체 프로젝트 목록 - paragraph]                          │
│  [총 N개의 프로젝트]                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌─────────────────────┐
│  [Projects - H1]    │
│                     │
│  [전체 프로젝트]     │
│  [총 N개]           │
│                     │
└─────────────────────┘
```

**콘텐츠:**
- **Page Title (H1)**: "Projects" (SectionTitle level="h1")
- **Description**: "AI를 적극 활용한 프로젝트 모음입니다."
- **Count**: "총 8개의 프로젝트" (DB에서 실시간 조회)

**레이아웃:**
- Container: max-width 1280px
- Padding: 48px 32px (desktop), 32px 24px (mobile)

---

### Section 2: Project Cards Grid

**Desktop:**
```
┌──────────────────────────────────────────────────────────┐
│  ┌───────────┐  ┌───────────┐  ┌───────────┐            │
│  │ Project 1 │  │ Project 2 │  │ Project 3 │            │
│  │           │  │           │  │           │            │
│  │ [Title-H3]│  │ [Title-H3]│  │ [Title-H3]│            │
│  │ [Summary] │  │ [Summary] │  │ [Summary] │            │
│  │ [Tags]    │  │ [Tags]    │  │ [Tags]    │            │
│  │ [Link →]  │  │ [Link →]  │  │ [Link →]  │            │
│  └───────────┘  └───────────┘  └───────────┘            │
│                                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐            │
│  │ Project 4 │  │ Project 5 │  │ Project 6 │            │
│  └───────────┘  └───────────┘  └───────────┘            │
│                                                          │
│  ┌───────────┐  ┌───────────┐                           │
│  │ Project 7 │  │ Project 8 │                           │
│  └───────────┘  └───────────┘                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Mobile:**
```
┌─────────────────────┐
│  ┌───────────────┐  │
│  │ Project 1     │  │
│  │ [Title-H3]    │  │
│  │ [Summary]     │  │
│  │ [Tags]        │  │
│  │ [Link →]      │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ Project 2     │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ Project 3     │  │
│  └───────────────┘  │
│                     │
│  ... (총 8개)       │
│                     │
└─────────────────────┘
```

**각 Project Card 구조 (Landing과 동일):**
```
┌─────────────────────────────────┐
│ [프로젝트명 - H3]                 │
│ [한 줄 요약 - paragraph]          │
│ [태그: AI활용, 웹개발, ... ]       │
│ [자세히 보기 →] (TextLink)        │
└─────────────────────────────────┘
```

**컴포넌트:**
- Project Title: SectionTitle level="h3"
- Summary: paragraph (1-2줄, 최대 100자)
- Tags: Badge 컴포넌트 사용 (variant="default" 또는 "outline", size="sm")
- Link: TextLink (href="/projects/{id}", underline=true)

**레이아웃:**
- Container: max-width 1280px
- Padding: 32px
- Grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Gap: 32px (desktop), 24px (mobile)
- Card: 동일한 스타일 (Landing Featured Projects와 일관성)
- Section 구분: Divider 컴포넌트 사용 (Page Header 하단)

**정보 밀도:**
- Desktop: 한 화면에 3-6개 카드 표시
- 총 스크롤: 약 2-3 viewport (8개 프로젝트 기준)

---

### Section 3: 필터/정렬 옵션 (선택적, Phase 6에서 재검토)

**현재 결정: 제외**

**이유:**
- 프로젝트 개수가 8개로 적음 (필터 불필요)
- 정보 과부하 방지 (Global Constraints 준수)
- 사용자가 전체 목록을 스캔하는 데 부담 없음

**향후 고려:**
- 프로젝트 개수가 15개 이상 증가 시 필터 추가 검토

---

## 공통 컴포넌트

### Navigation Header

**구성:**
- Logo/Name (TextLink, href="/")
- Navigation Links (TextLink)
  - "Projects" (href="/projects")
  - "Contact" (href="#contact" or mailto:)
- Mobile: 햄버거 메뉴

**레이아웃:**
- Position: Sticky (스크롤 시 상단 고정)
- Background: var(--color-bg-primary)
- Border-bottom: 1px solid var(--color-border-default)
- Height: 64px (desktop), 56px (mobile)
- Padding: 0 32px

**컴포넌트:**
- Logo/Name: TextLink
- Navigation Links: TextLink

---

### Footer

**구성:**
- Copyright: "© 2025 이준경"
- Links:
  - GitHub (TextLink, external=true, href="https://github.com/{username}") - 실제 GitHub URL 필요
  - Email (TextLink, href="mailto:{email}") - 실제 Email 주소 필요

**레이아웃:**
- Padding: 32px
- Border-top: 1px solid var(--color-border-default)
- Text Alignment: center
- Background: var(--color-bg-secondary) (옵션)

---

## 반응형 전략

### Breakpoints

```css
/* Mobile */
@media (max-width: 767px) { ... }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

### 레이아웃 변화

**Desktop (1024px+):**
- Navigation: Horizontal links
- Hero Section: Center-aligned, full viewport
- Featured Projects: 3-column grid
- Project Cards: 3-column grid

**Tablet (768px - 1023px):**
- Navigation: Horizontal links (축소)
- Hero Section: Center-aligned
- Featured Projects: 2-column grid
- Project Cards: 2-column grid

**Mobile (< 768px):**
- Navigation: 햄버거 메뉴 (드롭다운)
- Hero Section: Center-aligned, 작은 폰트
- Featured Projects: 1-column (세로 배치)
- Project Cards: 1-column

### Typography 반응형

**Desktop:**
- H1: 2.25rem (36px)
- H2: 1.875rem (30px)
- H3: 1.5rem (24px)
- Body: 1rem (16px)

**Mobile:**
- H1: 1.875rem (30px)
- H2: 1.5rem (24px)
- H3: 1.25rem (20px)
- Body: 1rem (16px)

### Spacing 반응형

**Desktop:**
- Section Padding: 64px 32px
- Component Gap: 32px

**Mobile:**
- Section Padding: 48px 24px
- Component Gap: 24px

---

## 구현 가이드

### Task 4.1: Landing Wireframe 구현

#### 4.1.1 Navigation Header 구현

**파일**: `frontend/src/widgets/layout/Header/Header.tsx`

**구조:**
```tsx
import { TextLink } from '@/design-system';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <TextLink href="/" className={styles.logo}>
          이준경
        </TextLink>
        <nav className={styles.nav}>
          <TextLink href="/projects">Projects</TextLink>
          <TextLink href="#contact">Contact</TextLink>
        </nav>
      </div>
    </header>
  );
};
```

**스타일**: `Header.module.css`
```css
.header {
  position: sticky;
  top: 0;
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-default);
  z-index: 100;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.125rem;
  font-weight: 600;
}

.nav {
  display: flex;
  gap: 32px;
}

/* Mobile */
@media (max-width: 767px) {
  .container {
    height: 56px;
    padding: 0 24px;
  }

  .nav {
    gap: 24px;
  }
}
```

---

#### 4.1.2 Hero Section 구현

**파일**: `frontend/src/pages/HomePage/HeroSection.tsx`

**구조:**
```tsx
import { SectionTitle, Button } from '@/design-system';

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <SectionTitle level="h1">이준경</SectionTitle>
        <SectionTitle level="h2">AI 적극 활용 개발자</SectionTitle>
        <p className={styles.intro}>
          AI 도구를 적극 활용하여 개발 효율성과 사용자 경험을 개선하는 개발자입니다.
        </p>
        <div className={styles.cta}>
          <Button variant="primary" href="/projects">
            프로젝트 보기
          </Button>
          <Button variant="secondary" href="#footer">
            연락하기
          </Button>
          <Button variant="secondary" onClick={() => scrollToSection('about')}>
            더 알아보기 ↓
          </Button>
        </div>
      </div>
    </section>
  );
};
```

**스타일**: `HeroSection.module.css`
```css
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 32px;
}

.container {
  max-width: 768px;
  text-align: center;
}

.intro {
  margin-top: 24px;
  font-size: 1.125rem;
  line-height: 1.75;
  color: var(--color-text-secondary);
}

.cta {
  margin-top: 32px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Mobile */
@media (max-width: 767px) {
  .hero {
    padding: 48px 24px;
  }

  .intro {
    font-size: 1rem;
  }

  .cta {
    flex-direction: column;
    align-items: center;
  }
}
```

---

#### 4.1.3 About Section 구현

**파일**: `frontend/src/pages/HomePage/AboutSection.tsx`

**구조:**
```tsx
import { SectionTitle } from '@/design-system';

export const AboutSection = () => {
  return (
    <section className={styles.about}>
      <div className={styles.container}>
        <SectionTitle level="h2">About</SectionTitle>
        <p className={styles.summary}>
          저는 AI를 단순한 도구가 아닌 개발 파트너로 활용합니다.
          Cursor, Claude, ChatGPT 등을 프로젝트 설계부터 디버깅까지 전 과정에 적극 활용하며,
          AI의 도움으로 빠르게 프로토타입을 만들고 반복 개선합니다.
          이를 통해 개발 속도를 높이고, 더 나은 사용자 경험에 집중할 수 있습니다.
        </p>
      </div>
    </section>
  );
};
```

**스타일**: `AboutSection.module.css`
```css
.about {
  padding: 64px 32px;
}

.container {
  max-width: 768px;
  margin: 0 auto;
}

.summary {
  margin-top: 24px;
  line-height: 1.75;
  color: var(--color-text-primary);
}

/* Mobile */
@media (max-width: 767px) {
  .about {
    padding: 48px 24px;
  }
}
```

---

#### 4.1.4 Featured Projects Section 구현

**파일**: `frontend/src/pages/HomePage/FeaturedProjectsSection.tsx`

**구조:**
```tsx
import { SectionTitle, TextLink, Badge, Divider } from '@/design-system';

interface Project {
  id: string;
  title: string;
  summary: string;
  tags: string[];
}

const featuredProjects: Project[] = [
  {
    id: 'genpresso',
    title: 'Genpresso',
    summary: 'AI 기반 블로그 자동화 플랫폼',
    tags: ['AI활용', '웹개발', 'TypeScript'],
  },
  {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    summary: 'LLM 기반 채팅봇 서비스',
    tags: ['AI활용', 'NLP', 'Node.js'],
  },
  {
    id: 'noru-erp',
    title: '노루 ERP',
    summary: '중소기업 ERP 시스템',
    tags: ['웹개발', 'Java', 'Spring'],
  },
];

export const FeaturedProjectsSection = () => {
  return (
    <section className={styles.featured}>
      <Divider orientation="horizontal" />
      <div className={styles.container}>
        <SectionTitle level="h2">Featured Projects</SectionTitle>
        <div className={styles.grid}>
          {featuredProjects.map((project) => (
            <div key={project.id} className={styles.card}>
              <SectionTitle level="h3">{project.title}</SectionTitle>
              <p className={styles.summary}>{project.summary}</p>
              <div className={styles.tags}>
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
              <TextLink href={`/projects/${project.id}`} underline>
                자세히 보기 →
              </TextLink>
            </div>
          ))}
        </div>
        <div className={styles.viewAll}>
          <TextLink href="/projects" underline>
            전체 프로젝트 보기 →
          </TextLink>
        </div>
      </div>
    </section>
  );
};
```

**스타일**: `FeaturedProjectsSection.module.css`
```css
.featured {
  padding: 64px 32px;
  background-color: var(--color-bg-secondary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

.grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.card {
  padding: 24px;
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  background-color: var(--color-bg-primary);
}

.summary {
  margin-top: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.tags {
  margin-top: 16px;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.viewAll {
  margin-top: 48px;
  text-align: center;
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 767px) {
  .featured {
    padding: 48px 24px;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
```

---

### Task 4.2: Archive Wireframe 구현

#### 4.2.1 Projects List Page 구현

**파일**: `frontend/src/pages/ProjectsListPage/ProjectsListPage.tsx`

**구조:**
```tsx
import { SectionTitle, TextLink, Badge, Divider } from '@/design-system';

interface Project {
  id: string;
  title: string;
  summary: string;
  tags: string[];
}

// API 구조 정의 (Phase 4에서는 하드코딩, Phase 5에서 실제 API 연동)
interface ProjectAPIResponse {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  // Phase 5에서 추가될 필드들
  // description?: string;
  // technologies?: string[];
  // githubUrl?: string;
  // liveUrl?: string;
}

const projects: Project[] = [
  // Phase 4: 하드코딩된 예시 데이터
  // Phase 5: API에서 가져오기
];

export const ProjectsListPage = () => {
  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div className={styles.container}>
          <SectionTitle level="h1">Projects</SectionTitle>
          <p className={styles.description}>
            AI를 적극 활용한 프로젝트 모음입니다.
          </p>
          <p className={styles.count}>총 {projects.length}개의 프로젝트</p>
        </div>
        <Divider orientation="horizontal" />
      </section>

      <section className={styles.projects}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {projects.map((project) => (
              <div key={project.id} className={styles.card}>
                <SectionTitle level="h3">{project.title}</SectionTitle>
                <p className={styles.summary}>{project.summary}</p>
                <div className={styles.tags}>
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <TextLink href={`/projects/${project.id}`} underline>
                  자세히 보기 →
                </TextLink>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
```

**스타일**: `ProjectsListPage.module.css`
```css
.page {
  min-height: 100vh;
}

.header {
  padding: 48px 32px;
  border-bottom: 1px solid var(--color-border-default);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

.description {
  margin-top: 16px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.count {
  margin-top: 8px;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

.projects {
  padding: 32px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.card {
  padding: 24px;
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
}

.summary {
  margin-top: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.tags {
  margin-top: 16px;
  font-size: 0.875rem;
  color: var(--color-text-tertiary);
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 767px) {
  .header {
    padding: 32px 24px;
  }

  .projects {
    padding: 24px;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
```

---

### Task 4.3: Footer 구현

**파일**: `frontend/src/widgets/layout/Footer/Footer.tsx`

**구조:**
```tsx
import { TextLink } from '@/design-system';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>© 2025 이준경</p>
        <div className={styles.links}>
          <TextLink href="https://github.com/{username}" external>
            GitHub
          </TextLink>
          <TextLink href="mailto:{email}">
            Email
          </TextLink>
        </div>
      </div>
    </footer>
  );
};
```

**스타일**: `Footer.module.css`
```css
.footer {
  padding: 32px;
  border-top: 1px solid var(--color-border-default);
  background-color: var(--color-bg-secondary);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
}

.copyright {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.links {
  margin-top: 16px;
  display: flex;
  gap: 24px;
  justify-content: center;
  font-size: 0.875rem;
}

/* Mobile */
@media (max-width: 767px) {
  .footer {
    padding: 24px;
  }
}
```

---

## 구현 결정사항 요약

### 명확화된 사항

1. **태그 표시**: Badge 컴포넌트 사용 (variant="outline", size="sm")
2. **Mobile 햄버거 메뉴**: SVG 아이콘, 드롭다운 애니메이션 허용
3. **Scroll Indicator**: 클릭 가능한 버튼 (다음 섹션으로 스크롤)
4. **CTA Section**: Featured Projects 내부의 "전체 프로젝트 보기" 링크만 사용 (별도 CTA Section 제거)
5. **Contact 링크**: Footer Email 링크로 대체 (href="#footer")
6. **프로젝트 데이터**: Phase 4에서는 API 구조만 정의, 하드코딩된 예시 데이터 사용
7. **Footer 링크**: 실제 GitHub URL과 Email 주소 필요 (현재 placeholder)
8. **섹션 구분**: Divider 컴포넌트 사용 (섹션 간 구분)
9. **Skeleton 컴포넌트**: Phase 4에서는 사용하지 않음 (Phase 5에서 API 연동 시 추가)
10. **Tablet 레이아웃**: 완전히 구현 (2-column grid 등)

### 추천 사항

#### 9. Skeleton 컴포넌트 사용 여부

**추천: Phase 4에서는 사용하지 않음**

**이유:**
- Phase 4는 Wireframe 단계로, 정적 레이아웃과 구조에 집중
- 프로젝트 데이터가 하드코딩되어 있어 로딩 상태가 필요 없음
- Phase 5에서 API 연동 시 실제 로딩 상태가 필요하므로, 그때 Skeleton 컴포넌트 활용

**Phase 5에서의 활용:**
- 프로젝트 카드 로딩 시: SkeletonCard 컴포넌트 사용
- 텍스트 로딩 시: Skeleton 컴포넌트 (Text variant) 사용

#### 10. Tablet 레이아웃 구현 범위

**추천: 완전히 구현 (2-column grid 등)**

**이유:**
- Tablet 사용자가 많고, 중간 크기 화면에 최적화된 레이아웃 필요
- 문서에 이미 Tablet breakpoint (768px-1023px)가 정의되어 있음
- 2-column grid는 Desktop과 Mobile 사이의 자연스러운 전환

**구현 내용:**
- Navigation: Horizontal links (축소된 간격)
- Featured Projects: 2-column grid
- Project Cards: 2-column grid
- Typography: Desktop과 동일 (또는 약간 축소)
- Spacing: Desktop과 동일

---

## 검증 체크리스트

### Task 4.1: Landing Wireframe 구현

- [ ] Navigation Header 구현
  - [ ] Desktop 레이아웃 (Logo, Projects, Contact 링크)
  - [ ] Mobile 햄버거 메뉴 (SVG 아이콘, 드롭다운 애니메이션)
  - [ ] Sticky positioning
  - [ ] 외부 클릭 시 메뉴 닫기
- [ ] Hero Section 구현
  - [ ] 이름, 역할, 한 줄 소개 표시
  - [ ] Primary CTA 버튼 ("프로젝트 보기")
  - [ ] Secondary CTA 버튼 ("연락하기" → Footer로 스크롤)
  - [ ] Scroll Indicator 버튼 (다음 섹션으로 스크롤)
  - [ ] 100vh 높이 (Above the fold)
- [ ] About Section 구현
  - [ ] AI 활용 방식 요약 (3-4문장)
  - [ ] 적절한 여백 및 가독성
  - [ ] Divider 컴포넌트 (섹션 상단 또는 하단)
- [ ] Featured Projects Section 구현
  - [ ] Divider 컴포넌트 (섹션 상단)
  - [ ] 3개 프로젝트 카드 표시
  - [ ] 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
  - [ ] 각 카드: Title (H3), Summary, Tags (Badge 컴포넌트), Link
  - [ ] "전체 프로젝트 보기" 링크 (TextLink)
- [ ] Footer 구현
  - [ ] Copyright 텍스트
  - [ ] GitHub 링크 (실제 URL 필요)
  - [ ] Email 링크 (실제 주소 필요)

### Task 4.2: Archive Wireframe 구현

- [ ] Page Header 구현
  - [ ] Page Title (H1)
  - [ ] 설명 및 프로젝트 개수
  - [ ] Divider 컴포넌트 (헤더 하단)
- [ ] Projects Grid 구현
  - [ ] 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
  - [ ] 전체 프로젝트 카드 표시
  - [ ] 각 카드: Title (H3), Summary, Tags (Badge 컴포넌트), Link
  - [ ] API 구조 정의 (ProjectAPIResponse 인터페이스)

### Task 4.3: 반응형 검증

- [ ] Desktop (1024px+) 레이아웃 확인
  - [ ] Navigation: Horizontal links
  - [ ] Hero: Center-aligned, full viewport
  - [ ] Featured Projects: 3-column grid
  - [ ] Project Cards: 3-column grid
- [ ] Tablet (768px-1023px) 레이아웃 확인
  - [ ] Navigation: Horizontal links (축소)
  - [ ] Hero: Center-aligned
  - [ ] Featured Projects: 2-column grid
  - [ ] Project Cards: 2-column grid
- [ ] Mobile (< 768px) 레이아웃 확인
  - [ ] Navigation: 햄버거 메뉴 (드롭다운)
  - [ ] Hero: Center-aligned, 작은 폰트
  - [ ] Featured Projects: 1-column
  - [ ] Project Cards: 1-column
- [ ] Typography 반응형 적용
  - [ ] Desktop: H1 36px, H2 30px, H3 24px
  - [ ] Mobile: H1 30px, H2 24px, H3 20px
- [ ] Spacing 반응형 적용
  - [ ] Desktop: Section padding 64px, Gap 32px
  - [ ] Mobile: Section padding 48px, Gap 24px

### Task 4.4: 디자인 시스템 컴포넌트 사용

- [ ] Button 컴포넌트 (Primary/Secondary)
- [ ] TextLink 컴포넌트 (underline 옵션)
- [ ] SectionTitle 컴포넌트 (H1-H4)
- [ ] Divider 컴포넌트 (Horizontal)
- [ ] Badge 컴포넌트 (태그 표시, variant="outline", size="sm")
- [ ] 새 컴포넌트 추가 없음 확인

### 품질 검증

- [ ] Global Constraints 준수
  - [ ] 디자인 최소화
  - [ ] 불필요한 요소 제거
  - [ ] 드롭다운 애니메이션만 허용 (기타 애니메이션 없음)
- [ ] 정보 밀도 검증
  - [ ] Landing: 최대 2-3 스크롤 (desktop)
  - [ ] Archive: 최대 3-4 스크롤 (8개 프로젝트 기준)
- [ ] 접근성 검증
  - [ ] 키보드 네비게이션 지원 (Tab 순서)
  - [ ] aria-label 적용 (햄버거 메뉴, 버튼)
  - [ ] 시맨틱 HTML 사용 (header, nav, section, footer)
  - [ ] 터치 타겟 크기 (최소 44x44px)

---

## 다음 단계

### Phase 5: UI Implementation

Phase 4 완료 후, [phase-5-design.md](./phase-5-design.md)로 이동하여 실제 UI 구현을 시작합니다.

**Phase 5 작업 개요**:
1. Landing 페이지 UI 구현
2. Archive 페이지 UI 구현
3. API 연동 (백엔드 데이터 조회)
4. 라우팅 설정

---

## 참고 문서

### Epic 문서
- [Epic README](./README.md)
- [Phase 3 완료 보고서](./phase-3-completion.md)
- [Phase 3 설계 문서](./phase-3-design.md)
- [Phase 2 완료 보고서](./phase-2-completion.md)

### 디자인 시스템
- [색상 팔레트](../../technical/design-system/color-palette.md)
- [Phase 3 디자인 토큰](./phase-3-design.md#디자인-토큰-정의)

---

**검토자**: 사용자 확인 필요
**최종 승인**: 대기 중
