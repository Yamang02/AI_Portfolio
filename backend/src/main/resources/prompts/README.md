# 챗봇 프롬프트 관리

이 디렉토리는 AI 챗봇의 프롬프트를 관리하는 파일들을 포함합니다.

## 📁 파일 구조

### `chatbot-prompts.md` (권장)
챗봇의 모든 프롬프트를 개발자가 쉽게 확인하고 수정할 수 있는 Markdown 문서입니다.
- **가독성**: 구조화된 형태로 프롬프트 확인 가능
- **편집성**: 직관적인 Markdown 형식으로 수정 용이
- **문서화**: 각 프롬프트의 용도와 예시 포함

### `chatbot-prompts.json`
챗봇의 모든 프롬프트와 패턴을 정의하는 메인 설정 파일입니다.
- **실행 파일**: 실제 애플리케이션에서 사용
- **자동 생성**: Markdown 파일에서 변환 스크립트로 생성
- **API 연동**: PromptService에서 직접 로드

#### 구조:
```json
{
  "system": {
    "main": "시스템 프롬프트 (AI의 기본 역할과 규칙 정의)"
  },
  "contextual": {
    "general_skill": "전반적인 기술 스택 질문용 프롬프트",
    "technical": "기술적 세부사항 질문용 프롬프트",
    "overview": "프로젝트 개요 질문용 프롬프트",
    "comparison": "비교 분석 질문용 프롬프트",
    "challenge": "도전과제 질문용 프롬프트",
    "general": "일반 질문용 프롬프트"
  },
  "patterns": {
    "general_skill": ["전반적인 기술 스택 질문 패턴들"],
    "specific_project": ["특정 프로젝트 질문 패턴들"]
  }
}
```

## 프롬프트 타입

### 1. System Prompt
- AI의 기본 역할과 성격 정의
- 응답 규칙과 금지사항 명시
- 답변 상세도 조절 가이드 포함

### 2. Contextual Prompts
각 질문 타입에 맞는 구체적인 프롬프트:

- **general_skill**: 개발자의 전반적인 기술 스택 질문
- **technical**: 기술적 세부사항 질문
- **overview**: 프로젝트 개요/소개 질문
- **comparison**: 비교 분석 질문
- **challenge**: 도전과제/문제해결 질문
- **general**: 기타 일반 질문

### 3. Patterns
질문 타입을 분석하기 위한 키워드 패턴들:

- **general_skill**: 전반적인 기술 스택 질문 감지 패턴
- **specific_project**: 특정 프로젝트 질문 감지 패턴

## 변수 치환

프롬프트에서 다음 변수들을 사용할 수 있습니다:

- `{question}`: 사용자의 질문
- `{projectContext}`: 프로젝트 컨텍스트 정보

### `PromptConverter.java`
Markdown 파일을 JSON으로 변환하는 Java 유틸리티 클래스입니다.
- **Java 네이티브**: Python 의존성 없이 Java로 구현
- **Spring 통합**: Spring Boot 애플리케이션과 완벽 통합
- **API 제공**: REST API를 통한 변환 기능 제공

## 🛠️ 관리 방법

### 1. 프롬프트 수정 (권장 방법)
```bash
# 1. Markdown 파일 수정
vim chatbot-prompts.md

# 2. JSON으로 변환 (Java API 사용)
curl -X POST http://localhost:8080/api/prompts/convert

# 3. API 재로드
curl -X POST http://localhost:8080/api/prompts/reload
```

### 2. 직접 JSON 수정
`chatbot-prompts.json` 파일을 직접 수정하여 프롬프트를 변경할 수 있습니다.

### 2. 실시간 재로드
API를 통해 프롬프트를 재로드할 수 있습니다:
```bash
POST /api/prompts/reload
```

### 3. 프롬프트 조회
현재 사용 중인 프롬프트를 확인할 수 있습니다:
```bash
GET /api/prompts/system
GET /api/prompts/patterns
```

### 4. Markdown 변환
Markdown 파일을 JSON으로 변환할 수 있습니다:
```bash
POST /api/prompts/convert
```

## ⚠️ 주의사항

### Markdown 파일 사용 시
1. **구조 준수**: Markdown 헤딩 구조를 정확히 유지해야 합니다.
2. **코드 블록**: 프롬프트는 반드시 ``` ``` 코드 블록 안에 작성해야 합니다.
3. **변수명 일치**: 변수 치환을 사용할 때 정확한 변수명을 사용해야 합니다.
4. **인코딩**: 한글 텍스트는 UTF-8 인코딩을 사용합니다.

### JSON 파일 직접 수정 시
1. **JSON 형식 준수**: 파일 수정 시 올바른 JSON 형식을 유지해야 합니다.
2. **변수명 일치**: 변수 치환을 사용할 때 정확한 변수명을 사용해야 합니다.
3. **인코딩**: 한글 텍스트는 UTF-8 인코딩을 사용합니다.
4. **백업**: 중요한 변경 전에는 파일을 백업하는 것을 권장합니다.

## 📝 예시

### 전반적인 기술 스택 질문 예시:
```
사용자: "다룰 수 있는 언어와 기술이 뭐야?"
→ general_skill 프롬프트 사용
→ 간결하고 요약된 답변 제공
```

### 특정 프로젝트 질문 예시:
```
사용자: "이 프로젝트에서 어떤 기술을 사용했어?"
→ specific_project 패턴 감지
→ 해당 프로젝트의 상세한 기술 정보 제공
```

## 🔄 워크플로우

### 개발자 워크플로우
1. **프롬프트 확인**: `chatbot-prompts.md` 파일 열기
2. **수정**: Markdown 형식으로 프롬프트 수정
3. **변환**: `python convert-md-to-json.py` 실행
4. **테스트**: API 재로드 후 챗봇 테스트
5. **검증**: 답변 품질 및 금지사항 준수 확인

### 자동화 워크플로우
```bash
# 개발 중 빠른 수정
vim chatbot-prompts.md && curl -X POST http://localhost:8080/api/prompts/convert && curl -X POST http://localhost:8080/api/prompts/reload
```

## 🎯 장점

### Markdown 문서화의 장점
- **가독성**: 구조화된 형태로 프롬프트 확인 가능
- **편집성**: 직관적인 Markdown 형식으로 수정 용이
- **문서화**: 각 프롬프트의 용도와 예시 포함
- **버전 관리**: Git에서 변경사항 추적 용이
- **협업**: 팀원 간 프롬프트 공유 및 리뷰 가능

### Java 기반 시스템의 장점
- **언어 일관성**: Java 프로젝트에 Python 의존성 없음
- **배포 간소화**: 추가 런타임 환경 불필요
- **보안 강화**: 외부 스크립트 실행 위험 제거
- **Spring 통합**: Spring Boot 생태계와 완벽 통합
- **API 제공**: REST API를 통한 원격 변환 가능 