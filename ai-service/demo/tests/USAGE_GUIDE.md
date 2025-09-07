# AI Service Demo 테스트 시스템 사용 가이드

## 🚀 빠른 시작

### 1. 개발 중 (기본)
```bash
# AI Service Demo 디렉토리에서
cd ai-service/demo

# 유닛 테스트만 실행 (빠른 피드백)
python tests/scripts/run_unit_tests.py
```

### 2. 기능 완료 (확장)
```bash
# 유닛 테스트 + 기본 실행 테스트
python tests/scripts/run_basic_tests.py --with-unit
```

### 3. 요청 시 (전체)
```bash
# E2E 테스트 실행
python tests/scripts/run_e2e_tests.py
```

## 📋 테스트 실행 전략

### 개발 단계별 테스트 실행
```bash
# 개발 중 (유닛 테스트만)
python tests/scripts/run_test_strategy.py --stage development

# 기능 완료 (유닛 + 기본)
python tests/scripts/run_test_strategy.py --stage feature_complete

# 통합 테스트 (유닛 + 기본 + 통합)
python tests/scripts/run_test_strategy.py --stage integration

# 배포 전 (전체 테스트)
python tests/scripts/run_test_strategy.py --stage deployment

# 요청 시 (E2E만)
python tests/scripts/run_test_strategy.py --stage request
```

### 특정 테스트 레벨 실행
```bash
# 유닛 테스트만
python tests/scripts/run_test_strategy.py --level unit

# 기본 실행 테스트만
python tests/scripts/run_test_strategy.py --level basic

# 통합 테스트만
python tests/scripts/run_test_strategy.py --level integration

# E2E 테스트만
python tests/scripts/run_test_strategy.py --level e2e
```

## 🧪 개별 테스트 실행

### 유닛 테스트
```bash
# 기본 실행
python tests/scripts/run_unit_tests.py

# 커버리지와 함께
python tests/scripts/run_unit_tests.py --coverage

# 특정 테스트 파일
python tests/scripts/run_unit_tests.py --test tests/unit/domain/services/test_embedding_service_extended.py
```

### 기본 실행 테스트
```bash
# 기본 실행
python tests/scripts/run_basic_tests.py

# 커버리지와 함께
python tests/scripts/run_basic_tests.py --coverage

# 유닛 테스트와 함께
python tests/scripts/run_basic_tests.py --with-unit

# 환경 확인만
python tests/scripts/run_basic_tests.py --check-env
```

### 통합 테스트
```bash
# 모든 통합 테스트
python tests/scripts/run_integration_tests.py

# 서비스 통합 테스트만
python tests/scripts/run_integration_tests.py --service-only

# 유스케이스 통합 테스트만
python tests/scripts/run_integration_tests.py --usecase-only

# 커버리지와 함께
python tests/scripts/run_integration_tests.py --coverage
```

### E2E 테스트
```bash
# 기본 실행
python tests/scripts/run_e2e_tests.py

# 헤드리스 모드
python tests/scripts/run_e2e_tests.py --headless

# 특정 테스트 파일
python tests/scripts/run_e2e_tests.py --test tests/document-management.spec.ts

# 환경 확인만
python tests/scripts/run_e2e_tests.py --check-env

# Playwright 설치
python tests/scripts/run_e2e_tests.py --install
```

## 📊 테스트 결과 확인

### 커버리지 리포트
```bash
# HTML 리포트 생성 후 브라우저에서 확인
open htmlcov/index.html
```

### E2E 테스트 리포트
```bash
# Playwright HTML 리포트 확인
open playwright-report/index.html
```

## 🔧 환경 설정

### Python 의존성 설치
```bash
# 테스트 의존성 설치
pip install pytest pytest-cov pytest-mock

# Playwright 설치
pip install playwright
npx playwright install
```

### 환경 변수 설정
```bash
# 테스트 환경 설정
export TEST_ENV=demo
export GRADIO_SERVER_URL=http://localhost:7860
export TEST_TIMEOUT=30000
```

## 📈 성능 목표

| 테스트 레벨 | 목표 실행 시간 | 커버리지 목표 |
|-------------|----------------|---------------|
| 유닛 테스트 | ~15초 | 80% |
| 기본 실행 테스트 | ~1분 | 70% |
| 통합 테스트 | ~2분 | 60% |
| E2E 테스트 | ~3분 | 50% |

## 🎯 테스트 전략 요약

### 개발 중 (기본)
- **실행**: 유닛 테스트만
- **목적**: 빠른 피드백
- **실행 시간**: ~15초

### 기능 완료 (확장)
- **실행**: 유닛 테스트 + 기본 실행 테스트
- **목적**: 통합 검증
- **실행 시간**: ~1분

### 요청 시 (전체)
- **실행**: E2E 테스트
- **목적**: 사용자 시나리오 검증
- **실행 시간**: ~3분

## 🚨 문제 해결

### 유닛 테스트 실패
```bash
# 상세한 오류 정보 확인
python tests/scripts/run_unit_tests.py -v

# 특정 테스트만 실행
python tests/scripts/run_unit_tests.py --test tests/unit/domain/services/test_embedding_service_extended.py
```

### E2E 테스트 실패
```bash
# 환경 확인
python tests/scripts/run_e2e_tests.py --check-env

# Playwright 재설치
python tests/scripts/run_e2e_tests.py --install

# 헤드리스 모드로 실행
python tests/scripts/run_e2e_tests.py --headless
```

### 서버 연결 실패
```bash
# AI Service Demo 서버가 실행 중인지 확인
curl http://localhost:7860

# 서버 재시작
cd ai-service/demo
python main.py
```

## 📚 추가 정보

- [테스트 시스템 README](README.md)
- [Playwright 공식 문서](https://playwright.dev/)
- [pytest 공식 문서](https://docs.pytest.org/)
- [헥사고널 아키텍처 테스트 전략](https://alistair.cockburn.us/hexagonal-architecture/)
