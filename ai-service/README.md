# AI Portfolio Chatbot Service

LangChain + Qdrant 기반 포트폴리오 챗봇 AI 서비스입니다.

## 🚀 주요 기능

- **AI 챗봇 채팅**: Gemini Pro 모델을 활용한 자연어 대화
- **RAG 시스템**: 벡터 검색 기반 지식 검색 및 응답 생성
- **벡터 데이터베이스**: Qdrant를 활용한 고성능 벡터 검색
- **대화 기록 관리**: 사용자별 대화 이력 저장 및 조회
- **RESTful API**: FastAPI 기반의 현대적인 API 설계

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Spring Boot   │    │   AI Service    │
│   (React)       │◄──►│   Backend       │◄──►│   (FastAPI)     │
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
│   ├── main.py              # FastAPI 애플리케이션 엔트리포인트
│   ├── models/              # 데이터 모델 클래스
│   │   ├── embeddings.py    # 임베딩 모델
│   │   └── rag.py          # RAG 시스템 모델
│   ├── services/            # 비즈니스 로직 서비스
│   │   ├── vector_store.py # 벡터 스토어 서비스
│   │   └── chat.py         # 챗봇 서비스
│   └── api/                 # API 엔드포인트
│       └── routes.py        # 라우터 정의
├── requirements.txt          # Python 의존성
├── Dockerfile               # Docker 이미지 빌드
├── docker-compose.ai.yml    # 개발 환경 구성
└── README.md                # 프로젝트 문서
```

## 🛠️ 기술 스택

- **Backend Framework**: FastAPI 0.104.1
- **LLM**: Google Gemini Pro (via LangChain)
- **Vector Database**: Qdrant
- **Embedding Model**: Sentence-Transformers
- **Cache**: Redis
- **Container**: Docker & Docker Compose
- **Language**: Python 3.11

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd ai-service

# 환경변수 설정
cp .env.example .env
# .env 파일 편집하여 실제 API 키 설정
GEMINI_API_KEY=your_actual_api_key_here
```

### 2. Docker로 실행

```bash
# AI 서비스 및 의존성 서비스 실행
docker-compose -f docker-compose.ai.yml up -d

# 로그 확인
docker-compose -f docker-compose.ai.yml logs -f ai-service
```

### 3. 로컬 개발 환경

```bash
# Python 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 서비스 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📡 API 엔드포인트

### 채팅 API
- `POST /api/v1/chat` - AI 챗봇과 대화
- `GET /api/v1/chat/history` - 대화 기록 조회
- `DELETE /api/v1/chat/history` - 대화 기록 초기화

### 벡터 검색 API
- `POST /api/v1/vector/search` - 벡터 기반 유사도 검색
- `GET /api/v1/vector/collections/{name}/stats` - 컬렉션 통계

### 시스템 API
- `GET /api/v1/health` - 서비스 헬스체크
- `GET /api/v1/info` - 서비스 정보

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
