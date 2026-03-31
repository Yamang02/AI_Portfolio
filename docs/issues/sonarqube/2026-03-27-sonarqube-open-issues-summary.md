# SonarQube 오픈 이슈 스냅샷

- **최신 갱신일:** 2026-03-29 (Sonar Web API `api/issues/search`, `resolved=false`)
- 기준 서버: `http://localhost:9000`
- 상태 필터: `resolved=false` (OPEN)

## 프로젝트별 집계

### Frontend (`AI_Portfolio_frontend_local`)

- 총 이슈: **336**
- Severity: BLOCKER 0, CRITICAL 1, MAJOR 82, MINOR 252, INFO 1
- Type: BUG 3, VULNERABILITY 0, CODE_SMELL 333
- effortTotal: 1697
- 원본: `docs/issues/sonarqube/2026-03-29-frontend-open-issues.json`

### Backend (`AI_Portfolio_backend_local`)

- 총 이슈: **331**
- Severity: BLOCKER 2, CRITICAL 42, MAJOR 227, MINOR 46, INFO 14
- Type: BUG 6, VULNERABILITY 0, CODE_SMELL 325
- effortTotal: 2999
- 원본: `docs/issues/sonarqube/2026-03-29-backend-open-issues.json`

## 이전 스냅샷 (2026-03-27)

- 프론트 총 481건 → 재수집 후 **336건** (분석·이슈 처리 반영).
- 참고 원본: `2026-03-27-frontend-open-issues.json`, `2026-03-27-backend-open-issues.json`

## 참고

- P07 Sonar way 정합 확인 절차: `2026-03-29-p07-sonar-way-verification.md` (E06 P02).
- 이후 수치는 재분석·재수집 시 달라질 수 있다.
- 프론트 안정성 개선은 SQ-02와 동일하게 `BUG` 또는 심각도 `BLOCKER/CRITICAL/MAJOR`(코드 스멜의 MAJOR·크리티컬 포함) 우선으로 처리하는 것을 권장한다.

## 작업 로그 기준 진행 현황 (업데이트)

- 기준 로그: `docs/issues/sonarqube/2026-03-27-frontend-issue-processing-log.md`
- **SQ-02-01 필터**(프론트 OPEN 중 BUG 또는 BLOCKER/CRITICAL/MAJOR): **84건** (2026-03-29 API 기준)
- `typescript:S3358`: **2026-03-29 스냅샷의 9건**은 처리 로그에 따라 코드 반영됨 — **재수집 후 0건이 될 수 있음**.
- 다음 우선 규칙(프론트, 잔여 다수): `typescript:S6479` 등 처리 로그 **다음 작업 가이드** 참고.
