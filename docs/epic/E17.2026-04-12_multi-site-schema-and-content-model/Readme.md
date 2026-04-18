# Epic E17: multi-site-schema-and-content-model

## 목표

- E16에서 분리된 `project_visibility` 중심 멀티사이트 스키마 설계를 구현 가능한 Phase로 구체화한다.
- `portfolio`/`business` 사이트 컨텍스트와 콘텐츠 모델(기술카드/아티클)의 경계를 확정한다.
- DB 마이그레이션, 백엔드 API, 프런트 타입/렌더링 변경의 실행 순서를 확정한다.

## 배경 / 맥락

- E16에서 도메인 전략 Option B(단계적 분리)가 확정되었고, 도메인/인프라 정합성은 `D01`에 고정되었다.
- 기존 `D04.technical-portfolio-schema-design.md`는 실행 설계 범위가 커서 E16 완결 범위를 초과했다.
- 따라서 D04를 E17의 P01로 승격하여 후속 구현 에픽으로 분리한다.

### 데이터 기준선 (로컬 PostgreSQL, 2026-04-12)

- `projects` 총 13건
- `projects.readme` 비어있지 않은 데이터 10건
- `projects.readme` 비어있는 데이터 3건
- `articles.category='project-overview'` 기존 데이터 0건

의미:
- `readme` 제거는 **선이관/후삭제**가 필수다.
- P02는 `readme -> project-overview` 이관 검증을 통과하기 전까지 `DROP COLUMN projects.readme`를 실행하지 않는다.
- 프로덕션 전환은 Flyway 자동 적용이 아니라 **수동 컷오버 SQL 1회 실행** 기준으로 관리한다.

### 프로덕션 데이터 전환 원칙 (레거시 호스티드 DB → GCP)

1. 기존 프로덕션 DB를 dump/export 한다.
2. 신규 GCP 프로덕션 DB에 restore/import 한다.
3. E17 수동 컷오버 SQL을 1회 실행한다.
   - `project_technical_cards` 스키마 생성
   - `projects.readme -> articles(category='project-overview')` 데이터 이관
   - 검증 통과 후 `projects.readme` 제거
4. 검증 쿼리/API 스모크 테스트를 통과한 뒤 애플리케이션 DB 접속 환경변수를 GCP로 전환한다.

### 환경변수 원칙

- 새 GCP 프로덕션을 시작할 때 데이터를 환경변수로 생성하지 않는다.
- 환경변수는 DB 연결 정보(예: JDBC URL, username, password)를 주입하는 용도다.
- 실제 데이터는 dump/restore + E17 컷오버 SQL로 반영한다.

## 아키텍처 결정 (Kickoff)

### Backend 구조

- 기존 백엔드 구조(도메인 중심 Port/Adapter + 계층 분리)를 유지한다.
- `project_technical_cards`는 프로젝트 콘텐츠 도메인 확장으로 추가하고, `articles`는 기존 Aggregate 경계를 보존한다.

### Frontend 구조

- E15에서 확정한 `frontend` 구조(FSD 런타임 경계)를 유지한다.
- 프로젝트 상세 렌더링에서 `projectOverviewArticle` + `technicalCards`를 조합해 표시한다.

### Read / Write 패턴

- 표준 CRUD + 조회 조합을 유지한다.
- 정렬 책임(`isPinned DESC, sortOrder ASC`)은 백엔드에서 확정해 프런트는 렌더링에 집중한다.

### 모듈 경계

- `project_visibility.site`는 도메인 문자열이 아닌 사이트 컨텍스트 enum(`portfolio`, `business`)으로 유지한다.
- 도메인 간 연결은 ID/참조 기반으로 유지하고, 프런트/백엔드 모두 `site` enum을 단일 계약으로 사용한다.

## 아키텍처 리뷰 메모 (epic-architecture-review)

- IMPORTANT [PT-01] `Project`와 `ProjectTechnicalCard`의 Aggregate 경계 및 Repository 책임이 P01에 명시적으로 분리되어 있지 않다. P02에서 엔티티/리포지토리 소유를 문서화한다.
- IMPORTANT [AR-03-03] `project_technical_cards.article_id` 참조가 있으므로 카드-아티클 결합 규칙(허용 카테고리/삭제 시 동작)을 애플리케이션 규칙으로 고정해야 한다. P02/P03에서 계약을 확정한다.
- MINOR [AR-02-01] 문서 파일명 표기(`Readme.md` vs `README.md`)와 용어(`기술카드`, `Technical Card`)를 통일할 필요가 있다. E17 문서 내에서는 `Technical Card`로 통일한다.

## 범위

### In

- `project_technical_cards` 스키마 추가와 기존 `projects.readme` 제거 마이그레이션
- `project-overview` Article 기반 프로젝트 소개 렌더링
- 프로젝트 상세의 Technical Card 조회/표시/정렬 규칙 확정
- 멀티사이트(`portfolio`/`business`) 컨텍스트 enum 계약 확정과 API 반영

### Out

- 신규 외부 도메인/DNS 개통 작업 자체
- Admin IA 전면 개편
- Article 카테고리 체계 전체 리디자인

## 실행 순서

1. **P05**로 스테이징 **GCP Cloud SQL 연결**(Java Connector, 인스턴스·DB·계정 환경 변수 분리, Railway/단일 URL 제거)을 마친 뒤 스테이징에서 스키마·API 작업을 안정적으로 진행한다.
2. P01 설계를 고정하고 구현 계약(엔티티/DTO/정렬 규칙)을 확정한다.
3. P02에서 non-breaking DB 변경(`project_technical_cards` 생성)·백엔드 API 계약·`readme -> project-overview` 이관 및 `projects.readme` 제거를 순서대로 완료한다.
4. P03에서 프런트 타입/페이지 렌더링을 API 계약과 동기화한다.
5. P04에서 컷오버 검증(데이터, API, UI, 회귀 테스트)을 수행한다.

## Phase 목록

- [P05: staging-gcp-database-connectivity](./P05.staging-gcp-database-connectivity.md) (스테이징 GCP DB·백엔드 연결 정리; Railway 제거)
- [P01: technical-portfolio-schema-design](./P01.technical-portfolio-schema-design.md)
- [P02: backend-migration-and-api-contract](./P02.backend-migration-and-api-contract.md)
- [P03: frontend-content-model-and-rendering](./P03.frontend-content-model-and-rendering.md)
- [P04: cutover-validation-and-release-readiness](./P04.cutover-validation-and-release-readiness.md)

## 상태

- [ ] P05 완료 (코드 반영 후 스테이징 배포·헬스 검증)
- [x] P01 완료
- [ ] P02 완료
- [ ] P03 완료
- [ ] P04 완료
