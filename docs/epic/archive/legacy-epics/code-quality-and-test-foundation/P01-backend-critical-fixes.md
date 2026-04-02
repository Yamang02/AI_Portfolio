# P01: 백엔드 핵심 결함 수정

## 목표

AI 응답 품질과 설정 정확성에 직접 영향을 주는 결함 3가지를 수정한다.
이 Phase 완료 후 챗봇이 실제 포트폴리오 데이터를 알고 응답하게 된다.

## 구현 상세

### 1. 시스템 프롬프트에 포트폴리오 데이터 주입

**문제:** `ChatApplicationService.buildSystemPrompt()`가 3줄짜리 범용 문장만 반환.
DB에 프로젝트, 기술 스택, 경험 데이터가 있지만 AI에게 전혀 전달되지 않음.

**접근:**
- `PortfolioApplicationService` 또는 관련 UseCase를 `ChatApplicationService`에 의존성 주입
- `buildSystemPrompt()`에서 프로젝트 목록, 기술 스택, 경험 데이터를 조회하여 컨텍스트 구성
- 토큰 예산 고려: 핵심 정보만 요약 형태로 포함

**변경 파일:**
- `backend/.../application/chatbot/ChatApplicationService.java` (주요 변경)

### 2. Gemini 모델명 설정값 주입

**문제:** `GeminiLLMAdapter`의 `DEFAULT_MODEL_NAME = "gemini-2.0-flash-exp"` 상수가 하드코딩.
`application-production.yml`의 `app.gemini.model-name: gemini-2.5-flash` 설정이 실제로 적용 안 됨.

**접근:**
- `DEFAULT_MODEL_NAME` 상수 제거
- `@Value("${app.gemini.model-name:gemini-2.0-flash-exp}")` 주입으로 교체

**변경 파일:**
- `backend/.../infrastructure/llm/GeminiLLMAdapter.java`

### 3. LLMException 중복 정의 제거

**문제:** `domain/.../exception/LLMException.java`와 `LLMPort.LLMException` 두 곳 존재.
`GeminiLLMAdapter`와 `ChatApplicationService`는 `LLMPort.LLMException`만 사용하므로
도메인 예외 파일이 데드코드처럼 보이지만, 도메인 예외는 `domain/` 패키지에 정의하는 것이 원칙.

**접근:**
- `domain/.../exception/LLMException.java`를 **유지** (도메인 예외 원칙 준수)
- `LLMPort` 내부 static 클래스 `LLMException`을 **삭제**
- `GeminiLLMAdapter`와 `ChatApplicationService`가 도메인 예외를 import하도록 변경

**변경 파일:**
- `backend/.../domain/chatbot/port/out/LLMPort.java` (내부 LLMException 삭제)
- `backend/.../infrastructure/adapters/outbound/llm/GeminiLLMAdapter.java` (import 변경)
- `backend/.../application/chatbot/ChatApplicationService.java` (import 변경)

## 체크리스트

- [ ] `ChatApplicationService.buildSystemPrompt()`가 프로젝트, 기술 스택, 경험 데이터를 포함한 컨텍스트 반환
- [ ] 로컬에서 챗봇에 "내 프로젝트 알려줘" 질문 시 실제 DB 데이터 기반 응답 확인
- [ ] `GeminiLLMAdapter`에서 하드코딩 모델명 제거, `@Value` 주입으로 교체 확인
- [ ] `application-production.yml`의 모델명 변경 시 실제 반영되는지 확인
- [ ] `LLMPort` 내부 static `LLMException` 삭제, `domain/.../exception/LLMException.java` 유지 확인
- [ ] `GeminiLLMAdapter`, `ChatApplicationService`가 도메인 예외를 import하는지 확인
- [ ] 빌드 성공 확인 (`./mvnw clean compile`)
