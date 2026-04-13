# Epic E18: admin-technical-cards-and-profile-tone-alignment

## 목표

- E17에서 확정한 스키마(`project_technical_cards`, `project-overview` article)를 실제 Admin 편집 UI와 API 계약에 연결한다.
- 포트폴리오 메인(`frontend/src/main`)에서 기존 `readme` 중심 렌더링을 제거하고 E17 콘텐츠 모델로 전환한다.
- 포트폴리오 페이지의 카피/타이포/톤을 루트 `profile/` 프로젝트와 유사한 방향으로 정렬하고, "그리운 경찰 감성체"를 제거한다.

## 배경 / 맥락

### 현재 상태

- Admin 프로젝트 편집 화면은 `readme` 필드를 직접 편집하며, Technical Card 입력/정렬/핀 관리 UI가 없다.
- 메인 프로젝트 상세 화면도 `project.readme`를 `MarkdownRenderer`로 렌더링하는 구조다.
- E17 문서에서 설계된 `project-overview` + `technicalCards` 조합이 런타임에 아직 반영되지 않았다.
- `profile/` 쪽과 `main` 쪽의 콘텐츠 톤/문체/시각 리듬이 분리되어 사용자 경험이 이질적이다.

### 선행 에픽과의 관계

- E17은 멀티사이트 스키마와 콘텐츠 모델의 기준을 확정했다.
- E18은 그 기준을 Admin 작성 경험과 Public 렌더링 경험에 실제로 연결하는 구현 에픽이다.
- E15의 FSD 경계 규칙을 유지하면서 변경한다.

## 아키텍처 결정

### Backend 구조

- 기존 도메인/애플리케이션/인프라 경계를 유지한다.
- `Project` Aggregate와 Technical Card 조회/수정 유스케이스 경계를 문서로 명시한다.
- Admin API는 기존 `/api/admin/projects/**` 경로 체계를 유지하되, 카드 관련 계약을 명시적으로 추가한다.

### Frontend 구조

- Admin: `frontend/src/admin` 내부 FSD 경계 유지, Project 편집 하위 feature로 Technical Card 편집 블록을 추가한다.
- Main: `frontend/src/main`의 ProjectDetail 렌더링을 `projectOverviewArticle` + `technicalCards` 중심으로 재구성한다.
- Profile 톤 정렬은 `profile`과 시각 언어를 맞추되 런타임 분리는 유지한다.

### Read / Write Pattern

- 표준 CRUD + 조회 조합을 유지한다.
- 카드 정렬은 `isPinned DESC, sortOrder ASC`를 백엔드 계약으로 고정하고 프론트는 결과를 그대로 사용한다.

### Module Boundary

- `frontend/src/admin`과 `frontend/src/main`은 직접 import하지 않는다.
- 공통 UI/토큰은 `design-system` 또는 앱별 `shared` 경로에서만 사용한다.
- `profile/`은 독립 런타임으로 유지하고, 스타일 가이드 참조만 수행한다.

## 아키텍처 리뷰 메모 (epic-architecture-review + PT-01/PT-02)

- IMPORTANT [PT-01] `Project`와 `ProjectTechnicalCard`의 쓰기 책임(동일 트랜잭션 vs 별도 유스케이스) 경계를 P01에서 명시해야 한다.
- IMPORTANT [AR-02-02] Main 상세 페이지가 `readme`에 직접 의존하고 있어 E17 계약과 의존 방향(도메인 계약 중심) 불일치가 있다. P03에서 제거한다.
- MINOR [AR-02-01] `profile`과 `main`의 문체/톤 가이드가 문서화되어 있지 않다. P02에서 UI 톤 가이드를 먼저 확정한다.

## 범위

### In

- Admin 프로젝트 편집에서 Technical Card 생성/수정/삭제/정렬/핀 처리
- Admin API/DTO/검증 로직의 E17 스키마 정렬
- Main 프로젝트 상세의 `readme` 의존 제거 및 `projectOverviewArticle` + `technicalCards` 렌더링
- "그리운 경찰 감성체" 제거 및 `profile` 톤에 맞춘 카피/타이포/색 톤 조정
- 회귀 테스트, Sonar 이슈 확인, 문서 동기화

### Out

- 신규 도메인 추가
- `profile` 런타임 자체를 `frontend`로 통합하는 구조 변경
- 멀티사이트 인프라/배포 파이프라인 변경
- E17 스키마 자체 재설계

## 완료 기준

- Admin에서 프로젝트별 Technical Card를 작성/정렬/핀 관리할 수 있고 저장 결과가 재조회에 일관되게 반영된다.
- Main 상세 페이지에서 `project.readme`를 더 이상 사용하지 않는다.
- Main 상세는 `projectOverviewArticle`과 Technical Card를 E17 계약대로 렌더링한다.
- 포트폴리오 카피/톤이 `profile` 기준과 충돌하지 않고, 기존 감성체가 제거된다.
- 프런트/백엔드 관련 테스트와 lint/빌드 검증이 통과한다.

## 실행 순서

1. P01에서 Admin/API 계약과 도메인 경계를 확정한다.
2. P02에서 Admin Technical Card 편집 UI를 완성한다.
3. P03에서 Main 렌더링 모델 전환과 톤 정렬을 적용한다.
4. P04에서 회귀 검증 및 배포 준비 체크를 완료한다.

## Phase 목록

- [P01: admin-project-technical-card-contract](./P01.admin-project-technical-card-contract.md)
- [P02: admin-technical-card-editor-ui](./P02.admin-technical-card-editor-ui.md)
- [P03: main-project-detail-model-cutover-and-tone-alignment](./P03.main-project-detail-model-cutover-and-tone-alignment.md)
- [P04: regression-validation-and-release-readiness](./P04.regression-validation-and-release-readiness.md)

## 상태

- [ ] P01 완료
- [ ] P02 완료
- [ ] P03 완료
- [ ] P04 완료

