# Agent instructions (AI_PortFolio)

SonarQube 품질 작업과 코드 수정 시 **프로젝트 로컬** `.cursor/skills/` 를 우선한다. 글로벌 스킬 팩과 `description` 이 겹치면 중복 적용을 끈다.

## Skills

- **원본:** `.cursor/skills/<name>/SKILL.md`
- **품질·Sonar:** `local-sonarqube-agent-workflow` — basis `docs/basis/quality/SQ-01-local-sonarqube-workflow.md`
- **이슈 배치 처리:** `docs/issues/sonarqube/sonarqube-issue-handling-guideline.md` (**SQ-02**)

## Suggested routing

1. 턴 시작 시 적용 가능 스킬이 있으면 **`basis-skill-gate`** 를 먼저 따른다.
2. 로컬 Sonar 분석·이슈 트라이아지·재분석·Sonar 관련 리뷰 → **`local-sonarqube-agent-workflow`**
3. 완료·테스트 통과 주장 직전 → **`evidence-before-completion`**
4. 의미 있는 변경 단위 후 → **`request-code-review`**
5. 프론트 구현·리뷰 → `react-stack` / `typescript-stack`(Cursor에 복제한 경우)
6. 백엔드 → `spring-boot-stack` / `java-stack`(복제한 경우)

보일러플레이트 `vibe_boilerplate` 에서 스택 스킬·추가 워크플로를 가져올 때는 `AGENTS.md` 와 이 라우팅 표를 함께 맞춘다.

## Sonar 한 줄 (모듈)

- **Frontend:** `frontend/` 에서 `npm run test:coverage` 후 `sonar-scanner`(또는 팀 표준 CLI). `sonar-project.properties` 참고.
- **Backend:** Maven 명령은 호스트가 아니라 Docker `backend` 컨테이너에서 실행한다.
  - 예: `"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose exec backend mvn verify`
- **Backend Sonar(로컬 :9000):** `backend` 서비스 안에서 `mvn sonar:sonar`만 쓰면 SonarCloud용 `sonar.organization` 등과 충돌할 수 있다. 로컬 SonarQube 재분석은 Compose에 정의된 전용 실행을 쓴다.
  - 예: `"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose --profile sonar run --rm backend-sonar`  
  - 전제·토큰: `docker-compose.yml` 주석, 레포 루트 `.env` 의 `SONAR_TOKEN`

## Maven 실행 규칙 (필수)

- 이 저장소에서 `mvn`, `mvnw` 관련 명령은 로컬 셸 직접 실행을 금지하고, 반드시 Docker 컨테이너 내부에서 실행한다.
- 기본 패턴:
  - `"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose exec backend mvn <goal>`
- 백엔드 테스트 예시:
  - `"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose exec backend mvn test`
- 검증/품질 예시:
  - `"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose exec backend mvn verify`
  - 로컬 Sonar 재분석: `"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose --profile sonar run --rm backend-sonar`

토큰은 **저장소 루트 `.env`** 의 `SONAR_TOKEN`(및 선택 `SONAR_HOST_URL`)로 두고, 스캔 전 셸에 로드한다. `.env`는 `.gitignore` 대상이므로 커밋하지 않는다. 공개 예시는 `.env.example` 주석을 따른다.
