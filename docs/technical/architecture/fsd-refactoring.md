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
