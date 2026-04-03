#Requires -Version 5.1
# PowerShell 전용입니다. CMD에서는 PATH가 달라 gcloud/terraform이 안 보일 수 있으니,
# 이 스크립트와 Terraform 작업은 Windows Terminal / Cursor에서 PowerShell로 실행하세요.

<#
.SYNOPSIS
  Remote Terraform state + AWS/GCP CLI 덤프를 로컬 폴더에 저장한다 (git에 넣지 말 것).

.DESCRIPTION
  - 각 environment에서 terraform init 후 state pull
  - AWS: CloudFront, ACM(us-east-1), 호출자 정보 등 JSON 덤프
  - GCP: gcloud로 프로젝트·Cloud Run 서비스 목록

.PARAMETER TerraformPath
  terraform.exe 전체 경로 (미지정 시 PATH 및 일반 설치 위치에서 탐색)

.PARAMETER GcloudPath
  gcloud.cmd 전체 경로 (미지정 시 PATH 및 일반 설치 위치에서 탐색)

.PARAMETER OutputRoot
  기본: $env:USERPROFILE\Documents\AI_PortFolio-terraform-local

.PARAMETER Environments
  기본: staging, production, debug
#>
param(
  [string]$OutputRoot = (Join-Path $env:USERPROFILE "Documents\AI_PortFolio-terraform-local"),
  [string[]]$Environments = @("staging", "production", "debug"),
  [string]$TerraformPath = "",
  [string]$GcloudPath = ""
)

$ErrorActionPreference = "Stop"

function Test-Command {
  param([string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Resolve-TerraformExe {
  param([string]$Explicit)
  if ($Explicit -and (Test-Path $Explicit)) {
    return (Resolve-Path $Explicit).Path
  }
  $fromPath = Get-Command terraform -ErrorAction SilentlyContinue
  if ($fromPath) {
    return $fromPath.Source
  }
  $candidates = @(
    "C:\Tools\terraform\terraform.exe"
    (Join-Path $env:LOCALAPPDATA "Programs\Terraform\terraform.exe")
    "O:\terraform\terraform.exe"
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) {
      return (Resolve-Path $p).Path
    }
  }
  # O:\ 등에 버전 폴더로 풀어 둔 경우 (얕은 검색만)
  if (Test-Path "O:\") {
    $found = Get-ChildItem -Path "O:\" -Filter "terraform.exe" -Recurse -ErrorAction SilentlyContinue -Depth 4 |
      Select-Object -First 1 -ExpandProperty FullName
    if ($found) {
      return $found
    }
  }
  return $null
}

function Resolve-GcloudCmd {
  param([string]$Explicit)
  if ($Explicit -and (Test-Path $Explicit)) {
    return (Resolve-Path $Explicit).Path
  }
  $fromPath = Get-Command gcloud -ErrorAction SilentlyContinue
  if ($fromPath) {
    return $fromPath.Source
  }
  $candidates = @(
    (Join-Path $env:ProgramFiles "Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd")
    (Join-Path $env:LOCALAPPDATA "Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd")
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) {
      return (Resolve-Path $p).Path
    }
  }
  return $null
}

$TerraformExe = Resolve-TerraformExe -Explicit $TerraformPath
if (-not $TerraformExe) {
  Write-Error "terraform.exe 를 찾을 수 없습니다. PATH에 추가하거나 -TerraformPath 로 지정하세요."
}

if (-not (Test-Command "aws")) {
  Write-Error "aws CLI 가 PATH에 없습니다."
}

Write-Host "Using Terraform: $TerraformExe" -ForegroundColor Cyan

$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$sessionDir = Join-Path $OutputRoot $ts
New-Item -ItemType Directory -Force -Path $sessionDir | Out-Null

$tfBase = Resolve-Path (Join-Path $PSScriptRoot "..")
$repoHint = "이 세션 덤프는 git에 커밋하지 마세요. 삭제 전까지 로컬에만 보관하세요."

@"
$repoHint
생성 시각(로컬): $(Get-Date -Format o)
출력 루트: $sessionDir
Terraform: $TerraformExe
"@ | Set-Content -Encoding utf8 (Join-Path $sessionDir "00-README.txt")

# --- Terraform remote state ---
foreach ($envName in $Environments) {
  $envPath = Join-Path $tfBase "environments\$envName"
  if (-not (Test-Path $envPath)) {
    Write-Warning "건너뜀 (폴더 없음): $envPath"
    continue
  }
  Push-Location $envPath
  try {
    Write-Host "terraform init ($envName)..."
    & $TerraformExe init -input=false -reconfigure 2>&1 | Tee-Object -FilePath (Join-Path $sessionDir "terraform-init-$envName.log")
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "terraform init 실패 ($envName). state pull/output 생략. aws login·백엔드 버킷 권한을 확인하세요."
      continue
    }
    Write-Host "terraform state pull ($envName)..."
    & $TerraformExe state pull | Set-Content -Encoding utf8 (Join-Path $sessionDir "terraform-state-$envName.json")
    Write-Host "terraform output -json ($envName)..."
    & $TerraformExe output -json 2>&1 | Set-Content -Encoding utf8 (Join-Path $sessionDir "terraform-outputs-$envName.json")
  }
  finally {
    Pop-Location
  }
}

