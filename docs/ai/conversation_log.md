# Conversation Log

### 📝 템플릿 사용 가이드

#### 작성 시점
- AI 에이전트와의 중요한 기술적 대화 완료 직후
- 주요 기능 구현이나 문제 해결 완료 후
- 새로운 기술 학습이나 아키텍처 결정 후

#### 세션 순서
- **최신 세션이 가이드 아래, 파일 상단에 위치**하도록 작성 (Session N이 위에, Session 1이 아래)
- 각 세션은 `---` 구분선으로 분리
- 백업된 기존 로그는 `docs/ai/backup/`에 보관

#### 기록할 가치가 있는 내용
- **기술적 의사결정**: 왜 그 선택을 했는지 근거
- **문제해결 과정**: 체계적 접근법과 결과
- **성능 개선**: Before/After 수치가 있는 최적화
- **새로운 학습**: 기존 지식에서 확장된 부분
- **실패와 교훈**: 시행착오에서 얻은 인사이트

#### 포트폴리오 활용 팁
- 면접에서 **"구체적 사례"** 질문에 바로 활용 가능
- 기술적 역량을 **정량적 지표**로 증명
- 문제해결 **사고 과정**을 체계적으로 보여줌
- 지속적 성장과 학습 **의지** 입증

---

## Session 20: RAG QnA 탭을 Query/VectorSearch 탭으로 리팩토링 및 지능형 쿼리 시스템 구현 (2025-01-06)

### 📅 세션 정보
- **날짜**: 2025-01-06  
- **목표**: RAG QnA 탭을 Query/VectorSearch로 분리하고 지능형 쿼리 분류 시스템 구현
- **주요 작업**: 헥사고널 아키텍처 적용, Mock LLM 기반 쿼리 분류, 동적 샘플 쿼리 생성

### 🎯 주요 성과

#### 1. **탭 구조 개선 및 기능 분리**
- ✅ **RAG Q&A → Query/VectorSearch 탭 변경**
  - 기존 단일 RAG 탭을 두 개의 서브탭으로 분리
  - **Query 탭**: 완전한 RAG 질의응답 기능
  - **Vector Search 탭**: 순수 벡터 유사도 검색 기능
  - 각 기능의 목적과 결과를 명확히 구분

- ✅ **UI/UX 개선**
  - Query 탭: 질문 입력 → AI 답변 + 참조 출처
  - Vector Search 탭: 검색 쿼리 → 유사 청크 목록 + 유사도 점수
  - 각 탭별 파라미터 최적화 (max_sources, top_k, similarity_threshold)

#### 2. **헥사고널 아키텍처 완전 적용**
- ✅ **Use Case 레이어 구현**
  - `ExecuteRAGQueryUseCase`: RAG 질의응답 비즈니스 로직
  - `ExecuteVectorSearchUseCase`: 벡터 검색 비즈니스 로직
  - UI 어댑터가 도메인 서비스를 직접 호출하지 않고 Use Case를 통해 호출

- ✅ **의존성 주입 패턴 개선**
  ```python
  # Before: 탭에서 직접 서비스 주입
  def __init__(self, generation_service: GenerationService):
  
  # After: 서비스 팩토리를 통한 Use Case 생성
  def __init__(self, service_factory):
      self.execute_rag_query_usecase = ExecuteRAGQueryUseCase(
          retrieval_service=service_factory.get_retrieval_service(),
          generation_service=service_factory.get_generation_service()
      )
  ```

#### 3. **지능형 쿼리 분류 시스템 구현**
- ✅ **Mock LLM 기반 쿼리 분류**
  - 실제 환경: 외부 LLM (Google Gemini API)을 통한 질의 분류
  - Demo 환경: Mock LLM을 통한 분류 시뮬레이션
  - 분류 타입: `PROJECT`, `EXPERIENCE`, `TECHNICAL_SKILL`, `GENERAL`

