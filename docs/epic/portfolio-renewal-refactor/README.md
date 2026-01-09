# Epic: Portfolio Site Renewal (Structural Refactor)

## Epic Goal

```text
기존 포트폴리오 사이트를
브랜딩 변경 없이,
구조·콘텐츠·UI를 정비하여
Landing / Profile / Archive 3단 구조로 리뉴얼한다.
```

* 목적: **정보 과부하 제거 + 구조 명확화**
* 범위: UI/구조/콘텐츠 재배치
* 비범위: 브랜딩 메시지, 카피라이팅 감성 수정

---

## Global Constraints (중요)

```text
- 디자인은 최소화한다
- 새로운 기능을 만들지 않는다
- 기존 기능은 필요 시 제거한다
- 디자인 시스템을 벗어난 UI 추가 금지
```

---

## Phase 0 — Current State Snapshot (필수)

### Task 0.1: 현 상태 기록

```text
- 기존 페이지 목록 정리
- 각 페이지의 주요 기능 목록화
- 주요 UI 컴포넌트 캡처
```

### Output

```text
/docs/epic/portfolio-renewal-refactor/current-state.md
```

---

## Phase 1 — Content Inventory (DB 기반 콘텐츠 인벤토리)

> **전략**: DB를 단일 소스로 유지하고 리뉴얼 설계를 위한 인벤토리 문서를 작성합니다.

### 문서 구조

```text
phase-1-design.md        # 설계 문서
phase-1-checklist.md     # 작업 체크리스트
phase-1-completion.md    # 완료 보고서 (작업 완료 시)
```

### 작업 개요

1. **DB 데이터 추출 및 분석**
   - `projects`, `experiences`, `education`, `certifications` 테이블 분석
   - 리뉴얼 템플릿과 DB 필드 매핑
   - 누락된 정보 또는 개선이 필요한 필드 식별

2. **콘텐츠 구조 문서화**
   - DB 데이터를 리뉴얼 템플릿 형식으로 정리
   - 각 프로젝트의 현재 상태와 리뉴얼 시 필요한 정보 정리

3. **DB 스키마 개선 제안** (필요 시)
   - 리뉴얼에 필요한 필드가 없으면 DB 스키마 확장 제안

### 상세 내용

자세한 작업 내용은 [phase-1-design.md](./phase-1-design.md)를 참조하세요.

---

## Phase 2 — Site Structure Definition

### 문서 구조

```text
phase-2-design.md        # 설계 문서
phase-2-checklist.md     # 작업 체크리스트
phase-2-completion.md    # 완료 보고서 (작업 완료 시)
```

### 작업 개요

1. **페이지 구조 확정**
   - Landing (Home), Archive (Projects List)
   - "AI 적극 활용 개발자" 컨셉 및 "AX 프로젝트" 중심 설계

2. **페이지별 허용 콘텐츠 정의**
   - 각 페이지의 역할과 콘텐츠 범위 명확화
   - 사용자 여정 및 인터랙션 플로우 정의

### 주요 결정 사항

- **컨셉**: "AI 적극 활용 개발자" + "AX 프로젝트"
- **Featured Projects**: Genpresso, AI Chatbot, 노루 ERP
- **Tech Stack Section**: 제거 (프로젝트 중심 단순화)

### 상세 내용

자세한 작업 내용은 [phase-2-design.md](./phase-2-design.md)를 참조하세요.

---

## Phase 3 — Design System Minimalization

### 문서 구조

```text
phase-3-design.md        # 설계 문서
phase-3-checklist.md     # 작업 체크리스트
phase-3-completion.md    # 완료 보고서 (작업 완료 시)
```

### 작업 개요

1. **토큰 정의**
   - Color, Typography, Spacing

2. **컴포넌트 정의**
   - Button, Text Link, Section Title, Divider

⚠️ 이 단계에서 페이지 UI 생성 금지

### 상세 내용

자세한 작업 내용은 [phase-3-design.md](./phase-3-design.md)를 참조하세요.

---

## Phase 4 — Wireframe (Low Fidelity)

### 문서 구조

```text
phase-4-design.md        # 설계 문서
phase-4-checklist.md     # 작업 체크리스트
phase-4-completion.md    # 완료 보고서 (작업 완료 시)
```

### 작업 개요

1. **Landing Wireframe**
   - 첫 화면 정보 밀도 검증
   - 페이지 이동 동선 명확화

2. **Profile Wireframe**
   - 스크롤 길이 최소화
   - 정보 계층 명확화

3. **Archive Wireframe**
   - 목록 부담 최소화
   - 클릭 이유 명확화

### 상세 내용

자세한 작업 내용은 [phase-4-design.md](./phase-4-design.md)를 참조하세요.

---

## Phase 4.5 — Landing Page Enhancement (Scroll-Driven Animations)

### 문서 구조

```text
phase-4-5-enhancement-design.md  # 설계 문서
phase-4-5-checklist.md           # 작업 체크리스트
phase-4-5-completion.md          # 완료 보고서 (작업 완료 시)
```

### 작업 개요

1. **브랜드 컬러 시스템 개선**
   - 그라데이션 컬러 추가
   - 애니메이션 강조 컬러 확장
   - 다크 모드 대응 개선

2. **Scroll-Driven Animations 구현**
   - Hero Section: 페이드인 + 스케일 애니메이션
   - About Section: 스크롤 기반 텍스트 등장
   - Featured Projects: 카드 순차 등장 애니메이션

