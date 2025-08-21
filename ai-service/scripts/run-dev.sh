#!/bin/bash
# 로컬 개발 환경 실행 스크립트

echo "🚀 AI Service 로컬 개발 환경 시작..."

# .env 파일이 있는지 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다."
    echo "   .env.example을 참고해서 .env 파일을 생성하세요."
    exit 1
fi

# 개발용 Docker Compose 실행
docker-compose -f docker-compose.ai.yml down
docker-compose -f docker-compose.ai.yml up --build

echo "✅ 개발 서버가 http://localhost:8000 에서 실행 중입니다."