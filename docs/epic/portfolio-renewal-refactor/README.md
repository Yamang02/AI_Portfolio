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

## Phase 1 — Content Inventory (UI 제거 단계)

### Task 1.1: 프로젝트 콘텐츠 정리

각 프로젝트를 UI와 분리된 텍스트로 정리한다.

```text
프로젝트 템플릿:
- Project Name
- Time Period
- My Role (Developer / Collaborator / Other)
- Initial Situation
- Key Problems Observed
- Direction / Decision Made
- Outcome
- References (GitHub / Service / Docs)
```

### Task 1.2: 프로필 정보 정리

```text
- 역할 이력 요약
- 기술 스택 단순 나열
- 협업/의사결정 관련 경험 요약
```

### Output

```text
/docs/epic/portfolio-renewal-refactor/content/projects.md
/docs/epic/portfolio-renewal-refactor/content/profile.md
```

---

## Phase 2 — Site Structure Definition

### Task 2.1: 페이지 구조 확정

```text
Pages:
- Landing
- Profile
- Archive
- Archive Detail
```

### Task 2.2: 페이지별 허용 콘텐츠 정의

```text
Landing:
- 소개 문장
- 내부 페이지 링크
- 요약된 사고 방식

Profile:
- 역할/경험 요약
- 판단 스타일
- 이력 정보

Archive:
- 프로젝트 목록
- 최소 필터
- 상세 페이지 진입

Archive Detail:
- 프로젝트 서술
- 판단 과정
- 결과 및 링크
```

### Output

```text
/docs/epic/portfolio-renewal-refactor/structure/pages.md
```

---

## Phase 3 — Design System Minimalization

### Task 3.1: 토큰 정의

```text
- Color: Base / Accent
- Typography: Heading / Body
- Spacing: XS / S / M / L
```

### Task 3.2: 컴포넌트 정의

```text
- Button (Primary 1종)
- Text Link
- Section Title
- Divider
```

⚠️ 이 단계에서 페이지 UI 생성 금지

### Output

```text
/docs/epic/portfolio-renewal-refactor/design-system/tokens.md
/docs/epic/portfolio-renewal-refactor/design-system/components.md
```

---

## Phase 4 — Wireframe (Low Fidelity)

### Task 4.1: Landing Wireframe

* 첫 화면 정보 밀도 검증
* 페이지 이동 동선 명확화

### Task 4.2: Profile Wireframe

* 스크롤 길이 최소화
* 정보 계층 명확화

### Task 4.3: Archive Wireframe

* 목록 부담 최소화
* 클릭 이유 명확화

### Output

```text
/docs/epic/portfolio-renewal-refactor/wireframe/landing.png
/docs/epic/portfolio-renewal-refactor/wireframe/profile.png
/docs/epic/portfolio-renewal-refactor/wireframe/archive.png
```

(또는 Figma 링크)

---

## Phase 5 — UI Implementation

### Task 5.1: Landing UI 적용

* 디자인 시스템만 사용
* 새로운 컴포넌트 추가 금지

### Task 5.2: Profile UI 적용

### Task 5.3: Archive + Detail UI 적용

### Output

```text
/src/pages/*
```

---

## Phase 6 — Cut & Validation

### Task 6.1: 제거 대상 식별

```text
- 없어도 되는 기능
- 설명 없으면 오해되는 UI
- 신뢰를 해치는 요소
```

### Task 6.2: 최종 정리

* 불필요한 요소 삭제
* 페이지 간 중복 제거

### Output

```text
/docs/epic/portfolio-renewal-refactor/cleanup-report.md
```

---

## Definition of Done (DoD)

```text
- 모든 페이지 역할이 명확하다
- 랜딩에 정보 과부하가 없다
- 프로젝트는 '결과'보다 '판단 과정'이 보인다
- 디자인 시스템 외 UI가 없다
- 처음 보는 사용자가 길을 잃지 않는다
```

---

## 에이전트에게 전달할 한 줄 요약 (복사용)

```text
브랜딩은 건드리지 말고,
기존 포트폴리오를
콘텐츠 정리 → 구조 재설계 → 디자인 시스템 최소화 → 와이어프레임 → UI 적용 순으로 리뉴얼하라.
새 기능 추가 금지, 불필요한 요소는 과감히 제거한다.
```
