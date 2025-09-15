@echo off
echo Starting AI Portfolio Development Environment...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo Starting PostgreSQL database with fresh data...
echo Stopping existing containers...
docker-compose down
echo Building PostgreSQL with data...
docker-compose up -d postgres

if errorlevel 0 (
    echo.
    echo Database started successfully!
    echo.
    echo PostgreSQL: localhost:5432
    echo Database: ai_portfolio
    echo Username: dev_user  
    echo Password: dev_password
    echo.
    echo pgAdmin (optional): docker-compose up -d pgadmin
    echo pgAdmin URL: http://localhost:5050 (admin@localhost.com / admin123)
    echo.
    echo Now you can:
    echo 1. Start backend: cd backend && mvn spring-boot:run
    echo 2. Start frontend: cd frontend && npm run dev
) else (
    echo Error: Failed to start database.
)

pause