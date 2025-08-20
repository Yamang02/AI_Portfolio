#!/bin/bash

# Railway PostgreSQL 스키마 배포 스크립트
# 사용법: ./scripts/deploy-db-schema.sh <RAILWAY_DATABASE_URL>

if [ -z "$1" ]; then
    echo "사용법: $0 <DATABASE_URL>"
    echo "예시: $0 postgresql://user:pass@host:port/dbname"
    exit 1
fi

DATABASE_URL=$1

echo "🚀 Railway PostgreSQL에 스키마 배포 시작..."

# 스키마 생성
echo "📋 스키마 생성 중..."
psql $DATABASE_URL -f database/schema.sql

# 데이터 삽입
echo "📊 초기 데이터 삽입 중..."
psql $DATABASE_URL -f database/insert-data.sql

echo "✅ 데이터베이스 배포 완료!"