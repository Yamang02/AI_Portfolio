# P07: SonarQube 품질 실행(SQ-01/SQ-02)·배치·검증

## 목표

- 로컬 SonarQube(`http://localhost:9000`)를 기준으로 **프론트엔드·백엔드** 모듈 분석을 반복 실행할 수 있다.
- **SQ-02**(`docs/issues/sonarqube/sonarqube-issue-handling-guideline.md`)에 따라 이슈를 배치 처리하고, **테스트 + 재분석**으로 완료를 정의한다.
- 에이전트 스킬(`.cursor/skills/local-sonarqube-agent-workflow` 등)과 `AGENTS.md` 라우팅이 실제 작업 흐름과 일치함을 유지한다.

## 배경 / 맥락

### 현재 상태

- `docs/basis/quality/SQ-01-local-sonarqube-workflow.md`, 이슈 처리 **SQ-02**, 모듈별 `sonar-project.properties`, 루트 `.env`의 `SONAR_TOKEN` 등이 정리되어 있다.
- `docs/issues/sonarqube/2026-03-27-frontend-issue-processing-log.md` 등 배치 로그가 누적되어 있다.

### 문제

- 배치마다 **테스트 출력·재분석 결과**가 로그에 항상 남지 않으면 SQ-02-04·SQ-01-04와 어긋난다.
- vibe_boilerplate **E06 / `sonar-profiles/README`** 정책은 **커스텀 Quality Profile 없이 내장 Sonar way**를 쓰는 것이다. 본 레포의 Sonar 프로젝트도 동일하게 맞추고, 예외는 **`sonar-project.properties`** 등 레포 단위로만 둔다.

## 구현 상세

1. **프론트:** `frontend/`에서 `npm run test`(또는 `test:coverage`) 후 Sonar 분석; 이슈는 SQ-02 우선순위로 배치.
2. **백엔드:** Sonar 스캔은 **`docker compose --profile sonar run --rm backend-sonar`**(레포 루트, `.env`의 `SONAR_TOKEN`) 권장. 로컬에 Maven이 있으면 동일 목표로 `mvn … sonar:sonar` 도 가능.
3. 처리 로그에 배치별로 **검증 요약**(테스트 명령·성공 여부, 재분석 후 이슈 키 상태)을 남긴다.
4. SonarQube UI에서 이 레포의 프론트·백 **프로젝트**에 연결된 Quality Profile이 언어별 **내장 Sonar way**인지 확인한다(커스텀 복제 프로파일이 아닌지). 팀 정책은 vibe_boilerplate **E06 P02** 및 `docs/basis/quality/sonar-profiles/README.md`와 같다. 예외 규칙은 이 레포의 `sonar-project.properties` 등으로만 둔다.

## 체크리스트

- [x] 프론트 MAJOR+ 우선 배치가 SQ-02-01과 일치한다 — `sonarqube-issue-handling-guideline.md`(SQ-02-01)와 `2026-03-27-frontend-issue-processing-log.md` 배치 단위가 동일 필터(BUG·BLOCKER/CRITICAL/MAJOR)로 운영됨(2026-03-29 점검).
- [x] 배치 완료 시점에 **테스트 실행**과 **재분석·스캔** 근거가 로그에 남는다 — 처리 로그 `메타`·**P07 검증 배치 (2026-03-29)** 표: `npm run test`, `npm run test:coverage`, `docker compose --profile sonar run --rm backend-sonar`. 프론트 `sonarqube-scanner`는 로컬 Sonar 가동 시 동일 파일에 추가 기록 가능.
- [x] `docs/issues/sonarqube/2026-03-27-sonarqube-open-issues-summary.md` 및 `2026-03-29-*-open-issues.json` — Sonar API `api/issues/search`로 **2026-03-29 재수집** 완료.
- [x] Sonar way 정책·레포 주석·**확인 절차** 문서화: `docs/issues/sonarqube/2026-03-29-p07-sonar-way-verification.md`.
- [x] 프론트: 재분석 스캔 로그에서 Quality profile(ts/css/json) = **Sonar way** 확인(2026-03-29, `2026-03-29-p07-sonar-way-verification.md` 근거).
- [x] 백엔드: `docker compose --profile sonar run --rm backend-sonar` 스캔 **성공(2026-03-29, exit 0)** — 프로젝트 `AI_Portfolio_backend_local`. UI/API로 **Java = Sonar way** 재확인 권장(`2026-03-29-p07-sonar-way-verification.md` API 절).
- [x] (선택) CI — 현재 `.github/workflows`에 Sonar 단계 **없음**; 로컬 SQ-01 기준과 충돌 없음.

## 관련 (vibe_boilerplate)

아래 경로는 **vibe_boilerplate** 저장소 루트 기준이다.

- `docs/basis/quality/sonar-profiles/README.md` — Sonar way 기본 정책·선택적 XML 백업(E06 P02).
- `docs/basis/quality/SQ-02-sonar-rule-basis-mapping.md` — 규칙 ↔ basis 매핑(P01/E06).
- `docs/epic/E06.2026-03-29_basis-sonarqube-profile/` — 에픽 E06 인덱스.
