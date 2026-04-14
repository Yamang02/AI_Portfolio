# Agent instructions (AI_PortFolio)

SonarQube 품질 작업과 코드 수정 시 **프로젝트 로컬** `.cursor/skills/` 를 우선한다. 글로벌 스킬 팩과 `description` 이 겹치면 중복 적용을 끈다.

## Skills

- **원본:** `.cursor/skills/<name>/SKILL.md`
- **품질·Sonar:** `local-sonarqube-agent-workflow` — basis `docs/basis/quality/SQ-01-local-sonarqube-workflow.md`
- **이슈 배치 처리:** `docs/issues/sonarqube/sonarqube-issue-handling-guideline.md` (**SQ-02**)
- **에픽/아키텍처 검토 (vibe_boilerplate에서 복제):** `epic-architecture-review`, `pt-01-domain-modeling`, `pt-02-implementation-patterns`
- **파일 단위 basis 검토:** `file-basis-review`, `cc-02-method-level`, `cc-05-code-hygiene`

## Suggested routing

1. 턴 시작 시 적용 가능 스킬이 있으면 **`basis-skill-gate`** 를 먼저 따른다.
2. 로컬 Sonar 분석·이슈 트라이아지·재분석·Sonar 관련 리뷰 → **`local-sonarqube-agent-workflow`**
3. 완료·테스트 통과 주장 직전 → **`evidence-before-completion`**
4. 의미 있는 변경 단위 후 → **`request-code-review`**
5. 프론트 구현·리뷰 → `react-stack` / `typescript-stack`(Cursor에 복제한 경우)
6. 백엔드 → `spring-boot-stack` / `java-stack`(복제한 경우)
7. 에픽 설계 검토·종료 전 아키텍처 감사 → `epic-architecture-review` → 필요 시 `pt-01-domain-modeling`, `pt-02-implementation-patterns`
8. 변경/리뷰 단위 파일 감사 → `file-basis-review` + `cc-02-method-level` + `cc-05-code-hygiene` (레이어에 맞게 선택)

보일러플레이트 `vibe_boilerplate` 에서 스택 스킬·추가 워크플로를 가져올 때는 `AGENTS.md` 와 이 라우팅 표를 함께 맞춘다.

## CodeSight (LLM용 코드 덤프)

[mattsilv/codesight](https://github.com/mattsilv/codesight) 로 저장소를 스캔해 단일 텍스트 컨텍스트를 만든다. 저장소 **루트**에서 `npm run codesight` — 최초 실행 시 `tools/codesight` 에 shallow clone 후 `docs/agent/codesight-context.txt` 생성(용량이 크므로 gitignore). 설정은 `.codesight/config` (`MAX_FILES`, 확장자 목록 등). 스크립트가 upstream `bin/codesight` 의 `SCRIPT_DIR` 버그와 분석기의 무제한 수집을 완화하는 패치를 적용한다. **Bash 필요**(Windows는 Git for Windows 권장). 파일 수가 많으면 완료까지 수 분 걸릴 수 있다.

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

## Redis 캐시 경계 결정 (프로젝트 규칙)

- 이 프로젝트는 Spring Cache 어노테이션(`@Cacheable`, `@CacheEvict`, `@EnableCaching`)을 사용하지 않는다.
- 캐시는 **명시적 Port/Adapter**로만 구현한다. Application은 캐시 기술 세부를 모른다.
- Domain Entity를 Redis에 직접 직렬화하지 않는다. 인프라 캐시 DTO(스냅샷 모델)로 변환 후 저장/복원한다.
- 캐시 직렬화는 캐시 DTO의 **구체 타입 고정 역직렬화**를 사용한다. 제네릭 default typing 기반 다형 직렬화에 의존하지 않는다.
- 캐시 무효화는 서비스 메서드 내 명시적 호출로 처리한다(암묵적 AOP 무효화 금지).
- **레이어 의존:** Application은 **Domain Port(out)** 와 Domain에 둔 공유 상수·모델만 참조한다. `infrastructure.*` 직접 import는 피한다(외부 저장소/JPA 등은 Port 경유 또는 전용 Application 어댑터로만). 레거시 파일에 남아 있는 직접 참조는 새 기능에서 확장하지 않는다.
