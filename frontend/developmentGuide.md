# 프론트엔드 개발 가이드

## 📁 문서 위치

프론트엔드 관련 상세 문서는 루트 `docs/` 폴더에서 확인할 수 있습니다:

- **아키텍처**: `docs/technical/architecture/frontend-architecture.md`
- **개발 가이드**: `docs/technical/guides/frontend/`
- **AI Agent 개발 가이드**: `docs/technical/guides/agent-development-guide.md`
- **마이그레이션 가이드**: `docs/archive/frontend-migration/`
- **디자인 시스템**: `docs/technical/design-system/`
  - **사용 가이드**: `docs/technical/design-system/usage-guide.md` (상세 가이드)
  - **컬러 시스템**: `docs/technical/design-system/color-palette.md`
  - **Phase 3 구현 가이드**: `docs/technical/design-system/phase-3-implementation-guide.md`
  - **Phase 3 사용 예시**: `docs/technical/design-system/phase-3-usage-examples.md`
  - **스토리북 문서**: Storybook 실행 후 `Design System/Tokens/Colors` 참조

## 🚀 빠른 시작

```bash
cd frontend
npm install
npm run dev
```

## 📚 주요 기술 스택

- React 19.1.0
- TypeScript
- Tailwind CSS
- Vite
- React Query

## 🎨 디자인 시스템

프로젝트는 **디자인 시스템**을 도입하여 일관된 UI/UX를 제공합니다. 모든 컴포넌트 개발 시 디자인 시스템을 우선적으로 활용해야 합니다.

**⚠️ 중요**: 상세한 디자인 시스템 사용 가이드는 다음 문서를 참조하세요:
- **디자인 시스템 가이드**: `docs/technical/design-system/README.md`
- **컬러 시스템**: `docs/technical/design-system/color-palette.md`
- **Phase 3 구현 가이드**: `docs/technical/design-system/phase-3-implementation-guide.md`
- **Phase 3 사용 예시**: `docs/technical/design-system/phase-3-usage-examples.md`
- **스토리북**: `npm run storybook` 실행 후 디자인 시스템 컴포넌트 확인

### ✅ DO (패턴)

```typescript
// 1. 디자인 시스템 컴포넌트 우선 사용
import { Button, Badge, Card, SectionTitle, TextLink } from '@/design-system';
<Button variant="primary" size="md">클릭</Button>

// 2. 컬러는 CSS 변수 사용
style={{ color: 'var(--color-text-primary)' }}
style={{ backgroundColor: 'var(--color-bg-primary)' }}
style={{ borderColor: 'var(--color-border-default)' }}

// 3. 디자인 토큰 사용
import { spacing, borderRadius, shadow } from '@/design-system/tokens';
style={{ padding: spacing[4], borderRadius: borderRadius.lg }}

// 또는 CSS 변수로 직접 사용
style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--border-radius-lg)' }}

// 4. 새 컴포넌트는 디자인 시스템에 등록 (재사용 가능한 경우)
// frontend/src/design-system/components/NewComponent/NewComponent.tsx
// CSS 변수 사용 필수, index.ts에 export 추가
```

### ❌ DON'T (안티패턴)

```typescript
// ❌ 하드코딩된 컬러 값 사용 금지
style={{ color: '#111827' }}
style={{ backgroundColor: '#ffffff' }}

// ❌ 디자인 시스템 컴포넌트 무시하고 직접 구현 금지
// Button, Badge 등이 있는데 새로 만들지 말 것

// ❌ 디자인 토큰 없이 하드코딩된 값 사용 금지
style={{ padding: '16px', borderRadius: '8px' }}
```

### 컴포넌트 생성 체크리스트

새 컴포넌트를 생성할 때 다음을 확인하세요:

1. **디자인 시스템 확인**: 필요한 컴포넌트가 이미 존재하는지 확인 (`frontend/src/design-system/components/` 또는 Storybook)
2. **컬러 사용**: CSS 변수(`--color-*`) 사용, 하드코딩 금지
3. **디자인 토큰 사용**: spacing, borderRadius, shadow 등 토큰 활용
4. **재사용성 검토**: 재사용 가능하면 디자인 시스템에 등록
5. **Storybook 문서화**: 디자인 시스템 컴포넌트는 Storybook 스토리 작성

## 🌓 다크모드 처리 방식

프로젝트는 **CSS 기반 다크모드**를 사용합니다:

- **시스템 설정 자동 감지**: `@media (prefers-color-scheme: dark)` 미디어 쿼리 사용
- **수동 토글 지원**: `:root.dark` 클래스를 통한 수동 토글 (시스템 설정보다 우선)
- **통일된 방식**: 모든 컴포넌트는 `@media (prefers-color-scheme: dark)`를 사용하여 다크모드 스타일 정의
- **변수 정의 위치**: 
  - 라이트모드: `globals.css`의 `:root`에 정의
  - 다크모드: `globals.css`의 `@media (prefers-color-scheme: dark)`와 `:root.dark`에 정의
- **주의사항**: 
  - 새로운 컴포넌트 작성 시 `:root.dark` 대신 `@media (prefers-color-scheme: dark)` 사용
  - ThemeProvider는 사용하지 않음 (CSS 기반 처리)

## 🤖 AI 에이전트 활용 가이드

프로젝트에 설정된 AI 에이전트들을 다음과 같이 활용하세요:

- **`@frontend-developer`**: React 컴포넌트 개발, 상태 관리, 성능 최적화, 접근성 구현 시
- **`@ui-ux-designer`**: UI/UX 설계, 와이어프레임, 디자인 시스템 구축, 사용자 경험 개선 시
- **`@code-reviewer`**: 코드 작성 후 품질 검토, 보안 점검, 리팩토링 제안이 필요할 때
- **`@backend-architect`**: API 설계 검토, 데이터 구조 설계, 백엔드와의 통신 방식 논의 시