3. **성능 및 접근성 최적화**
   - GPU 가속 활용
   - `prefers-reduced-motion` 지원

### 목적

Phase 4 완료 후 랜딩 페이지의 **임팩트 부족 문제**를 해결하기 위한 개선 작업입니다.

### 상세 내용

자세한 작업 내용은 [phase-4-5-enhancement-design.md](./phase-4-5-enhancement-design.md)를 참조하세요.

---

## Phase 5 — UI Implementation

### 문서 구조

```text
phase-5-design.md        # 설계 문서
phase-5-checklist.md     # 작업 체크리스트
phase-5-completion.md    # 완료 보고서 (작업 완료 시)
```

### 작업 개요

1. **Landing UI 적용**
   - 디자인 시스템만 사용
   - 새로운 컴포넌트 추가 금지

2. **Profile UI 적용**

3. **Archive + Detail UI 적용**

### 주요 결정 사항

#### 주요 프로젝트 소개문구 관리 방식

**결정**: 설정 파일 전용 관리 (API 사용 안 함)

**구조**:
```
frontend/src/pages/HomePage/
  ├── FeaturedProjectsSection.tsx
  └── config/
      └── featuredProjects.config.ts  # 주요 프로젝트 설정
```

**설정 파일 내용**:
- 주요 프로젝트 전체 정보 (ID, 제목, 이미지 URL, 기술 스택, 소개문구 등)
- 프로젝트 순서
- 표시 옵션 (최대 개수 등)

**장점**:
1. **단순성**: API 연동 없이 설정 파일만으로 관리하여 구조가 단순함
2. **명확성**: "주요 프로젝트"는 선별된 프로젝트이므로, 명시적으로 관리하는 것이 명확함
3. **유지보수성**: 소개문구 수정 시 코드를 건드리지 않고 설정 파일만 수정하면 됨
4. **독립성**: API 변경이나 장애와 무관하게 랜딩 페이지의 주요 프로젝트 섹션이 동작함
5. **확장성**: 나중에 다국어 지원이나 A/B 테스트를 추가하기 쉬움

**구현 전략**:
- Phase 4에서 하드코딩된 `PROJECTS` 배열을 설정 파일로 분리
- `FeaturedProjectsSection` 컴포넌트는 설정 파일에서 데이터를 import하여 사용
- 코드와 콘텐츠가 분리되어 유지보수가 쉬움

### 상세 내용

자세한 작업 내용은 [phase-5-design.md](./phase-5-design.md)를 참조하세요.

---

## Phase 6 — Profile & Chat Pages + Admin Login Design

### 문서 구조

```text
phase-6-design.md        # 설계 문서
phase-6-checklist.md     # 작업 체크리스트
phase-6-completion.md    # 완료 보고서 (작업 완료 시)
```

### 작업 개요

1. **Profile 페이지 구현**
   - 경력/교육/자격증 정보 표시
   - 디자인 시스템 완전 준수

2. **Chat 페이지 독립화**
   - 챗봇을 독립 페이지로 분리
   - 디자인 시스템 기반 구현

3. **Admin 로그인 페이지 리뉴얼**
   - 디자인 시스템 컴포넌트 적용
   - Input 컴포넌트 추가

### 상세 내용

자세한 작업 내용은 [phase-6-design.md](./phase-6-design.md)를 참조하세요.

---

## Phase 7 — Cleanup & System Consolidation

### 문서 구조

```text
phase-7-design.md        # 설계 문서
phase-7-checklist.md     # 작업 체크리스트
phase-7-completion.md    # 완료 보고서 (작업 완료 시)
```

### 작업 개요

리뉴얼의 마지막 단계로, 프로젝트 전체의 기술 부채를 정리합니다.

1. **폴더 구조 통합 (3-Folder Architecture)** ⭐ 핵심
   - `frontend/src/`를 `admin`, `design-system`, `main` 3개 폴더로 정리
   - 분산된 폴더들(pages, widgets, shared, features, entities, hooks)을 main으로 통합
   - import 경로 업데이트

2. **Phase 6 남은 작업 완료**
   - HomePage Chatbot 패널 제거
   - AppProvider 상태 정리
   - Footer 네비게이션 추가

3. **중복 컴포넌트 통합 및 제거**
   - shared/ui 중복 컴포넌트 제거
   - features/project-gallery 레거시 정리
   - features/chatbot 정리

4. **컬러 시스템 정리**
   - 하드코딩 컬러 제거
   - 스토리북 컬러 정리
   - globals.css 정리

5. **스토리북 정리**
   - 누락된 스토리 작성 (선택)
   - 미사용 스토리 제거

### 최종 구조

```
frontend/src/
├── admin/           # 🔵 Admin 앱 (독립)
├── design-system/   # 🟢 디자인 시스템 (공유)
├── main/            # 🟡 Main 포트폴리오 앱
├── stories/         # 📚 스토리북 에셋
├── index.css
└── main.tsx
```

### 상세 내용

자세한 작업 내용은 [phase-7-design.md](./phase-7-design.md)를 참조하세요.

---

## Definition of Done (DoD)

```text
- 모든 페이지 역할이 명확하다
- 랜딩에 정보 과부하가 없다
- 프로젝트는 '결과'보다 '판단 과정'이 보인다
- 디자인 시스템 외 UI가 없다
- 처음 보는 사용자가 길을 잃지 않는다
```


