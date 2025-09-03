# 설정 관리 시스템

이 디렉토리는 AI Portfolio 서비스의 모든 설정을 중앙에서 관리하는 시스템입니다.

## 구조

```
src/shared/config/
├── config_manager.py            # 설정 관리 클래스
├── prompt_config.py             # 프롬프트 관리 클래스
├── prompts/                     # 프롬프트 설정 디렉토리
│   ├── system_prompts.yaml     # 시스템 프롬프트 정의
│   ├── rag_prompts.yaml        # RAG 관련 프롬프트
│   ├── templates/              # 작업별 프롬프트 템플릿
│   │   ├── summary.yaml        # 요약 작업 템플릿
│   │   ├── classification.yaml # 분류 작업 템플릿
│   │   └── project_description.yaml # 프로젝트 설명 템플릿
│   └── README.md              # 프롬프트 설정 가이드
└── README.md                   # 이 파일

Note: 애플리케이션 설정 파일들은 루트의 config/ 디렉토리로 이동했습니다:
- config/production.yaml  # 프로덕션 환경 설정
- config/demo.yaml        # 데모 환경 설정
```

## 주요 컴포넌트

### 1. ConfigManager (`config_manager.py`)
- API 키, 데이터베이스 설정, 캐시 설정 등 인프라 설정 관리
- 환경 변수와 설정 파일의 우선순위 처리
- 민감한 정보 보호 및 검증

### 2. PromptManager (`prompt_config.py`)
- 모든 LLM 프롬프트의 중앙 집중식 관리
- 시스템 프롬프트, RAG 프롬프트, 작업별 템플릿 관리
- 동적 프롬프트 로딩 및 유효성 검증

### 3. 환경별 설정 파일
- `config/production.yaml`: 프로덕션 환경 설정
- `config/demo.yaml`: 데모 환경 설정  
- 민감한 정보는 환경 변수로 주입

## 사용 방법

### 설정 매니저 사용
```python
from src.shared.config.config_manager import get_config_manager

config_manager = get_config_manager()
llm_config = config_manager.get_llm_config("openai")
db_config = config_manager.get_database_config()
```

### 프롬프트 매니저 사용
```python
from src.shared.config.prompt_config import get_prompt_manager

prompt_manager = get_prompt_manager()
system_prompt = prompt_manager.get_system_prompt("main_assistant")
```

## 환경 변수 설정

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

## 헥사고날 아키텍처에서의 위치

이 설정 시스템은 `src/shared/config/`에 위치하여:

- **도메인 레이어** (`core/`): 도메인 설정 접근
- **애플리케이션 레이어** (`application/`): 서비스 설정 접근  
- **인프라 레이어** (`adapters/`): 외부 시스템 설정 접근

모든 레이어에서 공통으로 사용할 수 있습니다.

## 테스트

설정 시스템을 테스트하려면:

```bash
python test_prompt_manager.py
```

이 스크립트는 설정 매니저와 프롬프트 매니저의 모든 기능을 테스트합니다.
