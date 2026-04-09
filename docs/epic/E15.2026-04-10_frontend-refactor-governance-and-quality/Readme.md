# Epic E15: frontend-refactor-governance-and-quality

## 목표

- `frontend`와 `profile`의 런타임 경계를 다시 정리하고, profile 중복 구현을 제거한다.
- `frontend`에는 runtime-first slim FSD를 적용하고, 실제 디렉터리 구조와 alias/lint/doc 규칙을 일치시킨다.
- `YamangDesign`의 토큰 아키텍처를 기준으로 `Primitive -> Semantic(alias) -> UI shell` 체계를 재정의하고 `frontend`와 `profile`에 공통 적용한다.
- SonarQube 품질 이슈, 테스트 부족, 성능 부채를 함께 정리해 프론트엔드 품질 게이트를 끌어올린다.
- 제품 특화 규칙과 일반 규칙을 분리해, 재사용 가능한 결정만 `policy_compiler`로 이식한다.

## 배경 / 맥락

### 현재 상태

- `frontend/src/main/app/MainAppRoutes.tsx`는 여전히 `/profile`을 내부 라우트로 유지하고 있고, `frontend/src/main/pages/ProfilePage/ProfilePage.tsx`는 main 앱의 데이터 쿼리 기반 profile 화면을 렌더링한다.
- `profile/index.html`은 Tailwind CDN, inline theme config, inline script를 포함한 정적 monolith이고, 동시에 `profile/src/main.tsx`, `profile/src/App.tsx`, `profile/public/content.json` 기반의 별도 React 파이프라인이 공존한다.
- `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/.eslintrc.cjs`, `docs/technical/architecture/fsd-refactoring.md`가 서로 다른 구조를 가정하고 있어 FSD 규칙이 문서와 코드 모두에서 드리프트된 상태다.
- 토큰은 `frontend/src/design-system/styles/globals.css`, `frontend/src/design-system/tokens/colors.ts`, `frontend/src/shared/config/theme.ts`, `profile/index.html`에 분산되어 있으며 `--color-*`, hex literal, inline Tailwind theme가 혼재한다.
- SonarQube frontend baseline은 `docs/issues/sonarqube/2026-03-27-sonarqube-open-issues-summary.md` 기준 open issues 336건이고, `frontend/src`의 테스트 파일은 2개뿐이다.

### 선행 에픽과의 관계

- E08은 design-system token overhaul을 시도했지만 현재 `frontend` 전체와 `profile`까지 단일 거버넌스로 정리되지는 못했다.
- E13은 `profile/public/content.json`과 typed schema를 정리했다.
- E14는 `yamang02.com -> profile`, `yamangsolution.com -> frontend`의 배포 경계를 결정했다.
- E15는 E13/E14를 실제 프론트엔드 구조와 품질 규칙으로 흡수하는 정리 에픽이다.

## 아키텍처 결정

### Frontend Structure Choice

- `frontend/src/main`: 독립 앱 — FSD 6레이어 (`app/pages/widgets/features/entities/shared`)
- `frontend/src/admin`: 독립 앱 — FSD 6레이어 (`app/pages/widgets/features/entities/shared`)
- `profile`: static HTML + Tailwind CDN 단일 파일 구조 유지

### 선택 근거

- `main`과 `admin`은 별도 entry point(`index.html`, `admin.html`)를 가진 독립 런타임이다. 추후 별도 repo 분리가 가능하도록 상호 직접 import를 금지한다.
- 각 앱 내부에는 FSD 표준 6레이어를 적용해 dependency direction을 명시한다.
- top-level `shared/`와 `design-system/`은 양쪽 앱이 실제로 공용하는 코드만 남긴다.
- `profile`은 단일 deployable static site이므로 React 파이프라인 없이 HTML 단일 파일 구조를 유지한다.

### Read / Write Pattern

- React + React Query + local UI state의 standard pattern을 유지한다.
- 이 에픽에서는 CQRS, 새로운 전역 상태 프레임워크, micro frontend를 도입하지 않는다.

### Module Boundary

- `portfolio-public`: `frontend/src/main` (독립 앱)
- `portfolio-admin`: `frontend/src/admin` (독립 앱)
- `design-system`: `frontend/src/design-system` (cross-app UI 전용)
- `shared`: `frontend/src/shared` (양쪽 공용만, 최소화)
- `profile-site`: `profile/index.html` (static HTML)

### 의존 방향 규칙

