# AI 서비스 테스트 실행 Hook

## 트리거 조건
- AI 서비스 관련 파일 저장 시 (ai-service/**/*.py)
- 테스트 파일 저장 시 (tests/**/*.py)

## 실행 작업
1. Python 단위 테스트 실행
2. 통합 테스트 실행 (AI 서비스 ↔ Spring Boot)
3. 성능 테스트 (벡터 검색 응답 시간)
4. 테스트 결과 요약 리포트 생성

## 실행 명령어
```bash
# AI 서비스 테스트
cd ai-service
pytest tests/ --cov=src/ --cov-report=html

# 통합 테스트
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# 성능 테스트
pytest tests/performance/ --benchmark-only
```

## 성공 기준
- 단위 테스트 커버리지 > 90%
- 모든 통합 테스트 통과
- 벡터 검색 응답 시간 < 500ms
- AI 생성 응답 시간 < 3000ms