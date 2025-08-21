# AI 서비스 마이그레이션 구현 계획

## 1. 개발 환경 및 인프라 설정

- [x] 1.1 Python AI 서비스 프로젝트 구조 생성
  - ai-service/ 디렉토리 생성 및 기본 구조 설정
  - app/main.py - FastAPI 서버 엔트리포인트 구현
  - models/ 디렉토리 - embeddings.py, rag.py 모델 클래스 생성
  - services/ 디렉토리 - vector_store.py (Qdrant), chat.py (챗봇 로직) 구현
  - api/ 디렉토리 - routes.py API 엔드포인트 정의
  - requirements.txt - 필수 의존성 패키지 목록 작성
  - Dockerfile - 컨테이너 이미지 빌드 설정
  - docker-compose.ai.yml - AI 서비스 개발 환경 구성
  - _요구사항: 7.1, 7.2_

- [ ] 1.2 벡터 데이터베이스 환경 구성
  - Qdrant Cloud 계정 생성 및 클러스터 설정
  - API 키 발급 및 환경변수 설정
  - 벡터 컬렉션 스키마 정의 및 초기화 (HNSW 인덱스 설정)
  - 임베딩 모델 선택 및 설정 (sentence-transformers, 384차원)
  - Qdrant 클라이언트 연결 및 기본 CRUD 테스트
  - _요구사항: 2.1, 5.1, 5.2_

- [ ] 1.3 Redis 캐시 시스템 설정
  - Redis 서버 Docker 컨테이너 설정
  - Spring Boot Redis 연동 설정
  - 캐시 키 네이밍 규칙 및 TTL 정책 정의
  - _요구사항: 14.1, 14.2, 14.4_

- [ ] 1.4 개발 환경 통합 및 테스트
  - Docker Compose로 전체 서비스 통합 실행
  - 서비스 간 네트워크 연결 테스트
  - 환경변수 및 설정 파일 관리 체계 구축
  - _요구사항: 7.1, 7.3_

## 2. 데이터 모델 및 스키마 구현

- [ ] 2.1 PostgreSQL 스키마 확장
  - chat_cache 테이블 생성 및 인덱스 설정
  - ai_service_status 테이블 생성
  - data_sync_log 테이블 생성
  - 기존 테이블과의 관계 설정 및 마이그레이션 스크립트 작성
  - _요구사항: 12.1, 12.3_

- [ ] 2.2 벡터 데이터베이스 스키마 구현
  - 포트폴리오, 프로젝트, 스킬별 컬렉션 생성
  - 메타데이터 스키마 정의 및 검증 로직 구현
  - 벡터 인덱싱 전략 구현
  - _요구사항: 2.1, 5.1, 5.2_

- [ ] 2.3 데이터 모델 클래스 구현
  - Python Pydantic 모델 정의 (ChatRequest, ChatResponse 등)
  - Java DTO 클래스 확장 (AI 서비스 통신용)
  - 데이터 검증 및 직렬화 로직 구현
  - _요구사항: 4.1, 4.2_

## 3. 기본 AI 서비스 구현

- [ ] 3.1 FastAPI 기본 구조 및 엔드포인트 구현
  - 기본 FastAPI 애플리케이션 설정
  - 헬스체크 엔드포인트 구현
  - 채팅 API 엔드포인트 기본 구조 생성
  - 에러 핸들링 미들웨어 구현
  - _요구사항: 1.2, 6.1, 6.2_

- [ ] 3.2 LangChain 기본 체인 구현
  - Gemini API 연동 및 LangChain 모델 설정
  - 기본 프롬프트 템플릿 구현
  - 간단한 질의응답 체인 구현
  - 응답 후처리 및 포맷팅 로직 구현
  - _요구사항: 1.2, 10.2_

- [ ] 3.3 임베딩 서비스 구현
  - Sentence-Transformers 모델 로딩 및 설정
  - 텍스트 임베딩 생성 함수 구현
  - 배치 임베딩 처리 로직 구현
  - 임베딩 품질 검증 및 정규화 구현
  - _요구사항: 2.1, 5.2_

