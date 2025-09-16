#!/bin/bash

# AI Portfolio 로컬 개발 환경 시작 스크립트

echo "🚀 AI Portfolio 로컬 개발 환경을 시작합니다..."

# 기존 컨테이너 정리
echo "📦 기존 컨테이너 정리 중..."
docker-compose down -v

# 데이터베이스와 Redis만 먼저 시작
echo "🗄️ 데이터베이스 및 Redis 시작 중..."
docker-compose up -d postgres redis

# 데이터베이스 준비 대기
echo "⏳ 데이터베이스 준비 대기 중..."
sleep 10

# 백엔드 시작
echo "🔧 백엔드 서비스 시작 중..."
docker-compose up -d backend

# 백엔드 준비 대기
echo "⏳ 백엔드 준비 대기 중..."
sleep 15

# 프론트엔드 시작
echo "🎨 프론트엔드 서비스 시작 중..."
docker-compose up -d frontend

echo "✅ 모든 서비스가 시작되었습니다!"
echo ""
echo "📱 접속 정보:"
echo "  - 프론트엔드: http://localhost:3000"
echo "  - 백엔드 API: http://localhost:8080"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "📊 모니터링:"
echo "  - 컨테이너 상태: docker-compose ps"
echo "  - 로그 확인: docker-compose logs -f [service_name]"
echo "  - 서비스 중지: docker-compose down"
echo ""
echo "🎉 개발 환경이 준비되었습니다!"


