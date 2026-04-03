# P04: 프론트엔드 성능 최적화

## 목표

불필요한 의존성과 선제 데이터 로딩을 제거하여 초기 로드 성능을 개선한다.
이 Phase 완료 후 초기 번들에서 약 630KB(gzip) 절감이 기대된다.

## 구현 상세

### 1. framer-motion 제거 → CSS 전환

**문제:** `framer-motion` (~130KB gzip)을 페이지 전환 슬라이드 하나에만 사용.

**접근:**
- `AnimatedPageTransition.tsx`의 `motion.div` + `AnimatePresence`를
  CSS `@keyframes` + `useEffect` + className 토글 방식으로 재구현
- `framer-motion` 패키지 제거 (`npm uninstall framer-motion`)

**변경 파일:**
- `frontend/.../shared/ui/page-transition/AnimatedPageTransition.tsx` (재구현)
- `package.json` (의존성 제거)

### 2. mermaid 지연 로딩 적용

**문제:** `mermaid` (~500KB gzip)가 초기 번들에 포함.
아티클 상세 페이지에서만 필요한 라이브러리.

**접근:**
- mermaid를 사용하는 마크다운 렌더러에서 `import('mermaid')` 동적 import 적용
- Vite의 `manualChunks`에서 mermaid 청크 분리 확인

**변경 파일:**
- `MarkdownRenderer.tsx` — 이미 `import('mermaid')` 동적 로드 (유지)
- `frontend/vite.config.ts` — `mermaid`는 동적 청크로 분리되며, `manualChunks`에 강제 묶기 시 vendor와 순환 경고가 나므로 별도 규칙 없이 Rollup 기본 분할에 맡김

### 3. 라우트별 조건부 데이터 로딩

**문제:** `AppProvider`가 모든 페이지에서 projects, experiences, educations,
certifications 4개 API를 선제 호출. `/chat`, `/article` 등에서는 불필요.

**접근:**
- `AppProvider`에서 전체 선제 로딩 로직 제거
- 각 페이지/위젯에서 필요한 데이터만 React Query로 로드
- `/chat` 페이지: 데이터 로드 없음
- `/projects`: 프로젝트 데이터만
- `/profile`: experiences, educations, certifications만

**변경 파일:**
- `frontend/.../app/providers/AppProvider.tsx`
- 각 페이지 컴포넌트에 개별 useQuery 추가 (필요 시)

### 4. AnimatedPageTransition 미사용 컴포넌트 제거

**문제:** `AnimatedPageTransition` 컴포넌트가 `AnimatedRoutes`와 같은 파일에 존재하지만
실제로는 사용되지 않음 (미사용 번들 포함).

**접근:**
- `AnimatedPageTransition` export 제거 (또는 파일에서 삭제)
- framer-motion 제거 작업(1번)과 함께 처리

## 체크리스트

- [x] `framer-motion` 패키지 제거 확인 (`package.json`, `node_modules`)
- [ ] 페이지 전환 슬라이드 애니메이션이 CSS 기반으로 동일하게 동작하는지 확인 (수동 QA)
- [ ] `mermaid`가 아티클 페이지 접근 시에만 로드되는지 확인 (Network 탭)
- [x] 초기 진입 번들에 mermaid 정적 포함 없음 — 동적 `import('mermaid')`로 지연 로드 (빌드 산출물·Network로 확인 권장)
- [ ] `/chat` 페이지 접근 시 portfolio API 호출이 없는지 확인 (Network 탭)
- [ ] `/projects` 페이지에서 프로젝트 데이터가 정상 로드되는지 확인
- [ ] `/profile` 페이지에서 experiences, educations, certifications 정상 로드 확인
- [x] `AnimatedPageTransition` 컴포넌트 제거·export 제거 확인
- [x] 페이지별 `ErrorBoundary` + `Suspense` 쌍 적용 (`MainAppRoutes` lazy 라우트)
- [x] `npm run build` 성공 (번들 크기 before/after는 로컬에서 선택 비교)
