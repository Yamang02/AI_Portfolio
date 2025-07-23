# AI Portfolio API Documentation

## 📋 개요

AI Portfolio API는 개발자 포트폴리오 챗봇을 위한 RESTful API 서버입니다. 프로젝트 정보, 경력, 교육, 자격증 데이터를 제공하고 AI 챗봇 기능을 지원합니다.

## 🚀 서버 정보

- **Base URL**: `http://localhost:8080`
- **API Documentation**: `http://localhost:8080/swagger-ui.html`
- **Health Check**: `http://localhost:8080/api/chat/health`

## 📊 표준 응답 형식

모든 API 응답은 다음과 같은 표준 형식을 따릅니다:

### 성공 응답
```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    // 실제 데이터
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "message": "요청 처리 중 오류가 발생했습니다.",
  "error": "상세 에러 메시지"
}
```

## 📚 API 엔드포인트

### 1. AI 챗봇 API

#### POST `/api/chat/message`
AI 챗봇 응답을 생성합니다.

**Request Body:**
```json
{
  "question": "AI 포트폴리오 챗봇 프로젝트에 대해 알려줘",
  "selectedProject": "AI 포트폴리오 챗봇" // 선택사항
}
```

**Response:**
```json
{
  "success": true,
  "message": "챗봇 응답 성공",
  "data": {
    "response": "AI 포트폴리오 챗봇은 Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇입니다...",
    "success": true
  }
}
```

#### GET `/api/chat/health`
챗봇 서비스 상태를 확인합니다.

**Response:**
```json
{
  "success": true,
  "message": "챗봇 서비스 정상 작동",
  "data": "Chat service is running"
}
```

### 2. 프로젝트 API

#### GET `/api/projects`
모든 프로젝트 목록을 조회합니다.

**Query Parameters:**
- `type`: 프로젝트 타입 필터 (`project`, `certification`)
- `source`: 데이터 소스 필터 (`github`, `local`, `certification`)
- `isTeam`: 팀 프로젝트 여부 필터 (`true`, `false`)

**Response:**
```json
{
  "success": true,
  "message": "프로젝트 목록 조회 성공",
  "data": [
    {
      "id": "proj-001",
      "title": "AI 포트폴리오 챗봇",
      "description": "Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇",
      "technologies": ["React", "Google Gemini API", "TypeScript"],
      "githubUrl": "https://github.com/Yamang02/AI_Portfolio",
      "liveUrl": "https://ai-portfolio-chatbot.vercel.app",
      "type": "project",
      "source": "github",
      "startDate": "2024-01",
      "endDate": null,
      "isTeam": false
    }
  ]
}
```

#### GET `/api/projects/{id}`
특정 프로젝트의 상세 정보를 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "프로젝트 조회 성공",
  "data": {
    "id": "proj-001",
    "title": "AI 포트폴리오 챗봇",
    "description": "Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇",
    "technologies": ["React", "Google Gemini API", "TypeScript"],
    "githubUrl": "https://github.com/Yamang02/AI_Portfolio",
    "liveUrl": "https://ai-portfolio-chatbot.vercel.app",
    "readme": "# AI Portfolio Chatbot\n\n이 프로젝트는...",
    "type": "project",
    "source": "github",
    "startDate": "2024-01",
    "endDate": null,
    "isTeam": false
  }
}
```

### 3. GitHub API

#### GET `/api/github/projects`
GitHub 프로젝트 목록을 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "GitHub 프로젝트 목록 조회 성공",
  "data": [
    {
      "id": 123456789,
      "name": "AI_Portfolio",
      "description": "AI 포트폴리오 챗봇 프로젝트",
      "html_url": "https://github.com/Yamang02/AI_Portfolio",
      "homepage": "https://ai-portfolio-chatbot.vercel.app",
      "topics": ["react", "typescript", "ai"],
      "language": "TypeScript",
      "stargazers_count": 5,
      "forks_count": 2,
      "updated_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "visibility": "public"
    }
  ]
}
```

