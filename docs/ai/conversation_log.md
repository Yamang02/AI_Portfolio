# AI-Service 아키텍처 설계 대화 (2025-08-26)

## 대화 요약
ai-service 디렉토리에 Document Loader, TextSplitter 모듈화, 검증자, 중앙집중식 에러처리 구조 구현을 위한 완전 신규 아키텍처 설계

## 주요 결정사항

### 1. 전체 RAG 파이프라인 설계
- **기존**: Document Loader와 TextSplitter만 고려
- **최종**: 완전한 RAG 파이프라인 (Document → Embedding → Vector Store → Retrieval → Generation)

### 2. 환경 무관 코드 원칙
- **결정**: 모든 환경에서 동일한 코드 실행
- **환경변수**: 외부 의존성만 (API키, URL 등) - 최대 8개
- **YAML 설정**: 내부 튜닝 파라미터 (배치사이즈, 임계값 등)
- **금지**: `if environment == "production"` 같은 환경별 분기

### 3. 설정 관리 전략
```bash
# 환경변수 (외부 의존성만)
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=optional_key
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_key
LANGCHAIN_API_KEY=optional_langsmith_key
LOG_LEVEL=INFO
```

```yaml
# config.yaml (내부 설정)
embedding:
  model_name: "sentence-transformers/all-MiniLM-L6-v2"
  batch_size: 32
  dimension: 384

document_processing:
  chunk_size: 1000
  chunk_overlap: 200

retrieval:
  top_k: 5
  score_threshold: 0.7
  strategy: "hybrid"

generation:
  model: "gemini-pro"
  temperature: 0.3
  max_tokens: 1000
```

### 4. 프롬프트 관리 단순화
- **초기 계획**: 복잡한 버전 관리, 핫 리로드, 웹훅 시스템
- **최종 결정**: LangSmith + YAML 하이브리드
  - 1순위: LangSmith Hub에서 프롬프트 가져오기
  - 2순위: 로컬 YAML 파일 (기존 `C:\GIT\LangChain_Practice\prompt_loader.py` 코드 활용)
  - ~~3순위: 하드코딩된 기본 프롬프트~~ (제거)

### 5. 디렉토리 구조
```
ai-service/
├── app/
│   ├── core/                      # 설정, 에러처리, DI
│   ├── models/                    # Pydantic 모델들
│   ├── services/
│   │   ├── document/              # 로더, 스플리터, 검증
│   │   ├── embedding/             # 임베딩 + 캐시
│   │   ├── vectorstore/           # Qdrant 등 벡터DB
│   │   ├── retrieval/             # 검색 전략들
│   │   ├── prompt/                # LangSmith + YAML 로더
│   │   ├── generation/            # LLM 서비스
│   │   └── rag/                   # RAG 오케스트레이션
│   └── api/v1/                    # REST API
├── prompts/                       # YAML 프롬프트 파일들
├── config.yaml                    # 내부 설정
└── .env                          # 외부 설정
```

### 6. 핵심 설계 원칙
**✅ 권장:**
- 환경변수 최소화 (8개 이하)
- YAML 기반 내부 설정
- 환경 무관 코드
- LangSmith 활용
- 비동기 처리
- 배치 최적화

**❌ 지양:**
- 환경별 코드 분기
- 과도한 환경변수
- 복잡한 템플릿 관리
- 하드코딩된 프롬프트
- 동기 처리

## 구현 계획
- Phase 1: 기반 인프라 (설정, 에러처리, API)
- Phase 2: 문서 처리 (로더, 스플리터, 검증)
- Phase 3: 임베딩 + 벡터스토어
- Phase 4: 검색 + 생성 (프롬프트 포함)
- Phase 5: RAG 통합

## 배포 전략
- 동일한 Docker 이미지를 모든 환경에서 사용
- 환경별로 다른 .env 파일만 사용
- config.yaml은 코드와 함께 배포

---

