# Epic E12: profile-as-app-hub (헤더·진입·랜딩 제거)

## 목표

- **기존 Home(랜딩) 페이지를 제거**하고, 앱 진입 **`/`는 `/profile`과 동일한 허브**로 동작한다(리다이렉트 또는 동일 콘텐츠 — 아래 Phase에서 **리다이렉트** 권장).
- 헤더 **로고**는 **`/profile` 기준**: 다른 경로에서는 `navigate('/profile')`, 이미 `/profile`이면 상단 스크롤.
- **SEO·사이트맵**이 “홈=`/` 랜딩” 가정을 버리고 **프로필 허브** 기준으로 정합된다.
- 별도 배포하는 **외부 랜딩 사이트**는 이 에픽 범위에 포함하지 않는다.

## 배경 / 맥락

- `HomePage`는 `Hero`·`About`·`FeaturedProjects`·`CTA` 등 **전용 랜딩**이며, `HomePageLayout`으로만 감싸져 있다.
- **`/`** 는 여전히 이 랜딩을 보여 주므로, 로고만 `/profile`로 바꿔도 **첫 진입은 랜딩**에 남는다.
- 랜딩에서 쓰이던 **Organization / WebSite JSON-LD**는 `HomePage`에만 있으므로, 제거 시 **다른 페이지로 이전**하지 않으면 검색용 구조화 데이터가 줄어든다.

## 특이점

- `ProjectsListPage`가 `FEATURED_PROJECTS`를 `featured-projects-section/model/featuredProjects.config`에서 import — 랜딩 위젯을 지우기 전에 **설정 파일만** 프로젝트 영역(예: `ProjectsListPage` 인근 `model/` 또는 기존 규칙에 맞는 경로)으로 **이동**한다.
- **클라이언트 리다이렉트**만으로는 검색엔진이 `/`와 `/profile` 관계를 항상 동일하게 해석하지 않을 수 있다. **프로덕션 정적 호스팅(CloudFront/S3 등)에서 `/` → `/profile` 301/302** 규칙을 둘지는 인프라 에픽에서 검토한다(선택).

## 작업 일람 (체크리스트)

### 라우팅·레이아웃

- [x] `MainAppRoutes.tsx`: `isHomePage` / `HomePageLayout` / `HomePage` **분기 제거**. 단일 `PageLayout` + `AnimatedRoutes` 트리로 통일.
- [x] `path="/"` → `<Navigate to="/profile" replace />`(또는 동등한 리다이렉트). `react-router-dom`의 `Navigate` 사용.
- [x] `path="/profile"`에 기존과 같이 `ProfilePage`(Suspense·ErrorBoundary 유지).
- [x] `showFooter` 등 경로 배열에서 **`'/'` 전용 분기 제거**(`/profile`만으로 푸터 노출이 되면 됨).

### 헤더

- [x] `Header.tsx` `handleLogoClick`: `pathname === '/profile'` → 스크롤, 아니면 `navigate('/profile')` (**`/` 조건 제거**).

### 랜딩 전용 코드 삭제

- [x] `frontend/src/main/pages/HomePage/` 디렉터리 삭제.
- [x] 랜딩 전용 위젯 삭제(다른 곳에서 import 없음 확인 후): `hero-section`, `about-section`, `cta-section`, `home-page-layout`, `featured-projects-section` **UI** — 단, **`featuredProjects.config`는 먼저 이동** 후 `ProjectsListPage` import 경로 수정.
- [x] `globals.css` 등 **HomePage 전용 주석·스타일** 정리(필요 시).

### 페이지 라이프사이클

- [x] `pageConfig.ts`: **`'/'` 항목** 제거 또는 `/profile`과 통합. `pageKey: 'home'` 스크롤 복원 정책이 `/profile`과 충돌하지 않게 조정.
- [x] `usePageLifecycle` / `usePageLifecycle` 주석에 `home` 예시가 있으면 문구 갱신.

### SEO·구조화 데이터

- [x] `seo.config.ts`: **`pageMetaDefaults.home`** 처리 — 제거하거나 프로필 메타와 중복되지 않게 정리. 사이트 기본 진입이 `/profile`이면 **기본 canonical/OG 설명** 정책을 한 곳에 맞춤.
- [x] `ProfilePage`(또는 공통 레이아웃): 기존 `HomePage`의 `createOrganizationSchema()`, `createWebSiteSchema()` **추가**(배열 `jsonLd`에 Person과 병행 가능). 중복·충돌 없이 `SeoHead`에 전달.
- [x] `shared/lib/schema.ts` 등은 함수 재사용만 하면 되고, **삭제 금지**(다른 페이지에서 사용).

### 사이트맵·빌드

- [x] `vite.config.ts` `Sitemap` 플러그인 `routes`에서 **`'/'` 항목** 조정: `/` 제거 또는 `/profile`에 우선순위 통합(동일 URL 두 번 나열 방지).
- [x] `sitemap-routes.json`(동적 라우트)이 있다면 **중복·우선순위** 점검.

### 스크립트·문서

- [x] `frontend/scripts/take-screenshots-after.ts`: 랜딩·`#featured-projects` 스크린샷 항목 **제거 또는 `/profile` 기준으로 변경**.
- [x] `frontend/developmentGuide.md`: `isHomePage`, 홈 레이아웃 설명 **삭제/갱신**.
- [x] `docs/technical/guides/frontend/chunk-load-error-fix.md` 등 **`/` fallback** 언급이 있으면 문구 확인.

### 검증

- [x] 로컬: 직접 `/` 접속 시 `/profile`로 이동하는지.
- [x] 로고·푸터·스크롤 회귀 테스트.
- [x] `npm run build` 성공, 필요 시 `npm run test`.

## Phase 목록

| Phase | 문서 | 내용 요약 |
|-------|------|-----------|
| P01 | [P01.routing-redirect-and-remove-landing](./P01.routing-redirect-and-remove-landing.md) | `/` → `/profile`, HomePage·HomePageLayout 제거, 푸터 경로 정리 |
| P02 | [P02.featured-config-and-widget-cleanup](./P02.featured-config-and-widget-cleanup.md) | `FEATURED_PROJECTS` 이동, 랜딩 위젯·CSS 정리 |
| P03 | [P03.header-and-page-lifecycle](./P03.header-and-page-lifecycle.md) | 로고 동작, `pageConfig` 정리 |
| P04 | [P04.seo-sitemap-and-tooling](./P04.seo-sitemap-and-tooling.md) | SEO 메타·JSON-LD, sitemap, 스크립트·가이드 |

## 상태

- [x] P01 완료
- [x] P02 완료
- [x] P03 완료
- [x] P04 완료

## 완료
아카이브일: 2026-04-10
