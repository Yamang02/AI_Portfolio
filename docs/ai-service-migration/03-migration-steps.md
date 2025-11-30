# AI Service Migration - 단계별 실행 가이드

## 🎯 실행 전 준비사항

### 1. Git 상태 확인
```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# 현재 상태 확인
git status

# 변경사항이 있다면 commit
git add .
git commit -m "feat: Save current state before ai-service migration"
```

### 2. 백업 브랜치 생성
```bash
# 현재 브랜치 확인
git branch

# 마이그레이션 브랜치 생성
git checkout -b feature/ai-service-migration

# 백업 태그 생성 (선택사항)
git tag -a backup-before-migration -m "Backup before ai-service migration"
```

### 3. 환경 확인
```bash
# Docker 컨테이너 중지
docker-compose down

# 깨끗한 상태에서 시작
docker system prune -f
```

---

## 📦 Phase 1: ai-service 이동 (AI_portfolio_agent로)

### Step 1.1: demo 디렉토리 이동

```bash
# AI_portfolio_agent 프로젝트로 이동
cd C:\Users\ljj02\Desktop\dev\AI_portfolio_agent

# demo 디렉토리 복사
cp -r ../AI_PortFolio/ai-service/demo ./demo

# common 디렉토리 복사 (필요한 경우)
cp -r ../AI_PortFolio/ai-service/common ./common
```

**검증**:
```bash
# 파일 복사 확인
ls -la demo/
ls -la demo/main.py

# 파일 개수 확인
find demo/ -type f | wc -l
```

---

### Step 1.2: GitHub Workflow 이동

```bash
cd C:\Users\ljj02\Desktop\dev\AI_portfolio_agent

# workflows 디렉토리 생성 (없는 경우)
mkdir -p .github/workflows

# HuggingFace 배포 워크플로우 복사
cp ../AI_PortFolio/.github/workflows/ai-service-demo-huggingface.yml \
   .github/workflows/demo-huggingface.yml
```

---

### Step 1.3: Workflow 경로 수정

**파일**: `AI_portfolio_agent/.github/workflows/demo-huggingface.yml`

**수정 전**:
```yaml
paths:
  - 'ai-service/demo/**'
  - 'ai-service/common/**'
  - '.github/workflows/ai-service-demo-huggingface.yml'
```

**수정 후**:
```yaml
paths:
  - 'demo/**'
  - 'common/**'
  - '.github/workflows/demo-huggingface.yml'
```

**수정 명령어**:
```bash
cd C:\Users\ljj02\Desktop\dev\AI_portfolio_agent

# 경로 수정 (수동으로 에디터에서 수정 권장)
# sed를 사용하는 경우:
sed -i "s|ai-service/demo|demo|g" .github/workflows/demo-huggingface.yml
sed -i "s|ai-service/common|common|g" .github/workflows/demo-huggingface.yml
sed -i "s|ai-service-demo-huggingface.yml|demo-huggingface.yml|g" .github/workflows/demo-huggingface.yml
```

---

### Step 1.4: AI_portfolio_agent에서 테스트

```bash
cd C:\Users\ljj02\Desktop\dev\AI_portfolio_agent

# Demo 실행 테스트
cd demo
python main.py &
DEMO_PID=$!

# 30초 대기
sleep 30

# Health check
curl http://localhost:7860/ || echo "Demo failed to start"

# 프로세스 종료
kill $DEMO_PID
```

---

### Step 1.5: AI_portfolio_agent Git Commit

```bash
cd C:\Users\ljj02\Desktop\dev\AI_portfolio_agent

git add .
git commit -m "feat: Add demo and common from AI_PortFolio migration

- Migrated ai-service/demo → demo/
- Migrated ai-service/common → common/
- Added HuggingFace deployment workflow
- Updated paths in workflow file
"

git push origin staging  # 또는 main
```

---

## 🗑️ Phase 2: AI_PortFolio 정리

### Step 2.1: Backend AIServiceClient 제거

```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# AIServiceClient 디렉토리 제거
rm -rf backend/src/main/java/com/aiportfolio/backend/infrastructure/external/aiservice/
```

