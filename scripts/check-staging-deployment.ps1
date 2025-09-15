# 스테이징 배포 상태 확인 스크립트

param(
    [string]$ProjectId = "",
    [string]$Region = "asia-northeast3"
)

Write-Host "🔍 스테이징 배포 상태 확인" -ForegroundColor Green
Write-Host ""

if (-not $ProjectId) {
    $ProjectId = Read-Host "GCP Project ID를 입력하세요"
}

# Google Cloud 인증 확인
Write-Host "🔐 Google Cloud 인증 확인 중..." -ForegroundColor Blue
try {
    $currentProject = gcloud config get-value project 2>$null
    if ($currentProject -ne $ProjectId) {
        Write-Host "프로젝트 설정 중: $ProjectId" -ForegroundColor Yellow
        gcloud config set project $ProjectId
    }
    Write-Host "✅ 인증 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud 인증 실패. 'gcloud auth login'을 실행하세요." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Cloud Run 서비스 상태 확인..." -ForegroundColor Blue

# 백엔드 서비스 확인
Write-Host ""
Write-Host "📱 Backend Service (ai-portfolio-backend-staging):" -ForegroundColor Cyan
try {
    $backendService = gcloud run services describe ai-portfolio-backend-staging --region=$Region --format="value(status.url)" 2>$null
    if ($backendService) {
        Write-Host "✅ 서비스 URL: $backendService" -ForegroundColor Green
        
        # 헬스체크
        Write-Host "🏥 헬스체크 중..." -ForegroundColor Blue
        try {
            $response = Invoke-RestMethod -Uri "$backendService/health" -Method Get -TimeoutSec 10
            Write-Host "✅ 헬스체크 성공: $($response.status)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ 헬스체크 실패 또는 엔드포인트 없음" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ 백엔드 서비스를 찾을 수 없습니다." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 백엔드 서비스 조회 실패" -ForegroundColor Red
}

# 프론트엔드 서비스 확인
Write-Host ""
Write-Host "🌐 Frontend Service (ai-portfolio-frontend-staging):" -ForegroundColor Cyan
try {
    $frontendService = gcloud run services describe ai-portfolio-frontend-staging --region=$Region --format="value(status.url)" 2>$null
    if ($frontendService) {
        Write-Host "✅ 서비스 URL: $frontendService" -ForegroundColor Green
        
        # 기본 접속 테스트
        Write-Host "🌍 접속 테스트 중..." -ForegroundColor Blue
        try {
            $response = Invoke-WebRequest -Uri $frontendService -Method Get -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ 프론트엔드 접속 성공" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️ 프론트엔드 접속 실패" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ 프론트엔드 서비스를 찾을 수 없습니다." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 프론트엔드 서비스 조회 실패" -ForegroundColor Red
}

# 최근 배포 정보
Write-Host ""
Write-Host "📋 최근 배포 정보:" -ForegroundColor Blue
try {
    Write-Host "Backend Revisions:" -ForegroundColor Cyan
    gcloud run revisions list --service=ai-portfolio-backend-staging --region=$Region --limit=3 --format="table(metadata.name,status.conditions[0].lastTransitionTime,spec.containers[0].image)"
    
    Write-Host ""
    Write-Host "Frontend Revisions:" -ForegroundColor Cyan
    gcloud run revisions list --service=ai-portfolio-frontend-staging --region=$Region --limit=3 --format="table(metadata.name,status.conditions[0].lastTransitionTime)"
} catch {
    Write-Host "⚠️ 배포 정보 조회 실패" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 유용한 링크:" -ForegroundColor Yellow
Write-Host "• GitHub Actions: https://github.com/Yamang02/AI_Portfolio/actions" -ForegroundColor Cyan
Write-Host "• Cloud Run Console: https://console.cloud.google.com/run?project=$ProjectId" -ForegroundColor Cyan
Write-Host "• Railway Dashboard: https://railway.app/dashboard" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ 배포 상태 확인 완료!" -ForegroundColor Green