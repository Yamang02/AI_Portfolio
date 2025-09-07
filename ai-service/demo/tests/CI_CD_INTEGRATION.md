# CI/CD 파이프라인 통합 가이드

## 🚀 CI/CD 파이프라인 통합 개요

구축한 테스트 시스템은 CI/CD 파이프라인에 완벽하게 통합할 수 있도록 설계되었습니다. 
브랜치별로 적절한 테스트 레벨을 자동으로 선택하여 실행합니다.

## 📋 브랜치별 테스트 전략

### 🌿 Feature 브랜치
```yaml
# 실행되는 테스트
- 유닛 테스트 (필수)
- 기본 실행 테스트 (필수)

# 실행 시간: ~1분
# 목적: 빠른 피드백, 기본 동작 검증
```

### 🔄 Develop 브랜치
```yaml
# 실행되는 테스트
- 유닛 테스트 (필수)
- 기본 실행 테스트 (필수)
- 통합 테스트 (필수)

# 실행 시간: ~3분
# 목적: 서비스 간 연동 검증
```

### 🎯 Main 브랜치
```yaml
# 실행되는 테스트
- 유닛 테스트 (필수)
- 기본 실행 테스트 (필수)
- 통합 테스트 (필수)
- E2E 테스트 (필수)

# 실행 시간: ~6분
# 목적: 전체 시스템 검증, 배포 준비
```

### 🔀 Pull Request
```yaml
# 실행되는 테스트
- 유닛 테스트 (필수)
- 기본 실행 테스트 (필수)
- 통합 테스트 (필수)
- E2E 테스트 (라벨 'e2e-test'가 있을 때만)

# 실행 시간: ~3분 (E2E 포함 시 ~6분)
# 목적: 코드 품질 보증
```

## 🔧 GitHub Actions 워크플로우

### 기본 워크플로우 파일
```yaml
# .github/workflows/ai-service-demo-ci-cd.yml
name: AI Service Demo CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          cd ai-service/demo
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-mock
      
      - name: Run tests
        run: |
          cd ai-service/demo
          python tests/scripts/run_cicd_tests.py
```

### 고급 워크플로우 (단계별 실행)
```yaml
# .github/workflows/ai-service-demo-advanced.yml
name: AI Service Demo Advanced CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Run unit tests
        run: |
          cd ai-service/demo
          python tests/scripts/run_cicd_tests.py --level unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    if: github.ref == 'refs/heads/develop' || github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Run integration tests
        run: |
          cd ai-service/demo
          python tests/scripts/run_cicd_tests.py --level integration

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.ref == 'refs/heads/main' || contains(github.event.pull_request.labels.*.name, 'e2e-test')
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Playwright
        run: |
          cd ai-service/demo/tests/e2e
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd ai-service/demo
          python tests/scripts/run_cicd_tests.py --level e2e
      
      - name: Upload E2E results
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: ai-service/demo/tests/e2e/playwright-report/
```

## 🎯 CI/CD 테스트 실행 방법

### 자동 실행 (권장)
```bash
# 브랜치에 따라 자동으로 필요한 테스트만 실행
python tests/scripts/run_cicd_tests.py
```

### 특정 테스트 레벨만 실행
```bash
# 유닛 테스트만
python tests/scripts/run_cicd_tests.py --level unit

# 통합 테스트만
python tests/scripts/run_cicd_tests.py --level integration

# E2E 테스트만
python tests/scripts/run_cicd_tests.py --level e2e
```

### 모든 테스트 강제 실행
```bash
# 브랜치에 관계없이 모든 테스트 실행
python tests/scripts/run_cicd_tests.py --force-all
```

## 📊 테스트 결과 및 리포트

### 커버리지 리포트
```yaml
# GitHub Actions에서 커버리지 업로드
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./ai-service/demo/htmlcov/coverage.xml
    flags: ${{ matrix.test-level }}
    name: ${{ matrix.test-level }}-coverage
```

### E2E 테스트 리포트
```yaml
# Playwright 리포트 업로드
- name: Upload E2E test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: ai-service/demo/tests/e2e/playwright-report/
    retention-days: 30
```

## 🔔 알림 및 상태 확인

### 테스트 상태 배지
```markdown
![Tests](https://github.com/Yamang02/AI_Portfolio/workflows/AI%20Service%20Demo%20CI%20CD/badge.svg)
![Coverage](https://codecov.io/gh/Yamang02/AI_Portfolio/branch/main/graph/badge.svg)
```

### PR 라벨을 통한 테스트 제어
```yaml
# PR에 'e2e-test' 라벨을 추가하면 E2E 테스트 실행
labels:
  - e2e-test
  - bug
  - enhancement
```

## 🚨 문제 해결

### 테스트 실패 시
```bash
# 로컬에서 동일한 테스트 실행
python tests/scripts/run_cicd_tests.py --level unit

# 특정 브랜치에서 테스트 실행
git checkout develop
python tests/scripts/run_cicd_tests.py
```

### E2E 테스트 환경 문제
```bash
# Playwright 브라우저 재설치
cd ai-service/demo/tests/e2e
npx playwright install --with-deps

# 헤드리스 모드로 테스트
python tests/scripts/run_e2e_tests.py --headless
```

### 커버리지 리포트 문제
```bash
# 커버리지 리포트 재생성
python tests/scripts/run_unit_tests.py --coverage
open htmlcov/index.html
```

## 📈 성능 최적화

### 병렬 실행
```yaml
# GitHub Actions에서 병렬 실행
strategy:
  matrix:
    test-level: [unit, basic, integration]
  fail-fast: false
```

### 캐시 활용
```yaml
# Python 의존성 캐시
- name: Cache pip dependencies
  uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
```

### 조건부 실행
```yaml
# 변경된 파일에 따라 테스트 실행
- name: Check for changes
  uses: dorny/paths-filter@v2
  id: changes
  with:
    filters: |
      ai-service:
        - 'ai-service/**'
```

## 🎯 CI/CD 통합의 장점

1. **자동화**: 브랜치별로 적절한 테스트 자동 실행
2. **효율성**: 필요한 테스트만 실행하여 리소스 절약
3. **품질 보증**: 모든 코드 변경에 대한 자동 검증
4. **피드백**: 빠른 피드백으로 개발 속도 향상
5. **투명성**: 테스트 결과와 커버리지 공개

이렇게 구축된 테스트 시스템은 CI/CD 파이프라인에 완벽하게 통합되어 지속적인 품질 보증을 제공합니다! 🚀
