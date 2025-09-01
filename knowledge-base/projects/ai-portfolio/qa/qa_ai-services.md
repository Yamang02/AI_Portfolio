---
version: 1.1
valid_from_date: 2025-08-31
---

# AI 서비스 Q&A

이 문서는 AI 포트폴리오 프로젝트의 AI 서비스와 관련된 주요 질문과 답변을 포함합니다.

---

### Q: AI 챗봇은 어떤 기술로 구현되었나요?

> Python 기반의 독립 마이크로서비스로 구현되었습니다.
> 
> **주요 기술 스택**:
> - **LLM**: Google Gemini API
> - **Framework**: FastAPI
> - **Vector DB**: Qdrant
> - **Cache**: Redis
> - **Embeddings**: Sentence Transformers
> - **Orchestration**: 자체 구현

---

### Q: RAG(Retrieval Augmented Generation) 시스템은 어떻게 구현했나요?

> 지능형 임베딩 기반 RAG 파이프라인을 구축했습니다:
> 
> **지능형 처리 과정**:
> 1. **지능형 질문 분류**: IntelligentQueryClassifier가 SentenceTransformer로 질문 유형을 의미적으로 분류
> 2. **동적 전략 선택**: AdaptiveStrategyFactory가 질문 유형에 최적화된 검색 전략을 동적 생성
> 3. **벡터 검색**: 선택된 전략에 따라 Qdrant에서 최적화된 검색 수행
> 4. **컨텍스트 구성**: RAG Orchestrator가 검색 결과를 지능적으로 조합
> 5. **응답 생성**: Gemini API로 최종 답변 생성
> 6. **성능 추적**: 실시간 메트릭 수집 및 자동 최적화
> 
> **핵심 혁신**:
> - 하드코딩된 키워드 매칭 → 임베딩 기반 의미적 분류
> - 정적 전략 → JSON 설정 기반 동적 전략
> - 수동 최적화 → 자동 성능 모니터링 및 최적화

---

### Q: 벡터 데이터베이스는 왜 Qdrant를 선택했나요?

> 1. **성능**: 고속 벡터 유사도 검색
> 2. **스케일링**: 대용량 임베딩 처리 가능
> 3. **필터링**: 메타데이터 기반 필터링 지원
> 4. **API**: RESTful API로 쉬운 통합
> 5. **Docker**: 컨테이너 기반 배포 지원

---

### Q: 캐싱 전략은?

> Redis를 활용한 다층 캐싱:
> 
> **캐시 레이어**:
> - **질문-응답 캐시**: 동일 질문에 대한 즉시 응답
> - **벡터 검색 캐시**: 유사 질문의 검색 결과 재사용
> - **컨텍스트 캐시**: 구성된 프롬프트 임시 저장
> 
> **캐시 전략**:
> - **TTL**: 1시간 (질문-응답), 24시간 (벡터 검색)
> - **Eviction**: LRU 정책
> - **Warm-up**: 주요 질문들 사전 캐싱

---

### Q: 프롬프트는 어떻게 관리하나요?

> 구조화된 프롬프트 시스템으로 관리합니다:
> 
> **파일 위치**: `backend/src/main/resources/prompts/`
> - `chatbot-prompts.json`: 구조화된 프롬프트 데이터
> - `chatbot-prompts.md`: 프롬프트 문서화
> 
> **프롬프트 구성요소**:
> - **System Message**: AI의 역할과 성격 정의
> - **Context Template**: RAG 검색 결과 삽입 템플릿
> - **Response Format**: 응답 형식 가이드라인

---

### Q: AI 응답의 품질은 어떻게 보장하나요?

> 다층적 품질 관리 시스템:
> 
> **입력 검증**:
> - 스팸/악성 질문 필터링
> - 질문 길이 및 형식 검증
> - 부적절한 내용 차단
> 
> **응답 검증**:
> - 컨텍스트 일치성 확인
> - 환각(Hallucination) 감지
> - 응답 길이 및 구조 검증
> 
> **모니터링**:
> - 응답 시간 모니터링
> - 오류율 추적
> - 사용자 만족도 측정

---

### Q: 지능형 쿼리 분류기는 어떻게 작동하나요?

> 임베딩 기반 의미적 분류 시스템을 구축했습니다:
> 
> **핵심 구조**:
> - **모델**: jhgan/ko-sroberta-multitask (한국어 최적화)
> - **템플릿 시스템**: 카테고리별 의미적 템플릿 문장들의 평균 임베딩
> - **신뢰도 계산**: 1위와 2위 점수 차이로 분류 신뢰도 산출
> 
> **분류 과정**:
> 1. 질문을 벡터로 임베딩
> 2. 각 카테고리 템플릿과 코사인 유사도 계산
> 3. 최고 유사도 카테고리 선택 및 신뢰도 계산
> 4. 신뢰도 임계값 기반 분류 결과 반환
> 
> **장점**:
> - 키워드 매칭보다 의미적으로 정확한 분류
> - 온라인 학습으로 지속적 성능 개선
> - 다국어 질문 처리 가능

---

### Q: 동적 전략 팩토리는 어떤 기능을 제공하나요?

> JSON 설정 기반 RAG 전략을 동적으로 생성하는 시스템입니다:
> 
> **주요 기능**:
> - **템플릿 시스템**: project_focused, experience_focused, skill_focused 등 기본 템플릿
> - **설정 파일 지원**: JSON 파일로 전략을 외부화하여 코드 변경 없이 수정 가능
> - **런타임 로딩**: 설정 파일 변경 시 즉시 전략 업데이트
> - **커스터마이징**: 기본 템플릿에 overrides 적용으로 세밀한 조정
> 
> **설정 예시**:
> ```json
> {
>   "name": "ai_portfolio_specialized_strategy",
>   "target_query_types": ["project", "experience"],
>   "base_score": 0.8,
>   "document_filters": {
>     "document_types": ["project", "experience"],
>     "priority_min": 6
>   },
>   "search": {
>     "top_k": 7,
>     "similarity_threshold": 0.72,
>     "boost_settings": {
>       "tech_stack_boost": 2.2,
>       "recent_project_boost": 1.8
>     }
>   }
> }
> ```
> 
> **효과**:
> - 질문 유형별 최적화된 검색 전략
> - 하드코딩 제거로 유지보수성 향상
> - A/B 테스트 및 성능 비교 용이성
