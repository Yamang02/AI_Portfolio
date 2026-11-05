# Epic E23: portfolio-schema-admin-rebuild

## 목표
- 포트폴리오 콘텐츠(프로젝트, 경력, 교육, 자격증, 아티클, 기술 스택, 프로필, 미디어) 전체가 하나의 재설계된 스키마 위에서 동작하고, 사이트별 노출(portfolio / business 컨텍스트)이 데이터 모델로 표현된다.
- Admin이 공개 API와 분리된 별도 배포 단위로 운영되어, 공개 서버에는 Admin 엔드포인트가 존재하지 않고 Admin 인증이 Spring Security 기반으로 동작한다.
- Admin 프론트엔드가 Refine + Ant Design 기반의 독립 레포지토리로 동작하며, 기존 `frontend/`의 admin 코드와 디자인 시스템 의존이 제거된다.

## 배경 / 맥락
### 현재 상태
- Admin 프론트엔드는 `frontend/src/admin/`에 FSD 구조로 있고, `admin.html`이 별도 진입점이다. `@/main/app/config/queryClient`, `@/shared/*`, `@design-system/components`를 직접 참조한다.
- Admin 백엔드는 `infrastructure/web/admin/` 아래 컨트롤러 14개이며, 공개 API와 같은 Spring Boot 앱에서 노출된다. 인증은 `AdminAuthInterceptor`로 처리되는 것으로 보인다(P01에서 확인).
- 인프라는 `admin.yamang02.com` 호스트와 CloudFront Function(`admin-html-rewrite`)으로 프론트가 분리되어 있으나, 백엔드는 분리되어 있지 않다.
- 스키마는 `projects.source`가 입력 출처('github'/'local')만 나타내고 `context`가 없으며, site별 project visibility 계약이 없고 legacy readme 사용이 남아 있다. DB 변경은 `database/`의 SQL 파일 중심으로 관리되는 것으로 보인다(P01에서 확인).

### 문제
- 스키마가 사이트별 노출과 콘텐츠 맥락을 표현하지 못해, Admin API와 화면이 임시 규칙 위에 쌓여 있다.
- Admin 엔드포인트가 공개 서버에 그대로 노출되어 공격 표면이 넓다.
- Admin UI가 메인 사이트 내부 모듈과 디자인 시스템에 결합되어 독립 배포와 재설계가 어렵다.

## 특이점
- **순서 고정**: 스키마 → Admin API 계약 → Admin 프론트 순서로 진행한다. Admin API와 화면이 스키마를 따라가므로, 역순이면 Admin을 두 번 만들게 된다.
- **Admin 백엔드 분리 수준**: 완전 분리(별도 DB)는 도메인 중복 때문에 채택하지 않는다. 공유 DB와 공유 도메인 모듈 위의 별도 배포를 목표로 하고, 그 전 단계로 공개 도메인에서 Admin 경로를 차단한다.
- **프론트 전략**: 기존 UI를 이식하지 않고 설계부터 새로 한다. 기존 `entities` 데이터 레이어도 재사용하지 않고, 새 스키마 기준의 API 계약에서 시작한다.
- **범위 밖**: 메인 사이트(공개 포트폴리오) 리디자인은 이 에픽 이후로 미룬다. `profile/` 앱(E22)은 별개다.
- **프로필 i18n**: `profile/`의 ko/en 정적 콘텐츠를 DB로 옮길지는 P01에서 결정한다. 옮기기로 하면 다국어 모델을 스키마에 포함한다.
- **마이그레이션**: 운영 DB 변경은 호환성을 지키는 순서(expand/contract)와 롤백 조건을 설계 문서에 포함해야 한다.

## Phase 목록
- [P01: schema-analysis-design](./P01.schema-analysis-design.md)

## 후속
| 항목 | 종류 | 처분 |
|------|------|------|
| 스키마 마이그레이션 구현 | 다음 Phase 후보 | P01 설계 승인 후 Phase 생성 |
| Admin API 계약(OpenAPI)과 백엔드 admin 모듈 분리, 공개 도메인 Admin 경로 차단 | 다음 Phase 후보 | P01 설계 승인 후 Phase 생성 |
| Admin 신규 레포 구축(Refine + Ant Design) | 다음 Phase 후보 | API 계약 확정 후 Phase 생성 |
| Admin 배포·Terraform 분리와 기존 `frontend/` admin 코드 제거 | 다음 Phase 후보 | 신규 Admin 동작 확인 후 Phase 생성 |
| 메인 사이트 리디자인 | 핸드오프 | 이 에픽 완료 후 별도 에픽 |

## 상태
- [ ] P01 완료
