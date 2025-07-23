# AI Portfolio Chatbot

AI 포트폴리오 챗봇은 Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇입니다. 
**프론트엔드(React + TypeScript + Vite)**와 **백엔드(Spring Boot + LangChain4j)**가 완전히 분리된 구조로 운영됩니다.

---

## 📁 프로젝트 구조

```
AI_Portfolio/
├── frontend/         # 프론트엔드 (React + TypeScript + Vite)
│   ├── src/          # 프론트엔드 소스코드 및 컴포넌트
│   │   ├── features/         # 주요 도메인별 기능(챗봇, 프로젝트 등)
│   │   ├── shared/           # 공통 컴포넌트, 서비스, 유틸
│   │   └── ...
│   ├── public/       # 정적 파일
│   ├── package.json  # 프론트엔드 패키지 관리
│   └── ...           # 기타 프론트엔드 설정/빌드 파일
│
├── backend/          # 백엔드 (Spring Boot + LangChain4j)
│   ├── src/
│   │   └── main/
│   │       ├── java/com/aiportfolio/backend/
│   │       │   ├── controller/   # API 컨트롤러
│   │       │   ├── service/      # 비즈니스 로직, Gemini 연동
│   │       │   ├── model/        # 데이터 모델
│   │       │   └── ...
│   │       └── resources/
│   │           ├── application.yml  # 백엔드 환경설정 (API Key, 모델명 등)
│   │           └── data/            # 포트폴리오/프로젝트 데이터
│   ├── pom.xml       # 백엔드 패키지 관리(Maven)
│   └── ...           # 기타 백엔드 설정/빌드 파일
│
├── docs/             # 프로젝트 문서
│   ├── ai/           # AI/챗봇 관련 문서
│   ├── api-documentation.md
│   ├── portfolio.md
│   └── ...
│
├── scripts/          # 배포 및 유틸리티 스크립트
│   └── deploy.sh
│
├── README.md         # 프로젝트 개요 및 안내
└── ...               # 기타 공통 파일
```

---

- 프론트엔드와 백엔드는 완전히 분리되어 독립적으로 개발/배포/테스트가 가능합니다.
- API 통신(REST)으로 프론트-백엔드 연동
- 각 영역별 환경변수 및 설정 분리 관리
- 최신 LangChain4j + Google Gemini 모델 연동

---

## 🛠️ 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **React Router** - 라우팅

### Backend
- **Spring Boot 3** - Java 웹 프레임워크
- **Spring Web** - REST API
- **Spring Security** - 보안
- **Maven** - 빌드 도구
- **Swagger** - API 문서화

### AI & External APIs
- **Google Gemini API** - AI 챗봇
- **GitHub API** - 프로젝트 정보

## 📦 설치 및 실행

### 1. 전체 프로젝트 설치

```bash
# 모든 의존성 설치
npm run install:all
```

### 2. 개발 모드 실행

```bash
# 프론트엔드와 백엔드 동시 실행
npm run dev

# 또는 개별 실행
npm run dev:frontend  # 프론트엔드만
npm run dev:backend   # 백엔드만
```

### 3. 프로덕션 빌드

```bash
# 전체 프로젝트 빌드
npm run build

# 또는 개별 빌드
npm run build:frontend
npm run build:backend
```

## 🔧 환경 설정

### Frontend 환경변수
`frontend/.env.local` 파일을 생성하고 다음 내용을 추가:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Backend 환경변수
`backend/src/main/resources/application.yml` 파일을 수정:

```yaml
gemini:
  api-key: your_gemini_api_key_here

github:
  username: your_github_username
```

## 📚 API 문서

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API 문서**: [docs/api-documentation.md](docs/api-documentation.md)

## 🚀 배포

### Docker 배포
```bash
# Docker 이미지 빌드
docker build -t ai-portfolio .

# 컨테이너 실행
docker run -p 80:80 ai-portfolio
```

### 수동 배포
```bash
# 스크립트 실행
./scripts/deploy.sh
```

## 🧪 테스트

```bash
# 전체 테스트 실행
npm run test

# 개별 테스트
npm run test:frontend
npm run test:backend
```

## 📁 주요 디렉토리

### Frontend (`frontend/`)
- `src/` - 소스 코드
- `public/` - 정적 파일
- `dist/` - 빌드 결과물

### Backend (`backend/`)
- `src/main/java/` - Java 소스 코드
- `src/main/resources/` - 설정 파일
- `target/` - 빌드 결과물

### Documentation (`docs/`)
- `api-documentation.md` - API 명세
- `deployment-guide.md` - 배포 가이드
- `portfolio.md` - 포트폴리오 정보

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- **이메일**: ljj0210@gmail.com
- **GitHub**: https://github.com/Yamang02
- **포트폴리오**: https://ai-portfolio-chatbot.vercel.app

## 🙏 감사의 말

- Google Gemini API 팀
- React 및 Spring Boot 커뮤니티
- 모든 기여자들
