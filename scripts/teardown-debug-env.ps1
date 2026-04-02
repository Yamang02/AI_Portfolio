#Requires -Version 5.1
<#
.SYNOPSIS
  setup-debug-env.ps1 로 만든 디버그 스택을 삭제합니다.

.DESCRIPTION
  동일한 S3 state key (debug/<환경>/terraform.tfstate)로 init 한 뒤,
  S3 버킷을 비우고 terraform destroy 를 실행합니다.

.PARAMETER EnvironmentName
  삭제할 환경 이름 (예: debug-20260402-143022)

.PARAMETER TfVarsPath
  생성 시 사용한 것과 동일한 terraform.tfvars 경로

.PARAMETER Force
  destroy 확인 없이 진행합니다 (주의).

.PARAMETER SkipEmptyBucket
  S3 비우기 단계를 건너뜁니다 (일반적으로 사용하지 마세요).

.PARAMETER TerraformExe
  terraform 실행 파일 (기본: terraform)
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$EnvironmentName,

  [string]$TfVarsPath = "",

  [switch]$Force,

  [switch]$SkipEmptyBucket,

  [string]$TerraformExe = "terraform"
)

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$DebugDir = Join-Path $RepoRoot 'infrastructure\terraform\environments\debug'

$TfVars = if ($TfVarsPath) { $TfVarsPath } else { Join-Path $DebugDir 'terraform.tfvars' }
if (-not (Test-Path $TfVars)) {
  throw "terraform.tfvars 가 없습니다: $TfVars"
}

$backendKey = "debug/$EnvironmentName/terraform.tfstate"

Write-Host "삭제 대상: $EnvironmentName" -ForegroundColor Yellow
Write-Host "State key: $backendKey" -ForegroundColor DarkGray

try {
  $token = (& gcloud auth print-access-token).Trim()
  if (-not $token) { throw 'empty token' }
  $env:GOOGLE_OAUTH_ACCESS_TOKEN = $token
}
catch {
  throw "gcloud auth print-access-token 실패. ($_)"
}

Push-Location $DebugDir
try {
  & $TerraformExe init -reconfigure "-backend-config=key=$backendKey"
  if ($LASTEXITCODE -ne 0) { throw 'terraform init 실패' }

  if (-not $SkipEmptyBucket) {
    $bucket = $null
    try {
      $bucket = (& $TerraformExe output -raw s3_bucket 2>$null).Trim()
    }
    catch {
      $bucket = $null
    }
    if ($bucket) {
      Write-Host "S3 버킷 비우기: $bucket" -ForegroundColor DarkGray
      & aws s3 rm "s3://$bucket" --recursive
      if ($LASTEXITCODE -ne 0) {
        throw "aws s3 rm 실패. AWS CLI 프로필/권한을 확인하세요."
      }
    }
  }

  if (-not $Force) {
    $r = Read-Host 'terraform destroy 를 실행합니다. 계속하려면 yes 입력'
    if ($r -ne 'yes') {
      Write-Host '취소되었습니다.'
      return
    }
  }

  $destroyArgs = @(
    'destroy',
    "-var-file=$TfVars",
    "-var=environment=$EnvironmentName",
    '-auto-approve'
  )

  & $TerraformExe @destroyArgs
  if ($LASTEXITCODE -ne 0) { throw 'terraform destroy 실패' }

  $planFile = Join-Path $DebugDir "$EnvironmentName.tfplan"
  $infoFile = Join-Path $DebugDir "$EnvironmentName-info.json"
  if (Test-Path $planFile) { Remove-Item -LiteralPath $planFile -Force }
  if (Test-Path $infoFile) { Remove-Item -LiteralPath $infoFile -Force }

  Write-Host '삭제 완료.' -ForegroundColor Green
}
finally {
  Pop-Location
}