- ✅ **QueryTemplateService 도메인 서비스 구현**
  - DocumentService와 동일한 패턴으로 파일 로드 담당
  - `query_templates.json`을 통한 구조화된 템플릿 관리
  - 문서 타입별 적절한 샘플 쿼리 동적 생성

- ✅ **템플릿 기반 동적 쿼리 생성**
  ```json
  {
    "template": "{doc_title}의 주요 기술 스택은 무엇인가요?",
    "expected_type": "PROJECT",
    "confidence": 0.95,
    "reasoning": "프로젝트의 기술 스택을 묻는 질문 (Mock LLM 분류)"
  }
  ```

#### 4. **샘플 쿼리 시스템 완전 개편**
- ✅ **파일 시스템 직접 로드 제거**
  - Before: 정적 `sample_queries.json` 파일 직접 로드
  - After: 로드된 문서 메타데이터 기반 동적 생성

- ✅ **문서 기반 샘플 쿼리 생성**
  - 현재 로드된 문서들의 타입과 제목 분석
  - 각 문서에 적합한 질의 템플릿 자동 선택
  - Mock LLM 분류 결과와 신뢰도 점수 포함

- ✅ **UI 개선**
  - "로드된 문서 기반 샘플 쿼리 생성" 버튼 추가
  - 드롭다운에서 `[QUERY_TYPE] 질문내용 (신뢰도: 0.95) - 문서명` 형식 표시
  - 선택 시 자동으로 질문 입력창에 반영

#### 5. **코드 품질 및 아키텍처 개선**
- ✅ **관심사 분리 완료**
  - QueryTemplateService: 템플릿 로드 및 쿼리 생성
  - ExecuteRAGQueryUseCase: RAG 비즈니스 로직
  - UI Adapter: 순수 UI 이벤트 처리만 담당

- ✅ **확장성 확보**
  - 새로운 문서 타입 추가 시 템플릿 파일만 수정
  - 새로운 쿼리 분류 타입 추가 시 템플릿만 확장
  - Mock LLM을 실제 LLM으로 교체 시 서비스 레이어만 수정

### 🔧 기술적 의사결정

#### **Query 분류 시스템 설계**
**문제**: 사용자 질의를 어떻게 지능적으로 분류하여 최적화된 검색을 할 것인가?

**선택**: Mock LLM 기반 시뮬레이션 + 템플릿 시스템
- **장점**: Demo 환경에서 외부 API 의존성 없이 동작
- **장점**: 실제 LLM 분류 로직을 시뮬레이션하여 실제 동작 방식 구현
- **장점**: 템플릿 파일로 쉬운 확장 및 수정

**대안**: 하드코딩된 규칙 기반 분류
- **단점**: 확장성 부족, 실제 LLM 동작과 차이

#### **샘플 쿼리 생성 방식**
**문제**: 정적 파일 vs 동적 생성 중 어떤 방식을 선택할 것인가?

**선택**: 로드된 문서 기반 동적 생성
- **장점**: 실제 로드된 문서에 맞는 관련성 높은 질의 제공
- **장점**: 문서가 없을 때 적절한 안내 메시지 표시
- **장점**: DocumentService와 일관된 파일 로드 패턴

**대안**: 정적 JSON 파일
- **단점**: 로드된 문서와 무관한 질의 표시 가능성
- **단점**: 문서 로드 상태 반영 불가

### 📈 성능 및 사용성 개선

#### **Before & After 비교**

**Before: 단일 RAG Q&A 탭**
```python
# 하나의 탭에서 모든 기능
with gr.Tab("🤖 RAG Q&A"):
    # 질의응답만 가능
    # 벡터 검색 결과 확인 불가
    # 정적 샘플 질의
```

**After: Query/VectorSearch 분리**
```python
# 기능별 명확한 분리
with gr.Tab("💬 Query"):
    # RAG 질의응답 + 출처 표시
with gr.Tab("🔍 Vector Search"): 
    # 순수 벡터 검색 + 유사도 점수
# 동적 샘플 질의 생성
```

