# 프롬프트 관리 시스템

이 디렉토리는 AI 서비스에서 사용되는 모든 프롬프트를 중앙에서 관리하는 시스템입니다.

## 구조

```
src/shared/config/
├── app_config.yaml          # 애플리케이션 기본 설정
├── config_manager.py        # 설정 관리 클래스
├── prompt_config.py         # 프롬프트 관리 클래스
├── prompts/                 # 프롬프트 설정 디렉토리
│   ├── system_prompts.yaml  # 시스템 프롬프트 정의
│   ├── rag_prompts.yaml     # RAG 관련 프롬프트
│   ├── templates/           # 작업별 프롬프트 템플릿
│   │   ├── summary.yaml     # 요약 작업 템플릿
│   │   ├── classification.yaml # 분류 작업 템플릿
│   │   └── project_description.yaml # 프로젝트 설명 템플릿
│   └── README.md           # 이 파일
└── README.md               # 전체 설정 가이드
```

## 시스템 프롬프트 (system_prompts.yaml)

AI 어시스턴트의 기본 역할과 특징을 정의합니다.

### 주요 프롬프트

- **main_assistant**: 메인 AI 어시스턴트 역할
- **summary_writer**: 요약 작성 전문가
- **keyword_extractor**: 키워드 추출 전문가
- **question_classifier**: 질문 분류 전문가

### 구조

```yaml
main_assistant:
  role: "역할 설명"
  description: "상세 설명"
  characteristics:
    - "특징 1"
    - "특징 2"
  guidelines:
    - "가이드라인 1"
    - "가이드라인 2"
```

## RAG 프롬프트 (rag_prompts.yaml)

Retrieval-Augmented Generation을 위한 프롬프트를 정의합니다.

### 주요 프롬프트

- **basic_rag**: 기본 RAG 프롬프트
- **hybrid_rag**: 하이브리드 검색 RAG
- **enhanced_rag**: 메타데이터 강화 RAG

### 구조

```yaml
basic_rag:
  system: "main_assistant"  # 시스템 프롬프트 참조
  human_template: |
    컨텍스트: {context}
    질문: {question}
    ...
```

## 작업별 템플릿 (templates/)

특정 작업을 위한 프롬프트 템플릿을 정의합니다.

### 요약 템플릿 (summary.yaml)

- **general_summary**: 일반 텍스트 요약
- **project_summary**: 프로젝트 요약
- **tech_doc_summary**: 기술 문서 요약
- **experience_summary**: 경험/경력 요약

### 분류 템플릿 (classification.yaml)

- **basic_classification**: 기본 질문 분류
- **detailed_classification**: 상세 분류
- **tech_classification**: 기술 질문 분류

### 프로젝트 설명 템플릿 (project_description.yaml)

- **basic_project_description**: 기본 프로젝트 설명
- **detailed_project_description**: 상세 프로젝트 설명
- **project_improvements**: 개선사항 제안
- **tech_explanation**: 기술 설명

## 사용 방법

### 1. 프롬프트 매니저 초기화

```python
from config.prompt_config import get_prompt_manager

prompt_manager = get_prompt_manager()
```

### 2. 시스템 프롬프트 가져오기

```python
system_prompt = prompt_manager.get_system_prompt("main_assistant")
```

### 3. RAG 프롬프트 가져오기

```python
rag_config = prompt_manager.get_rag_prompt("basic_rag")
```

### 4. 작업별 템플릿 사용

```python
prompt_config = prompt_manager.build_prompt(
    "summary", "general_summary",
    content="요약할 내용",
    max_length=200
)
```

### 5. 프롬프트 유효성 검증

```python
errors = prompt_manager.validate_prompts()
if any(errors.values()):
    print("프롬프트 오류 발견:", errors)
```

## 장점

1. **중앙 집중식 관리**: 모든 프롬프트를 한 곳에서 관리
2. **동적 로딩**: 런타임에 프롬프트 수정 가능
3. **재사용성**: 프롬프트 템플릿 재사용
4. **유지보수성**: 코드 수정 없이 프롬프트 변경
5. **다국어 지원**: 언어별 프롬프트 관리 용이
6. **버전 관리**: 프롬프트 변경 이력 추적

## 프롬프트 수정

프롬프트를 수정하려면:

1. 해당 YAML 파일을 편집
2. 변경사항 저장
3. 필요시 `prompt_manager.reload_prompts()` 호출

## 주의사항

- YAML 파일의 들여쓰기를 정확히 유지
- 변수명은 `{variable_name}` 형식 사용
- 시스템 프롬프트 키는 정확히 참조
- 템플릿 변수는 필수 파라미터와 일치해야 함

## 테스트

프롬프트 매니저와 설정 매니저를 테스트하려면:

```bash
python test_prompt_manager.py
```

이 스크립트는 다음을 테스트합니다:
- 프롬프트 설정 로드 및 유효성 검증
- 설정 매니저의 API 키 및 환경 설정 로드
- LLM, 데이터베이스, 캐시 설정 검증

## 환경 변수 설정

필요한 환경 변수들:

```bash
# LLM API 키
export OPENAI_API_KEY="your-openai-api-key"
export GOOGLE_API_KEY="your-google-api-key"

# 데이터베이스
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_NAME="ai_portfolio"
export DB_USERNAME="postgres"
export DB_PASSWORD="your-db-password"

# Redis 캐시
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export REDIS_PASSWORD="your-redis-password"
```
