#!/bin/bash

# Railway PostgreSQL 연결 및 스키마 배포 스크립트
# Railway 콘솔에서 DATABASE_URL을 복사해서 사용하세요

echo "🚀 Railway PostgreSQL 연결 테스트 및 스키마 배포"
echo ""

# Railway DATABASE_URL 입력 받기
if [ -z "$DATABASE_URL" ]; then
    echo "Railway 콘솔에서 DATABASE_URL을 복사해주세요:"
    echo "예시: postgresql://postgres:password@host:port/railway"
    read -p "DATABASE_URL: " DATABASE_URL
fi

echo ""
echo "📡 데이터베이스 연결 테스트 중..."

# 연결 테스트
if psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ 데이터베이스 연결 성공!"
else
    echo "❌ 데이터베이스 연결 실패. URL을 확인해주세요."
    exit 1
fi

echo ""
echo "📋 기존 테이블 확인 중..."
psql "$DATABASE_URL" -c "\dt"

echo ""
read -p "스키마를 배포하시겠습니까? (y/N): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo ""
    echo "🏗️ 스키마 생성 중..."
    psql "$DATABASE_URL" -f database/schema.sql
    
    echo ""
    echo "📊 초기 데이터 삽입 중..."
    psql "$DATABASE_URL" -f database/insert-data.sql
    
    echo ""
    echo "📋 배포 결과 확인..."
    psql "$DATABASE_URL" -c "\dt"
    
    echo ""
    echo "📈 데이터 확인..."
    psql "$DATABASE_URL" -c "SELECT business_id, title FROM projects LIMIT 3;"
    
    echo ""
    echo "✅ Railway PostgreSQL 배포 완료!"
    echo ""
    echo "🔗 연결 정보를 GitHub Secrets에 추가하세요:"
    echo "RAILWAY_DATABASE_URL=$DATABASE_URL"
else
    echo "배포를 취소했습니다."
fi