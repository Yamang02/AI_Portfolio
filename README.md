# AI 포트폴리오 챗봇

개발자 포트폴리오를 위한 AI 챗봇 애플리케이션입니다. Google Gemini API를 사용하여 프로젝트 정보를 자연스럽게 소개합니다.

## 주요 기능

- 🤖 **AI 챗봇**: Google Gemini API 기반 자연어 대화
- 📊 **GitHub 연동**: 실제 GitHub 레포지토리 정보 동적 가져오기
- 🎯 **프로젝트 선택**: 인터랙티브 프로젝트 선택 버튼
- 💬 **자연스러운 대화**: 구조화된 프롬프트 시스템으로 자연스러운 응답
- ⚡ **캐시 시스템**: 24시간 캐시로 성능 최적화

## 기술 스택

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API
- **데이터**: GitHub API
- **배포**: Google Cloud Run

## 프로젝트 구조

```
services/
├── prompts/           # AI 챗봇 프롬프트 관리
│   ├── chatbotPersona.ts      # 챗봇 페르소나 정의
│   ├── conversationPatterns.ts # 대화 패턴 관리
│   └── index.ts               # 프롬프트 시스템 통합
├── geminiService.ts   # Gemini API 연동
├── githubService.ts   # GitHub API 연동
└── projectService.ts  # 프로젝트 데이터 관리
```

## 프롬프트 시스템

### 챗봇 페르소나 (`chatbotPersona.ts`)
- 챗봇의 역할과 성격 정의
- 답변 스타일 가이드라인
- 좋은/나쁜 답변 예시

### 대화 패턴 (`conversationPatterns.ts`)
- 질문 유형별 분류
- 답변 가이드라인
- 자연스러운 대화 흐름

## 로컬 실행

**필수 조건:** Node.js

1. 의존성 설치:
   ```bash
   npm install
   ```

2. 환경 변수 설정:
   - `.env.local` 파일에 `GEMINI_API_KEY` 설정
   - GitHub 사용자명 확인 (`services/geminiService.ts`의 `Yamang02` 부분)

3. 개발 서버 실행:
   ```bash
   npm run dev
   ```

## 배포

Google Cloud Run을 통한 자동 배포가 설정되어 있습니다.
