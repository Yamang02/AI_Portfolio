# SonarQube 오픈 이슈 스냅샷

- 생성일: 2026-03-27
- 기준 서버: `http://localhost:9000`
- 상태 필터: `resolved=false` (OPEN)

## 프로젝트별 집계

### Frontend (`AI_Portfolio_frontend_local`)
- 총 이슈: 481
- Severity: BLOCKER 1, CRITICAL 13, MAJOR 207, MINOR 259, INFO 1
- Type: BUG 20, VULNERABILITY 0, CODE_SMELL 461
- 원본: `docs/issues/sonarqube/2026-03-27-frontend-open-issues.json`

### Backend (`AI_Portfolio_backend_local`)
- 총 이슈: 331
- Severity: BLOCKER 2, CRITICAL 42, MAJOR 227, MINOR 46, INFO 14
- Type: BUG 6, VULNERABILITY 0, CODE_SMELL 325
- 원본: `docs/issues/sonarqube/2026-03-27-backend-open-issues.json`

## 참고
- 이 문서는 스냅샷이므로 재분석 후 수치가 달라질 수 있습니다.
- 프론트 안정성 개선은 `BUG + BLOCKER/CRITICAL` 우선으로 처리하는 것을 권장합니다.

## 작업 로그 기준 진행 현황 (업데이트)

- 기준 로그: `docs/issues/sonarqube/2026-03-27-frontend-issue-processing-log.md` (Batch 24까지 반영)
- 미처리 추정(로그 제외 기준): 총 376건
- Severity: MAJOR 121, MINOR 254, INFO 1 (BLOCKER/CRITICAL 0)
- 현재 우선 규칙: `typescript:S3358` 잔여 11건
- 다음 우선 대상:
  - `39efd196-a13d-4a64-9839-91f858db103b` (`src/main/pages/ProfilePage/components/CareerTimelineSection.tsx`)
  - `42712458-32e4-4d38-bb91-911f511ffc00` (`src/shared/ui/tech-stack/TechStackList.tsx`)
  - `5a4f3ecf-e38a-436f-a877-9dee68b96f43` (`src/admin/pages/TechStackManagement.tsx`)
