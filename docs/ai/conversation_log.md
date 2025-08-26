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

---

## 2025-08-26: Document Loader와 TextSplitter 모듈 설계 및 라이브러리 선정

### 배경
conversation_log의 최종결정 사항을 바탕으로, Document Loader와 TextSplitter 모듈 구현을 위한 라이브러리 선정 및 검증 방식 결정

### Knowledge-Base 분석 결과
- **대상 파일**: `docs/projects/` 디렉토리의 Markdown 파일들
  - `3_OnTheTrain.md` (181줄) - 여행 계획 스케줄러 프로젝트
  - `2_CloseToU.md` (135줄) - 중고거래 게시판 프로젝트  
  - `1_README.md` (141줄) - SKKU 미술동아리 갤러리 프로젝트

- **문서 특성**:
  - 구조화된 Markdown (헤더 1-5 레벨)
  - 프로젝트별 100-180줄의 상세 문서
  - 기술 스택, 기능, 구현 과정 등 체계적 구성

### 라이브러리 후보군 분석

#### DocumentLoader 후보군
1. **LangChain DocumentLoader** ⭐
   - 장점: RAG 시스템 완벽 호환, 메타데이터 자동 추출, 표준화된 출력
   - 단점: 의존성이 무거움, 세밀한 제어 어려움

2. **python-markdown + pathlib** ⭐⭐  
   - 장점: 가볍고 빠름, Markdown 확장 지원, 완전한 커스터마이징
   - 단점: 직접 구현 필요, Document 객체 변환 필요

3. **Unstructured**
   - 장점: 고급 문서 구조 분석
   - 단점: 과도한 기능, 단순 MD에는 불필요

#### TextSplitter 후보군
1. **LangChain TextSplitter** ⭐⭐
   - 장점: Markdown 헤더 기반 분할, 정밀한 제어, 검증된 알고리즘
   - 단점: LangChain 의존성 필요

2. **spaCy + 직접 구현** ⭐
   - 장점: 문장/단락 경계 우수, 완전 커스터마이징, 가벼운 의존성
   - 단점: 구현 복잡도 높음, 성능 튜닝 필요

3. **tiktoken (OpenAI)**
   - 장점: 토큰 기반 정확한 분할
   - 단점: 의미적 경계 무시, Markdown 구조 미고려

4. **NLTK + 직접 구현**
   - 장점: 문장 경계 감지 우수
   - 단점: Markdown 헤더 직접 처리 필요, 한국어 지원 제한

### 최종 결정: LangChain 통합 추천 ⭐⭐⭐

#### 선정 이유
- RAG 파이프라인과 완벽 호환
- 검증된 알고리즘과 안정성  
- 메타데이터 자동 처리
- Markdown 헤더 구조 인식
- 포트폴리오 프로젝트 특성에 최적

#### 구현 클래스 설계
```python
# DocumentLoader
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.document_loaders import UnstructuredMarkdownLoader

# TextSplitter  
from langchain.text_splitter import MarkdownHeaderTextSplitter
from langchain.text_splitter import RecursiveCharacterTextSplitter
```

### 검증 시스템 설계

#### 1. Document Load 검증
```python
class DocumentLoadValidator:
    def validate_file_integrity(self, file_path: str) -> ValidationResult:
        # 파일 존재, 읽기 권한, 크기 검증
    
    def validate_markdown_structure(self, content: str) -> ValidationResult:
        # 헤더 구조, 링크, 이미지 경로 검증
    
    def validate_encoding(self, file_path: str) -> ValidationResult:
        # UTF-8 인코딩 검증
```

#### 2. TextSplit 검증
```python
class TextSplitValidator:
    def validate_chunk_sizes(self, chunks: List[TextChunk]) -> ValidationResult:
        # chunk_size 범위 검증 (500-2000자)
    
    def validate_overlap_consistency(self, chunks: List[TextChunk]) -> ValidationResult:
        # 청크 간 overlap 검증
    
    def validate_content_completeness(self, original: str, chunks: List[TextChunk]) -> ValidationResult:
        # 원본 내용 손실 없는지 검증
    
    def validate_semantic_boundaries(self, chunks: List[TextChunk]) -> ValidationResult:
        # 헤더/문단 경계에서 분할되었는지 검증
```

#### 3. 통합 검증  
```python
class DocumentProcessingValidator:
    def validate_pipeline(self, file_path: str) -> PipelineValidationResult:
        # load -> split -> embed 전체 파이프라인 검증
```

