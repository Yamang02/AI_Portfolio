# Epic E06: Admin 진입점 격리

## 목표

- Main App UI에서 Admin으로 이어지는 모든 진입점(설정 버튼, 라우트)이 제거된다.
- Admin App은 Vite MPA 독립 진입점(`admin.html`)을 통해서만 접근 가능하다. (동일 오리진·별도 HTML 엔트리)
- Main App 소스가 `@/admin/**`를 직접 import하지 않는다.
- **Staging** Admin은 호스트 **`admin.staging.yamang02.com`** 으로만 진입한다 (메인 스테이징 사이트와 호스트 분리).
- **Production** Admin은 호스트 **`admin.yamang02.com`** 으로 진입한다 (Staging과 대칭되는 운영 전용 호스트).

## 배경 / 맥락

### 현재 상태

- Main App(`App.tsx`)이 `/admin/*` 라우트를 포함하며 `AdminApp`을 lazy load한다.
- `Header.tsx` 설정 버튼이 `/admin/settings`로 navigate한다 (Desktop L210, Mobile L296).
- Main 페이지 4곳이 `@/admin/entities/article`에서 `ARTICLE_CATEGORIES` 상수를 import한다.
- Vite는 단일 `index.html` SPA로 구성되어 있다.
- 프론트 정적 호스팅은 **S3 + CloudFront**이며, 403 등에 대해 **Main용 `index.html` 폴백**이 걸려 있어 `/admin/*` 딥링크만으로는 Admin 번들이 보장되지 않을 수 있다.

### 문제

Admin 기능은 운영자 전용임에도 Main App 라우터와 Header UI를 통해 일반 사용자에게 진입점이 노출되어 있다. 서비스 분리 의도와 맞지 않으며, Main 번들이 Admin 코드에 의존하는 구조적 결합이 존재한다.

## 결정 사항 (본 에픽)

| 항목 | 결정 |
|------|------|
| Staging Admin 공개 호스트 | **`https://admin.staging.yamang02.com`** — 메인 스테이징(`staging.yamang02.com`)과 분리 |
| Production Admin 공개 호스트 | **`https://admin.yamang02.com`** — 메인 프로덕션과 분리 |
| Admin 라우트 경로 | 기존과 같이 앱 내부는 **`/admin/*`** 경로 유지 (`/admin/login` 등). 서브도메인만 분리하고 경로 대규모 변경은 범위 밖으로 둔다. |
| 딥링크·새로고침 | Admin 전용 호스트에서 HTML 요청이 **`admin.html`** 을 타도록 **CloudFront Viewer-request 함수**(또는 동등한 Edge 로직)로 오리진 URI를 정규화한다. 정적 청크(`assets/` 등)는 제외한다. |
| 인프라 표현 | **Terraform** (`infrastructure/terraform/modules/aws-frontend` 및 staging/production 환경)에 별칭·함수 연계·Route53(필요 시) 반영. |
| 백엔드 API | **변경 없음** 원칙. 다만 **CORS 허용 Origin**에 `https://admin.staging.yamang02.com`, `https://admin.yamang02.com` 추가는 **필수**(별도 호스트에서 API를 호출하므로). |

## 특이점

- `/api/admin/**`는 이미 `AdminAuthInterceptor`로 격리되어 있다.
- `ARTICLE_CATEGORIES`는 공유 상수로 `src/shared/`로 옮긴다. Main이 Admin 엔티티를 import하지 않도록 한다 (P01).
- Header 설정 버튼 제거 후 레이아웃 조정은 P03 범위에 포함한다.
- GitHub Actions 프론트 배포 워크플로는 동일하게 `dist/` 동기화; **Admin 전용 호스트**는 CloudFront **Alternate domain names** + DNS로 연결한다.

## Phase 목록

- [P01: 공유 상수 분리](./P01.shared-constants-extraction.md)
- [P02: Admin 독립 진입점 구성 (MPA)](./P02.admin-mpa-entry.md)
- [P03: Main App Admin 진입점 제거](./P03.remove-admin-entry.md)
- [P04: Admin 호스트·CloudFront·CORS](./P04.infrastructure-admin-hosts.md)

## 상태

- [ ] P01 완료
- [ ] P02 완료
- [ ] P03 완료
- [ ] P04 완료
