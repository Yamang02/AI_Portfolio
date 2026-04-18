# Frontend 아키텍처 가이드

## 구조 원칙

`frontend`는 `main`(portfolio-public)과 `admin`(portfolio-admin) 두 개의 독립 앱으로 구성된다.
각 앱은 FSD 6레이어를 적용하고, 추후 별도 repo로 분리 가능하도록 상호 직접 import를 금지한다.

---

## 디렉터리 구조

```
frontend/src/
  main/                  ← portfolio-public 앱
    app/
    pages/
    widgets/
    features/
    entities/
    shared/              ← main 전용 공용 코드
  admin/                 ← portfolio-admin 앱
    app/
    pages/
    widgets/
    features/
    entities/
    shared/              ← admin 전용 공용 코드
  design-system/         ← cross-app UI 컴포넌트 및 토큰
  shared/                ← cross-app 공용 코드 (최소화)
```

---

## FSD 레이어 규칙

각 앱 내부의 의존 방향 (단방향, 아래로만):

```
app → pages → widgets → features → entities → shared
```

- `app`: 진입점, 라우팅, 전역 Provider
- `pages`: 라우트에 대응하는 페이지 컴포넌트
- `widgets`: 여러 feature/entity를 조합하는 복합 UI 블록
- `features`: 사용자 인터랙션 단위 기능
- `entities`: 비즈니스 도메인 객체 (타입, API, 상태)
- `shared`: 앱 내 공용 유틸, UI 프리미티브

---

## 파일 depth 규칙

layer를 depth 1로 기준 삼아 최대 4 depth:

```
pages/                          ← depth 1 (layer)
  ArticleListPage/               ← depth 2 (slice)
    index.ts                     ← slice public API
    ui/                          ← depth 3 (segment)
      ArticleListPage.tsx        ← depth 4
      ArticleListPage.module.css ← depth 4
    model/                       ← depth 3 (segment)
      types.ts                   ← depth 4
    api/                         ← depth 3 (segment)
      useArticleListQuery.ts     ← depth 4
```

### Segment 종류

| segment | 용도 |
|---------|------|
| `ui/` | React 컴포넌트, CSS Module |
| `model/` | 타입, 인터페이스, 상태 |
| `api/` | API 호출, React Query hooks |
| `lib/` | 유틸리티 함수 |
| `config/` | 상수, 설정값 |

---

## Public API 규칙

각 slice는 `index.ts`를 통해서만 외부에 노출한다.

```typescript
// ✅ Good — slice 외부에서
import { ArticleListPage } from '@main/pages/ArticleListPage';

// ❌ Bad — 내부 구현에 직접 접근
import { ArticleListPage } from '@main/pages/ArticleListPage/ui/ArticleListPage';
```

### Slice import 강제 원칙

- slice **외부**(상위/하위 레이어 포함)에서 해당 slice를 사용할 때는 항상 `slice root` 경로로 import한다.
- `slice root` 경로 import는 결과적으로 해당 slice의 `index.ts` public API를 사용한다.
- 같은 앱 내부에서도 `features/*/ui/*`, `entities/*/model/*` 같은 내부 구현 경로 직접 import를 금지한다.
- 예외: 같은 slice 내부 파일끼리(`ui`/`model`/`api`/`lib`) 참조할 때만 내부 경로 import를 허용한다.
- 같은 slice 내부 참조는 alias deep import 대신 상대경로를 사용한다.

```typescript
// ✅ Good — slice root(public API)
import { LikeButton } from '@main/features/like-post';

// ❌ Bad — slice 내부 구현 직접 접근
import { LikeButton } from '@main/features/like-post/ui/LikeButton';
```

---

## Path Alias

| alias | 경로 | 용도 |
|-------|------|------|
| `@/*` | `src/*` | 절대경로 fallback |
| `@main/*` | `src/main/*` | main 앱 |
| `@admin/*` | `src/admin/*` | admin 앱 |
| `@shared/*` | `src/shared/*` | cross-app 공용 |
| `@design-system/*` | `src/design-system/*` | cross-app UI |

---

## Import 해석 기준 (프로젝트 정책)

- 물리적 루트는 `frontend/src` 하나다.
- 아키텍처 경계 관점의 논리 루트는 `@main`, `@admin`, `@shared`, `@design-system` 4개로 본다.
- 프론트엔드 앱 코드에서는 확장자 명시 없이 slice root import를 기본으로 사용한다.
- 단, 이 규칙은 **번들러(Vite) + TypeScript(`moduleResolution: bundler`) 전제**다.
- Node ESM 런타임 코드(번들러 없이 실행되는 스크립트)는 별도 규칙(확장자 명시)을 따른다.

```typescript
// 동일한 public API 해석 의도
import { LikeButton } from '@main/features/like-post';
import { LikeButton } from '@main/features/like-post/index';
```

프로젝트 컨벤션은 첫 번째 형태(파일명 생략)를 표준으로 사용한다.

---

## Cross-app 의존 규칙

- `main`과 `admin`은 서로 직접 import하지 않는다.
- cross-app 공유가 필요한 코드는 `src/shared/` 또는 `src/design-system/`으로 승격한다.
- `src/shared/`와 `src/design-system/`은 `main`/`admin`의 layer 코드를 import하지 않는다.

---

## shared/ 분류 기준

| 위치 | 기준 |
|------|------|
| `main/shared/` | main 앱에서만 사용 |
| `admin/shared/` | admin 앱에서만 사용 |
| `src/shared/` | 두 앱 모두 실제로 사용 |
| `src/design-system/` | UI 컴포넌트 및 디자인 토큰 |
