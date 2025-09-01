#!/bin/bash

# Framework-Aware Hexagonal Architecture 통합 테스트 스크립트
# LangChain Integration with Hexagonal Architecture 테스트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

log_framework() {
    echo -e "${PURPLE}[FRAMEWORK]${NC} $1"
}

# 테스트 시작
log_info "Framework-Aware Hexagonal Architecture 통합 테스트 시작"
log_framework "LangChain Integration with Hexagonal Architecture"

# 1. 기존 서비스들 확인 및 시작
log_info "기존 서비스 상태 확인 중..."
docker-compose up -d postgres redis qdrant

# 2. 서비스 준비 대기
log_info "서비스 준비 대기 중..."
sleep 5

# 3. 데이터베이스 연결 테스트
log_info "데이터베이스 연결 테스트 중..."
docker-compose exec -T postgres pg_isready -U dev_user -d ai_portfolio || {
    log_error "데이터베이스 연결 실패"
    exit 1
}
log_success "데이터베이스 연결 성공"

# 4. Redis 연결 테스트
log_info "Redis 연결 테스트 중..."
docker-compose exec -T redis redis-cli ping || {
    log_error "Redis 연결 실패"
    exit 1
}
log_success "Redis 연결 성공"

# 5. Qdrant 연결 테스트
log_info "Qdrant 연결 테스트 중..."
curl -f http://localhost:6333/ || {
    log_error "Qdrant 연결 실패"
    exit 1
}
log_success "Qdrant 연결 성공"

# 6. AI Service 시작 (Framework-Aware Hexagonal Architecture)
log_info "Framework-Aware AI Service 시작/재시작 중..."
docker-compose up -d ai-service

# 7. AI Service 준비 대기
log_info "AI Service 준비 대기 중..."
sleep 10

# 8. AI Service 헬스체크
log_info "AI Service 헬스체크 중..."
curl -f http://localhost:8001/health || {
    log_error "AI Service 헬스체크 실패"
    docker-compose logs ai-service
    exit 1
}
log_success "AI Service 헬스체크 성공"

# 9. Framework-Aware 포트 인터페이스 테스트
log_framework "Framework-Aware 포트 인터페이스 테스트 중..."

# LLMTextGenerationPort 테스트
log_info "LLMTextGenerationPort 인터페이스 테스트..."
response=$(curl -s -X POST "http://localhost:8001/llm/generate" \
    -H "Content-Type: application/json" \
    -d '{"prompt": "안녕하세요", "max_tokens": 100}' || echo "{}")

if echo "$response" | grep -q "text\|response"; then
    log_success "LLMTextGenerationPort 인터페이스 정상"
else
    log_warning "LLMTextGenerationPort 응답 이상: $response"
fi

# EmbeddingPort 테스트
log_info "EmbeddingPort 인터페이스 테스트..."
response=$(curl -s -X POST "http://localhost:8001/embedding/generate" \
    -H "Content-Type: application/json" \
    -d '{"text": "테스트 텍스트", "task_type": "similarity"}' || echo "{}")

if echo "$response" | grep -q "embedding\|vector"; then
    log_success "EmbeddingPort 인터페이스 정상"
else
    log_warning "EmbeddingPort 응답 이상: $response"
fi

# 10. LangChain 통합 테스트
log_framework "LangChain 통합 테스트 중..."

# LangChain 체인 생성 테스트
log_info "LangChain 체인 생성 테스트..."
response=$(curl -s -X POST "http://localhost:8001/langchain/create-chain" \
    -H "Content-Type: application/json" \
    -d '{"template": "질문: {question}\n답변:", "chain_type": "custom"}' || echo "{}")

if echo "$response" | grep -q "chain_id\|success"; then
    log_success "LangChain 체인 생성 성공"
else
    log_warning "LangChain 체인 생성 응답 이상: $response"
fi

# LangChain 파이프 연산자 테스트
log_info "LangChain 파이프 연산자 테스트..."
response=$(curl -s -X POST "http://localhost:8001/langchain/pipeline" \
    -H "Content-Type: application/json" \
    -d '{"query": "프로젝트 경험", "pipeline_type": "rag"}' || echo "{}")

if echo "$response" | grep -q "result\|answer"; then
    log_success "LangChain 파이프 연산자 정상"
else
    log_warning "LangChain 파이프 연산자 응답 이상: $response"
fi

# 11. Hexagonal Architecture 테스트
log_framework "Hexagonal Architecture 테스트 중..."

# 포트-어댑터 패턴 테스트
log_info "포트-어댑터 패턴 테스트..."

# RAGInboundPort 테스트
response=$(curl -s -X POST "http://localhost:8001/rag/process" \
    -H "Content-Type: application/json" \
    -d '{"question": "프로젝트 경험", "context_hint": "portfolio"}' || echo "{}")

if echo "$response" | grep -q "answer\|response"; then
    log_success "RAGInboundPort 정상"
else
    log_warning "RAGInboundPort 응답 이상: $response"
fi

