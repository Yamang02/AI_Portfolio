# AI Portfolio Service with RAG Demo

LangChain + Qdrant 기반 포트폴리오 RAG 시스템과 Gradio 인터랙티브 데모를 제공하는 AI 서비스입니다.

## 🚀 주요 기능

- **🎯 RAG 데모 인터페이스**: Gradio 기반 인터랙티브 RAG 파이프라인 체험
- **📄 문서 처리**: 실제 프로젝트 문서 로딩 및 전처리 데모
- **✂️ 텍스트 분할**: MarkdownTextSplitter를 활용한 청킹 시각화
- **🤖 컨텍스트 구성**: ContextBuilder 기반 포트폴리오 컨텍스트 생성
- **🔄 전체 파이프라인**: 문서 → 분할 → 컨텍스트 → 답변 생성 통합 플로우
- **🚧 확장 예정**: 임베딩, 벡터 스토어, 검색 기능 향후 구현
- **RESTful API**: FastAPI 기반의 현대적인 API 설계

## 🏗️ 아키텍처

### RAG 데모 인터페이스 (새로 추가)
```
┌─────────────────┐    ┌─────────────────┐
│    Browser      │    │   AI Service    │
│                 │◄──►│  (FastAPI +     │
│  Gradio Demo    │    │   Gradio)       │
│  localhost:8000 │    │                 │
└─────────────────┘    └─────────────────┘
```

### 전체 시스템 구조
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Spring Boot   │    │   AI Service    │
│   (React)       │◄──►│   Backend       │◄──►│ (FastAPI+Gradio)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   PostgreSQL    │    │     Qdrant      │
                       │   (RDB)         │    │   (Vector DB)   │
                       └─────────────────┘    └─────────────────┘
```

## 📁 프로젝트 구조

```
ai-service/
├── app/
│   ├── main.py                    # FastAPI + Gradio 통합 엔트리포인트
│   ├── demo/                      # RAG 데모 인터페이스 (새로 추가)
│   │   ├── __init__.py
│   │   ├── rag_demo.py           # Gradio 인터페이스 정의
│   │   └── demo_service.py       # 데모 서비스 로직
│   ├── models/                   # 데이터 모델 클래스
│   │   ├── chat.py              # 채팅 모델
│   │   └── portfolio.py         # 포트폴리오 모델
│   ├── services/                # 비즈니스 로직 서비스
│   │   ├── document/            # 문서 처리 파이프라인
│   │   │   ├── pipeline.py     # 메인 처리 파이프라인
│   │   │   ├── loaders/        # 문서 로더들
│   │   │   └── splitters/      # 텍스트 분할기들
│   │   ├── chat/               # 채팅 서비스
│   │   │   ├── context_builder.py  # 컨텍스트 구성
│   │   │   └── question_analyzer.py
│   │   └── portfolio/          # 포트폴리오 서비스
│   ├── api/                     # API 엔드포인트
│   │   └── v1/                 # API v1
│   └── core/                   # 핵심 설정
│       ├── config.py          # 설정 관리
│       └── database.py        # DB 연결
├── docs/                       # 문서 디렉토리
│   └── projects/              # 프로젝트 문서들 (데모용)
├── requirements-base.txt       # 기본 의존성 (gradio 포함)
├── Dockerfile                  # Docker 이미지 빌드
├── docker-compose.ai.yml       # 개발 환경 구성
└── README.md                   # 프로젝트 문서
```

## 🛠️ 기술 스택

- **Backend Framework**: FastAPI 0.104.1 + Gradio 4.44.0
- **Demo Interface**: Gradio (인터랙티브 RAG 데모)
- **Document Processing**: LangChain (DocumentLoader, TextSplitter)
- **Vector Database**: Qdrant (향후 연동 예정)
- **LLM**: Google Gemini Pro (향후 연동 예정)
- **Cache**: Redis
- **Container**: Docker & Docker Compose
- **Language**: Python 3.11

## 🚀 빠른 시작

### 1. RAG 데모 체험하기 (권장)

```bash
# 저장소 클론
git clone <repository-url>
cd ai-service

# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements-base.txt

# RAG 데모 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**🎯 접속**: http://localhost:8000 (Gradio RAG 데모 인터페이스)

### 2. 환경 설정 (API 사용 시)

```bash
# 환경변수 설정
cp .env.example .env
# .env 파일 편집하여 실제 API 키 설정
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Docker로 실행

```bash
# AI 서비스 및 의존성 서비스 실행
docker-compose -f docker-compose.ai.yml up -d

# 로그 확인
docker-compose -f docker-compose.ai.yml logs -f ai-service
```

### 4. 전체 시스템 실행 (DB 포함)

```bash
# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements-base.txt

# PostgreSQL, Redis 등 필요 (별도 설치 또는 Docker)
# 서비스 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📡 접속 포인트 및 API

### 🎯 메인 인터페이스
- **RAG 데모 페이지**: `http://localhost:8000/` (Gradio 인터페이스)

### 📡 REST API 엔드포인트

#### 채팅 API
- `POST /api/v1/chat` - AI 챗봇과 대화
- `GET /api/v1/chat/history` - 대화 기록 조회 
- `DELETE /api/v1/chat/history` - 대화 기록 초기화

#### 시스템 API
- `GET /health` - 서비스 헬스체크 (데모 포함)
- `GET /api/v1/health` - API 헬스체크

### 🚧 향후 추가 예정 API
- `POST /api/v1/vector/search` - 벡터 기반 유사도 검색
- `GET /api/v1/vector/collections/{name}/stats` - 컬렉션 통계
- `POST /api/v1/demo/reset` - 데모 데이터 초기화

## 🔧 개발 가이드

### 코드 스타일
- Python: PEP 8 준수
- 타입 힌트 사용
- 비동기 프로그래밍 (async/await)
- Pydantic 모델 활용

### 테스트
```bash
# 단위 테스트 실행
pytest tests/

# 커버리지 확인
pytest --cov=app tests/
```

### 로깅
- 구조화된 로깅 (structlog)
- 로그 레벨: INFO, WARNING, ERROR
- JSON 형식 로그 출력

## 📊 모니터링

### 헬스체크
- `/api/v1/health` 엔드포인트로 서비스 상태 확인
- 각 서비스별 상태 모니터링
- 응답 시간 및 에러율 추적

### 로깅
- LangSmith 연동으로 LLM 실행 추적
- 사용자 질문 및 AI 응답 자동 로깅
- 성능 메트릭 수집

## 🔒 보안

- API 키는 환경변수로 관리
- CORS 설정으로 허용된 도메인만 접근
- 입력 데이터 검증 (Pydantic)
- 에러 메시지에서 민감 정보 제거

## 🚧 향후 계획

- [ ] LangGraph 기반 워크플로우 엔진
- [ ] 멀티모달 지원 (이미지, 문서)
- [ ] 실시간 스트리밍 응답
- [ ] 사용자 인증 및 권한 관리
- [ ] A/B 테스트 프레임워크

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
