# AI Service Migration - 의존성 분석

## 📊 Backend (Spring Boot) 의존성 분석

### 현재 AI 관련 의존성

#### 1. **LangChain4j (Gemini 통합)**
```xml
<!-- pom.xml에서 확인 필요 -->
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-google-ai-gemini</artifactId>
</dependency>
```

**상태**: ✅ **유지 필요**
- 현재 `GeminiLLMAdapter`에서 직접 사용 중
- 웹서비스의 채팅 기능에 필수
- 제거 불가

---

#### 2. **AI Service Client 관련**
**파일 위치**:
```
backend/src/main/java/com/aiportfolio/backend/infrastructure/external/aiservice/
├── AIServiceClient.java
├── dto/
│   ├── AIServiceChatRequest.java
│   ├── AIServiceChatResponse.java
│   └── AIServiceHealthResponse.java
```

**상태**: ❌ **제거 대상 (데드 코드)**
- 현재 사용되지 않음
- `GeminiLLMAdapter`가 직접 LLM 호출
- 삭제 안전

**제거 후 영향**: 없음

---

### 환경 변수 의존성

#### application-local.yml
```yaml
app:
  ai-service:
    url: http://localhost:8001  # ❌ 사용 안 함
    timeout: 30000
```

**조치**:
- [ ] `app.ai-service.*` 설정 제거 또는 주석 처리
- [ ] `GEMINI_API_KEY` 유지 (필수)

---

## 🎨 Frontend 의존성 분석

### AI 관련 의존성 점검

#### package.json 확인 필요
```json
{
  "dependencies": {
    // AI 관련 라이브러리가 있는지 확인
  }
}
```

**예상 결과**: Frontend는 AI 라이브러리 직접 사용 안 함
- 단순 API 호출만 수행 (`chatbotService.ts`)
- 추가 정리 불필요

---

## 🐳 Docker 설정 분석

### docker-compose.yml

#### 현재 설정
```yaml
# ✅ 운영 중
postgres:   # 유지
redis:      # 유지
backend:    # 유지

# ❌ 주석 처리됨 (미사용)
# qdrant:     # 제거 가능
# ai-service: # 제거 가능
```

**조치**:
- [ ] 주석 처리된 `qdrant` 섹션 완전 삭제
- [ ] 주석 처리된 `ai-service` 섹션 완전 삭제
- [ ] `volumes`에서 `qdrant_data` 제거

---

## 📦 제거 가능한 파일 및 디렉토리

### 1. ai-service/ 전체 디렉토리
```bash
AI_PortFolio/ai-service/
├── demo/           # → AI_portfolio_agent로 이동 후 삭제
├── prod/           # → 삭제 (미사용)
├── common/         # → AI_portfolio_agent로 이동 후 삭제
└── README.md       # → 삭제
```

**크기**: 약 수백 MB (모델 캐시 포함)

---

### 2. Backend AI Service Client 코드
```
backend/src/main/java/com/aiportfolio/backend/infrastructure/external/aiservice/
└── 전체 삭제 (데드 코드)
```

---

### 3. GitHub Workflows
```
.github/workflows/
├── ai-service-demo-huggingface.yml      # → AI_portfolio_agent로 이동
├── ai-service-staging-cloudrun.yml      # → 삭제 (미사용)
```

---

## 🔍 의존성 검증 체크리스트

### Backend 검증
- [ ] `pom.xml`에서 AI 관련 의존성 확인
- [ ] `GeminiLLMAdapter` 정상 작동 확인 (유지)
- [ ] `AIServiceClient` 참조 여부 확인 (제거)
- [ ] 환경변수 사용 여부 확인

### Frontend 검증
- [ ] `package.json`에서 AI 라이브러리 확인
- [ ] `chatbotService.ts` API 호출만 수행하는지 확인
- [ ] 불필요한 의존성 없는지 확인

### Docker 검증
- [ ] `docker-compose.yml` 불필요한 서비스 확인
- [ ] Volume 정리 확인
- [ ] Network 설정 검토

---

## 📋 의존성 정리 TODO

### High Priority (즉시 실행 가능)
1. [ ] `ai-service/` 디렉토리 백업
2. [ ] `AIServiceClient.java` 및 관련 DTO 삭제
3. [ ] `application-local.yml`에서 `ai-service` 설정 제거
4. [ ] `docker-compose.yml`에서 주석 섹션 완전 삭제

### Medium Priority
5. [ ] `.github/workflows/ai-service-staging-cloudrun.yml` 삭제
6. [ ] 테스트 코드에서 AI Service 관련 참조 제거

### Low Priority
7. [ ] 문서에서 ai-service 관련 내용 업데이트
8. [ ] README 업데이트

---

## ⚠️ 주의사항

### 제거하면 안 되는 것
- ❌ `GeminiLLMAdapter.java` (현재 채팅 기능 사용 중)
- ❌ `langchain4j` 의존성 (Gemini 통합)
- ❌ `GEMINI_API_KEY` 환경변수
- ❌ `ChatController`, `ChatApplicationService` (채팅 API)

### 제거해도 되는 것
- ✅ `ai-service/` 전체 디렉토리
- ✅ `AIServiceClient.java` 및 DTO들
- ✅ `app.ai-service.*` 설정
- ✅ Qdrant 관련 설정 (docker-compose.yml)

---

**다음 문서**: [02-code-removal-checklist.md](./02-code-removal-checklist.md)