### 구현 계획 (Phase 2 세부)
1. **LangChain 의존성 추가**: requirements에 langchain-community 추가
2. **Document Loader 구현**: DirectoryLoader + UnstructuredMarkdownLoader
3. **Text Splitter 구현**: MarkdownHeaderTextSplitter + RecursiveCharacterTextSplitter  
4. **검증 시스템 구현**: 각 단계별 검증 클래스
5. **통합 테스트**: docs/projects/ 파일들로 전체 파이프라인 검증

### 설정 파라미터
```yaml
# config.yaml 추가 설정
document_processing:
  source_directory: "docs/projects/"
  file_pattern: "*.md"
  chunk_size: 1000
  chunk_overlap: 200
  header_levels: [1, 2, 3]  # 분할할 헤더 레벨
```

---

## 2025-08-26: Document Processing 모듈 완전 구현 및 테스트 완료

### 구현 완료된 아키텍처

#### 디렉토리 구조 생성
```
ai-service/app/services/document/
├── __init__.py                    # 모듈 exports
├── pipeline.py                    # 메인 오케스트레이터
├── loaders/
│   ├── __init__.py
│   ├── base.py                    # DocumentLoader 인터페이스
│   └── markdown_loader.py         # LangChain TextLoader 기반 구현
├── splitters/
│   ├── __init__.py
│   ├── base.py                    # TextSplitter 인터페이스 + TextChunk 모델
│   └── markdown_splitter.py       # MarkdownHeaderTextSplitter 기반 구현
└── validators/
    ├── __init__.py
    ├── base.py                    # 검증 기반 클래스들 (ValidationResult, ValidationStatus)
    ├── load_validator.py          # 문서 로딩 검증
    ├── split_validator.py         # 텍스트 분할 검증  
    └── pipeline_validator.py      # 통합 파이프라인 검증
```

### 핵심 구현 클래스들

#### 1. Base Interfaces
```python
# DocumentLoader 인터페이스
class DocumentLoader(ABC):
    async def load_document(self, file_path: Path) -> Document
    async def load_documents(self, directory_path: Path, pattern: Optional[str] = None) -> List[Document]

# TextSplitter 인터페이스 + TextChunk 모델
@dataclass
class TextChunk:
    content: str
    metadata: dict
    start_index: int = 0
    end_index: int = 0

class TextSplitter(ABC):
    async def split_document(self, document: Document) -> List[TextChunk]
    async def split_documents(self, documents: List[Document]) -> List[TextChunk]
```

#### 2. LangChain 통합 구현체
```python
# MarkdownDocumentLoader: TextLoader 기반 (unstructured 대신 경량화)
class MarkdownDocumentLoader(DocumentLoader):
    - DirectoryLoader + TextLoader 조합
    - 비동기 처리 (run_in_executor)
    - 풍부한 메타데이터 (파일 정보, 크기, 경로 등)

# MarkdownTextSplitter: 2단계 분할
class MarkdownTextSplitter(TextSplitter):
    - 1단계: MarkdownHeaderTextSplitter (H1, H2, H3 기준)
    - 2단계: RecursiveCharacterTextSplitter (chunk_size 기준)
    - 메타데이터 전파 및 청크 인덱싱
```

#### 3. 3단계 검증 시스템
```python
# DocumentLoadValidator: 파일 무결성, 메타데이터, 마크다운 구조 검증
class DocumentLoadValidator:
    - 파일 존재/권한/크기 검증
    - UTF-8 인코딩 검증
    - 마크다운 헤더 구조 분석
    - 브로큰 링크 감지

# TextSplitValidator: 분할 품질, 오버랩, 의미 경계 검증  
class TextSplitValidator:
    - 청크 크기 분포 분석 (100-2000자)
    - 오버랩 일관성 검증 (10%-30%)
    - 의미적 경계 검증 (문장/문단 단위)
    - 콘텐츠 완전성 검증 (원본과 비교)

# PipelineValidator: 전체 파이프라인 통합 검증
class PipelineValidator:
    - 문서-청크 비율 분석
    - 메타데이터 일관성 검증
    - 콘텐츠 분포 통계
```

#### 4. DocumentProcessingPipeline 오케스트레이터
```python
class DocumentProcessingPipeline:
    async def process_directory(self, directory_path: Path, file_pattern: str = "*.md") -> Dict[str, Any]
    async def process_file(self, file_path: Path) -> Dict[str, Any]  
    async def process_batch(self, paths: List[Path], max_concurrent: int = 5) -> List[Dict[str, Any]]
    def get_processing_summary(self, results: List[Dict[str, Any]]) -> Dict[str, Any]
```

