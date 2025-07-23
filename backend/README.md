# AI Portfolio Backend (Java Spring Boot)

AI 포트폴리오 웹사이트의 백엔드 API 서버입니다. Spring Boot를 사용하여 구현되었습니다.

## 🚀 주요 기능

- **AI 챗봇 API**: Google Gemini API를 활용한 포트폴리오 AI 어시스턴트
- **프로젝트 관리**: GitHub API 연동 및 로컬 프로젝트 데이터 관리
- **포트폴리오 데이터**: 경험, 자격증 등 포트폴리오 정보 제공
- **RESTful API**: 표준 HTTP 메서드를 사용한 REST API
- **Swagger 문서**: 자동 생성되는 API 문서

## 🛠 기술 스택

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring WebFlux**: HTTP 클라이언트
- **Jackson**: JSON 처리
- **Lombok**: 보일러플레이트 코드 제거
- **SpringDoc OpenAPI**: Swagger 문서 자동 생성

## 📁 프로젝트 구조

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/aiportfolio/backend/
│   │   │   ├── BackendApplication.java     # 메인 애플리케이션
│   │   │   ├── controller/                 # API 컨트롤러
│   │   │   │   ├── ChatController.java
│   │   │   │   ├── ProjectController.java
│   │   │   │   ├── DataController.java
│   │   │   │   └── GitHubController.java
│   │   │   ├── service/                    # 비즈니스 로직
│   │   │   │   ├── GeminiService.java
│   │   │   │   ├── ProjectService.java
│   │   │   │   ├── GitHubService.java
│   │   │   │   └── DataService.java
│   │   │   ├── model/                      # 데이터 모델
│   │   │   │   ├── Project.java
│   │   │   │   ├── Experience.java
│   │   │   │   ├── Certification.java
│   │   │   │   ├── ChatRequest.java
│   │   │   │   └── ChatResponse.java
│   │   │   ├── config/                     # 설정
│   │   │   │   ├── AppConfig.java
│   │   │   │   └── WebConfig.java
│   │   │   └── util/                       # 유틸리티
│   │   │       └── DateUtils.java
│   │   └── resources/
│   │       ├── application.yml             # 애플리케이션 설정
│   │       └── data/                       # 정적 데이터
│   │           ├── projects.json
│   │           ├── experiences.json
│   │           └── certifications.json
│   └── test/                               # 테스트 코드
└── pom.xml                                 # Maven 설정
```

## 🔧 환경 설정

### 필수 환경변수

```bash
# Gemini AI API 키
GEMINI_API_KEY=your_gemini_api_key

# GitHub 사용자명
GITHUB_USERNAME=your_github_username

# 연락처 이메일
CONTACT_EMAIL=your_email@example.com

# 서버 포트 (기본값: 8080)
PORT=8080

# 환경 (development/production)
NODE_ENV=development

# 허용된 CORS 오리진
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting 설정
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 실행 방법

### 1. 환경변수 설정

`.env` 파일을 생성하거나 환경변수를 설정합니다:

```bash
# .env 파일 예시
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_USERNAME=your_github_username
CONTACT_EMAIL=your_email@example.com
PORT=8080
NODE_ENV=development
```

### 2. 애플리케이션 실행

```bash
# Maven으로 빌드 및 실행
mvn spring-boot:run

# 또는 JAR 파일로 실행
mvn clean package
java -jar target/ai-portfolio-backend-1.0.0.jar
```

### 3. 개발 모드 실행

```bash
# 개발 모드 (자동 재시작)
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## 📚 API 문서

애플리케이션 실행 후 다음 URL에서 Swagger 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

## 🔌 API 엔드포인트

### 챗봇 API
- `POST /api/chat/message` - 챗봇 메시지 전송
- `GET /api/chat/health` - 챗봇 서비스 상태 확인

### 프로젝트 API
- `GET /api/projects` - 모든 프로젝트 조회
- `GET /api/projects/{id}` - 프로젝트 상세 조회
- `GET /api/projects/title/{title}` - 프로젝트 제목으로 조회

### 데이터 API
- `GET /api/data/all` - 모든 포트폴리오 데이터 조회
- `GET /api/data/projects` - 프로젝트 데이터 조회
- `GET /api/data/experiences` - 경험 데이터 조회
- `GET /api/data/certifications` - 자격증 데이터 조회

### GitHub API
- `GET /api/github/projects` - GitHub 프로젝트 조회
- `GET /api/github/project/{repoName}` - GitHub 프로젝트 상세 조회

## 🔒 보안

- **CORS 설정**: 허용된 오리진에서만 API 접근 가능
- **Rate Limiting**: API 요청 제한으로 DDoS 방지
- **환경변수**: 민감한 정보는 환경변수로 관리
- **입력 검증**: 모든 API 입력에 대한 검증

## 🧪 테스트

```bash
# 단위 테스트 실행
mvn test

# 통합 테스트 실행
mvn verify
```

## 📦 배포

### Docker 배포

```bash
# Docker 이미지 빌드
docker build -t ai-portfolio-backend .

# Docker 컨테이너 실행
docker run -p 8080:8080 --env-file .env ai-portfolio-backend
```

### 클라우드 배포

- **Google Cloud Run**: `gcloud run deploy`
- **AWS ECS**: ECS 서비스로 배포
- **Azure Container Instances**: 컨테이너 인스턴스로 배포

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 