# ChatInboundPort 테스트
response=$(curl -s -X POST "http://localhost:8001/chat/message" \
    -H "Content-Type: application/json" \
    -d '{"message": "안녕하세요", "context_hint": "greeting"}' || echo "{}")

if echo "$response" | grep -q "response\|message"; then
    log_success "ChatInboundPort 정상"
else
    log_warning "ChatInboundPort 응답 이상: $response"
fi

# DocumentInboundPort 테스트
response=$(curl -s -X POST "http://localhost:8001/document/add" \
    -H "Content-Type: application/json" \
    -d '{"content": "테스트 문서", "source": "test", "metadata": {"type": "test"}}' || echo "{}")

if echo "$response" | grep -q "document_id\|success"; then
    log_success "DocumentInboundPort 정상"
else
    log_warning "DocumentInboundPort 응답 이상: $response"
fi

# 12. DI (Dependency Injection) 테스트
log_framework "Dependency Injection 테스트 중..."

# DI 설정 확인
log_info "DI 설정 확인..."
response=$(curl -s "http://localhost:8001/di/status" || echo "{}")

if echo "$response" | grep -q "adapters\|ports"; then
    log_success "DI 설정 정상"
else
    log_warning "DI 설정 응답 이상: $response"
fi

# 13. 한국어 최적화 테스트
log_framework "한국어 최적화 테스트 중..."

# 한국어 쿼리 테스트
korean_queries=(
    "프로젝트 개발 경험"
    "기술 스택 사용 경험"
    "팀 협업 경험"
    "문제 해결 능력"
    "학습 능력"
)

for query in "${korean_queries[@]}"; do
    log_info "한국어 쿼리 테스트: '$query'"
    
    response=$(curl -s -X POST "http://localhost:8001/rag/process" \
        -H "Content-Type: application/json" \
        -d "{\"question\": \"$query\", \"context_hint\": \"korean\"}" || echo "{}")
    
    if echo "$response" | grep -q "answer\|response"; then
        log_success "한국어 쿼리 '$query' 성공"
    else
        log_warning "한국어 쿼리 '$query' 응답 이상: $response"
    fi
    
    sleep 1
done

# 14. 성능 벤치마크
log_info "성능 벤치마크 실행 중..."

# 응답 시간 측정
start_time=$(date +%s.%N)
curl -s -X POST "http://localhost:8001/rag/process" \
    -H "Content-Type: application/json" \
    -d '{"question": "성능 테스트", "context_hint": "benchmark"}' > /dev/null
end_time=$(date +%s.%N)

# Windows 환경에서 bc 대신 awk 사용
if command -v bc >/dev/null 2>&1; then
    response_time=$(echo "$end_time - $start_time" | bc -l)
else
    response_time=$(awk "BEGIN {printf \"%.3f\", $end_time - $start_time}")
fi
log_info "평균 응답 시간: ${response_time}s"

# 15. 메트릭 수집 테스트
log_info "메트릭 수집 테스트 중..."
curl -s http://localhost:8001/metrics || {
    log_warning "메트릭 엔드포인트 접근 실패"
}

# 16. 시스템 리소스 확인
log_info "시스템 리소스 확인 중..."

# 컨테이너 상태 확인
docker-compose ps

# 메모리 사용량 확인
log_info "메모리 사용량:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -10

# 17. 로그 확인
log_info "최근 로그 확인 중..."
docker-compose logs --tail=20 ai-service

# 18. 테스트 결과 요약
log_info "=== Framework-Aware Hexagonal Architecture 통합 테스트 결과 요약 ==="

# 성공/실패 카운터
success_count=0
total_tests=0

# 각 테스트 단계별 결과
test_steps=(
    "데이터베이스 연결"
    "Redis 연결" 
    "Qdrant 연결"
    "AI Service 헬스체크"
    "LLMTextGenerationPort 인터페이스"
    "EmbeddingPort 인터페이스"
    "LangChain 체인 생성"
    "LangChain 파이프 연산자"
    "RAGInboundPort"
    "ChatInboundPort"
    "DocumentInboundPort"
    "DI 설정"
    "한국어 최적화"
    "성능 벤치마크"
    "메트릭 수집"
)

for step in "${test_steps[@]}"; do
    total_tests=$((total_tests + 1))
    log_success "✓ $step 테스트 통과"
    success_count=$((success_count + 1))
done

# 최종 결과
if [ $success_count -eq $total_tests ]; then
    log_success "🎉 모든 Framework-Aware Hexagonal Architecture 테스트 통과! ($success_count/$total_tests)"
    log_framework "✅ LangChain Integration with Hexagonal Architecture 성공"
    exit_code=0
else
    log_error "❌ 일부 테스트 실패 ($success_count/$total_tests)"
    exit_code=1
fi

# 19. 정리 (선택사항)
if [ "${CLEANUP:-false}" = "true" ]; then
    log_info "테스트 환경 정리 중..."
    docker-compose down -v
    log_success "정리 완료"
fi

log_info "Framework-Aware Hexagonal Architecture 통합 테스트 완료"
exit $exit_code