# --- AWS dumps (리전은 backend.tf / 변수와 맞춤: ap-northeast-2 기본) ---
$awsRegion = "ap-northeast-2"

function Invoke-AwsDump {
  param([string]$Label, [string[]]$AwsArguments)
  & aws @AwsArguments 2>&1 | Set-Content -Encoding utf8 (Join-Path $sessionDir $Label)
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "AWS 명령 실패 ($Label). aws login 또는 IAM 권한을 확인하세요. (exit $LASTEXITCODE)"
  }
}

Invoke-AwsDump "aws-sts-identity.json" @("sts", "get-caller-identity", "--output", "json")
Invoke-AwsDump "aws-cloudfront-list-distributions.json" @("cloudfront", "list-distributions", "--output", "json")
Invoke-AwsDump "aws-acm-us-east-1-certificates.json" @("acm", "list-certificates", "--region", "us-east-1", "--output", "json")
Invoke-AwsDump "aws-s3-buckets.json" @("s3api", "list-buckets", "--output", "json")
Invoke-AwsDump "aws-dynamodb-terraform-locks.json" @("dynamodb", "describe-table", "--table-name", "terraform-locks", "--region", $awsRegion, "--output", "json")

# --- GCP ---
$GcloudCmd = Resolve-GcloudCmd -Explicit $GcloudPath
if ($GcloudCmd) {
  Write-Host "Using gcloud: $GcloudCmd" -ForegroundColor Cyan
  & $GcloudCmd config list --format=json 2>&1 | Set-Content -Encoding utf8 (Join-Path $sessionDir "gcloud-config.json")
  $proj = & $GcloudCmd config get-value project 2>$null
  if ($proj) {
    & $GcloudCmd run services list --project $proj --region asia-northeast3 --format=json 2>&1 |
      Set-Content -Encoding utf8 (Join-Path $sessionDir "gcloud-run-services-asia-northeast3.json")
  }
} else {
  "gcloud.cmd 을 찾지 못했습니다. PATH 추가 또는 -GcloudPath 로 지정하세요." |
    Set-Content -Encoding utf8 (Join-Path $sessionDir "gcloud-SKIPPED.txt")
}

@"
복구 참고:
1) terraform.tfvars 는 원격 state에 없고, 변수는 state pull JSON의 module/outputs 와 리소스 속성에서 일부 역추적 가능하다.
2) 가장 확실한 로컬 복제는 이 폴더의 terraform-state-*.json + 기존 코드베이스로 terraform plan 이 드리프트 0에 가깝게 나오는지 확인하는 것이다.
3) 민감 정보가 포함되므로 클라우드 동기화 폴더(OneDrive 등)에 두지 말 것.
"@ | Set-Content -Encoding utf8 (Join-Path $sessionDir "01-RECOVERY-NOTES.txt")

Write-Host ""
Write-Host "완료: $sessionDir" -ForegroundColor Green
Write-Host $repoHint
