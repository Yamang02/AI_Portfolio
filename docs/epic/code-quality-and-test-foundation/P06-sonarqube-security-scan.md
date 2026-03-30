# P06: SonarQube 보안 검사 도입

## 목표

SonarQube를 CI 파이프라인에 통합하여 코드 품질 및 보안 취약점을 자동으로 검사한다.
이 Phase 완료 후 PR마다 정적 분석 결과를 확인할 수 있다.

## 구현 상세

### 1. SonarQube 환경 구성

**표준(본 저장소):** **로컬(또는 팀 내부) SonarQube** — `sonar.host.url=http://localhost:9000`, 절차·에이전트 기준은 `docs/basis/quality/SQ-01-local-sonarqube-workflow.md` 참고.

**선택지:**
- **Self-hosted SonarQube**: Docker로 로컬/서버에 설치 (표준)
- **SonarCloud**: 별도 서버 불필요, GitHub 연동 간편 (의도적 전환 시 `sonar-project.properties` 주석 참고)

### 2. 백엔드 연동

**접근:**
- `pom.xml`에 `sonar-maven-plugin` 추가
- `sonar-project.properties` 또는 Maven 프로퍼티로 프로젝트 키, 조직 설정
- `mvn sonar:sonar` 실행으로 분석

**변경 파일:**
- `backend/pom.xml` (plugin 추가)
- `backend/sonar-project.properties` (신규, 선택)

### 3. 프론트엔드 연동

**접근:**
- `sonar-project.properties`에 프론트엔드 소스 경로 설정
- TypeScript 분석 활성화
- `lcov.info` 커버리지 리포트 연동 (Vitest 생성)

**변경 파일:**
- `frontend/sonar-project.properties` (신규)
- `frontend/package.json` (`test:coverage` 스크립트 확인)

### 4. CI/CD 연동 (선택)

**로컬 표준일 때:** CI는 필수가 아니다. 팀이 PR 게이트를 원하면 self-hosted 스캐너(또는 SonarCloud)에 맞는 workflow를 추가한다.

**접근 예:**
- GitHub Actions에 분석 step 추가, PR 코멘트·Quality Gate 연동

**변경 파일:**
- `.github/workflows/` (필요 시)

### 5. Quality Gate 기준 (권장)

| 항목 | 기준 |
|------|------|
| 신규 코드 커버리지 | 80% 이상 |
| 신규 코드 중복률 | 3% 이하 |
| 보안 취약점 (Vulnerability) | 0개 |
| 보안 핫스팟 (Security Hotspot) | 리뷰 완료 |
| 코드 스멜 (Code Smell) | A 등급 |
| 버그 (Bug) | 0개 |

## 체크리스트

- [x] 로컬 SonarQube 기준 `sonar.host.url` 및 모듈별 `sonar-project.properties` 정렬 (`frontend/`, `backend/`)
- [ ] 로컬 Sonar 서버 기동·프로젝트 생성·토큰 설정(필요 시) 문서화
- [x] 백엔드 `sonar-maven-plugin` 설정 및 Jacoco XML 생성 파이프라인(설정) 반영
- [x] 프론트엔드 소스 분석을 위한 `sonar-project.properties` + `lcov.info` 생성 설정 반영 (`npm run test:coverage`로 파일 생성 확인)
- [ ] (선택) CI에서 PR 분석 자동 실행 workflow 추가
- [ ] (선택) Quality Gate 통과/실패가 PR에 표시되는지 확인
- [ ] 초기 분석 결과에서 Critical/Blocker 이슈 확인 및 우선순위 목록화