## 📝 문서 관리 가이드

`docs/` 폴더의 `epic/`, `issues/`, `backlog/`에 문서를 추가하거나 업데이트할 때는:

1. **같은 디렉토리의 문서 최신화**: 관련 문서들도 함께 업데이트하세요
   - 에픽 문서 추가 시 → `epic/README.md` 업데이트
   - 이슈 문서 추가 시 → `issues/README.md` 및 관련 기능별 폴더 구조 확인
   - 백로그 추가 시 → `backlog/README.md` 확인

2. **문서 간 일관성 유지**: 참조하는 문서들의 링크와 내용이 최신 상태인지 확인

3. **변경 이력 기록**: 중요한 변경사항은 문서 하단에 변경 이력 추가 (템플릿: `docs/templates/documentation-changelog-template.md`)

## 🎯 페이지별 레이아웃 정책

애플리케이션의 각 페이지는 고유한 레이아웃 요구사항을 가지고 있으며, 이를 조건부로 관리합니다:

### 정책 관리 위치
- **파일**: `frontend/src/main/app/MainApp.tsx`
- **적용 지점**: `MainAppContent` 컴포넌트의 메인 컨테이너 div

### 페이지별 정책

#### 1. 홈페이지 (`/`)
- **Overflow 정책**: `overflowX: 'visible'`
- **이유**:
  - 스크롤 드리븐 애니메이션 사용 (`window.pageYOffset`, `getBoundingClientRect()` 계산)
  - `overflow: hidden`은 스크롤 기준점을 변경하여 애니메이션 오작동 유발
- **특징**:
  - 배경 그라데이션 효과 (스크롤 위치 기반)
  - 섹션별 애니메이션 트리거
  - 페이지 전환 효과 제외 (자연스러운 문서 플로우 유지)

#### 2. 채팅 페이지 (`/chat`)
- **Overflow 정책**: `overflowX: 'hidden'`
- **이유**:
  - 페이지 전환 시 좌우 슬라이드 애니메이션 적용
  - 내부 스크롤 컨테이너 사용

#### 3. 기타 페이지 (`/profile`, `/projects`, `/projects/:id`)
- **Overflow 정책**: `overflowX: 'hidden'`
- **이유**:
  - 페이지 전환 애니메이션 적용
  - 좌우 슬라이드 시 콘텐츠가 화면 밖으로 넘치는 것 방지

### 구현 예시

```typescript
// MainApp.tsx
const isHomePage = location.pathname === '/';

<div
  style={{
    overflowX: isHomePage ? 'visible' : 'hidden',
    // ... 기타 스타일
  }}
>
```

### 새 페이지 추가 시 체크리스트

1. **스크롤 드리븐 애니메이션 사용 여부 확인**
   - 사용한다면: `overflowX: 'visible'` 필요
   - 사용하지 않는다면: `overflowX: 'hidden'` 유지

2. **페이지 전환 애니메이션 적용 여부 결정**
   - 적용: `AnimatedRoutes`에 포함 (기본)
   - 제외: `AnimatedPageTransition.tsx`에서 조건부 처리

3. **스크롤 정책 명시**
   - `PageMeta` 컴포넌트의 `scrollPolicy` prop 설정
   - `window` (전역 스크롤) vs `container` (내부 스크롤)

4. **MainApp.tsx 정책 업데이트**
   - 필요시 `isHomePage`와 유사한 조건 추가
   - 주석으로 정책 적용 이유 명시

### 주의사항

- **스크롤 관련 CSS 변경 시**: 홈페이지의 스크롤 드리븐 효과가 정상 작동하는지 반드시 확인
- **애니메이션 추가 시**: 페이지별 overflow 정책과의 충돌 여부 검토
- **레이아웃 리팩토링 시**: 각 페이지의 특수 요구사항 문서화 유지

## 🔑 식별자 사용 가이드 (PK vs businessId)

프로젝트는 **내부 식별자(PK)**와 **외부 식별자(businessId)**를 분리하여 사용합니다.

**프론트엔드는 `businessId`만 사용합니다.** 내부 PK는 백엔드에서만 사용되며 프론트엔드에 노출되지 않습니다.

### ✅ DO

- **모든 API 통신에서 `businessId` 사용**
  - API 엔드포인트: `/api/articles/article-001`
  - 라우팅: `/articles/:businessId`
  - React Query 키: `['article', 'article-001']`
- **프로젝트 참조 시 프로젝트의 `businessId` 사용**
  - API 응답의 `projectId`는 프로젝트의 `businessId`
- **상태 관리, 라우팅, 쿼리 키 모두 `businessId` 기반**

### ❌ DON'T

- **내부 PK 사용 금지** (`id: 1` 같은 숫자 식별자)
- **API 응답의 `id` 필드 사용 금지** (API 응답에 `id` 필드는 없음)
- **PK와 businessId 혼용 금지**

> 📖 **상세 가이드**: `docs/technical/guides/identifier-usage-guide.md` 참조

## ⚡ 성능 최적화

성능 최적화 관련 가이드라인은 다음 문서를 참고하세요:

- **성능 최적화 가이드**: `docs/technical/guides/frontend/performance-optimization-guide.md`
  - 중복 컴포넌트 방지
  - React Query 캐싱 전략
  - 유틸리티 함수 통일
  - CSS 기반 최적화

## 🔗 관련 문서

자세한 내용은 루트 `docs/` 폴더의 문서를 참고하세요.
