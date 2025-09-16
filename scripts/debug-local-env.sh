#!/bin/bash

# AI Portfolio 디버깅 스크립트

echo "🐛 AI Portfolio 디버깅을 시작합니다..."

# 1. 컨테이너 상태 확인
echo "📦 컨테이너 상태:"
docker-compose ps

echo ""
echo "🔍 각 서비스별 상세 상태:"

# 2. PostgreSQL 상태
echo "🗄️ PostgreSQL 상태:"
docker-compose exec postgres pg_isready -U dev_user -d ai_portfolio 2>/dev/null || echo "PostgreSQL 연결 실패"

# 3. Redis 상태
echo "🔴 Redis 상태:"
docker-compose exec redis redis-cli ping 2>/dev/null || echo "Redis 연결 실패"

# 4. 백엔드 상태
echo "🔧 백엔드 상태:"
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ 백엔드 정상"
    echo "헬스 체크 응답:"
    curl -s http://localhost:8080/health | head -c 200
    echo ""
else
    echo "❌ 백엔드 연결 실패"
fi

# 5. API 엔드포인트 테스트
echo ""
echo "🧪 API 엔드포인트 테스트:"

echo "교육 데이터 API:"
response=$(curl -s -w "%{http_code}" http://localhost:8080/api/data/education)
http_code="${response: -3}"
if [ "$http_code" = "200" ]; then
    echo "✅ 교육 데이터 API 정상 (HTTP $http_code)"
    echo "응답 샘플: ${response%???}" | head -c 100
    echo ""
else
    echo "❌ 교육 데이터 API 실패 (HTTP $http_code)"
fi

echo "자격증 데이터 API:"
response=$(curl -s -w "%{http_code}" http://localhost:8080/api/data/certifications)
http_code="${response: -3}"
if [ "$http_code" = "200" ]; then
    echo "✅ 자격증 데이터 API 정상 (HTTP $http_code)"
    echo "응답 샘플: ${response%???}" | head -c 100
    echo ""
else
    echo "❌ 자격증 데이터 API 실패 (HTTP $http_code)"
fi

# 6. 로그 확인
echo ""
echo "📋 최근 로그 (마지막 10줄):"
echo "백엔드 로그:"
docker-compose logs --tail=10 backend

echo ""
echo "프론트엔드 로그:"
docker-compose logs --tail=10 frontend

echo ""
echo "🔧 문제 해결 방법:"
echo "1. 백엔드 재시작: docker-compose restart backend"
echo "2. 전체 재시작: docker-compose down && docker-compose up -d"
echo "3. 로그 확인: docker-compose logs -f [service_name]"
echo "4. 데이터베이스 초기화: docker-compose down -v && docker-compose up -d"


