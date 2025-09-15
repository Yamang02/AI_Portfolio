# Railway PostgreSQL 연결 및 스키마 배포 스크립트 (PowerShell)

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging"
)

Write-Host "🚀 Railway PostgreSQL 연결 테스트 및 스키마 배포 ($Environment)" -ForegroundColor Green
Write-Host ""

# 환경별 DATABASE_URL 입력 받기
$envVarName = "DATABASE_URL_" + $Environment.ToUpper()
$databaseUrl = [Environment]::GetEnvironmentVariable($envVarName)

if (-not $databaseUrl) {
    Write-Host "Railway $Environment 콘솔에서 DATABASE_URL을 복사해주세요:" -ForegroundColor Yellow
    Write-Host "예시: postgresql://postgres:password@host:port/railway" -ForegroundColor Gray
    $databaseUrl = Read-Host "DATABASE_URL ($Environment)"
}

Write-Host ""
Write-Host "📡 데이터베이스 연결 테스트 중..." -ForegroundColor Blue

# 연결 테스트
try {
    $result = psql $databaseUrl -c "SELECT version();" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 데이터베이스 연결 성공!" -ForegroundColor Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "❌ 데이터베이스 연결 실패. URL을 확인해주세요." -ForegroundColor Red
    Write-Host "psql이 설치되어 있는지 확인해주세요." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 기존 테이블 확인 중..." -ForegroundColor Blue
psql $databaseUrl -c "\dt"

Write-Host ""
$confirm = Read-Host "스키마를 배포하시겠습니까? (y/N)"

if ($confirm -eq 'y' -or $confirm -eq 'Y' -or $confirm -eq 'yes' -or $confirm -eq 'Yes') {
    Write-Host ""
    Write-Host "🏗️ 스키마 생성 중..." -ForegroundColor Blue
    psql $databaseUrl -f database/schema.sql
    
    Write-Host ""
    Write-Host "📊 초기 데이터 삽입 중..." -ForegroundColor Blue
    psql $databaseUrl -f database/insert-data.sql
    
    Write-Host ""
    Write-Host "📋 배포 결과 확인..." -ForegroundColor Blue
    psql $databaseUrl -c "\dt"
    
    Write-Host ""
    Write-Host "📈 데이터 확인..." -ForegroundColor Blue
    psql $databaseUrl -c "SELECT business_id, title FROM projects LIMIT 3;"
    
    Write-Host ""
    Write-Host "✅ Railway PostgreSQL ($Environment) 배포 완료!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 연결 정보를 GitHub Secrets에 추가하세요:" -ForegroundColor Yellow
    Write-Host "RAILWAY_DATABASE_URL_$($Environment.ToUpper())=$databaseUrl" -ForegroundColor Cyan
} else {
    Write-Host "배포를 취소했습니다." -ForegroundColor Yellow
}