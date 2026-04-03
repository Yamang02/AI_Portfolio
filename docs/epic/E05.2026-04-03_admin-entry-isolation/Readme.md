# Epic E05: Admin 진입점 격리

## 목표

- Main App UI에서 Admin으로 이어지는 모든 진입점(설정 버튼, 라우트)이 제거된다.
- Admin App은 Vite MPA 독립 진입점(`admin.html`)을 통해서만 접근 가능하다.
- Main App 소스가 `@/admin/**`를 직접 import하지 않는다.

## 배경 / 맥락

### 현재 상태

- Main App(`App.tsx`)이 `/admin/*` 라우트를 포함하며 `AdminApp`을 lazy load한다.
- `Header.tsx` 설정 버튼이 `/admin/settings`로 navigate한다 (Desktop L210, Mobile L296).
- Main 페이지 4곳이 `@/admin/entities/article`에서 `ARTICLE_CATEGORIES` 상수를 import한다.
- Vite는 단일 `index.html` SPA로 구성되어 있다.

### 문제

Admin 기능은 운영자 전용임에도 Main App 라우터와 Header UI를 통해 일반 사용자에게 진입점이 노출되어 있다. 서비스 분리 의도와 맞지 않으며, Main 번들이 Admin 코드에 의존하는 구조적 결합이 존재한다.

## 특이점

- 백엔드 변경 없음. `/api/admin/**`는 이미 `AdminAuthInterceptor`로 격리되어 있다.
- Vite MPA 전환 시 `admin.html`은 별도 URL(`/admin/`)로만 접근된다. 기존 SPA fallback 라우팅과 충돌하지 않도록 서버(Cloud Run) 설정 확인 필요.
- `ARTICLE_CATEGORIES`는 Admin 전용 개념이 아닌 공유 상수이므로 `src/shared/`로 이동한다. Admin 엔티티에서 re-export하는 방식은 채택하지 않는다.
- Header 설정 버튼 제거 후 빈 공간 처리(UI 조정)는 P03 범위에 포함한다.

## Phase 목록

- [P01: 공유 상수 분리](./P01.shared-constants-extraction.md)
- [P02: Admin 독립 진입점 구성](./P02.admin-mpa-entry.md)
- [P03: Main App Admin 진입점 제거](./P03.remove-admin-entry.md)

## 상태

- [ ] P01 완료
- [ ] P02 완료
- [ ] P03 완료