- `frontend/src/main`과 `frontend/src/admin`은 서로 직접 import하지 않는다.
- 각 앱 내부에서 FSD downward dependency를 적용한다: `app → pages → widgets → features → entities → shared`.
- `frontend/src/shared`는 `main`/`admin`의 feature, entity, page 코드를 import하지 않는다.
- `frontend/src/design-system`은 표현 계층과 토큰 정의만 담당하고, runtime feature 데이터나 page orchestration을 포함하지 않는다.
- `profile`은 `frontend/src/**`를 직접 import하지 않는다.

## 아키텍처 리뷰 결과

- BLOCKER [AR-02-02] profile surface가 `frontend`와 `profile`에 이중 구현되어 canonical runtime이 불명확하다.
- BLOCKER [AR-02-01] `profile/index.html` 정적 monolith와 `profile/src/App.tsx` JSON consumer가 병존해, single source of truth가 깨져 있다.
- IMPORTANT [AR-02-02] FSD 문서, alias, lint 규칙, 실제 디렉터리 구조가 서로 다르다.
- IMPORTANT [DT-04-01] UI 코드에서 `var(--ds-*)` / `var(--ui-*)` 외 경로(`--color-*`, inline hex, duplicated theme constants)가 광범위하게 남아 있다.
- IMPORTANT [SQ-01/SQ-02] Sonar frontend issues 336건, 테스트 2개 수준으로 구조 리팩토링과 품질 개선을 분리해서 진행할 수 없는 상태다.
- MINOR [AR-02-03] `ArticleListPage`, `ProjectDetailPage`, `ProjectEdit` 등 orchestration이 과도한 페이지가 많아, 구조 정리 후에도 품질/성능 병목이 남을 가능성이 높다.

## 범위

### In

- `frontend` 구조 재정렬과 runtime 경계 재문서화
- `profile` canonical rendering path 정리
- 디자인 토큰 체계 재설계와 migration bridge 전략
- SonarQube scope 정리, 반복 이슈 정리, 테스트 baseline 확장
- 대형 페이지와 공통 유틸의 품질/성능 hotspot 정리
- `policy_compiler`로 일반화 가능한 정책 이식

### Out

- 백엔드 구조 리팩토링
- DNS, CloudFront, S3 등 인프라 작업 자체
- reusable package publish까지 포함한 design-system 패키지 추출
- 제품 기능 추가나 신규 도메인 개발

## 특이점

- `profile`은 E14 기준 별도 런타임이므로, 이 에픽에서 canonical profile surface는 `profile` 앱 하나로 정리한다.
- `frontend`의 `/profile` 제거 이후 `/`의 최종 진입 정책은 P01에서 함께 확정한다. `/profile` 유지 상태를 새 기본값으로 인정하지 않는다.
- 토큰 migration 중에는 temporary bridge alias를 허용하지만, 최종 UI consumption 규칙은 `var(--ds-*)` / `var(--ui-*)`로 고정한다.
- `YamangDesign`는 reference architecture다. 이 에픽의 목표는 로컬 도입 기준을 맞추는 것이지, 즉시 runtime dependency를 추가하는 것이 아니다.
- `policy_compiler` 이식은 local validation 이후 진행한다. 제품 특화 결정은 `AI_PortFolio`에 남긴다.

## 완료 기준

- `frontend`와 `profile`의 역할이 겹치지 않고, canonical profile surface가 하나로 정리된다.
- `frontend` 구조 문서, alias, lint 규칙, 실제 디렉터리 구조가 동일한 dependency direction을 표현한다.
- `frontend`와 `profile`의 디자인 토큰 source of truth가 통합되고, UI 코드의 direct hex/legacy token 사용이 거버넌스 허용 범위로 축소된다.
- Sonar frontend 기준 CRITICAL 0, story/test/generated noise 정리, 반복 규칙 대량 구간 축소, 테스트 baseline 확장이 완료된다.
- `policy_compiler`에 재사용 가능한 frontend structure/token governance 결정이 문서화된다.

## 실행 순서

1. P01에서 runtime boundary와 canonical profile path를 확정한다.
2. P02와 P03를 병렬로 진행하되, P01의 구조 규칙을 선행 조건으로 삼는다.
3. P04는 P01~P03에서 검증된 규칙만 골라 `policy_compiler`에 이식한다.

## Phase 목록

- [P01: runtime-boundary-and-profile-consolidation](./P01.runtime-boundary-and-profile-consolidation.md)
- [P02: design-token-governance-and-yamangdesign-alignment](./P02.design-token-governance-and-yamangdesign-alignment.md)
- [P03: performance-and-sonar-quality-foundation](./P03.performance-and-sonar-quality-foundation.md)
- [P04: policy-compiler-port](./P04.policy-compiler-port.md)

## 상태

- [ ] P01 완료
- [ ] P02 완료
- [ ] P03 완료
- [ ] P04 완료
