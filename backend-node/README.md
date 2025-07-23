# AI Portfolio Backend

이 폴더는 AI Portfolio 프로젝트의 백엔드 관련 파일들을 포함합니다.
별도의 API 서버 프로젝트로 이전될 예정입니다.

## 📁 폴더 구조

```
backend/
├── README.md                    # 이 파일
├── services/                    # 서비스 로직
│   ├── geminiService.ts        # Gemini AI 서비스
│   ├── githubService.ts        # GitHub API 서비스
│   └── prompts/                # AI 프롬프트
│       ├── chatbotPersona.ts
│       ├── conversationPatterns.ts
│       └── index.ts
├── data/                       # 정적 데이터
│   ├── projects.ts            # 프로젝트 정보
│   ├── experiences.ts         # 경력 정보
│   ├── education.ts           # 교육 정보
│   ├── certifications.ts      # 자격증 정보
│   └── index.ts
├── config/                     # 설정 파일
│   └── app.config.ts
├── types/                      # 타입 정의
│   └── index.ts
└── utils/                      # 유틸리티 함수
    ├── dateUtils.ts
    └── spamProtection.ts
```

## 🔧 주요 기능

### 1. AI 챗봇 서비스
- Gemini API를 통한 AI 응답 생성
- 프로젝트 컨텍스트 기반 대화
- 프롬프트 관리 및 최적화

### 2. GitHub API 서비스
- 사용자 레포지토리 정보 가져오기
- README 및 프로젝트 파일 내용 가져오기
- 포트폴리오 프로젝트 필터링

### 3. 데이터 관리
- 프로젝트, 경력, 교육, 자격증 정보
- 정적 데이터와 동적 데이터 통합
- 캐싱 전략

## 🚀 API 엔드포인트 설계

```
POST /api/chat                    # AI 챗봇 응답
GET  /api/projects               # 프로젝트 목록
GET  /api/projects/:id           # 특정 프로젝트 상세
GET  /api/experiences            # 경력 정보
GET  /api/education              # 교육 정보
GET  /api/certifications         # 자격증 정보
GET  /api/github/repos           # GitHub 레포지토리 목록
GET  /api/github/repos/:name     # 특정 레포지토리 정보
```

## 🔒 보안 고려사항

- API 키를 서버 환경변수로 관리
- 요청 제한 (Rate Limiting) 구현
- 입력 검증 및 sanitization
- CORS 설정으로 허용된 도메인만 접근 가능

## 📋 이전 작업 목록

- [x] 백엔드 관련 파일 분리
- [ ] API 서버 프로젝트 생성
- [ ] 환경변수 설정
- [ ] 데이터베이스 스키마 설계
- [ ] API 엔드포인트 구현
- [ ] 보안 설정
- [ ] 배포 설정 