## 4. RAG 시스템 구현

- [ ] 4.1 벡터 검색 엔진 구현
  - Qdrant 클라이언트 연동 및 연결 풀 설정
  - 유사도 검색 함수 구현 (코사인 유사도, 페이로드 필터링)
  - 하이브리드 검색 로직 구현 (벡터 + 메타데이터 필터)
  - 검색 성능 최적화 (HNSW 파라미터 튜닝, 배치 처리)
  - _요구사항: 2.2, 5.3, 5.4_

- [ ] 4.2 컨텍스트 생성 및 관리
  - 검색된 문서들을 컨텍스트로 변환하는 로직 구현
  - 컨텍스트 길이 제한 및 우선순위 기반 선택 구현
  - 컨텍스트 품질 평가 메트릭 구현
  - 동적 컨텍스트 조정 로직 구현
  - _요구사항: 2.2, 2.3_

- [ ] 4.3 RAG 체인 통합 구현
  - 벡터 검색과 LLM 생성을 결합한 RAG 체인 구현
  - 검색 실패 시 대체 로직 구현
  - RAG 응답 품질 검증 및 후처리 구현
  - 응답 시간 최적화 (병렬 처리, 캐싱)
  - _요구사항: 2.2, 2.3, 2.4_

## 5. Spring Boot 백엔드 확장

- [ ] 5.1 AI 서비스 클라이언트 구현
  - AI 서비스와의 HTTP 통신 클라이언트 구현
  - 연결 풀링 및 타임아웃 설정
  - 재시도 로직 및 서킷 브레이커 패턴 구현
  - 응답 검증 및 에러 처리 로직 구현
  - _요구사항: 4.3, 8.2_

- [ ] 5.2 캐시 서비스 구현
  - Redis 기반 응답 캐싱 로직 구현
  - 캐시 키 생성 및 해시 알고리즘 구현
  - TTL 관리 및 캐시 무효화 로직 구현
  - 캐시 히트율 모니터링 구현
  - _요구사항: 14.1, 14.2, 14.3, 14.4_

- [ ] 5.3 대체 응답 서비스 구현
  - PostgreSQL 기반 기본 응답 생성 로직 구현
  - 키워드 매칭 및 템플릿 기반 응답 시스템 구현
  - 질문 유형별 대체 응답 전략 구현
  - 대체 응답 품질 개선 로직 구현
  - _요구사항: 13.1, 13.2, 13.3_

- [ ] 5.4 채팅 컨트롤러 리팩토링
  - 기존 채팅 API를 AI 서비스 연동으로 변경
  - 캐시 우선 조회 로직 통합
  - AI 서비스 장애 시 대체 응답 로직 통합
  - API 응답 형식 및 에러 처리 표준화
  - _요구사항: 4.1, 4.2, 4.4, 8.1_

## 6. 데이터 동기화 시스템 구현

- [ ] 6.1 PostgreSQL 데이터 추출 서비스 구현
  - 포트폴리오 데이터 조회 API 구현
  - 증분 업데이트 감지 로직 구현 (updated_at 기반)
  - 데이터 변환 및 정규화 로직 구현
  - 배치 처리 및 페이징 지원 구현
  - _요구사항: 3.3, 12.3_

- [ ] 6.2 벡터 데이터 동기화 구현
  - PostgreSQL 변경사항을 벡터 DB에 반영하는 로직 구현
  - 임베딩 재생성 및 업데이트 로직 구현
  - 동기화 상태 추적 및 로깅 구현
  - 동기화 실패 시 재시도 메커니즘 구현
  - _요구사항: 3.1, 3.2, 3.3_

- [ ] 6.3 데이터 동기화 API 구현
  - 수동 동기화 트리거 API 구현
  - 동기화 상태 조회 API 구현
  - 배치 동기화 스케줄러 구현
  - 동기화 성능 모니터링 구현
  - _요구사항: 3.1, 9.2_

## 7. 모니터링 및 로깅 시스템 구현

