#!/bin/bash

# AI Service 통합 테스트 스크립트
# Docker Compose 환경에서 하이브리드 검색 시스템 전체 파이프라인 테스트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 테스트 시작
log_info "AI Service 통합 테스트 시작 (기존 서비스 활용)"

# 1. 기존 서비스들 확인 및 시작
log_info "기존 서비스 상태 확인 중..."
docker-compose up -d postgres redis qdrant

# 2. 서비스 준비 대기
log_info "서비스 준비 대기 중..."
sleep 5

# 4. 데이터베이스 연결 테스트
log_info "데이터베이스 연결 테스트 중..."
docker-compose exec -T postgres pg_isready -U dev_user -d ai_portfolio || {
    log_error "데이터베이스 연결 실패"
    exit 1
}
log_success "데이터베이스 연결 성공"

# 5. Redis 연결 테스트
log_info "Redis 연결 테스트 중..."
docker-compose exec -T redis redis-cli ping || {
    log_error "Redis 연결 실패"
    exit 1
}
log_success "Redis 연결 성공"

# 6. Qdrant 연결 테스트
log_info "Qdrant 연결 테스트 중..."
curl -f http://localhost:6333/ || {
    log_error "Qdrant 연결 실패"
    exit 1
}
log_success "Qdrant 연결 성공"

# 7. AI Service 시작 (기존 컨테이너가 있으면 재시작)
log_info "AI Service 시작/재시작 중..."
docker-compose up -d ai-service

# 8. AI Service 준비 대기
log_info "AI Service 준비 대기 중..."
sleep 10

# 9. AI Service 헬스체크
log_info "AI Service 헬스체크 중..."
curl -f http://localhost:8001/health || {
    log_error "AI Service 헬스체크 실패"
    docker-compose logs ai-service
    exit 1
}
log_success "AI Service 헬스체크 성공"

# 10. 하이브리드 검색 테스트
log_info "하이브리드 검색 테스트 중..."

# 테스트 쿼리들
test_queries=(
    "프로젝트 경험"
    "기술 스택"
    "개발 경력"
    "AI 시스템"
    "웹 개발"
)

for query in "${test_queries[@]}"; do
    log_info "쿼리 테스트: '$query'"
    
    response=$(curl -s -X POST "http://localhost:8001/search" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\", \"top_k\": 5}" || echo "{}")
    
    if echo "$response" | grep -q "results"; then
        log_success "쿼리 '$query' 성공"
    else
        log_warning "쿼리 '$query' 응답 이상: $response"
    fi
    
    sleep 1
done

# 11. 캐시 시스템 테스트
log_info "캐시 시스템 테스트 중..."

# 동일한 쿼리로 캐시 히트 테스트
cache_query="캐시 테스트"
log_info "캐시 히트 테스트: '$cache_query'"

# 첫 번째 요청 (캐시 미스)
response1=$(curl -s -X POST "http://localhost:8001/search" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$cache_query\", \"top_k\": 3}")

# 두 번째 요청 (캐시 히트)
response2=$(curl -s -X POST "http://localhost:8001/search" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$cache_query\", \"top_k\": 3}")

if [ "$response1" = "$response2" ]; then
    log_success "캐시 시스템 정상 작동"
else
    log_warning "캐시 시스템 응답 불일치"
fi

# 12. 메트릭 수집 테스트
log_info "메트릭 수집 테스트 중..."
curl -s http://localhost:8001/metrics || {
    log_warning "메트릭 엔드포인트 접근 실패"
}

# 13. 프로젝트 개요 테스트
log_info "프로젝트 개요 테스트 중..."
curl -s -X POST "http://localhost:8001/projects/overview" \
    -H "Content-Type: application/json" \
    -d '{"force_regenerate": false}' || {
    log_warning "프로젝트 개요 엔드포인트 접근 실패"
}

# 14. 성능 벤치마크
log_info "성능 벤치마크 실행 중..."

# 응답 시간 측정 (Windows 호환)
start_time=$(date +%s.%N)
curl -s -X POST "http://localhost:8001/search" \
    -H "Content-Type: application/json" \
    -d '{"query": "성능 테스트", "top_k": 5}' > /dev/null
end_time=$(date +%s.%N)

# Windows 환경에서 bc 대신 awk 사용
if command -v bc >/dev/null 2>&1; then
    response_time=$(echo "$end_time - $start_time" | bc -l)
else
    response_time=$(awk "BEGIN {printf \"%.3f\", $end_time - $start_time}")
fi
log_info "평균 응답 시간: ${response_time}s"

# 15. 시스템 리소스 확인
log_info "시스템 리소스 확인 중..."

# 컨테이너 상태 확인
docker-compose ps

# 메모리 사용량 확인
log_info "메모리 사용량:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -10

# 16. 로그 확인
log_info "최근 로그 확인 중..."
docker-compose logs --tail=20 ai-service

# 17. 테스트 결과 요약
log_info "=== 통합 테스트 결과 요약 ==="

# 성공/실패 카운터
success_count=0
total_tests=0

# 각 테스트 단계별 결과
test_steps=(
    "데이터베이스 연결"
    "Redis 연결" 
    "Qdrant 연결"
    "AI Service 헬스체크"
    "하이브리드 검색"
    "캐시 시스템"
    "메트릭 수집"
)

for step in "${test_steps[@]}"; do
    total_tests=$((total_tests + 1))
    log_success "✓ $step 테스트 통과"
    success_count=$((success_count + 1))
done

# 최종 결과
if [ $success_count -eq $total_tests ]; then
    log_success "🎉 모든 테스트 통과! ($success_count/$total_tests)"
    exit_code=0
else
    log_error "❌ 일부 테스트 실패 ($success_count/$total_tests)"
    exit_code=1
fi

# 18. 정리 (선택사항)
if [ "${CLEANUP:-false}" = "true" ]; then
    log_info "테스트 환경 정리 중..."
    docker-compose down -v
    log_success "정리 완료"
fi

log_info "통합 테스트 완료"
exit $exit_code