**검증**:
```bash
# 디렉토리 삭제 확인
ls backend/src/main/java/com/aiportfolio/backend/infrastructure/external/

# 참조 확인 (아무것도 나오지 않아야 함)
grep -r "AIServiceClient" backend/src/ || echo "No references found - OK"
```

---

### Step 2.2: 설정 파일 정리

#### application-local.yml
```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# 백업
cp backend/src/main/resources/application-local.yml \
   backend/src/main/resources/application-local.yml.bak
```

**수동 수정**: `backend/src/main/resources/application-local.yml`

**Line 137-139 제거**:
```yaml
# 제거 전:
app:
  ai-service:
    url: http://localhost:8001
    timeout: 30000
  github:
    username: yamang02

# 제거 후:
app:
  github:
    username: yamang02
```

---

#### application-staging.yml 확인
```bash
# ai-service 설정이 있는지 확인
grep -n "ai-service" backend/src/main/resources/application-staging.yml

# 있다면 제거
```

---

#### application-production.yml 확인
```bash
# ai-service 설정이 있는지 확인
grep -n "ai-service" backend/src/main/resources/application-production.yml

# 있다면 제거
```

---

### Step 2.3: docker-compose.yml 정리

```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# 백업
cp docker-compose.yml docker-compose.yml.bak
```

**수동 수정**: `docker-compose.yml`

**제거할 라인**:
1. Line 36-47: Qdrant 주석 섹션
2. Line 114-161: ai-service 주석 섹션
3. Line 184: `# qdrant_data:` 주석

**확인**:
```bash
# Qdrant 참조 없는지 확인
grep -n "qdrant" docker-compose.yml || echo "No qdrant references - OK"

# ai-service 참조 없는지 확인
grep -n "ai-service" docker-compose.yml || echo "No ai-service references - OK"
```

---

### Step 2.4: docker-compose.demo.yml 삭제

```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# 백업 후 삭제
mv docker-compose.demo.yml docker-compose.demo.yml.bak

# 또는 완전 삭제
rm docker-compose.demo.yml
```

---

### Step 2.5: GitHub Workflows 정리

```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# ai-service 관련 워크플로우 삭제
rm .github/workflows/ai-service-demo-huggingface.yml
rm .github/workflows/ai-service-staging-cloudrun.yml

# 삭제 확인
ls .github/workflows/
```

**남아있어야 할 워크플로우**:
- `backend-staging-cloudrun.yml`
- `backend-production-cloudrun.yml`
- `frontend-staging-aws.yml`
- `frontend-production-aws.yml`

---

### Step 2.6: ai-service 디렉토리 삭제

```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# 최종 백업 (선택사항)
tar -czf ai-service-backup-$(date +%Y%m%d).tar.gz ai-service/

# 디렉토리 삭제
rm -rf ai-service/

# 삭제 확인
ls -la | grep ai-service || echo "ai-service directory removed - OK"
```

---

## ✅ Phase 3: 검증 및 테스트

### Step 3.1: Backend 빌드 테스트

```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio\backend

# Maven 빌드
mvn clean compile

# 성공 확인
echo $?  # 0이면 성공
```

---

### Step 3.2: Docker Compose 테스트

```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# Docker Compose 시작
docker-compose up -d

# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs backend | tail -50

# Health check
curl http://localhost:8080/actuator/health
```

**예상 결과**:
```
NAME                    STATUS
ai-portfolio-postgres   Up (healthy)
ai-portfolio-redis      Up
ai-portfolio-backend    Up (healthy)
```

---

### Step 3.3: 웹서비스 기능 테스트

```bash
# Backend API 테스트
curl http://localhost:8080/api/data

# Chat API 테스트 (Gemini LLM)
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"question":"안녕하세요"}'

# Admin API 테스트
curl http://localhost:8080/admin/api/projects
```

---

### Step 3.4: 전역 참조 검사

