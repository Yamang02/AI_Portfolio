# AI Service Migration - 제거 대상 체크리스트

## 📁 디렉토리 단위 제거

### 1. ai-service/ 전체
```bash
AI_PortFolio/ai-service/
```

**작업 순서**:
1. [ ] AI_portfolio_agent로 이동 후 삭제 (Phase 2)
2. [ ] 백업 확인 완료
3. [ ] 디렉토리 삭제

**명령어**:
```bash
# 백업 (선택사항)
cp -r ai-service/ ../ai-service-backup-$(date +%Y%m%d)

# AI_portfolio_agent로 이동 후 삭제
rm -rf ai-service/
```

---

### 2. Backend - AIServiceClient 관련 코드

```
backend/src/main/java/com/aiportfolio/backend/infrastructure/external/aiservice/
```

**제거 대상 파일 목록**:
- [ ] `AIServiceClient.java`
- [ ] `dto/AIServiceChatRequest.java`
- [ ] `dto/AIServiceChatResponse.java`
- [ ] `dto/AIServiceHealthResponse.java`

**명령어**:
```bash
cd backend/src/main/java/com/aiportfolio/backend/infrastructure/external
rm -rf aiservice/
```

---

## 📄 파일 단위 제거/수정

### 1. GitHub Workflows

#### 삭제 대상
- [ ] `.github/workflows/ai-service-staging-cloudrun.yml`

```bash
rm .github/workflows/ai-service-staging-cloudrun.yml
```

#### 이동 대상 (AI_portfolio_agent로)
- [ ] `.github/workflows/ai-service-demo-huggingface.yml`

```bash
# AI_portfolio_agent로 복사 후 원본 삭제
cp .github/workflows/ai-service-demo-huggingface.yml \
   ../AI_portfolio_agent/.github/workflows/demo-huggingface.yml

rm .github/workflows/ai-service-demo-huggingface.yml
```

---

### 2. Docker 설정 파일

#### docker-compose.yml
**수정 위치**: Line 36-47, 114-161

**제거할 주석 섹션**:
```yaml
# 제거 대상 1: Qdrant (Line 36-47)
  # qdrant:
  #   image: qdrant/qdrant:latest
  #   ...

# 제거 대상 2: AI Service (Line 114-161)
  # ai-service:
  #   build:
  #   ...
```

**volumes 섹션 수정**:
```yaml
# Line 184: 주석 제거
# qdrant_data:  # AI 서비스용 - 불필요
```

**작업**:
- [ ] 36-47 라인 삭제 (Qdrant 주석 섹션)
- [ ] 114-161 라인 삭제 (ai-service 주석 섹션)
- [ ] 184 라인 삭제 (qdrant_data volume)

---

#### docker-compose.demo.yml
**상태**: 전체 삭제 가능

- [ ] `docker-compose.demo.yml` 파일 삭제

```bash
rm docker-compose.demo.yml
```

---

### 3. Backend 설정 파일

#### application-local.yml
**수정 위치**: Line 137-139

**제거할 설정**:
```yaml
app:
  ai-service:
    url: http://localhost:8001
    timeout: 30000
```

**작업**:
- [ ] Line 137-139 삭제 또는 주석 처리

**수정 후**:
```yaml
app:
  # ai-service:  # 제거됨 - AI_portfolio_agent로 분리
  #   url: http://localhost:8001
  #   timeout: 30000
  github:
    username: yamang02
  contact:
    email: yamang02@gmail.com
```

---

#### application-staging.yml
**확인 필요**: ai-service 설정 있는지 확인

- [ ] `application-staging.yml` 검토
- [ ] ai-service 관련 설정 제거

---

#### application-production.yml
**확인 필요**: ai-service 설정 있는지 확인

- [ ] `application-production.yml` 검토
- [ ] ai-service 관련 설정 제거

---

## 🧪 테스트 코드 정리

### Backend 테스트 코드 확인

**확인 위치**:
```
backend/src/test/java/com/aiportfolio/backend/
```

**작업**:
- [ ] AIServiceClient 관련 테스트 코드 검색
- [ ] 발견 시 삭제

**검색 명령어**:
```bash
cd backend/src/test
grep -r "AIServiceClient" .
grep -r "aiservice" .
```

---

## 📚 문서 정리

### README 파일들

#### 프로젝트 루트 README.md
- [ ] ai-service 관련 설명 제거 또는 업데이트
- [ ] 아키텍처 다이어그램 업데이트

#### backend/README.md
- [ ] AI Service 통합 관련 내용 제거
- [ ] API 문서에서 관련 내용 제거

---

## 🔍 참조 검색 체크리스트

### 전역 검색으로 누락 확인

#### 1. AIServiceClient 참조
```bash
cd AI_PortFolio
grep -r "AIServiceClient" --include="*.java" .
```

**예상 결과**: 제거 대상 파일만 나와야 함

---

#### 2. ai-service 경로 참조
```bash
grep -r "ai-service" --include="*.yml" --include="*.yaml" .
```

**예상 결과**: GitHub Workflows와 docker-compose만 나와야 함

---

#### 3. localhost:8001 참조
```bash
grep -r "8001" --include="*.yml" --include="*.yaml" --include="*.java" .
```

**예상 결과**: 설정 파일에서만 발견, 제거 필요

---

#### 4. Qdrant 참조
```bash
grep -r "qdrant" --include="*.yml" .
```

**예상 결과**: docker-compose.yml 주석 섹션만

---

## 📋 최종 체크리스트

### Phase 1: 백업
- [ ] Git에 현재 상태 commit
- [ ] 새 브�ch 생성 (`feature/ai-service-migration`)
- [ ] ai-service/ 디렉토리 별도 백업 (선택사항)

### Phase 2: 코드 제거
- [ ] AIServiceClient 및 DTO 삭제
- [ ] application-*.yml 설정 제거
- [ ] docker-compose 정리
- [ ] GitHub Workflows 정리

### Phase 3: 참조 제거
- [ ] 전역 검색으로 누락 확인
- [ ] 테스트 코드 정리
- [ ] 문서 업데이트

### Phase 4: 검증
- [ ] Backend 빌드 성공
- [ ] Docker Compose 정상 실행
- [ ] 웹서비스 정상 작동

### Phase 5: 정리
- [ ] ai-service/ 디렉토리 삭제
- [ ] Commit 및 Push
- [ ] PR 생성 (선택사항)

---

## ⚠️ 삭제 전 확인사항

### 반드시 유지해야 할 것
- ✅ `GeminiLLMAdapter.java`
- ✅ `ChatController.java`
- ✅ `ChatApplicationService.java`
- ✅ `LLMPort.java` 인터페이스
- ✅ `GEMINI_API_KEY` 환경변수
- ✅ langchain4j 의존성

### 안전하게 삭제 가능한 것
- ✅ `ai-service/` 전체 (이동 후)
- ✅ `AIServiceClient.java` 전체
- ✅ `ai-service` 관련 설정
- ✅ Qdrant 관련 Docker 설정

---

**다음 문서**: [03-migration-steps.md](./03-migration-steps.md)
