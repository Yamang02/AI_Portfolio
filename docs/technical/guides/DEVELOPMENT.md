# AI Portfolio Development Guide

## 📋 개요
AI Portfolio 프로젝트의 개발 환경 설정, API 명세, 배포 아키텍처를 통합한 개발 가이드입니다.

## 🚀 기술 스택
- **프론트엔드**: React 19.1.0, TypeScript, Tailwind CSS, Vite
- **백엔드**: Spring Boot 3.x, LangChain4j, 헥사고날 아키텍처
- **AI/API**: Google Gemini API, GitHub REST API
- **인프라**: Google Cloud Run, Docker, GitHub Actions

## 🏗️ 백엔드 아키텍처

### 헥사고날 아키텍처 구조
```
backend/src/main/java/com/aiportfolio/backend/
├── domain/                     # 도메인 레이어 (핵심 비즈니스 로직)
│   ├── model/                  # 도메인 엔티티
│   ├── port/                   # 인터페이스 정의 (포트)
│   └── service/                # 도메인 서비스
├── application/                # 어플리케이션 레이어 (Use Case 구현체)
├── infrastructure/             # 인프라 레이어 (외부 어댑터 구현)
│   ├── persistence/            # 데이터베이스 어댑터
│   ├── web/                    # HTTP 어댑터
│   └── external/               # 외부 서비스 어댑터
└── shared/                     # 공통 유틸리티
```

### 아키텍처 특징
- **의존성 역전**: 도메인 레이어는 외부 의존성 없음
- **포트와 어댑터**: 인터페이스를 통한 느슨한 결합
- **확장성**: 새로운 데이터베이스나 외부 서비스 추가 용이
- **테스트 용이성**: 각 레이어별 독립적인 테스트 가능

## 🔌 API 명세

### 기본 정보
- **Base URL**: `http://localhost:8080`
- **API Documentation**: `http://localhost:8080/swagger-ui.html`
- **Health Check**: `http://localhost:8080/api/chat/health`

### 주요 엔드포인트
- `POST /api/chat` - AI 챗봇 대화
- `GET /api/projects` - 프로젝트 목록 조회
- `GET /api/projects/{id}` - 프로젝트 상세 조회

### 표준 응답 형식
```json
{
  "success": true,
  "data": {},
  "message": "성공",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🛠️ 개발 환경 설정

### 사전 요구사항
- Java 17+
- Node.js 18+
- Docker
- Docker Compose

### 로컬 개발 환경

#### Docker Compose (권장)
```bash
# backend/.env.example을 backend/.env로 복사하고 필요한 값을 설정
cd backend

# 백엔드·PostgreSQL·Redis 시작
docker compose up -d postgres redis backend

# 로그 확인
docker compose logs backend -f

# 컨테이너 중지
docker compose down

# 컨테이너 중지 + 볼륨 삭제 (데이터 완전 초기화)
docker compose down -v
```

#### 프론트엔드 개별 실행
```bash
# 프론트엔드 실행
cd frontend
pnpm install
pnpm run dev
```

### 환경 변수 설정
```bash
# backend/.env.example을 backend/.env로 복사
# backend/.env에서 DB·Redis 및 필요한 외부 API 값을 설정
```

## 🚀 배포

### Cloud Run 배포
```bash
# Docker 이미지 빌드
docker build -t ai-portfolio .

# Cloud Run 배포
gcloud run deploy ai-portfolio \
  --image gcr.io/PROJECT_ID/ai-portfolio \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated
```

### CI/CD 파이프라인
- **GitHub Actions**: main 브랜치 push 시 자동 배포
- **멀티스테이지 빌드**: 프론트엔드 + 백엔드 통합 컨테이너
- **보안**: GitHub Secrets를 통한 API 키 관리

## 🧪 테스트

### 백엔드 테스트
```bash
# 단위 테스트
mvn test

# 통합 테스트
mvn verify
```

### 프론트엔드 테스트
```bash
# 단위 테스트
pnpm test

# E2E 테스트
pnpm run test:e2e
```

## 📚 추가 문서
- [아키텍처 상세 설명](./ai-service-architecture-layers.md)
- [데이터 플로우](./ai-service-data-flow.md)
- [배포 전략](./deployment/deployment-strategy.md)