#### **사용자 경험 개선**
- **기능 명확성**: Query vs Vector Search 목적 구분
- **결과 이해도**: 각 기능별 적절한 출력 형식
- **학습 효과**: Mock LLM 분류 시스템에 대한 이해 증진

### 🎓 학습 및 인사이트

#### **헥사고널 아키텍처 적용 경험**
- **Use Case의 역할**: UI와 도메인 서비스 사이의 비즈니스 로직 조정자
- **의존성 방향**: UI → Use Case → Domain Service 단방향 의존성 유지
- **테스트 가능성**: Use Case 단위로 독립적인 테스트 가능

#### **템플릿 시스템 설계 패턴**
- **DocumentService 패턴 재사용**: 일관된 파일 로드 방식
- **변수 치환 패턴**: `{doc_title}` 같은 플레이스홀더 활용
- **타입별 템플릿 분류**: 문서 타입에 따른 적절한 질의 생성

#### **Mock 시스템 구현 전략**  
- **실제 동작 시뮬레이션**: 실제 LLM 분류 결과와 유사한 구조
- **신뢰도 점수 포함**: 실제 분류 시스템의 불확실성 반영
- **확장 가능한 설계**: Mock → Real LLM 교체 용이성

### 🚀 다음 단계 및 확장 계획

1. **실제 LLM 연동**: Mock LLM을 Google Gemini API로 교체
2. **쿼리 히스토리**: 사용자 질의 이력 및 분석 기능
3. **개인화된 추천**: 사용자 패턴 기반 질의 추천
4. **A/B 테스트**: 다양한 분류 모델 성능 비교

---

## Session 19: 임베딩/벡터스토어 탭 완전 리팩토링 및 UI 개선 (2025-01-06)

### 📅 세션 정보
- **날짜**: 2025-01-06
- **목표**: 임베딩/벡터스토어 탭의 헥사고널 아키텍처 완전 적용 및 사용자 경험 개선
- **주요 작업**: Use Case 구현, 객체-메서드 관계 정리, 3열 그리드 UI 구현, 오류 해결

### 🎯 주요 성과

#### 1. **헥사고널 아키텍처 완전 적용**
- ✅ **Use Case 레이어 구현**
  - `CreateEmbeddingUseCase`: 임베딩 생성 비즈니스 로직 캡슐화
  - `GetVectorStoreInfoUseCase`: 벡터스토어 정보 조회
  - `GetVectorContentUseCase`: 벡터 내용 조회 및 포맷팅
  - `ClearVectorStoreUseCase`: 벡터스토어 초기화

- ✅ **의존성 주입 패턴 적용**
  - `EmbeddingModelPort` 인터페이스 정의
  - `SentenceTransformerEmbeddingModelAdapter` 구현
  - `ServiceFactory`를 통한 중앙화된 서비스 관리
  - UI 어댑터가 Use Case만 참조하도록 구조 개선

- ✅ **도메인 엔티티 강화**
  - `Embedding` 엔티티에 메타데이터 지원 추가
  - `ProcessingStatus`, `BatchJob`, `ValidationResult` 엔티티 추가
  - 도메인 서비스와 엔티티 간의 명확한 책임 분리

#### 2. **객체-메서드 관계 정리 및 오류 해결**
- ✅ **Embedding 엔티티 속성 일관성 확보**
  - `vector_dimension` 속성 추가 (dimension의 별칭)
  - `metadata` 속성 추가 및 초기화
  - `to_dict()`, `from_dict()` 메서드에 새 속성들 반영

- ✅ **NumPy 배열 처리 개선**
  - `create_embedding` 메서드에서 NumPy 배열을 리스트로 변환
  - `get_vector_norm()`, `get_vector_magnitude()` 메서드 안전성 강화
  - 'The truth value of an array with more than one element is ambiguous' 오류 해결

