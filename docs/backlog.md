# Backlog

| # | 설명 | 발견 맥락 | 상태 | 비고 |
|---|------|-----------|------|------|
| 3 | **프로덕션 인프라를 스테이징과 정렬** (Flyway 제외). ① `application-production.yml` datasource 블록을 `POSTGRE_URL` 방식에서 Cloud SQL 분리 환경변수 방식으로 교체. ② `backend-production-cloudrun.yml` 워크플로우에 `--service-account`, `GCP_CLOUD_SQL_INSTANCE_CONNECTION_NAME`, `POSTGRES_DATABASE`, `POSTGRES_USER`, `POSTGRES_PASSWORD` 추가 및 `POSTGRE_URL` 제거. ③ `infrastructure/terraform/environments/production/main.tf`에 `google_service_account_iam_member.github_actions_act_as_cloud_run_runtime` 리소스 추가 및 `github_actions_deployer_service_account_email` 변수 추가. 참고: 스테이징 파일이 목표 상태. | E17 GCP 이전(스테이징) 완료 후 프로덕션 정비 시 발견(2026-04-13) | 수집됨 | 스테이징 안정화 후 단독 Epic 또는 인프라 정비 Epic으로 승격 |
| 2 | 프로젝트 검색 모달 및 기술스택 필터 제거. 방문자는 프로젝트명·기술스택을 사전에 모르므로 검색 기능이 실질적으로 사용되지 않음. | 2026-04-05 사용자 피드백 | 에픽 승격 | E09 |
| 1 | Application 레이어가 `infrastructure.*`(JPA 엔티티·리포지토리, 일부 web DTO 등)를 직접 import하는 레거시 구간의 **영향도 검토 및 이관 우선순위** 정리. 목표: `AGENTS.md` 레이어 의존 규칙과 정렬(외부 기술은 Port/Adapter 또는 Application 전용 퍼사드로만). 범위 예: `ManageProjectService`, `ManageEducationService`, `ManageArticleService`, `GitHubIntegrationService`(설정), `TechStackMetadataService` 등 `application` 패키지에서 `infrastructure` import grep으로 목록화 후, 테스트·변경 빈도·경계 위반 심각도 기준으로 정렬. | Redis 캐시 Port/Adapter 도입, 캐시 무효화 세분화, `AGENTS.md`에 Application→Domain Port 원칙 명시(2026-04) | 수집됨 | 단건 에픽 승격 여부는 목록 확정 후 판단. |