- [ ] 7.1 헬스체크 시스템 구현
  - 각 서비스별 헬스체크 엔드포인트 구현
  - 의존성 서비스 상태 확인 로직 구현
  - 헬스체크 결과 집계 및 대시보드 구현
  - 장애 알림 시스템 연동 구현
  - _요구사항: 6.1, 6.3_

- [ ] 7.2 LangSmith 통합 및 로깅 시스템 구현
  - LangSmith 프로젝트 설정 및 API 키 구성
  - LangChain 체인에 LangSmith 트레이싱 통합
  - 사용자 질문, AI 응답, 실행 시간 자동 로깅
  - LangSmith 대시보드에서 성능 메트릭 모니터링 설정
  - 커스텀 메타데이터 및 태그를 통한 분석 강화
  - _요구사항: 6.2, 6.4_

- [ ] 7.3 에러 추적 및 알림 시스템 구현
  - 예외 상황 자동 감지 및 분류 시스템 구현
  - 에러 발생 시 자동 알림 시스템 구현
  - 에러 복구 및 자동 재시도 로직 구현
  - 에러 패턴 분석 및 예방 시스템 구현
  - _요구사항: 6.2, 6.3_

## 8. 테스트 및 품질 보증

- [ ] 8.1 단위 테스트 구현
  - Python AI 서비스 핵심 로직 단위 테스트 작성
  - Spring Boot 서비스 레이어 단위 테스트 작성
  - 모킹을 활용한 외부 의존성 테스트 구현
  - 테스트 커버리지 90% 이상 달성
  - _요구사항: 모든 구현 요구사항_

- [ ] 8.2 통합 테스트 구현
  - 서비스 간 통신 테스트 구현
  - 데이터베이스 연동 테스트 구현
  - 캐시 시스템 통합 테스트 구현
  - 장애 상황 시나리오 테스트 구현
  - _요구사항: 4.1, 4.2, 4.3, 4.4_

- [ ] 8.3 성능 테스트 구현
  - 동시 사용자 부하 테스트 구현
  - 벡터 검색 성능 테스트 구현
  - 메모리 사용량 및 리소스 최적화 테스트 구현
  - 응답 시간 SLA 검증 테스트 구현
  - _요구사항: 5.4, 14.4_

- [ ] 8.4 E2E 테스트 구현
  - 프론트엔드부터 AI 서비스까지 전체 플로우 테스트 구현
  - 다양한 질문 유형별 응답 품질 테스트 구현
  - 장애 복구 시나리오 E2E 테스트 구현
  - 사용자 시나리오 기반 테스트 자동화 구현
  - _요구사항: 전체 시스템 요구사항_

## 9. 배포 및 마이그레이션

- [ ] 9.1 CI/CD 파이프라인 구성
  - GitHub Actions 또는 Jenkins 기반 빌드 파이프라인 구성
  - 자동 테스트 실행 및 품질 게이트 설정
  - Docker 이미지 빌드 및 레지스트리 푸시 자동화
  - 스테이징 환경 자동 배포 구성
  - _요구사항: 7.2_

- [ ] 9.2 점진적 마이그레이션 구현
  - 기존 채팅 시스템과 새 AI 서비스 병렬 운영 구현
  - 트래픽 분할 및 A/B 테스트 시스템 구현
  - 마이그레이션 진행률 모니터링 구현
  - 롤백 메커니즘 및 안전장치 구현
  - _요구사항: 8.1, 8.2, 8.3, 8.4_

- [ ] 9.3 프로덕션 배포 및 모니터링
  - 프로덕션 환경 배포 스크립트 및 설정 구현
  - 실시간 모니터링 대시보드 구성
  - 성능 지표 및 SLA 모니터링 구현
  - 장애 대응 플레이북 작성 및 훈련
  - _요구사항: 6.1, 6.2, 6.3, 6.4_

## 10. LangGraph 확장 준비 (선택사항)

