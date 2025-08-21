#!/bin/bash

# AI 서비스 핵심 기능 테스트 스크립트

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 기본 설정
BASE_URL=${1:-"http://localhost:8000"}
QDANT_URL="http://localhost:6333"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 로그 함수
log_test() {
    local test_name="$1"
    local success="$2"
    local details="$3"
    
    if [ "$success" = "true" ]; then
        echo -e "${GREEN}✅ PASS${NC} $test_name"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ FAIL${NC} $test_name"
        ((FAILED_TESTS++))
    fi
    
    if [ -n "$details" ]; then
        echo "   $details"
    fi
    
    ((TOTAL_TESTS++))
}

# HTTP 요청 헬퍼 함수
make_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "%{http_code}"
    else
        curl -s -X "$method" "$url" \
            -w "%{http_code}"
    fi
}

# 테스트 함수들
test_root_endpoint() {
    echo "테스트: 루트 엔드포인트"
    
    local response=$(make_request "GET" "$BASE_URL/")
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        if echo "$body" | grep -q '"service"' && echo "$body" | grep -q '"version"'; then
            log_test "루트 엔드포인트" true "응답: $body"
        else
            log_test "루트 엔드포인트" false "필수 필드 누락"
        fi
    else
        log_test "루트 엔드포인트" false "상태 코드: $status_code"
    fi
}

test_health_check() {
    echo "테스트: 헬스체크"
    
    local response=$(make_request "GET" "$BASE_URL/api/v1/health")
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        if echo "$body" | grep -q '"status"' && echo "$body" | grep -q '"services"'; then
            log_test "헬스체크" true "상태 확인 성공"
        else
            log_test "헬스체크" false "응답 형식 오류"
        fi
    else
        log_test "헬스체크" false "상태 코드: $status_code"
    fi
}

test_service_info() {
    echo "테스트: 서비스 정보"
    
    local response=$(make_request "GET" "$BASE_URL/api/v1/info")
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        if echo "$body" | grep -q '"service"' && echo "$body" | grep -q '"features"'; then
            log_test "서비스 정보" true "서비스 정보 조회 성공"
        else
            log_test "서비스 정보" false "응답 형식 오류"
        fi
    else
        log_test "서비스 정보" false "상태 코드: $status_code"
    fi
}

test_chat_api() {
    echo "테스트: 채팅 API"
    
    local test_messages=(
        '{"message": "안녕하세요!"}'
        '{"message": "당신은 누구인가요?"}'
        '{"message": "프로젝트에 대해 알려주세요"}'
    )
    
    for message in "${test_messages[@]}"; do
        local response=$(make_request "POST" "$BASE_URL/api/v1/chat" "$message")
        local status_code="${response: -3}"
        local body="${response%???}"
        
        if [ "$status_code" = "200" ]; then
            if echo "$body" | grep -q '"answer"' && echo "$body" | grep -q '"query_type"'; then
                log_test "채팅 API" true "메시지 응답 성공"
            else
                log_test "채팅 API" false "응답 형식 오류"
                return 1
            fi
        else
            log_test "채팅 API" false "상태 코드: $status_code"
            return 1
        fi
    done
}

test_error_handling() {
    echo "테스트: 에러 처리"
    
    # 빈 메시지 테스트
    local response=$(make_request "POST" "$BASE_URL/api/v1/chat" '{"message": ""}')
    local status_code="${response: -3}"
    
    if [[ "$status_code" =~ ^(400|422)$ ]]; then
        log_test "에러 처리 - 빈 메시지" true "상태 코드: $status_code"
    else
        log_test "에러 처리 - 빈 메시지" false "예상 에러가 발생하지 않음: $status_code"
        return 1
    fi
    
    # 잘못된 JSON 테스트
    response=$(make_request "POST" "$BASE_URL/api/v1/chat" "invalid json")
    status_code="${response: -3}"
    
    if [[ "$status_code" =~ ^(400|422)$ ]]; then
        log_test "에러 처리 - 잘못된 JSON" true "상태 코드: $status_code"
    else
        log_test "에러 처리 - 잘못된 JSON" false "예상 에러가 발생하지 않음: $status_code"
        return 1
    fi
}

test_qdrant_connection() {
    echo "테스트: Qdrant 연결"
    
    local response=$(make_request "GET" "$QDANT_URL/collections")
    local status_code="${response: -3}"
    
    if [ "$status_code" = "200" ]; then
        log_test "Qdrant 연결" true "Qdrant 서비스 응답 성공"
    else
        log_test "Qdrant 연결" false "상태 코드: $status_code"
    fi
}

# 메인 테스트 실행
main() {
    echo -e "${BLUE}🚀 AI 서비스 핵심 기능 테스트 시작${NC}"
    echo -e "${BLUE}🎯 테스트 대상: $BASE_URL${NC}"
    echo "=================================================="
    echo
    
    # Docker 서비스 상태 확인
    echo -e "${YELLOW}📋 Docker 서비스 상태 확인${NC}"
    if command -v docker-compose &> /dev/null; then
        cd "$(dirname "$0")/.."
        docker-compose -f docker-compose.ai.yml ps
        echo
    fi
    
    # 테스트 실행
    test_root_endpoint
    test_health_check
    test_service_info
    test_chat_api
    test_error_handling
    test_qdrant_connection
    
    # 결과 요약
    echo
    echo -e "${BLUE}📊 테스트 결과 요약${NC}"
    echo "=================================================="
    echo "총 테스트: $TOTAL_TESTS"
    echo -e "성공: $PASSED_TESTS ${GREEN}✅${NC}"
    echo -e "실패: $FAILED_TESTS ${RED}❌${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo
        echo -e "${GREEN}🎉 모든 테스트가 통과했습니다!${NC}"
        exit 0
    else
        echo
        echo -e "${RED}⚠️  $FAILED_TESTS개 테스트가 실패했습니다.${NC}"
        exit 1
    fi
}

# 스크립트 실행
main "$@"