```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# AIServiceClient 참조 확인 (없어야 함)
grep -r "AIServiceClient" --include="*.java" . || echo "✅ No AIServiceClient references"

# ai-service 경로 참조 확인 (없어야 함)
grep -r "ai-service" --include="*.yml" --include="*.yaml" . || echo "✅ No ai-service path references"

# localhost:8001 참조 확인 (없어야 함)
grep -r "8001" --include="*.yml" --include="*.yaml" --include="*.java" . || echo "✅ No port 8001 references"

# Qdrant 참조 확인 (없어야 함)
grep -r "qdrant" --include="*.yml" . || echo "✅ No qdrant references"
```

---

## 📝 Phase 4: Commit 및 문서화

### Step 4.1: AI_PortFolio Git Commit

```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# 변경사항 확인
git status

# Staging
git add .

# Commit
git commit -m "refactor: Remove ai-service and clean up dependencies

Breaking Changes:
- Removed ai-service/ directory (migrated to AI_portfolio_agent)
- Removed AIServiceClient and related DTOs (unused code)
- Removed ai-service configuration from application-*.yml
- Cleaned up docker-compose.yml (removed qdrant, ai-service)
- Removed ai-service related GitHub workflows

Current Chat Service:
- Still using GeminiLLMAdapter for direct LLM calls
- No functionality impact on production service

Migration Details:
- ai-service/demo → AI_portfolio_agent/demo
- ai-service/common → AI_portfolio_agent/common
- GitHub workflows moved to AI_portfolio_agent

Refs: docs/ai-service-migration/
"

# Push
git push origin feature/ai-service-migration
```

---

### Step 4.2: 마이그레이션 완료 보고서 작성

**파일 생성**: `docs/ai-service-migration/06-migration-report.md`

```markdown
# AI Service Migration - 완료 보고서

## 실행 일시
- 시작: YYYY-MM-DD HH:MM
- 완료: YYYY-MM-DD HH:MM

## 작업 내용
- [x] ai-service → AI_portfolio_agent 이동
- [x] AIServiceClient 제거
- [x] 설정 파일 정리
- [x] Docker 설정 정리
- [x] GitHub Workflows 정리
- [x] 전역 참조 검사 완료
- [x] 테스트 완료

## 제거된 파일/디렉토리
- ai-service/ (전체)
- AIServiceClient.java 및 DTO
- docker-compose.demo.yml
- .github/workflows/ai-service-*

## 테스트 결과
- Backend 빌드: ✅ 성공
- Docker Compose: ✅ 정상
- 웹서비스: ✅ 정상
- Chat API: ✅ 정상 (Gemini LLM)

## 다음 단계
- [ ] AI_portfolio_agent 배포
- [ ] Demo HuggingFace 배포
- [ ] Backend ↔ AI Agent 통합 (선택)
```

---

## 🔄 Phase 5: 롤백 (필요시)

### 롤백 방법

```bash
cd C:\Users\ljj02\Desktop\dev\AI_PortFolio

# 브랜치 삭제 및 원래 브랜치로 복귀
git checkout staging  # 또는 main
git branch -D feature/ai-service-migration

# 태그로 롤백 (태그 생성한 경우)
git reset --hard backup-before-migration

# 강제 푸시 (주의!)
git push -f origin staging
```

---

## ✅ 최종 체크리스트

### AI_PortFolio 정리 완료
- [ ] ai-service/ 디렉토리 삭제
- [ ] AIServiceClient 관련 코드 제거
- [ ] 설정 파일 정리 (application-*.yml)
- [ ] docker-compose.yml 정리
- [ ] GitHub Workflows 정리
- [ ] 전역 참조 검사 완료
- [ ] Backend 빌드 성공
- [ ] Docker Compose 정상 실행
- [ ] 웹서비스 정상 작동
- [ ] Git Commit & Push 완료

### AI_portfolio_agent 이동 완료
- [ ] demo/ 디렉토리 이동
- [ ] common/ 디렉토리 이동
- [ ] GitHub Workflow 이동
- [ ] Demo 실행 테스트 성공
- [ ] Git Commit & Push 완료

### 문서화 완료
- [ ] 마이그레이션 보고서 작성
- [ ] README 업데이트
- [ ] 아키텍처 문서 업데이트

---

**이전 문서**: [02-code-removal-checklist.md](./02-code-removal-checklist.md)
**다음 문서**: [04-testing-guide.md](./04-testing-guide.md)
