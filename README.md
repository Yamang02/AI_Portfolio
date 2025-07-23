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

## 🚀 로컬 실행

**필수 조건:** Node.js 18.0.0 이상

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   `.env.local` 파일에 다음 내용 추가:
   ```env
   # Frontend Environment Variables
   VITE_API_BASE_URL=http://localhost:3001
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here

   # Backend Environment Variables
   GEMINI_API_KEY=your_gemini_api_key_here
   GITHUB_USERNAME=Yamang02
   CONTACT_EMAIL=ljj0210@gmail.com

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:5173
   ```

3. **개발 서버 실행**

   **프론트엔드 (Vite)**
   ```bash
   npm run dev
   ```

   **백엔드 (Express API)**
   ```bash
   npm run server:dev
   ```

4. **브라우저에서 확인**
   - **프론트엔드**: http://localhost:5173
   - **API 문서**: http://localhost:3001/api-docs
   - **헬스 체크**: http://localhost:3001/health

## 📚 API 서버

이 프로젝트는 Express.js 기반의 API 서버를 포함하고 있습니다.

### 주요 기능
- **AI 챗봇 API**: Gemini API를 통한 AI 응답 생성
- **프로젝트 API**: 포트폴리오 프로젝트 정보 제공
- **GitHub API**: GitHub 레포지토리 정보 연동
- **정적 데이터 API**: 경력, 교육, 자격증 정보 제공

### API 문서
- **Swagger UI**: http://localhost:3001/api-docs
- **상세 문서**: [docs/api-documentation.md](docs/api-documentation.md)

### 보안 기능
- **Rate Limiting**: API 호출 제한
- **CORS**: 허용된 도메인만 접근 가능
- **Helmet**: 보안 헤더 설정
- **API 키 보안**: 서버 사이드에서만 API 키 관리

## 배포

Google Cloud Run을 통한 자동 배포가 설정되어 있습니다.
