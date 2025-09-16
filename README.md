# AI Portfolio

Live URL
www.yamang02.com

AI RAG DEMO
https://huggingface.co/spaces/Yamang02/ai-portfolio-rag-demo

AI 포트폴리오는 Google Gemini API를 활용한 개발자 포트폴리오 AI 챗봇입니다.

## 🚀 로컬 개발 환경 설정

### 사전 요구사항
- Docker & Docker Compose
- Git

### 빠른 시작

#### Windows
```bash
# 스크립트 실행
scripts/start-local-dev.bat
```

#### Linux/Mac
```bash
# 실행 권한 부여
chmod +x scripts/start-local-dev.sh

# 스크립트 실행
./scripts/start-local-dev.sh
```

#### 수동 실행
```bash
# 1. 데이터베이스 및 Redis 시작
docker-compose up -d postgres redis

# 2. 백엔드 시작
docker-compose up -d backend

# 3. 프론트엔드 시작
docker-compose up -d frontend
```

### 접속 정보
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 개발 도구
```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f [service_name]

# 서비스 중지
docker-compose down
```

## 🏗️ 서비스 구조
<img width="1267" height="743" alt="image" src="https://github.com/user-attachments/assets/8d304a4c-5feb-45a7-9981-a474abe1db94" />

## 🏗️ 인프라 구성
<img width="1281" height="749" alt="image" src="https://github.com/user-attachments/assets/29850671-8660-42de-aea8-b185d5adcb68" />

## 📞 연락처

- **이메일**: ljj0210@gmail.com
- **GitHub**: https://github.com/Yamang02
- **포트폴리오**: https://www.yamang02.com
