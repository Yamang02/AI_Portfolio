---
version: 1.1
valid_from_date: 2025-08-31
---

# 아키텍처 Q&A

이 문서는 AI 포트폴리오 프로젝트의 아키텍처와 관련된 주요 질문과 답변을 포함합니다.

---

### Q: 백엔드는 어떤 아키텍처 패턴을 사용하나요?

> 헥사고날 아키텍처(Ports and Adapters)를 적용했습니다. 도메인 로직을 중심으로 하고 외부 의존성을 포트와 어댑터로 분리하여 테스트 가능성과 유지보수성을 향상시켰습니다.
> 
> **주요 구성요소**:
> - **Domain**: 핵심 비즈니스 로직과 포트 인터페이스
> - **Application**: 유스케이스 구현체
> - **Infrastructure**: 외부 시스템과의 어댑터 (DB, API, Web)

---

### Q: 패키지 구조는 어떻게 구성되어 있나요?

> 도메인별로 분리된 구조입니다:
> ```text
> com.aiportfolio.backend/
> ├── domain/
> │   ├── chatbot/
> │   │   ├── model/       # 도메인 모델
> │   │   └── port/        # 포트 인터페이스
> │   └── portfolio/
> │       ├── model/
> │       └── port/
> ├── application/         # 유스케이스 구현
> │   ├── chatbot/
> │   └── portfolio/
> └── infrastructure/      # 어댑터 구현
>     ├── persistence/
>     ├── external/
>     └── web/
> ```

---

### Q: 아키텍처 리팩토링 과정에서 주요 개선사항은?

> 1. **도메인 격리**: 각 도메인(chatbot, portfolio)을 독립적으로 분리
> 2. **의존성 역전**: 도메인이 인프라에 의존하지 않도록 포트 인터페이스 도입
> 3. **레이어 분리**: 웹, 애플리케이션, 도메인 레이어 명확히 구분
> 4. **테스트 용이성**: 모킹 가능한 구조로 변경

---

### Q: 왜 Spring Boot를 선택했나요?

> 1. **생산성**: 자동 설정과 스타터 의존성으로 빠른 개발
> 2. **생태계**: 풍부한 라이브러리와 커뮤니티 지원
> 3. **운영**: Actuator를 통한 모니터링 및 헬스체크
> 4. **확장성**: 마이크로서비스 아키텍처로의 확장 용이성

---

### Q: RAG 시스템의 헥사고날 아키텍처는 어떻게 구현되었나요?

> RAG의 각 단계를 포트-어댑터 패턴으로 완전히 분리하여 구현했습니다:
> 
> **Core Domain Layer (중앙)**:
> - Document, DocumentChunk, EmbeddingVector 등 핵심 도메인 모델
> - RAG 오케스트레이터와 검색 전략 서비스
> 
> **Application Layer (유스케이스)**:
> - rag_pipeline_service.py: RAG 파이프라인 전체 관리
> - document_processing_service.py: 문서 로드 및 전처리
> - embedding_service.py: 임베딩 생성 및 관리
> - retrieval_service.py: 검색 및 랭킹
> 
> **Port Interfaces (추상화)**:
> - DocumentLoaderPort: 문서 로딩 추상화
> - TextSplitterPort: 텍스트 분할 추상화  
> - EmbeddingPort: 임베딩 생성 추상화
> - VectorStorePort: 벡터 저장/검색 추상화
> 
> **Secondary Adapters (구현체)**:
> - PostgreSQL/JSON 문서 로더
> - Semantic/Recursive 텍스트 분할기
> - SentenceTransformers/캐시 임베딩 어댑터
> - Qdrant 벡터 스토어 어댑터

---

### Q: 지능형 RAG 시스템의 핵심 혁신은 무엇인가요?

> 기존 하드코딩된 키워드 기반 시스템을 임베딩 기반 지능형 시스템으로 완전히 전환했습니다:
> 
> **1. 지능형 쿼리 분류**:
> - IntelligentQueryClassifier: SentenceTransformer 기반 의미적 분류
> - 한국어 최적화 모델 (jhgan/ko-sroberta-multitask) 사용
> - 템플릿 기반 카테고리 분류와 신뢰도 계산
> 
> **2. 동적 전략 팩토리**:
> - AdaptiveStrategyFactory: 설정 기반 전략 생성
> - JSON 파일을 통한 전략 외부화
> - 런타임 전략 업데이트 지원
> 
> **3. RAG Orchestrator**:
> - 전체 RAG 파이프라인 자동 조율
> - 지능형 전략 선택 및 성능 메트릭 수집
> - 자동 최적화 기능

---

### Q: 설정 관리 시스템은 어떻게 구현되었나요?

> 헥사고날 아키텍처를 준수하는 중앙집중식 설정 관리 시스템을 구축했습니다:
> 
> **구조**:
> ```
> src/shared/config/          # 헥사고널 아키텍처 준수
> ├── config_manager.py       # 중앙 설정 관리
> ├── prompt_config.py        # 프롬프트 관리
> ├── app_config.yaml         # 기본 설정
> └── prompts/               # 프롬프트 설정 파일들
>     ├── system_prompts.yaml
>     ├── rag_prompts.yaml
>     └── templates/
> ```
> 
> **주요 특징**:
> - ConfigManager: API 키와 환경 설정 중앙 관리
> - PromptManager: 하드코딩된 프롬프트 완전 제거
> - 환경 변수 기반 보안 강화
> - 계층적 fallback 구조 (설정 파일 → 기본값 → 하드코딩)
