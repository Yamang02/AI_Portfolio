# AI 서비스 테스트 체크리스트

## 🚀 사전 준비
- [ ] Docker Desktop 실행 중
- [ ] ai-service 디렉토리로 이동
- [ ] .env 파일 생성 (GEMINI_API_KEY 설정)

## 📋 Docker 실행
```bash
# AI 서비스 실행
docker-compose -f docker-compose.ai.yml up -d

# 상태 확인
docker-compose -f docker-compose.ai.yml ps

# 로그 확인
docker-compose -f docker-compose.ai.yml logs -f ai-service
```

## 🧪 자동 테스트 실행

### Python 스크립트 (권장)
```bash
# 의존성 설치
pip install requests

# 테스트 실행
python scripts/test_ai_service.py

# 다른 URL로 테스트
python scripts/test_ai_service.py http://localhost:8000
```

### Bash 스크립트
```bash
# 실행 권한 부여
chmod +x scripts/test_ai_service.sh

# 테스트 실행
./scripts/test_ai_service.sh

# 다른 URL로 테스트
./scripts/test_ai_service.sh http://localhost:8000
```

## 🔍 수동 테스트

### 1. 기본 연결 확인
```bash
# 루트 엔드포인트
curl http://localhost:8000/

# 헬스체크
curl http://localhost:8000/api/v1/health

# 서비스 정보
curl http://localhost:8000/api/v1/info
```

### 2. AI 챗봇 테스트
```bash
# 기본 채팅
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "안녕하세요!"}'

# 프로젝트 관련 질문
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "프로젝트에 대해 알려주세요"}'
```

### 3. Qdrant 연결 확인
```bash
# Qdrant 상태 확인
curl http://localhost:6333/collections
```

### 4. 에러 처리 테스트
```bash
# 빈 메시지
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'

# 잘못된 JSON
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d "invalid json"
```

## ✅ 성공 기준
- [ ] AI 서비스가 8000 포트에서 응답
- [ ] Qdrant가 6333 포트에서 응답
- [ ] 모든 API 엔드포인트 정상 동작
- [ ] 채팅 API에서 AI 응답 생성
- [ ] 에러 상황 적절히 처리

## 🐛 문제 해결

### 포트 충돌
```bash
# 포트 사용 중인지 확인
netstat -ano | findstr :8000
netstat -ano | findstr :6333

# 기존 컨테이너 정리
docker-compose -f docker-compose.ai.yml down --volumes
```

### 로그 확인
```bash
# AI 서비스 로그
docker-compose -f docker-compose.ai.yml logs ai-service

# Qdrant 로그
docker-compose -f docker-compose.ai.yml logs qdrant
```

### 환경변수 확인
```bash
# .env 파일 내용 확인
cat .env

# 환경변수 설정
export GEMINI_API_KEY="your-api-key-here"
```

## 📊 테스트 결과 기록
- 테스트 날짜: _________
- 테스트 환경: _________
- 통과한 테스트: ___ / ___
- 발견된 문제: _________
- 해결 방법: _________
