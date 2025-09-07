# AI Service Demo 테스트 시스템

## 📋 개요

AI Service Demo 전용 체계적인 테스트 시스템입니다. 개발 생산성과 품질 보증의 균형을 고려한 테스트 전략을 적용합니다.

## 🏗️ 테스트 피라미드 구조

```
    /\
   /  \     E2E Tests (Playwright)
  /____\    - 사용자 시나리오 테스트
 /      \   - 요청 시에만 실행
/________\  
Integration Tests
- 서비스 간 연동 테스트
- 기본 실행 테스트

Unit Tests (현재 구현됨)
- 개별 함수/컴포넌트 테스트
- 매번 실행
```

## 📁 디렉토리 구조

```
ai-service/demo/tests/
├── unit/                    # 유닛 테스트 (현재 구현됨)
│   ├── domain/
│   │   ├── services/        # 도메인 서비스 테스트
│   │   └── entities/        # 엔티티 테스트
│   ├── application/
│   │   └── usecases/        # 유스케이스 테스트
│   └── infrastructure/       # 인프라 테스트
├── integration/             # 통합 테스트
│   ├── test_basic_execution.py      # 기본 실행 테스트
│   ├── test_service_integration.py   # 서비스 통합 테스트
│   └── test_usecase_integration.py  # 유스케이스 통합 테스트
├── e2e/                     # E2E 테스트 (Playwright)
│   ├── playwright.config.ts
│   ├── tests/
│   │   ├── document-management.spec.ts
│   │   ├── chunking-process.spec.ts
│   │   ├── embedding-generation.spec.ts
│   │   ├── rag-query.spec.ts
│   │   └── vector-search.spec.ts
│   └── pages/               # 페이지 객체 모델
└── scripts/                 # 테스트 실행 스크립트
    ├── run_unit_tests.py
    ├── run_basic_tests.py
    └── run_e2e_tests.py
```

## 🎯 테스트 실행 전략

### 1. 개발 중 (기본)
- **유닛 테스트만 실행**: 빠른 피드백 (~15초)
- **실행 시점**: 코드 변경 시마다
- **목적**: 개별 컴포넌트 동작 검증

### 2. 기능 완료 (확장)
- **유닛 테스트 + 기본 실행 테스트**: 통합 검증 (~1분)
- **실행 시점**: 기능 개발 완료 시
- **목적**: 서비스 간 연동 및 기본 동작 검증

### 3. 요청 시 (전체)
- **전체 테스트**: E2E 포함 (~3분)
- **실행 시점**: 사용자 요청 시 또는 배포 전
- **목적**: 실제 사용자 시나리오 검증

## 🚀 테스트 실행 방법

### 유닛 테스트 (기본)
```bash
# AI Service Demo 디렉토리에서
cd ai-service/demo

# 유닛 테스트 실행
python -m pytest tests/unit/ -v

# 또는 스크립트 사용
python tests/scripts/run_unit_tests.py
```

### 기본 실행 테스트 (확장)
```bash
# 기본 실행 테스트
python tests/scripts/run_basic_tests.py

# 또는 직접 실행
python tests/integration/test_basic_execution.py
```

### E2E 테스트 (요청 시)
```bash
# E2E 테스트 실행 (Playwright)
python tests/scripts/run_e2e_tests.py

# 또는 직접 실행
npx playwright test tests/e2e/
```

## 📊 현재 테스트 현황

### ✅ 구현 완료
- **유닛 테스트**: 52개 테스트 (100% 성공)
  - ProcessingStatusService: 13개 테스트
  - ValidationService: 12개 테스트
  - BatchProcessingService: 14개 테스트
  - EmbeddingService: 13개 테스트

### 🔄 구현 예정
- **기본 실행 테스트**: 애플리케이션 부트스트래핑 및 기본 동작 검증
- **서비스 통합 테스트**: 서비스 간 연동 테스트
- **E2E 테스트**: Playwright 기반 사용자 시나리오 테스트

## 🎨 E2E 테스트 시나리오

### 주요 사용자 시나리오
1. **문서 관리**: 샘플 데이터 로드 → 문서 추가 → 문서 목록 확인
2. **청킹 프로세스**: 문서 선택 → 청킹 실행 → 청크 목록 확인
3. **임베딩 생성**: 청크 선택 → 임베딩 생성 → 벡터스토어 저장
4. **RAG 질의응답**: 질문 입력 → AI 답변 확인 → 참조 출처 확인
5. **벡터 검색**: 검색 쿼리 입력 → 유사 청크 목록 확인

### 페이지 객체 모델
- `DocumentManagementPage`: 문서 관리 탭
- `ChunkingPage`: 텍스트 분할 탭
- `EmbeddingPage`: 임베딩 탭
- `RAGQueryPage`: RAG 질의응답 탭
- `VectorSearchPage`: 벡터 검색 탭

## 🔧 테스트 환경 설정

### 의존성
```bash
# Python 테스트 의존성
pip install pytest pytest-cov pytest-mock

# Playwright 의존성
npm install @playwright/test
npx playwright install
```

### 환경 변수
```bash
# 테스트 환경 설정
export TEST_ENV=demo
export GRADIO_SERVER_URL=http://localhost:7860
export TEST_TIMEOUT=30000
```

## 📈 성능 목표

| 테스트 레벨 | 현재 시간 | 목표 시간 | 개선 방법 |
|-------------|-----------|-----------|-----------|
| 유닛 테스트 | ~30초 | ~15초 | 병렬 실행, 테스트 최적화 |
| 기본 실행 테스트 | - | ~1분 | 필요한 기능만 테스트 |
| E2E 테스트 | - | ~3분 | Playwright 최적화, 헤드리스 모드 |

## 🎯 품질 지표

- **테스트 커버리지**: 80% 이상
- **테스트 성공률**: 100%
- **실행 시간**: 목표 시간 내 달성
- **사용자 시나리오 커버리지**: 주요 기능 100% 커버

## 🔄 CI/CD 통합

### GitHub Actions 워크플로우
```yaml
# .github/workflows/test.yml
name: AI Service Demo Tests
on: [push, pull_request]
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Unit Tests
        run: python tests/scripts/run_unit_tests.py
  
  basic-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run Basic Tests
        run: python tests/scripts/run_basic_tests.py
  
  e2e-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - name: Run E2E Tests
        run: python tests/scripts/run_e2e_tests.py
```

## 📚 참고 자료

- [pytest 공식 문서](https://docs.pytest.org/)
- [Playwright 공식 문서](https://playwright.dev/)
- [헥사고널 아키텍처 테스트 전략](https://alistair.cockburn.us/hexagonal-architecture/)
- [테스트 피라미드 원칙](https://martinfowler.com/articles/practical-test-pyramid.html)