### 의존성 관리 개선

#### requirements 파일 업데이트
```bash
# requirements-ml.txt (CI/CD 배포용)
langchain-community==0.0.10

# requirements-local.txt (로컬 개발용)  
langchain-community==0.0.10
```

**선택한 라이브러리:**
- **langchain-community**: DirectoryLoader, TextLoader
- **langchain.text_splitter**: MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
- **unstructured 제외**: 의존성 복잡성으로 인해 TextLoader로 대체

### 설정 시스템 통합

#### config.yaml 확장
```yaml
document_processing:
  source_directory: "docs/projects/"
  file_pattern: "*.md"
  encoding: "utf-8"
  enable_validation: true
  max_concurrent_processing: 5
  
  # Splitter Configuration
  splitter:
    chunk_size: 1000
    chunk_overlap: 200
    header_levels: [1, 2, 3]
  
  # Validator Configuration  
  validator:
    max_file_size_mb: 10
    min_chunk_size: 100
    max_chunk_size: 2000
    min_overlap_ratio: 0.1
    max_overlap_ratio: 0.3
```

### 실제 테스트 결과

#### 테스트 환경
- **대상 파일**: docs/projects/ 디렉토리의 3개 마크다운 문서
  - `1_README.md` (SKKU FAC Gallery) - 3,687자
  - `2_CloseToU.md` (중고거래 게시판) - 2,424자  
  - `3_OnTheTrain.md` (여행 스케줄러) - 3,095자

#### 성공 결과
- ✅ **문서 로딩**: 3개 문서, 9,206자 성공 처리
- ✅ **청크 생성**: 67개 청크 (평균 22.3개/문서)
- ✅ **처리 성능**: 0.01초 처리 시간 (561.1 문서/초)
- ✅ **비동기 처리**: 병렬 배치 처리 완료
- ✅ **검증 시스템**: 3단계 검증 모두 동작 확인

#### 검증으로 발견된 개선점
- ⚠️ **청크 크기**: 40개 청크가 100자 미만 (min_chunk_size 조정 필요)
- ⚠️ **콘텐츠 손실**: 9.4% 길이 차이 (분할 알고리즘 개선 필요)
- ⚠️ **오버랩 일관성**: 66개 청크에서 오버랩 비일관성
- ⚠️ **의미 경계**: 64개 청크가 문장 중간에서 분할

#### 테스트 스크립트 구현
- **test_document_processing.py**: 완전한 테스트 파이프라인
- **UTF-8 인코딩 처리**: Windows 환경 호환성
- **상세한 결과 보고**: 문서, 청크, 검증 결과 분석
- **배치 처리 테스트**: 동시 처리 성능 확인

### 다음 단계 계획

#### Phase 3: 벡터 임베딩 및 저장소 연동
```python
# 예정된 확장
embedding/
├── embedder.py          # SentenceTransformer 기반 임베딩
├── vector_store.py      # Qdrant 연동
└── retriever.py         # 유사도 검색
```

#### 설정 튜닝 우선순위
1. **chunk_size**: 1000 → 800 (더 균등한 분할)
2. **min_chunk_size**: 100 → 200 (품질 향상)
3. **header_levels**: [1, 2, 3, 4] (더 세밀한 분할)
4. **overlap_ratio**: 현재 20% → 15% (중복 최적화)

### 기술적 성과

#### 아키텍처 설계
- ✅ **관심사 분리**: Loader, Splitter, Validator 독립 모듈
- ✅ **인터페이스 추상화**: 다양한 구현체 교체 가능
- ✅ **Pipeline 패턴**: 단계별 처리 및 검증
- ✅ **비동기 처리**: 성능 최적화

#### LangChain 생태계 통합
- ✅ **표준 호환성**: Document, TextChunk 모델 준수
- ✅ **메타데이터 활용**: 풍부한 문서 정보 보존
- ✅ **확장성**: 향후 RAG 파이프라인 연결 준비

#### 검증 및 품질 관리
- ✅ **다층 검증**: 로딩 → 분할 → 파이프라인 검증
- ✅ **문제 진단**: 구체적인 이슈와 해결 제안
- ✅ **성능 모니터링**: 처리 시간, 처리량 측정

이제 Document Processing 모듈이 완전히 구현되어 향후 RAG 파이프라인의 기초가 완성되었습니다.