- [ ] 10.1 상태 관리 인프라 구현
  - 대화 상태 관리 클래스 및 Redis 저장소 구현
  - 워크플로우 실행 로그 테이블 및 API 구현
  - 노드별 성능 추적 시스템 구현
  - 상태 기반 디버깅 도구 구현
  - _요구사항: LangGraph 확장 고려사항_

- [ ] 10.2 노드 기반 아키텍처 기반 구현
  - WorkflowNode 추상 클래스 및 기본 노드들 구현
  - 간단한 2-3개 노드 워크플로우 구현
  - 노드 간 상태 전달 및 조건부 분기 로직 구현
  - 워크플로우 실행 엔진 기본 구현
  - _요구사항: LangGraph 확장 고려사항_

- [ ] 10.3 워크플로우 관리 시스템 구현
  - 워크플로우 정의 및 등록 시스템 구현
  - 동적 워크플로우 생성 및 수정 기능 구현
  - 워크플로우 버전 관리 및 배포 시스템 구현
  - 워크플로우 성능 분석 및 최적화 도구 구현
  - _요구사항: LangGraph 확장 고려사항_## Git 
워크플로우 및 배포 전략

### 브랜치 전략
```bash
# 1. 각 주요 작업별로 feature 브랜치 생성
git checkout -b feature/task-1-1-python-project-setup

# 2. 작업 완료 후 main으로 PR/merge
git checkout main
git merge feature/task-1-1-python-project-setup

# 3. 배포 전 staging 브랜치에서 통합 테스트
git checkout -b staging/v2.0.0-integration
# 여러 feature 브랜치들을 staging에 merge하여 테스트

# 4. 검증 완료 후 main으로 merge 및 배포
git checkout main
git merge staging/v2.0.0-integration
git tag v2.0.0
```

### 작업 단위별 브랜치 계획
- `feature/task-1-x-infrastructure`: 인프라 설정 (1.1~1.4)
- `feature/task-2-x-data-models`: 데이터 모델 구현 (2.1~2.3)
- `feature/task-3-x-ai-service`: 기본 AI 서비스 (3.1~3.3)
- `feature/task-4-x-rag-system`: RAG 시스템 (4.1~4.3)
- `feature/task-5-x-spring-integration`: Spring Boot 확장 (5.1~5.4)
- `feature/task-6-x-data-sync`: 데이터 동기화 (6.1~6.3)
- `feature/task-7-x-monitoring`: 모니터링 (7.1~7.3)
- `feature/task-8-x-testing`: 테스트 구현 (8.1~8.4)

### 배포 환경별 브랜치
```yaml
environments:
  development:
    branch: "feature/*"
    auto_deploy: false
    description: "로컬 개발 환경"
    
  staging:
    branch: "staging/*"
    auto_deploy: true
    description: "통합 테스트 환경"
    url: "https://staging.your-domain.com"
    
  production:
    branch: "main"
    auto_deploy: true (after manual approval)
    description: "프로덕션 환경"
    url: "https://your-domain.com"
```

### CI/CD 파이프라인 (GitHub Actions 예시)
```yaml
# .github/workflows/ai-service-ci.yml
name: AI Service CI/CD

on:
  push:
    branches: [ main, staging/* ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Python AI Service 테스트
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: |
          cd ai-service
          pip install -r requirements.txt
          
      - name: Run tests
        run: |
          cd ai-service
          pytest tests/ --cov=src/
          
      # Spring Boot 테스트
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          
      - name: Run Spring Boot tests
        run: |
          cd backend
          ./mvnw test
          
  deploy-staging:
    if: github.ref == 'refs/heads/staging/*'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: echo "Deploy to staging environment"
        
  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: echo "Deploy to production environment"
```

### 안전한 마이그레이션 전략
1. **Phase 1**: AI 서비스 개발 (기존 시스템 유지)
2. **Phase 2**: 병렬 운영 (트래픽 분할 테스트)
3. **Phase 3**: 점진적 전환 (10% → 50% → 100%)
4. **Phase 4**: 기존 코드 정리

이렇게 하면 안전하게 개발하면서도 언제든 롤백할 수 있습니다!