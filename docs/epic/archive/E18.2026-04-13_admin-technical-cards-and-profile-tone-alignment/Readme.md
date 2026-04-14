# Epic E18: admin-technical-cards-and-profile-tone-alignment

## 목표

- E17에서 정착된 스키마(`project_technical_cards`, `project-overview` article)를 실제 Admin 편집 UI와 API 흐름으로 완성한다.
- 메인(`frontend/src/main`)에서 기존 `readme` 기반 렌더링을 제거하고 E17 콘텐츠 모델로 전환한다.
- 프론트엔드 언어/스타일이 `profile/` 프로젝트와 불일치하는 구간을 정렬하고, "그리운 경찰 감성체"를 제거한다.

## 배경 / 맥락

### 현재 상태 (시작 시점)

- Admin 프로젝트 편집 화면이 `readme` 필드를 직접 편집하며, Technical Card 작성/정렬/삭제 UI가 없었다.
- 메인 프로젝트 상세 화면이 `project.readme`를 `MarkdownRenderer`로 렌더링하는 구조였다.
- E17 문서에서 확정된 `project-overview` + `technicalCards` 의도에 맞게 구현이 연결되어 있지 않았다.
- `profile/`과 `main` 사이의 컴포넌트/스타일 불일치가 문서화되어 있으나 해소되지 않았다.

### 이전 에픽과의 관계

- E17이 DB 마이그레이션과 콘텐츠 모델을 확정했다.
- E18은 그 모델로 Admin 편집 기능과 Public 렌더링 기능을 실제로 완성하는 구현 에픽이다.
- E15의 FSD 컨벤션 위반이 수면 위로 올라와 P01에서 정리했다.

## 아키텍처 결정

### Backend

- 기존 `Project` Aggregate가 Technical Card 조회/수정 도메인 로직을 포함하도록 결정했다.
- Admin API는 기존 `/api/admin/projects/**` 경로를 유지하고, 카드 관련 엔드포인트를 하위 리소스로 추가했다.

### Frontend

- Admin: `frontend/src/admin` 안에서 FSD 경계를 정비하고, Project 편집 섹션에 Technical Card 편집 feature를 추가했다.
- Main: `frontend/src/main`의 ProjectDetail 렌더링을 `projectOverviewArticle` + `technicalCards` 기반으로 전환했다.
- Profile 언어/스타일 정렬 작업을 `profile`과 `main` 분리 경계 내에서 처리했다.

### Read / Write Pattern

- 전체 CRUD + 조회 흐름을 확정했다.
- 기본 정렬은 `isPinned DESC, sortOrder ASC`를 반환 계약으로 고정하고 클라이언트는 그 결과를 그대로 사용했다.

## Phase 목록

- [P01: admin-fsd-cleanup](./P01.admin-fsd-cleanup.md)
- [P02: admin-project-technical-card-contract](./P02.admin-project-technical-card-contract.md)
- [P03: admin-technical-card-editor-ui](./P03.admin-technical-card-editor-ui.md)
- [P04: main-project-detail-model-cutover-and-tone-alignment](./P04.main-project-detail-model-cutover-and-tone-alignment.md)
- [P05: regression-validation-and-release-readiness](./P05.regression-validation-and-release-readiness.md)

## 상태

- **시작일:** 2026-04-13
- [x] P01 완료
- [x] P02 완료
- [x] P03 완료
- [x] P04 완료
- [x] P05 완료

## 완료

아카이브일: 2026-04-14
