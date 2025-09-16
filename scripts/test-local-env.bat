@echo off
REM AI Portfolio 로컬 테스트 스크립트 (Windows)

echo 🔍 AI Portfolio 로컬 환경 진단을 시작합니다...

REM 1. Docker 상태 확인
echo 📦 Docker 상태 확인...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker가 설치되지 않았습니다.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose가 설치되지 않았습니다.
    pause
    exit /b 1
)

echo ✅ Docker 및 Docker Compose가 설치되어 있습니다.

REM 2. 포트 사용 확인
echo 🔌 포트 사용 상태 확인...
netstat -an | findstr :8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  포트 8080이 이미 사용 중입니다.
)

netstat -an | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  포트 3000이 이미 사용 중입니다.
)

REM 3. 기존 컨테이너 정리
echo 🧹 기존 컨테이너 정리...
docker-compose down -v

REM 4. 데이터베이스만 먼저 시작
echo 🗄️ 데이터베이스 시작...
docker-compose up -d postgres redis

REM 데이터베이스 준비 대기
echo ⏳ 데이터베이스 준비 대기 (30초)...
timeout /t 30 /nobreak >nul

REM 5. 데이터베이스 연결 테스트
echo 🔗 데이터베이스 연결 테스트...
docker-compose exec postgres pg_isready -U dev_user -d ai_portfolio

REM 6. 백엔드 시작
echo 🔧 백엔드 시작...
docker-compose up -d backend

REM 백엔드 준비 대기
echo ⏳ 백엔드 준비 대기 (60초)...
timeout /t 60 /nobreak >nul

REM 7. 백엔드 헬스 체크
echo 🏥 백엔드 헬스 체크...
curl -f http://localhost:8080/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 백엔드가 정상적으로 실행 중입니다.
) else (
    echo ❌ 백엔드 헬스 체크 실패
    echo 백엔드 로그 확인:
    docker-compose logs backend
)

REM 8. API 엔드포인트 테스트
echo 🧪 API 엔드포인트 테스트...
echo 교육 데이터 API 테스트:
curl -s http://localhost:8080/api/data/education

echo.
echo 자격증 데이터 API 테스트:
curl -s http://localhost:8080/api/data/certifications

REM 9. 프론트엔드 시작
echo 🎨 프론트엔드 시작...
docker-compose up -d frontend

echo ✅ 테스트 완료!
echo.
echo 📱 접속 정보:
echo   - 프론트엔드: http://localhost:3000
echo   - 백엔드 API: http://localhost:8080
echo   - 헬스 체크: http://localhost:8080/health
echo.
echo 📊 모니터링 명령어:
echo   - 컨테이너 상태: docker-compose ps
echo   - 백엔드 로그: docker-compose logs -f backend
echo   - 프론트엔드 로그: docker-compose logs -f frontend
echo.
pause


