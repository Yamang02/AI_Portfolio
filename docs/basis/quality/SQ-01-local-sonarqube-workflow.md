# 로컬 SonarQube 워크플로 (에이전트·CI 전제)

> 정적 분석을 **로컬 SonarQube 서버**를 기본으로 수행하고, 그 결과로 이슈 처리·재분석·리뷰까지 일관되게 운용하기 위한 basis이다.  
> SonarCloud 전용 설정·조직 키·클라우드 게이트는 다루지 않는다(프로젝트가 명시적으로 선택한 경우 예외).  
> 스택별 빌드·커버리지 명령은 모듈 README·`frontend/package.json`·`backend/pom.xml`을 따른다. 이 문서는 **절차·우선순위·검증 게이트**만 규정한다.

---

## Meta

### 적용 범위

- 본 저장소 **프론트엔드**(`frontend/`, React + TypeScript) 및 **백엔드**(`backend/`, Java Spring Boot)
- 에이전트 스킬 **`local-sonarqube-agent-workflow`**
- 배치별 이슈 처리 세부 규칙: `docs/issues/sonarqube/sonarqube-issue-handling-guideline.md` (**SQ-02-xx**)

### 전제

- **기본 서버:** `http://localhost:9000` (`sonar-project.properties`의 `sonar.host.url`과 일치)
- 분석은 **모듈 단위**(`frontend/`, `backend/`)로 실행한다.
- 인증이 필요하면 **토큰**을 환경 변수로만 주입하고, 저장소에 커밋하지 않는다. 본 프로젝트는 루트 **`.env`** 의 `SONAR_TOKEN`·`SONAR_HOST_URL`을 사용할 수 있다(`.gitignore` 처리됨).

### 규칙 티어

| 티어 | 규칙 | 기준 | 최소 적용 |
|------|------|------|----------|
| Core | SQ-01-01 ~ SQ-01-05 | 분석 전제·게이트·추적성 | S |
| Guide | SQ-01-06 ~ SQ-01-07 | 범위·리뷰 연동 | M |

### 우선순위 체계

1. **안전·정확성** — 높은 심각도 이슈와 검증 생략 금지
2. **검증 가능성** — `SQ-01-04`의 “테스트 + 재분석”
3. **최소 변경** — 동일 규칙 위반은 최소 diff

---

## Relation to other docs

- **SQ-02** — `docs/issues/sonarqube/sonarqube-issue-handling-guideline.md` (배치 처리·문서 포맷)

---

## Rules

### SQ-01-01. 기본 분석 대상은 로컬 SonarQube이다

**Rule:** 표준 실행 환경은 **로컬(또는 팀 내부망) SonarQube**이며, `sonar.host.url` 기본값은 `http://localhost:9000`으로 둔다.

**Why:** 클라우드와 로컬을 혼용하면 이슈 키·품질 프로파일이 달라져 배치 간 비교가 어렵다.

**DO:** 모듈 `sonar-project.properties`에 동일 호스트를 명시한다. SonarCloud로 바꿀 때는 의도를 문서에 남긴다.

**Exception:** 조직 정책으로 SonarCloud가 필수면 별도 문서로 전제를 고정한다.

---

### SQ-01-02. 모듈별 `sonar-project.properties`를 분리한다

**Rule:** 프론트엔드와 백엔드는 **각각** 설정 파일을 둔다.

**Why:** 소스 루트·커버리지·바이너리 경로가 다르다.

**DO:** 프론트는 `lcov.info` 경로, 백엔드는 `sonar.java.binaries`·JaCoCo XML을 명시한다.

**Exception:** 공통 키만 루트에 두는 패턴은 허용한다.

---

### SQ-01-03. 분석 전에 커버리지·빌드 산출물을 생성한다

**Rule:** Sonar 직전에 해당 모듈의 테스트·커버리지·(Java) 컴파일 산출물이 있어야 한다.

**Why:** 빈 리포트는 오해를 부른다.

**DO:** 프론트 `npm run test:coverage`, 백엔드 `mvn verify`(또는 프로젝트 표준) 후 분석.

**Exception:** 문서화된 실험 모듈만 예외.

---

### SQ-01-04. 완료의 정의는 “테스트 + 로컬 재분석”이다

**Rule:** 이슈 수정 완료는 (1) 관련 테스트 통과 (2) 로컬 Sonar 재분석에서 해소 또는 명시적 허용 근거.

**DO:** 에이전트는 **`evidence-before-completion`** 으로 출력을 남긴다.

**Exception:** 재분석 불가 시 보류·사유 기록.

---

### SQ-01-05. 이슈 처리 우선순위를 고정한다

**Rule:** 1순위는 **`BUG` + `BLOCKER`/`CRITICAL`/`MAJOR`** (세부는 SQ-02와 정합).

**DO:** `MINOR`/`INFO`는 보류 목록으로 옮긴다.

---

### SQ-01-06. 루트 원인을 기록한 뒤 수정한다

**Rule:** 코드 변경 전 이슈별 원인 1~2문장.

**Exception:** 명백한 단순 위반은 한 줄로 축약.

---

### SQ-01-07. Sonar 기반 리뷰는 별도 패스로 수행한다

**Rule:** 의미 있는 변경 후 **`request-code-review`** 로 diff·남은 경고를 점검한다.

---

## Conflict Resolution

- 로컬 서버 부재 시: 기동·토큰을 먼저 해결; 임시 호스트 변경 시 `sonar.host.url`과 문서를 함께 갱신.
- 대량 리팩터링은 Sonar 이슈 배치와 브랜치를 분리한다.

---

## Design Decisions

| 결정 | 근거 |
|------|------|
| 로컬 기본 | 프로파일·버전 통제, 팀 내부 반복 분석 |
| FE/BE 설정 분리 | 산출물 경로 상이 |
| SQ-02로 이슈 처리 규칙 분리 | 동일 번호 체계 충돌 방지 |