## 아키텍처 설계 변경 (백엔드 AI 기능 완전 분리)

### 배경
초기에는 Document Loader와 TextSplitter만 모듈화하려 했으나, 현재 백엔드 코드 분석 결과:
- Java 백엔드에 AI 관련 로직이 이미 구현되어 있음 (`ChatApplicationService`, `QuestionAnalysisService`, `ContextBuilderService` 등)
- 백엔드에서 직접 Gemini API 호출하는 구조
- AI-Service는 별도 컨테이너로 존재하지만 실제로는 사용되지 않는 상태

### 문제점
- **관심사 혼재**: Java 백엔드에 AI 로직과 비즈니스 로직이 혼재
- **확장성 제약**: RAG, 벡터 검색 등 AI 고급 기능 추가가 어려움
- **유지보수성**: AI 관련 변경 시 백엔드 재배포 필요
- **기술 스택 불일치**: AI/ML은 Python이 더 적합한데 Java로 구현

### 최종 결정: 완전 분리 아키텍처

#### Before (현재)
```
Backend (Java)
├── ChatApplicationService     # 채팅 로직 
├── QuestionAnalysisService   # 질문 분석
├── ContextBuilderService     # 컨텍스트 구성 
├── AIService                 # AI 호출
└── GeminiApiClient          # LLM 직접 호출
```

#### After (목표)
```
Backend (Java)                     AI-Service (Python)
├── ChatController             │   ├── RAG Pipeline
└── RestTemplate → AI-Service  │   ├── Question Analysis (이관)
                               │   ├── Context Builder (이관)
                               │   ├── Portfolio DB 연동 (신규)
                               │   ├── Document Processing
                               │   ├── Vector Search
                               │   └── LLM Generation
```

### 이관할 주요 기능들

#### 1. 질문 분석 로직
```python
# 백엔드 QuestionAnalysisService → AI-Service
class QuestionAnalyzer:
    async def analyze_question(self, question: str) -> AnalysisResult:
        # AI 사용 여부 판단
        # 즉시 응답 가능 여부 체크
        # 질문 타입 분류
```

#### 2. 컨텍스트 구성 로직  
```python
# 백엔드 ContextBuilderService → AI-Service
class ContextBuilder:
    async def build_full_portfolio_context(self) -> str:
        # PostgreSQL에서 직접 Portfolio/Project/Experience 조회
        # 구조화된 컨텍스트 문자열 생성
    
    async def build_project_context(self, project_title: str) -> str:
        # 특정 프로젝트 중심 컨텍스트 구성
```

#### 3. 포트폴리오 데이터 접근
```python
# AI-Service에서 직접 PostgreSQL 연결
class PortfolioRepository:
    async def get_all_projects(self) -> List[Project]:
        # 백엔드와 동일한 DB, 동일한 테이블 조회
    
    async def get_full_portfolio(self) -> PortfolioData:
        # Projects + Experiences + Education + Certifications
```

### 새로운 API 설계
```python
POST /api/v1/chat
{
    "question": "사용자 질문",
    "user_context": "선택된 프로젝트명 (선택적)",
    "user_id": "사용자 식별자 (선택적)"
}

# AI-Service가 모든 AI 관련 처리 담당:
# 1. 질문 분석
# 2. DB에서 포트폴리오 데이터 조회
# 3. 컨텍스트 구성
# 4. RAG 벡터 검색 (향후 확장)
# 5. LLM 응답 생성
```

### 백엔드 단순화
```java
// 백엔드는 단순한 프록시 역할
@RestController
public class ChatController {
    @PostMapping("/api/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        // AI-Service로 전달만
        return restTemplate.postForEntity(aiServiceUrl + "/api/v1/chat", request, ChatResponse.class);
    }
}
```