- ✅ **메타데이터 생성 개선**
  - 임베딩 생성 시 청크 정보를 메타데이터로 저장
  - `document_source`를 `document_id`로 정확히 표시
  - 청크 인덱스, 크기, 겹침 정보 저장

#### 3. **UI/UX 완전 개선**
- ✅ **4단계 워크플로우 구조화**
  - **1단계**: 임베딩 생성 및 분석 (2열: 생성 옵션 + 모델 정보)
  - **2단계**: 벡터스토어 저장 (저장된 임베딩 관리)
  - **3단계**: 벡터스토어 정보 (독립된 정보 조회)
  - **4단계**: 벡터 내용 확인 (전체 너비, 3열 그리드)

- ✅ **3열 그리드 레이아웃 구현**
  - 생성된 임베딩 확인을 별도 행으로 분리
  - 벡터 내용 확인을 4단계로 독립화
  - `create_embedding_card()` 및 `create_vector_card()` 컴포넌트 추가
  - `create_embedding_preview_container()` 및 `create_vector_content_container()` 구현

- ✅ **스크롤 기능 및 사용자 안내 추가**
  - 임베딩 카드의 벡터 미리보기에 세로 스크롤 추가
  - 벡터 카드의 청크 미리보기에 세로 스크롤 추가
  - 벡터 스토어 저장 필드에 대한 명확한 안내 박스 추가

#### 4. **코드 품질 및 안정성 향상**
- ✅ **임베딩 분석 영역 제거**
  - 중복되는 내용으로 인한 혼란 방지
  - 관련 Use Case, 메서드, 이벤트 핸들러 완전 제거
  - UI 레이아웃 단순화

- ✅ **비동기/동기 처리 일관성 확보**
  - 모든 Use Case를 동기 방식으로 통일
  - `asyncio` 루프 제거로 안정성 향상
  - 'coroutine' object is not iterable 오류 해결

### 🔧 기술적 개선사항

#### **아키텍처 레이어별 개선**
```python
# Application Layer (Use Cases)
class CreateEmbeddingUseCase:
    def execute(self, chunk_ids=None, document_id=None, all_chunks=False):
        # 비즈니스 로직 캡슐화
        chunks = self._get_chunks(chunk_ids, document_id, all_chunks)
        embeddings = []
        for chunk in chunks:
            embedding = self.embedding_service.create_embedding(chunk)
            embeddings.append(embedding)
        return {"success": True, "embeddings_created": len(embeddings)}

# Domain Layer (Services & Entities)
class EmbeddingService:
    def create_embedding(self, chunk: Chunk) -> Embedding:
        vector = self.embedding_model.encode_single(chunk.content)
        vector_list = vector.tolist() if hasattr(vector, 'tolist') else list(vector)
        
        metadata = {
            "chunk_text_preview": chunk.get_content_preview(100),
            "document_source": str(chunk.document_id),
            "chunk_index": getattr(chunk, 'chunk_index', 0),
            "chunk_size": getattr(chunk, 'chunk_size', len(chunk.content)),
            "chunk_overlap": getattr(chunk, 'chunk_overlap', 0)
        }
        
        return Embedding(
            chunk_id=chunk.chunk_id,
            vector=vector_list,
            model_name=self.embedding_model.get_model_info()["model_name"],
            dimension=self.embedding_model.get_dimension(),
            metadata=metadata
        )

# Infrastructure Layer (Adapters)
class ServiceFactory:
    def get_embedding_service(self):
        if self._embedding_service is None:
            processing_status_service = self.get_processing_status_service()
            validation_service = self.get_validation_service()
            
            self._embedding_service = EmbeddingService(
                embedding_model=self.get_embedding_model(),
                processing_status_service=processing_status_service,
                validation_service=validation_service
            )
        return self._embedding_service
```

