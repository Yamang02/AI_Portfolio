@echo off
REM AI Portfolio Backend - Local Development Script
REM This script runs the Spring Boot backend with local profile

echo ====================================
echo Starting AI Portfolio Backend (Local)
echo ====================================
echo.

REM Check if mvnw exists
if not exist "mvnw.cmd" (
    echo Error: Maven wrapper not found!
    echo Please run this script from the backend directory.
    pause
    exit /b 1
)

REM Run Spring Boot with local profile
echo Running: mvnw spring-boot:run -Dspring-boot.run.profiles=local
echo.

mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local

pause