### 장점
- **관심사 분리**: AI 로직이 AI-Service에 집중
- **기술 스택 최적화**: Python으로 AI/ML 기능 구현
- **확장성**: RAG, 벡터 검색 등 고급 AI 기능 자유롭게 확장
- **독립 배포**: AI 기능 변경 시 AI-Service만 재배포
- **성능 최적화**: AI 전용 캐싱, 최적화 구현 가능

### 구현 우선순위 (수정된 Phase 1)
1. **PostgreSQL 연동** - 백엔드와 동일한 DB 연결
2. **기존 로직 이관** - QuestionAnalysis + ContextBuilder Python 구현
3. **API 호환성** - 백엔드에서 호출 가능한 인터페이스
4. **기본 RAG 구조** - 향후 벡터 검색 확장을 위한 기반 마련

---

## 2025-08-26: 백엔드 AI 기능 완전 분리 및 AI-Service 구조 완성

### 1. 백엔드 컴파일 오류 해결

**문제점:**
- 백엔드에서 ai-service로 이관된 클래스들을 여전히 참조
- `QuestionAnalysisService`, `PromptService`, `PromptConverter` 등 삭제된 클래스 참조 오류

**해결책:**
- `PromptController` 완전 삭제 (백엔드에서 AI 기능 제거)
- `ChatRequest`에 `sessionId` 필드 추가 (user_id 대신 session 기반 식별)
- `ChatApplicationService`에서 `getUserId()` → `getSessionId()` 변경

**결과:**
- ✅ 백엔드 컴파일 성공
- ✅ ai-service로 모든 AI 기능 완전 이관
- ✅ 백엔드는 순수 프록시 역할만 수행

### 2. AI-Service 구조 완성

**conversation_log.md 설계와 현재 구조 조합:**

#### 디렉토리 구조 정리
```
ai-service/
├── app/
│   ├── core/                      # ✅ 설정, DB 관리
│   ├── models/                    # ✅ Pydantic 모델들
│   ├── services/
│   │   ├── chat/                  # ✅ 질문 분석, 컨텍스트 구성
│   │   ├── portfolio/             # ✅ 포트폴리오 DB 연동
│   │   └── generation/            # ✅ LLM 서비스 (새로 추가)
│   └── api/v1/                    # ✅ REST API
├── config.yaml                    # ✅ 내부 설정
└── requirements-*.txt             # ✅ 의존성 관리
```

#### LLM 서비스 구현
- **파일**: `app/services/generation/llm_service.py`
- **기능**: Gemini API 연동, 응답 생성
- **통합**: `chat.py`에서 임시 응답을 실제 LLM 호출로 교체

**주요 변경사항:**
```python
# Before: 임시 응답
answer = await _generate_temporary_response(request.question, analysis, context)

# After: 실제 LLM 호출
answer = await llm_service.generate_response(
    question=request.question,
    context=context,
    system_prompt=None
)
```

### 3. 환경변수 및 설정 관리 개선

**문제점:**
- `ExternalConfig`에서 정의되지 않은 환경변수로 인한 Pydantic 검증 오류
- `QDRANT__HOST`, `SERVER__DEBUG_MODE` 등 GitHub Secrets와 불일치

**해결책:**
- `ExternalConfig`에 누락된 필드들 추가:
  - `QDRANT_HOST`, `QDRANT_PORT`, `QDRANT_API_KEY`
  - `SERVER_DEBUG_MODE`, `LOGGING_LEVEL`
- `extra = "ignore"` 설정으로 정의되지 않은 환경변수 무시

### 4. 의존성 관리 문제 해결

**문제점:**
- Docker 멀티스테이지 빌드와 로컬 개발 환경의 requirements 파일 불일치
- `asyncpg`가 `requirements.txt`에만 있고 `requirements-base.txt`에 없어서 배포 시 누락

**해결책:**
- `asyncpg`, `sqlalchemy[asyncio]`, `alembic`을 `requirements-base.txt`에 추가
- Docker 빌드 시 데이터베이스 관련 패키지들이 모두 설치되도록 보장

