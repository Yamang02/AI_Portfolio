# 레포 루트 .env 의 SONAR_TOKEN 으로 로컬 SonarQube(:9000)에
# OPEN 이슈 중 Blocker / Critical / Major 건수를 조회합니다.
# PowerShell 에서 URL 의 & 가 명령으로 잘리지 않도록 curl 은 -G + --data-urlencode 를 사용합니다.
# Docker backend 이미지에 curl 이 포함되어 있음(호스트에 curl 없어도 됨).

$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))
if (-not (Test-Path .env)) { throw ".env not found at repo root" }
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*SONAR_TOKEN\s*=\s*(.+)\s*$') {
        [Environment]::SetEnvironmentVariable("SONAR_TOKEN", $matches[1].Trim().Trim('"'), "Process")
    }
}
if (-not $env:SONAR_TOKEN) { throw "SONAR_TOKEN missing in .env" }

$docker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
if (-not (Test-Path $docker)) { $docker = "docker" }

$curlArgs = 'curl -s -S -G -u "$SONAR_TOKEN:" "http://host.docker.internal:9000/api/issues/search" --data-urlencode "componentKeys=AI_Portfolio_backend_local" --data-urlencode "severities=BLOCKER,CRITICAL,MAJOR" --data-urlencode "statuses=OPEN" --data-urlencode "ps=500"'
& $docker compose run --rm --no-deps -e "SONAR_TOKEN=$env:SONAR_TOKEN" --entrypoint /bin/sh backend -c $curlArgs
