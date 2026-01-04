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

### 상세 내용

자세한 작업 내용은 [phase-5-design.md](./phase-5-design.md)를 참조하세요.

---

## Phase 6 — Cut & Validation

### 문서 구조

```text
phase-6-design.md        # 설계 문서
phase-6-checklist.md     # 작업 체크리스트
phase-6-completion.md    # 완료 보고서 (작업 완료 시)
```

### 작업 개요

1. **제거 대상 식별**
   - 없어도 되는 기능
   - 설명 없으면 오해되는 UI
   - 신뢰를 해치는 요소

2. **최종 정리**
   - 불필요한 요소 삭제
   - 페이지 간 중복 제거

### 상세 내용

자세한 작업 내용은 [phase-6-design.md](./phase-6-design.md)를 참조하세요.

---

## Definition of Done (DoD)

```text
- 모든 페이지 역할이 명확하다
- 랜딩에 정보 과부하가 없다
- 프로젝트는 '결과'보다 '판단 과정'이 보인다
- 디자인 시스템 외 UI가 없다
- 처음 보는 사용자가 길을 잃지 않는다
```


