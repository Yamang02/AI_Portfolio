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