# 설정 가이드

AI Portfolio 프로젝트의 설정 관리 방법입니다.

## 설정 파일 구조

- `app_config.yaml`: 메인 설정 파일 (필수)
- `langchain-config.yaml`: LangChain 전용 설정 (선택)
- `.env`: 환경변수 파일 (민감한 정보)

## 초기 설정

1. 예시 파일들을 복사하여 실제 설정 파일 생성:
   ```bash
   cp app_config.yaml.example app_config.yaml
   cp .env.example .env
   ```

2. `app_config.yaml`에서 필요한 설정값 수정

3. `.env` 파일에 API 키와 민감한 정보 설정

## 설정 우선순위

1. 환경변수 (최우선)
2. YAML 설정 파일
3. ~~기본값~~ (제거됨 - 모든 설정은 명시적으로 제공되어야 함)

## 필수 설정 항목

모든 설정은 반드시 YAML 파일 또는 환경변수로 제공되어야 합니다:

### LLM 설정
- `llm.openai.model_name`
- `llm.openai.temperature`
- `llm.openai.max_tokens`
- `llm.google.model_name`
- `llm.google.temperature`
- `llm.google.max_output_tokens`

### 데이터베이스 설정
- `database.host`
- `database.port`
- `database.database`
- `database.username`
- `database.password`

### 캐시 설정
- `cache.host`
- `cache.port`
- `cache.database`

### 로깅 설정
- `logging.level`
- `logging.format`

### LangChain 설정
- `langchain.korean.text_splitter.chunk_size`
- `langchain.korean.text_splitter.chunk_overlap`
- `langchain.korean.text_splitter.separators`
- `langchain.rag.chunk_size`
- `langchain.rag.chunk_overlap`
- `langchain.rag.top_k`
- `langchain.rag.similarity_threshold`

## 환경변수 매핑

다음 환경변수들이 설정을 오버라이드합니다:

- `OPENAI_API_KEY` → `llm.openai.api_key`
- `GOOGLE_API_KEY` → `llm.google.api_key`
- `DB_HOST` → `database.host`
- `DB_PORT` → `database.port`
- `DB_NAME` → `database.database`
- `DB_USERNAME` → `database.username`
- `DB_PASSWORD` → `database.password`
- `REDIS_HOST` → `cache.host`
- `REDIS_PORT` → `cache.port`
- `REDIS_PASSWORD` → `cache.password`
- `LOG_LEVEL` → `logging.level`

## 주의사항

- 설정 파일에서 기본값이 제거되었으므로 모든 필수 설정을 명시적으로 제공해야 합니다
- 설정이 누락된 경우 애플리케이션이 시작되지 않습니다
- API 키와 비밀번호는 반드시 환경변수로 설정하는 것을 권장합니다
- `.env` 파일은 git에 커밋하지 마세요 (`.gitignore`에 이미 포함됨)