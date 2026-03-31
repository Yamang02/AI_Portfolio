# Epic E01: Backend SonarQube Issue Resolution

## 목표

- 백엔드 SonarQube 오픈 이슈 중 BLOCKER/CRITICAL/MAJOR 271건을 모두 해결한다
- BUG 5건(정규식 오류, InterruptedException 미처리, 미사용 반환값)이 0건이 된다
- BLOCKER 2건(항상 동일 값 반환 메서드, assertion 없는 테스트)이 0건이 된다
- Sonar 재분석 시 대상 범위 이슈가 재등장하지 않는다

## 배경 / 맥락

### 현재 상태

- 2026-03-29 스냅샷 기준 백엔드 OPEN 이슈 331건
- MINOR(46) + INFO(14) = 60건은 이번 범위에서 제외, 필요 시 점진적 개선
- 처리 대상: BLOCKER 2 / CRITICAL 42 / MAJOR 227 = **271건**

### 문제

- BUG 5건 중 정규식 backreference 오류(S6001)는 런타임 장애 가능성이 있다
- `Collectors.toList()` 잔존(S6204, 121건)은 이미 P07에서 일부 처리했으나 백엔드 미완료
- generic exception 사용(S112, 47건)은 에러 핸들링 정밀도를 떨어뜨린다

## 특이점

- SQ-02(이슈 처리 지침)의 배치 단위·루트 원인 확정·검증 게이트를 따른다
- MINOR/INFO는 scope 밖 — 별도 점진적 개선으로 처리 예정
- S6204(121건)와 S1128 등 기계적 치환 가능한 규칙은 병렬 에이전트로 빠르게 처리 가능
- S112(47건)와 S3776(16건)은 설계 판단이 필요하므로 루트 원인 분석 후 수정
- 백엔드는 Hexagonal Architecture — 레이어 경계를 깨뜨리지 않도록 주의

## Phase 목록

- [P01: BUG + BLOCKER 긴급 수정](./P01.bug-and-blocker-fixes.md)
- [P02: 기계적 치환 (S6204, S1128 등)](./P02.mechanical-replacements.md)
- [P03: Generic Exception 정리 (S112)](./P03.generic-exception-cleanup.md)
- [P04: 코드 품질 개선 (S1192, S3776 등 나머지)](./P04.code-quality-improvements.md)

## 상태

- [x] P01 완료 — 코드 체크리스트 및 Docker `mvn test` 기준 (**Sonar 해당 7건 RESOLVED는 재분석으로 확인**)
- [x] P02 완료 — P02 문서 체크리스트 및 테스트 기준
- [x] P03 완료 — `throw new RuntimeException` 0건, 테스트 기준 (**Sonar S112 RESOLVED는 재분석으로 확인**)
- [x] P04 완료 — S1192·S1141·S3358·S3776·S5993·S1117·S6355 등 Phase 문서·P04 체크리스트 반영, 14~24차 품질 배치까지 코드 정리. **에픽 처리 범위 밖:** Sonar 심각도 MINOR·INFO(스냅샷 60건)는 문서상 제외.

### Sonar 잔여 OPEN 확인 방법 (BLOCKER·CRITICAL·MAJOR)

1. **UI:** 로컬 Sonar(`http://localhost:9000`) → 프로젝트 `AI Portfolio Backend` → **Issues** → **Status = Open**, **Severity = Blocker, Critical, Major** (MINOR·Info 제외).
2. **API (Docker 권장):** 레포 루트 `.env`에 `SONAR_TOKEN`이 있으면, 호스트 셸에 토큰이 없어도 `docker compose run`으로 `backend` 컨테이너의 `curl`에 토큰을 넘길 수 있다. PowerShell에서 URL에 `&`가 들어가면 명령이 잘려 **URL이 비어** `curl: (2) no URL specified` 가 나오므로, **`curl -G` + `--data-urlencode`로 쿼리를 나누는 방식**을 쓴다. 재현용 스크립트: `scripts/sonar-query-open-bcma.ps1` (JSON 응답의 `total` 필드가 OPEN B/C/M 건수).
3. **최신 분석 반영:** `docker compose exec backend mvn verify` 후 `docker compose --profile sonar run --rm backend-sonar`.

**최종 검증 스냅샷:** 2026-03-31 재분석 후 동일 API 필터(`OPEN`, `BLOCKER/CRITICAL/MAJOR`) 조회 결과 **OPEN `total` = 0**.

### 완료 요약

- P04: S1192는 `WebApiResponseMessages`·`AdminApiErrorMessages` 등 상수화, S1141·S3358·S3776 등은 해당 Phase·P04 진행 현황에 기록.
- 검증: Docker `compose exec backend mvn test`·`verify` 통과 기록.

## 완료

아카이브일: 2026-03-31
