#Requires -Version 5.1
<#
.SYNOPSIS
  디버그용 AWS(S3·CloudFront·Route53) + GCP(Cloud Run hello) 스택을 Terraform으로 생성합니다.

.DESCRIPTION
  - 환경 이름: debug-YYYYMMDD-HHmmss
  - S3 backend state key: debug/<환경>/terraform.tfstate
  - GCP provider: GOOGLE_OAUTH_ACCESS_TOKEN = gcloud auth print-access-token
  - infrastructure/terraform/environments/debug/terraform.tfvars 를 준비하세요 (example 복사).

.PARAMETER TfVarsPath
  사용할 tfvars 경로 (기본: debug 디렉터리의 terraform.tfvars)

.PARAMETER PlanOnly
  plan 만 수행하고 apply 하지 않습니다.

.PARAMETER SkipConfirm
  apply 전 확인 프롬프트를 생략합니다 (자동화용).

.PARAMETER TerraformExe
  terraform 실행 파일 이름 또는 전체 경로 (기본: PATH 의 terraform)
#>
[CmdletBinding()]
param(
  [string]$TfVarsPath = "",
  [switch]$PlanOnly,
  [switch]$SkipConfirm,
  [string]$TerraformExe = "terraform"
)

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$DebugDir = Join-Path $RepoRoot 'infrastructure\terraform\environments\debug'

if (-not (Test-Path $DebugDir)) {
  throw "Debug 디렉터리가 없습니다: $DebugDir"
}

$TfVars = if ($TfVarsPath) { $TfVarsPath } else { Join-Path $DebugDir 'terraform.tfvars' }
if (-not (Test-Path $TfVars)) {
  throw "terraform.tfvars 가 없습니다. terraform.tfvars.example 을 복사해 값을 채우세요: $TfVars"
}

$envName = 'debug-{0:yyyyMMdd-HHmmss}' -f (Get-Date)
$backendKey = "debug/$envName/terraform.tfstate"

Write-Host "환경 이름: $envName" -ForegroundColor Cyan
Write-Host "State key:  $backendKey" -ForegroundColor DarkGray

try {
  $token = (& gcloud auth print-access-token).Trim()
  if (-not $token) { throw 'empty token' }
  $env:GOOGLE_OAUTH_ACCESS_TOKEN = $token
}
catch {
  throw "gcloud auth print-access-token 실패. gcloud 로그인 후 다시 실행하세요. ($_)"
}

Push-Location $DebugDir
try {
  & $TerraformExe init -reconfigure "-backend-config=key=$backendKey"
  if ($LASTEXITCODE -ne 0) { throw 'terraform init 실패' }

  $planFile = "$envName.tfplan"
  & $TerraformExe plan -var-file="$TfVars" -var="environment=$envName" -out=$planFile
  if ($LASTEXITCODE -ne 0) { throw 'terraform plan 실패' }

  if ($PlanOnly) {
    Write-Host "PlanOnly: apply 는 수행하지 않습니다. plan 파일: $planFile" -ForegroundColor Yellow
    return
  }

  if (-not $SkipConfirm) {
    $r = Read-Host '위 plan 을 apply 하시겠습니까? (y/N)'
    if ($r -ne 'y' -and $r -ne 'Y') {
      Write-Host '취소되었습니다.'
      return
    }
  }

  & $TerraformExe apply $planFile
  if ($LASTEXITCODE -ne 0) { throw 'terraform apply 실패' }

  $infoPath = Join-Path $DebugDir "$envName-info.json"
  & $TerraformExe output -json | Set-Content -Path $infoPath -Encoding utf8
  Write-Host "출력 JSON: $infoPath" -ForegroundColor DarkGray

  Write-Host "완료. 삭제: .\scripts\teardown-debug-env.ps1 -EnvironmentName '$envName'" -ForegroundColor Green
}
finally {
  Pop-Location
}