### 5. SQLAlchemy 2.0 호환성

**문제점:**
- `"SELECT 1"` → `text("SELECT 1")` 문법 변경 필요

**해결책:**
- `from sqlalchemy import text` import 추가
- 모든 raw SQL 쿼리를 `text()` 함수로 감싸기

### 최종 아키텍처

```
Frontend → Backend (프록시) → AI-Service
         ↓
    sessionId 기반
    스팸 방지 & 검증
```

**백엔드 역할:**
- 입력 검증 및 스팸 방지
- AI-Service로 요청 전달
- 응답 반환

**AI-Service 역할:**
- 질문 분석 (QuestionAnalyzer)
- 포트폴리오 컨텍스트 구성 (ContextBuilder)
- LLM 응답 생성 (LLMService)
- 향후 RAG 파이프라인 확장 준비

### 6. Requirements 파일 구조 개선

**문제점:**
- Docker 멀티스테이지 빌드와 로컬 개발 환경의 requirements 파일 불일치
- 로컬에서는 `requirements.txt` 사용, 배포에서는 `requirements-base.txt` + `requirements-ml.txt` 사용
- 새로운 의존성 추가 시 어느 파일에 추가해야 할지 불명확

**해결책:**
- **`requirements-local.txt`**: 로컬 개발용 단일 파일 생성
- **`requirements-base.txt`**: Docker 기본 의존성 (FastAPI, DB, 유틸리티)
- **`requirements-ml.txt`**: Docker ML/AI 의존성 (LangChain, Transformers)
- **`requirements.txt`**: Docker 빌드 안내용으로 변경
- **`README-requirements.md`**: 사용법 및 가이드라인 문서화

**새로운 의존성 추가 가이드라인:**
```bash
# 로컬 개발용
echo "new-package==1.0.0" >> requirements-local.txt

# Docker 배포용 (기본 의존성)
echo "new-package==1.0.0" >> requirements-base.txt

# Docker 배포용 (ML/AI 관련)
echo "new-package==1.0.0" >> requirements-ml.txt
```

**결과:**
- ✅ 로컬과 배포 환경의 명확한 분리
- ✅ CI/CD 오류 방지
- ✅ 의존성 관리 가이드라인 확립

### 7. 스테이징 환경 데이터베이스 연결 오류 해결

**문제점:**
- AI 서비스에서 `DATABASE_URL` 환경변수 사용
- GitHub Secrets에는 `POSTGRE_URL`로 설정됨
- 스테이징 배포 시 `[Errno 111] Connection refused` 오류 발생

**해결책:**
- **AI 서비스 설정 변경**: `DATABASE_URL` → `POSTGRE_URL`로 통일
- **배포 워크플로우 수정**: 스테이징/프로덕션 모두에 `POSTGRE_URL` 환경변수 추가

**변경된 파일들:**
```python
# ai-service/app/core/config.py
POSTGRE_URL: str = "postgresql+asyncpg://dev_user:dev_password@localhost:5432/ai_portfolio"

def get_database_config(self) -> dict:
    return {
        "url": self.external.POSTGRE_URL,  # DATABASE_URL → POSTGRE_URL
        **self.internal['database']
    }
```

```yaml
# .github/workflows/deploy-ai-service-staging.yml
# .github/workflows/deploy-ai-service-production.yml
--set-env-vars="POSTGRE_URL=${{ secrets.POSTGRE_URL }}" \
```

**결과:**
- ✅ 스테이징 환경에서 PostgreSQL 연결 성공
- ✅ 환경변수 명명 규칙 통일
- ✅ 백엔드와 AI 서비스 간 일관성 확보

### 다음 단계
1. **RAG 파이프라인 확장**: Document processing, Vector store, Retrieval
2. **캐싱 시스템**: Redis 연동으로 성능 최적화
3. **프롬프트 관리**: LangSmith + YAML 하이브리드 시스템