#!/bin/bash

# Framework-Aware Hexagonal Architecture 테스트 실행 스크립트

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
log_info "Framework-Aware Hexagonal Architecture 테스트 실행"
log_framework "LangChain Integration with Hexagonal Architecture"

# 1. Python 환경 확인
log_info "Python 환경 확인 중..."
python --version || {
    log_error "Python이 설치되지 않았습니다"
    exit 1
}

# 2. 필요한 패키지 설치 확인
log_info "필요한 패키지 설치 확인 중..."
pip install pytest pytest-asyncio || {
    log_error "pytest 설치 실패"
    exit 1
}

# 3. 단위 테스트 실행
log_info "단위 테스트 실행 중..."
cd ai-service
python -m pytest tests/test_framework_aware_architecture.py -v --tb=short || {
    log_error "단위 테스트 실패"
    exit 1
}
log_success "단위 테스트 통과"

# 4. 통합 테스트 실행 (Docker Compose 기반)
log_info "통합 테스트 실행 중..."
cd ..
chmod +x ai-service/scripts/test-framework-aware-integration.sh
./ai-service/scripts/test-framework-aware-integration.sh || {
    log_error "통합 테스트 실패"
    exit 1
}
log_success "통합 테스트 통과"

# 5. 테스트 결과 요약
log_info "=== 테스트 결과 요약 ==="
log_success "✅ 단위 테스트: 통과"
log_success "✅ 통합 테스트: 통과"
log_framework "✅ Framework-Aware Hexagonal Architecture: 검증 완료"
log_framework "✅ LangChain Integration: 검증 완료"

log_info "모든 테스트가 성공적으로 완료되었습니다!"
exit 0
