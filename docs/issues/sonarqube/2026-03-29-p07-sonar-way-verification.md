# P07: Sonar way 정합 확인 (E06)

- 기준일: 2026-03-29
- 정책: vibe_boilerplate **E06 P02** — 커스텀 Quality Profile 없이 **내장 Sonar way** 사용 (`docs/basis/quality/sonar-profiles/README.md`).

## 대상 Sonar 프로젝트 키

| 모듈   | `sonar.projectKey` (로컬 스냅샷 기준) |
|--------|--------------------------------------|
| 프론트 | `AI_Portfolio_frontend_local`        |
| 백엔드 | `AI_Portfolio_backend_local`         |

키가 다르면 SonarQube **프로젝트 개요** 또는 분석 로그의 `projectKey`로 바꿔 확인한다.

## UI에서 확인

1. `http://localhost:9000` 로그인.
2. 각 프로젝트 → **Project Settings** → **Quality Profiles** (또는 **프로젝트** → 해당 프로젝트 → **Quality Profiles**).
3. TypeScript/Java/CSS 등 **언어별**로 선택된 프로파일 이름이 **Sonar way**인지 본다. (`vibe-*` 등 커스텀 복제본이면 Sonar way로 변경.)

## API로 확인 (`.env`의 User Token)

Sonar User Token은 **레포 루트 `.env`**에만 둔다(`.env.example` 참고). 커밋하지 않는다. 터미널에 토큰을 직접 붙여 넣을 필요는 없고, 아래처럼 **`.env`를 읽어 현재 PowerShell 세션에만** 올린 뒤 API를 호출하면 된다.

**저장소 루트**(`AI_PortFolio/`, `.env`가 있는 위치)에서 실행:

```powershell
Set-Location <AI_PortFolio 루트 경로>
Get-Content .env | ForEach-Object {
  $t = $_.Trim()
  if ($t -match '^#' -or $t -eq '') { return }
  if ($t -match '^SONAR_TOKEN=(.+)$') {
    $env:SONAR_TOKEN = $Matches[1].Trim().Trim('"')
  }
  if ($t -match '^SONAR_HOST_URL=(.+)$') {
    $env:SONAR_HOST_URL = $Matches[1].Trim().Trim('"')
  }
}
$base = ($env:SONAR_HOST_URL).TrimEnd('/')
if (-not $base) { $base = "http://localhost:9000" }
$h = @{ Authorization = "Bearer $($env:SONAR_TOKEN)" }
foreach ($key in @("AI_Portfolio_frontend_local", "AI_Portfolio_backend_local")) {
  $u = "$base/api/qualityprofiles/search?project=$key"
  Invoke-RestMethod -Uri $u -Headers $h
}
```

응답의 프로파일 이름이 언어별 **Sonar way**인지 확인한다. Sonar 버전에 따라 필드명은 `name`, `profiles` 등으로 달라질 수 있다.

401이면 `.env`의 `SONAR_TOKEN` 값·따옴표·공백, `SONAR_HOST_URL`이 실제 Sonar 주소와 맞는지 확인한다.

## 백엔드 분석 (Docker Compose 권장)

호스트에 Maven/JDK를 깔지 않아도 되도록 **`docker-compose.yml`의 `backend-sonar` 서비스**로 고정해 두었다. `maven_cache` 볼륨으로 의존성 재사용.

- **전제:** SonarQube가 **호스트** `http://localhost:9000` 에서 실행 중. 컨테이너 안에서는 `host.docker.internal:9000` 으로 붙는다.
- **준비:** 레포 루트 `.env`에 `SONAR_TOKEN` (커밋 금지).
- **실행 (레포 루트):**

```bash
docker compose --profile sonar run --rm backend-sonar
```

성공 시 대시보드: `http://localhost:9000/dashboard?id=AI_Portfolio_backend_local`  
스캔 로그에 Java 품질 프로파일이 **Sonar way**인지 확인하면 P07 백엔드 정합 체크에 쓸 수 있다.

## 세션 증거 (2026-03-29)

- 자동화 에이전트 세션에서는 **`.env`를 읽지 않아** API가 `401`이었다. 로컬에서는 위 스크립트로 `.env`만 로드하면 1회 확인 가능하다.
- 프론트 회귀: `frontend`에서 `npm run test` (Vitest) **통과** — P07 구현 상세의 테스트 근거와 병행 가능.
- **프론트 Sonar 스캔 성공** (동일 날짜, `npx sonarqube-scanner`, 루트 `.env`의 `SONAR_TOKEN`으로 `-Dsonar.token=...` 전달). 스캔 로그: Quality profile for **ts** / **css** / **json**: **Sonar way**. 대시보드: `http://localhost:9000/dashboard?id=AI_Portfolio_frontend_local`

### 추가 (2026-03-29, P07 연속)

- `frontend`: `npm run test` · `npm run test:coverage` 재실행 — **통과** (처리 로그 `메타`·`P07 검증 배치` 표 참고).
- **백엔드 Sonar 스캔**: 레포 루트에서 `docker compose --profile sonar run --rm backend-sonar` — **성공(exit 0)**. 스캔 출력에 **Quality profile for java: Sonar way** 등이 표시되는지 확인하면 UI/API와 동일한 정합 확인에 쓸 수 있다. 대시보드: `http://localhost:9000/dashboard?id=AI_Portfolio_backend_local`
- 언어별 프로파일 이름은 위 **API로 확인** 절차로 `AI_Portfolio_backend_local`에 대해 한 번 더 검증하는 것을 권장한다(에이전트는 `.env` 미커밋 원칙으로 API 응답 본문을 저장하지 않음).
