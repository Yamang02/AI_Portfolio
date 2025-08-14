# AI Portfolio Chatbot

AI 포트폴리오 챗봇은 Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇입니다. 
**프론트엔드(React + TypeScript + Vite)**와 **백엔드(Spring Boot + LangChain4j)**가 완전히 분리된 구조로 운영됩니다.

---

## 📁 프로젝트 구조

```
AI_Portfolio/
├── frontend/         # 프론트엔드 (React + TypeScript + Vite)
│   ├── src/          # 프론트엔드 소스코드 (FSD 아키텍처)
│   │   ├── app/              # 애플리케이션 레이어
│   │   │   ├── providers/    # 전역 상태 관리 (Context API)
│   │   │   ├── layout/       # 메인 레이아웃 컴포넌트
│   │   │   └── index.tsx     # 앱 진입점
│   │   ├── entities/         # 엔티티 레이어 (비즈니스 도메인 모델)
│   │   │   ├── project/      # 프로젝트 엔티티
│   │   │   ├── experience/   # 경력 엔티티
│   │   │   ├── education/    # 교육 엔티티
│   │   │   └── certification/# 자격증 엔티티
│   │   ├── features/         # 기능 레이어 (독립적인 기능 단위)
│   │   │   ├── chatbot/      # 챗봇 기능
│   │   │   └── projects/     # 포트폴리오 표시 기능
│   │   ├── shared/           # 공유 레이어
│   │   │   ├── components/   # 공통 UI 컴포넌트
│   │   │   ├── services/     # API 클라이언트 등 공통 서비스
│   │   │   └── utils/        # 유틸리티 함수
│   │   ├── index.css         # 전역 스타일
│   │   └── main.tsx          # React 앱 마운트
│   ├── index.html            # HTML 템플릿 (Vite)
│   ├── package.json          # 프론트엔드 패키지 관리
│   ├── vite.config.ts        # Vite 설정
│   ├── tsconfig.json         # TypeScript 설정
│   └── dist/                 # 빌드 결과물
│
├── backend/          # 백엔드 (Spring Boot + LangChain4j) - 헥사고날 아키텍처
│   ├── src/
│   │   └── main/
│   │       ├── java/com/aiportfolio/backend/
│   │       │   ├── domain/              # 도메인 레이어 (의존성 없는 핵심 비즈니스 로직)
│   │       │   │   ├── model/           # 도메인 엔티티 (Project, Education, Experience, Certification)
│   │       │   │   ├── port/            # 인터페이스 정의 (포트)
│   │       │   │   │   ├── in/          # Primary Port (Use Cases)
│   │       │   │   │   └── out/         # Secondary Port (Repository, External Services)
│   │       │   │   └── service/         # 도메인 서비스 (채팅, LLM, 분석 등)
│   │       │   ├── application/         # 어플리케이션 레이어 (Use Case 구현체)
│   │       │   │   └── service/         # 어플리케이션 서비스
│   │       │   ├── infrastructure/      # 인프라 레이어 (외부 어댑터 구현)
│   │       │   │   ├── persistence/     # 데이터베이스 어댑터 (JSON, PostgreSQL)
│   │       │   │   ├── web/             # HTTP 어댑터 (Controllers, DTOs)
│   │       │   │   └── external/        # 외부 서비스 어댑터 (Gemini AI, GitHub 등)
│   │       │   └── shared/              # 공통 유틸리티
│   │       │       ├── config/          # 설정 클래스 (Spring Configuration)
│   │       │       ├── exception/       # 예외 처리
│   │       │       └── common/          # 공통 모델 및 유틸리티
│   │       └── resources/
│   │           ├── application.yml  # 백엔드 환경설정 (API Key, 모델명 등)
│   │           ├── data/            # 포트폴리오/프로젝트 데이터
│   │           └── prompts/         # 챗봇 프롬프트 템플릿
│   ├── pom.xml       # 백엔드 패키지 관리(Maven)
│   └── target/       # 빌드 결과물
│
├── docs/             # 프로젝트 문서
│   ├── ai/           # AI/챗봇 관련 문서
│   ├── projects/     # 프로젝트별 상세 문서
│   ├── mermaid/      # Mermaid 다이어그램 소스
│   ├── portfolio.md  # 프로젝트 개요 및 학습 성과
│   └── DEVELOPMENT.md # 개발 및 배포 가이드
│
├── Dockerfile        # Docker 설정
├── package.json      # 루트 패키지 관리
├── README.md         # 프로젝트 개요 및 안내
└── ...               # 기타 공통 파일
```

---

- **프론트엔드**: FSD (Feature-Sliced Design) 아키텍처로 확장 가능한 구조
- **백엔드**: 헥사고날 아키텍처 (Domain-Application-Infrastructure)로 확장성 확보
- 프론트엔드와 백엔드는 완전히 분리되어 독립적으로 개발/배포/테스트가 가능
- API 통신(REST)으로 프론트-백엔드 연동
- 각 영역별 환경변수 및 설정 분리 관리
- 최신 LangChain4j + Google Gemini 모델 연동
- Vite 기반의 빠른 개발 환경

---

## 🛠️ 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 빌드 도구
- **CSS Modules** - 스타일링
- **Express** - 개발 서버

### Backend
- **Spring Boot 3** - Java 웹 프레임워크
- **Spring Web** - REST API
- **Spring Validation** - 입력 검증
- **Maven** - 빌드 도구
- **SpringDoc OpenAPI** - API 문서화
- **LangChain4j** - AI 모델 연동

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

## 📚 문서

- **프로젝트 개요**: [docs/portfolio.md](docs/portfolio.md) - 프로젝트 개요, 기술 스택, 학습 성과
- **개발 가이드**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) - API 명세, 배포 아키텍처, 개발 환경 설정
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html

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
# 백엔드 빌드 및 실행
cd backend && mvn clean package
java -jar target/ai-portfolio-backend-1.0.0.jar

# 프론트엔드 빌드 및 배포
cd frontend && npm run build
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
  - `features/` - 도메인별 기능 모듈
  - `shared/` - 공통 컴포넌트 및 서비스
- `index.html` - HTML 템플릿 (Vite)
- `dist/` - 빌드 결과물

### Backend (`backend/`)
- `src/main/java/` - Java 소스 코드 (헥사고날 아키텍처)
  - `domain/` - 핵심 비즈니스 로직 (의존성 없음)
  - `application/` - Use Case 구현체
  - `infrastructure/` - 외부 어댑터 (DB, Web, AI)
  - `shared/` - 공통 설정 및 유틸리티
- `src/main/resources/` - 설정 파일 및 데이터
- `target/` - 빌드 결과물

### Documentation (`docs/`)
- `portfolio.md` - 프로젝트 개요, 기술 스택, 학습 성과
- `DEVELOPMENT.md` - API 명세, 배포 아키텍처, 개발 환경 설정
- `projects/` - 프로젝트별 상세 문서

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
- **포트폴리오**: https://ai-portfolio-chatbot-493721639129.asia-northeast3.run.app/