#### GET `/api/github/project/{repoName}`
특정 GitHub 프로젝트의 상세 정보를 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "GitHub 프로젝트 조회 성공",
  "data": {
    "title": "AI_Portfolio",
    "description": "AI 포트폴리오 챗봇 프로젝트",
    "technologies": ["React", "TypeScript", "AI"],
    "githubUrl": "https://github.com/Yamang02/AI_Portfolio",
    "liveUrl": "https://ai-portfolio-chatbot.vercel.app",
    "readme": "# AI Portfolio Chatbot\n\n이 프로젝트는...",
    "portfolioInfo": "포트폴리오 상세 정보...",
    "stars": 5,
    "forks": 2,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4. 정적 데이터 API

#### GET `/api/data/experiences`
경력 정보를 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "경험 목록 조회 성공",
  "data": [
    {
      "id": "exp-001",
      "title": "(주)디아이티",
      "description": "노루그룹 전산 계열사에서 ERP, 웹사이트 유지보수 및 IT외주 관리 등을 담당했습니다.",
      "technologies": ["Oracle Forms", "PL/SQL", "Java"],
      "organization": "디아이티",
      "role": "ERP 개발/유지보수 엔지니어",
      "startDate": "2023-07",
      "endDate": "2025-01",
      "type": "career",
      "mainResponsibilities": [
        "영업/물류 도메인 ERP 시스템 및 WEB 유지보수",
        "차세대 ERP FCM팀 Git 관리 위원"
      ],
      "achievements": [
        "SAP EAI와의 인터페이스 개발로 REST API 방식 전환",
        "Git 기반 버전 관리 시스템으로 개발 프로세스 표준화"
      ],
      "projects": [
        "노루화학 BG 차세대 ERP (SAP) 전환 프로젝트",
        "노루 로지넷 운임비 정산 시스템 TMS 개발"
      ]
    }
  ]
}
```

#### GET `/api/data/education`
교육 정보를 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "교육 목록 조회 성공",
  "data": [
    {
      "id": "edu-001",
      "title": "Sesac",
      "description": "Cloud 기반 Multi Modal AI 개발자 양성 과정 with Google Cloud",
      "technologies": ["Python", "PyQt5", "Cursor"],
      "organization": "Sesac 강동지점",
      "startDate": "2025-06",
      "endDate": null,
      "type": "education",
      "projects": [
        "PYQT5 파일 태거 (File Tagger)",
        "AI 포트폴리오 챗봇 (AI Portfolio Chatbot)"
      ]
    }
  ]
}
```

#### GET `/api/data/certifications`
자격증 정보를 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "자격증 목록 조회 성공",
  "data": [
    {
      "id": "cert-001",
      "title": "SAP Certified Associate - Back-End Developer - ABAP",
      "description": "",
      "technologies": ["SAP", "ABAP", "Backend Development"],
      "issuer": "SAP",
      "startDate": "2024-10"
    }
  ]
}
```

#### GET `/api/data/all`
모든 정적 데이터를 한 번에 조회합니다.

**Response:**
```json
{
  "success": true,
  "message": "포트폴리오 데이터 조회 성공",
  "data": {
    "experiences": [...],
    "education": [...],
    "certifications": [...]
  }
}
```

## 🔒 보안

### Rate Limiting
- **기본 제한**: 15분당 100회 요청
- **챗봇 API**: 추가 제한 적용 가능

### CORS 설정
- **허용된 도메인**: `http://localhost:5173`, `https://your-frontend-domain.com`
- **Credentials**: 지원

### 보안 헤더
- **Helmet**: 보안 헤더 자동 설정
- **Compression**: 응답 압축
- **Morgan**: 요청 로깅

## 🚨 에러 응답

### 400 Bad Request
```json
{
  "success": false,
  "message": "잘못된 요청입니다",
  "error": "Question is required and must be a string"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "프로젝트를 찾을 수 없습니다",
  "error": "Project not found with id: proj-001"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "프로젝트 목록 조회 실패",
  "error": "Failed to generate response"
}
```

## 🛠️ 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가:
```env
# AI API 설정
GEMINI_API_KEY=your_gemini_api_key_here

# GitHub 설정
GITHUB_USERNAME=Yamang02

# 서버 설정
PORT=3001
NODE_ENV=development

# CORS 설정
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. 서버 실행
```bash
# 개발 모드
npm run server:dev

# 프로덕션 모드
npm run server
```

## 📊 모니터링

### 헬스 체크
```bash
curl http://localhost:8080/api/chat/health
```

### 로그 확인
서버는 Morgan을 통해 모든 요청을 로깅합니다.

## 🔄 API 버전 관리

현재 API 버전: `v1.0.0`

향후 버전 변경 시 URL에 버전을 포함할 예정:
- `v1`: `/api/v1/chat`
- `v2`: `/api/v2/chat`

## 📞 지원

API 관련 문의사항이 있으시면 다음으로 연락주세요:
- **이메일**: ljj0210@gmail.com
- **GitHub**: https://github.com/Yamang02 