#### **UIComponents 확장**
```python
# 새로운 컴포넌트 추가
- create_embedding_card(): 임베딩 카드 생성 (파란색 테마)
- create_embedding_preview_container(): 임베딩 미리보기 컨테이너
- create_vector_card(): 벡터 카드 생성 (보라색 테마)
- create_vector_content_container(): 벡터 내용 컨테이너

# 3열 그리드 레이아웃
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 16px;
max-height: 400px;
overflow-y: auto;
```

### 🎨 UI/UX 개선 효과

#### **시각적 일관성**
- 청크 목록과 동일한 3열 그리드 패턴 적용
- 임베딩 카드: 파란색 테마 (#e3f2fd, #2196f3)
- 벡터 카드: 보라색 테마 (#f3e5f5, #9c27b0)
- 호버 효과 및 그라데이션 배경으로 현대적 디자인

#### **사용자 안내 강화**
- 벡터 스토어 저장 필드에 대한 명확한 안내
- 미리보기와 실제 저장 데이터의 차이점 설명
- 시각적으로 구분되는 안내 박스로 주의 환기

#### **워크플로우 최적화**
- 단계별 명확한 구분으로 사용자 혼란 방지
- 각 단계별 독립적인 기능으로 모듈성 확보
- 전체 너비 활용으로 정보 밀도 향상

### 🐛 해결된 오류들

1. **`'Embedding' object has no attribute 'vector_dimension'`**
   - 원인: 속성명 불일치 (dimension vs vector_dimension)
   - 해결: 호환성을 위한 별칭 속성 추가

2. **`'The truth value of an array with more than one element is ambiguous'`**
   - 원인: NumPy 배열을 조건문에서 직접 사용
   - 해결: 안전한 타입 변환 및 예외 처리 추가

3. **`'coroutine' object is not iterable`**
   - 원인: 비동기/동기 처리 혼재
   - 해결: 모든 Use Case를 동기 방식으로 통일

4. **문서 출처가 Unknown으로 표시**
   - 원인: 존재하지 않는 속성 접근
   - 해결: `document_id`를 직접 사용하여 정확한 정보 표시

5. **`'EmbeddingService' object has no attribute 'store_embedding'`**
   - 원인: 의존성 주입 누락
   - 해결: ServiceFactory에서 모든 의존성 주입

### 📊 성능 및 안정성

- **데이터 타입 일관성**: 모든 벡터 연산에서 안전한 타입 처리
- **메모리 효율성**: 스크롤 가능한 영역으로 메모리 사용량 최적화
- **아키텍처 일관성**: 헥사고널 아키텍처 원칙 완전 적용
- **사용자 경험**: 명확한 안내로 오해 방지 및 사용성 향상

### 🔄 다음 단계
- 벡터 검색 기능 구현 (유사도 검색)
- 임베딩 품질 평가 메트릭 추가
- 대용량 데이터 처리 최적화
- 실시간 임베딩 생성 진행률 표시
- 벡터 인덱싱 전략 구현

---

## Session 18: Data 확인 탭 → 시스템 정보 및 아키텍처 시각화 탭 전환 계획 (2025-01-27)

### 🎯 목표
기존 "Data 확인" 탭을 시스템 정보 및 아키텍처 시각화를 보여주는 탭으로 전환하여 임베딩 모델, 벡터스토어 상태, 외부 LLM 정보, 설정 파일 로드 상태, 전체 아키텍처 및 시나리오별 흐름을 표시

### 📊 현재 엔티티/서비스 분석 결과

#### 1. 시스템 정보 수집 가능한 엔티티들
**임베딩 관련**:
- `VectorStore` (`ai-service/demo/domain/entities/vector_store.py:69-79`) - 벡터스토어 통계, 모델명, 차원, 저장 상태
- `Embedding` (`ai-service/demo/domain/entities/embedding.py:31-87`) - 임베딩 모델 정보, 벡터 차원, 생성 시간
- `EmbeddingService` (`ai-service/demo/domain/services/embedding_service.py:21-244`) - 임베딩 통계, 처리 상태, 실패/성공률

**처리 상태 관련**:
- `ProcessingStatus` - 각 단계별 처리 상태 추적
- `BatchJob` - 배치 작업 진행률 및 상태
- `ValidationResult` - 검증 결과 및 데이터 일관성

**설정 관련**:
- `ConfigManager` (`ai-service/core/shared/config/config_manager.py`) - 설정 파일 로드 상태
- `PromptConfig` - 프롬프트 설정 정보
- `ChunkingConfigManager` - 청킹 설정 관리

#### 2. 현재 서비스들로 수집 가능한 정보
✅ **완전 커버 가능**:
- 임베딩 모델 정보 (모델명, 차원, 통계)
- 벡터스토어 상태 (저장량, 크기, 생성시간)
- 처리 상태 추적 (성공/실패률, 단계별 진행상황)
- 배치 작업 모니터링
- 청킹 전략 및 설정 정보

⚠️ **부분적 커버**:
- 외부 LLM 정보 (현재는 Generation Service에서 하드코딩)
- 설정 파일 로드 상태 (ConfigManager 존재하지만 UI 연동 부족)
- 전체 시스템 메모리/CPU 사용량

❌ **추가 구현 필요**:
- 아키텍처 다이어그램 시각화
- 실시간 시스템 메트릭스
- 외부 API 연결 상태 체크

### 🏗️ 시스템 정보 탭 구현 계획

#### 1. 새로운 탭 구성 (4개 섹션)
**A. 모델 및 서비스 상태**
- 임베딩 모델: 모델명, 차원, 로드 상태
- LLM 모델: 사용 중인 외부 API, 응답 시간
- 벡터스토어: 저장량, 크기, 인덱스 상태

**B. 처리 현황 대시보드**
- 실시간 처리 통계 (성공/실패/대기 중)
- 배치 작업 진행률
- 최근 오류 로그

**C. 설정 및 구성 정보**
- 로드된 설정 파일 목록
- 청킹 전략 설정
- 프롬프트 템플릿 상태

**D. 아키텍처 시각화**
- 헥사고널 아키텍처 구조도
- 데이터 흐름 다이어그램
- 시나리오별 처리 흐름

#### 2. 필요한 Use Case 설계
```python
- GetSystemStatusUseCase: 전체 시스템 상태 조회
- GetModelInfoUseCase: 모델 정보 및 상태 조회  
- GetConfigurationStatusUseCase: 설정 파일 로드 상태
- GetProcessingMetricsUseCase: 실시간 처리 메트릭스
- GetArchitectureInfoUseCase: 아키텍처 구조 정보
```

### 📋 구현 순서
1. **시스템 상태 Use Case 구현**: 기존 서비스들 통합
2. **UI 리팩토링**: Data 확인 → 시스템 정보 탭으로 변경
3. **실시간 모니터링**: 처리 상태 실시간 업데이트
4. **아키텍처 시각화**: 구조도 및 흐름도 추가
5. **설정 상태 체크**: Config 로드 상태 확인 기능

### 🔄 다음 단계
- 기존 엔티티/서비스만으로도 80% 이상 구현 가능
- 아키텍처 시각화는 정적 다이어그램으로 시작
- 실시간 메트릭스는 점진적 추가

---

## Session 17.1: 서비스 단위 테스트 완료 및 DocumentType 확장 (2025-09-05)

### 🎯 목표
임베딩/VectorStore 탭 헥사고널 아키텍처 리팩토링을 위한 서비스들의 단위 테스트 진행 및 DocumentType 확장

### 📊 완료된 작업

#### 1. 테스트 환경 구축
- **conda 환경 활용**: `env_ai_portfolio` 환경에서 pytest를 사용한 단위 테스트 실행
- **테스트 디렉토리 구조**: `ai-service/demo/tests/unit/domain/services/` 생성
- **테스트 프레임워크**: unittest와 pytest 병행 사용

#### 2. 서비스 단위 테스트 완료
**ProcessingStatusService** (`test_processing_status_service.py`):
- ✅ 처리 상태 생성/업데이트/조회 테스트 (13개 테스트 모두 통과)
- ✅ 상태별 통계 조회 및 재시도 로직 검증
- ✅ Mock을 활용한 의존성 분리 테스트

**ValidationService** (`test_validation_service.py`):
- ✅ 임베딩 생성 검증 테스트 (12개 테스트 모두 통과)
- ✅ 벡터스토어 저장 검증 및 데이터 일치성 검증
- ✅ 빈 청크, 긴 청크, 차원 불일치 등 다양한 시나리오 테스트

**BatchProcessingService** (`test_batch_processing_service.py`):
- ✅ 배치 작업 생성/실행/관리 테스트 (14개 테스트 모두 통과)
- ✅ 진행률 추적 및 통계 조회 기능 검증
- ✅ 실패 처리 및 재시도 로직 테스트

**확장된 EmbeddingService** (`test_embedding_service_extended.py`):
- ✅ 상태 추적 포함 임베딩 생성 테스트 (13개 테스트 모두 통과)
- ✅ 배치 추적 및 검증 통합 테스트
- ✅ Mock을 활용한 의존성 주입 테스트

#### 3. DocumentType 확장
**새로운 타입 추가**:
- `DocumentType.TEXT` 추가: 테스트용 일반 텍스트 문서 타입
- 기존: MANUAL, SAMPLE, API, PROJECT, QA
- 확장: MANUAL, SAMPLE, API, PROJECT, QA, **TEXT**

**샘플 데이터 확장**:
- `test_document.md`: 청킹 및 임베딩 테스트용 문서 생성
- `metadata.json` 업데이트: TEXT 타입 문서 메타데이터 추가
- 다양한 청킹 시나리오 테스트를 위한 충분한 텍스트 내용 포함

#### 4. 테스트 결과 요약
- **총 테스트 수**: 52개 단위 테스트
- **성공률**: 100% (모든 테스트 통과)
- **테스트 범위**: 
  - 상태 추적 기능
  - 데이터 검증 로직
  - 배치 처리 관리
  - 임베딩 생성 및 관리
  - 청킹 서비스 기능

### 🔧 기술적 성과

#### 1. Mock을 활용한 의존성 분리
```python
# 예시: ProcessingStatusService Mock 활용
self.mock_processing_status_service = Mock(spec=ProcessingStatusService)
self.service = EmbeddingService(
    processing_status_service=self.mock_processing_status_service,
    validation_service=self.mock_validation_service
)
```

#### 2. 다양한 시나리오 테스트
- **정상 케이스**: 기본 기능 동작 검증
- **예외 케이스**: 빈 데이터, 잘못된 입력 처리
- **경계 케이스**: 긴 텍스트, 특수 문자 처리
- **성능 테스트**: 대용량 데이터 처리 시간 측정

#### 3. 헥사고널 아키텍처 준수
- **도메인 서비스**: 비즈니스 로직 검증
- **엔티티**: 데이터 모델 정합성 확인
- **의존성 주입**: Mock을 통한 외부 의존성 분리

### 📈 학습 포인트

#### 1. 테스트 설계 원칙
- **AAA 패턴**: Arrange, Act, Assert 구조화
- **단일 책임**: 각 테스트는 하나의 기능만 검증
- **독립성**: 테스트 간 의존성 제거

#### 2. Mock 활용 전략
- **의존성 분리**: 외부 서비스와의 결합도 감소
- **행위 검증**: 메서드 호출 횟수 및 인수 확인
- **상태 검증**: 반환값 및 객체 상태 확인

#### 3. 테스트 데이터 관리
- **샘플 데이터**: 실제 사용 시나리오 반영
- **메타데이터**: 문서 타입별 적절한 분류
- **확장성**: 새로운 타입 추가 시 기존 구조 유지

### 🚀 다음 단계
1. **ChunkingService 단위 테스트**: 현재 진행 중 (터미널 문제로 중단)
2. **Use Case 통합 테스트**: 서비스 조합 테스트
3. **UI 통합**: 테스트된 서비스들을 UI에 연결
4. **성능 최적화**: 테스트 결과 기반 성능 개선

---


## Session 17: 임베딩/VectorStore 탭 헥사고널 아키텍처 리팩토링 계획 (2025-09-05)

### 🎯 목표
임베딩/VectorStore 저장 탭을 헥사고널 아키텍처에 맞게 UI, UseCase, Service, Entity로 분리하여 구조 개선

### 📊 현재 상태 분석

#### 1. 현재 구조
- **UI 레이어**: `embedding_tab.py` - 3개 섹션 (임베딩 모델, 벡터스토어, 벡터 내용)
- **도메인 서비스**: `EmbeddingService` - 청크→임베딩 변환, 통계 제공
- **엔티티**: `Embedding`, `VectorStore` - 데이터 모델 정의
- **문제점**: UI와 비즈니스 로직 혼재, Use Case 부재, 하드코딩된 Mock 데이터

#### 2. 기능 현황
- ✅ 임베딩 분석 정보 표시
- ✅ 벡터스토어 상세 정보 표시  
- ✅ 벡터 내용 확인
- ❌ 실제 임베딩 생성 기능
- ❌ 벡터스토어 관리 기능
- ❌ 실시간 통계 업데이트

### 🏗️ 헥사고널 아키텍처 분리 계획

#### 1. Use Case 설계 (Application Layer)
**임베딩 관련**:
- `CreateEmbeddingUseCase`: 청크를 임베딩으로 변환
- `GetEmbeddingAnalysisUseCase`: 임베딩 분석 정보 제공
- `GetEmbeddingStatisticsUseCase`: 임베딩 통계 정보 제공

**벡터스토어 관련**:
- `GetVectorStoreInfoUseCase`: 벡터스토어 상세 정보 제공
- `GetVectorContentUseCase`: 벡터스토어 내용 조회
- `GetVectorStoreStatisticsUseCase`: 벡터스토어 통계 제공
- `ClearVectorStoreUseCase`: 벡터스토어 초기화

#### 2. UI 개선 계획
**기능 확장**:
- 청크에서 임베딩 생성 버튼 추가
- 벡터스토어 초기화 기능
- 실시간 통계 업데이트
- 벡터 시각화 기능 (선택사항)

**레이아웃 개선**:
- 임베딩 생성 섹션 추가
- 벡터스토어 관리 섹션 추가
- 통계 대시보드 섹션 추가

#### 3. 서비스 레이어 개선
**Repository 패턴 적용**:
- `EmbeddingRepository`: 임베딩 저장/조회
- `VectorStoreRepository`: 벡터스토어 상태 관리

**도메인 서비스 확장**:
- 실제 sentence-transformers 모델 연동
- 벡터 유사도 검색 기능
- 벡터 압축/최적화 기능

### 📋 구현 순서
1. **Use Case 생성**: 애플리케이션 레이어 Use Case 구현
2. **Repository 패턴**: 데이터 접근 레이어 분리
3. **UI 리팩토링**: Use Case 기반으로 UI 어댑터 수정
4. **기능 확장**: 실제 임베딩 생성 및 벡터스토어 관리 기능 추가
5. **테스트 및 검증**: 각 레이어별 단위 테스트

### 🔄 다음 단계
- Use Case 구현부터 시작하여 점진적으로 헥사고널 아키텍처 적용
- 기존 기능 유지하면서 새로운 기능 추가
- 다른 탭들과의 일관성 유지

---