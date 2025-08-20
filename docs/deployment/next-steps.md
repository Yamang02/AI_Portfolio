# 스테이징 환경 설정 다음 단계

## 🎯 현재 상황
- ✅ Railway PostgreSQL 인스턴스 준비됨
- ✅ GitHub Actions 워크플로우 생성됨
- ✅ 스테이징 환경 설정 파일 준비됨
- ✅ 배포 스크립트 준비됨

## 📋 실행 순서

### 1. Railway 데이터베이스 설정
```powershell
# Railway 콘솔에서 DATABASE_URL 복사 후 실행
./scripts/connect-railway.ps1
```

**확인사항:**
- [ ] Railway 콘솔에서 DATABASE_URL 복사
- [ ] 스키마 배포 성공
- [ ] 초기 데이터 삽입 확인
- [ ] 테이블 생성 확인

### 2. GitHub Secrets 설정
GitHub Repository → Settings → Secrets and variables → Actions

**필수 Secrets:**
- [ ] `GCP_PROJECT_ID` - Google Cloud 프로젝트 ID
- [ ] `GCP_SA_KEY` - Service Account JSON 키 (전체 내용)
- [ ] `RAILWAY_DATABASE_URL` - Railway에서 복사한 DATABASE_URL
- [ ] `GEMINI_API_KEY` - Google AI Studio API 키
- [ ] `GITHUB_USERNAME` - GitHub 사용자명 (Yamang02)
- [ ] `CONTACT_EMAIL` - 연락처 이메일
- [ ] `ALLOWED_ORIGINS_STAGING` - 스테이징 허용 도메인

### 3. Google Cloud Service Account 생성
```bash
# Service Account 생성 및 권한 부여
gcloud iam service-accounts create github-actions-staging \
    --description="GitHub Actions for staging deployment"

# 필요한 권한 부여
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions-staging@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions-staging@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions-staging@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# JSON 키 생성
gcloud iam service-accounts keys create github-actions-staging-key.json \
    --iam-account=github-actions-staging@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 4. 스테이징 브랜치 생성 및 첫 배포
```bash
# 스테이징 브랜치 생성 및 배포
git checkout -b staging
git push origin staging
```

**또는 스크립트 사용:**
```bash
./scripts/setup-staging-branch.sh
```

### 5. 배포 상태 확인
```powershell
# 배포 완료 후 상태 확인
./scripts/check-staging-deployment.ps1 -ProjectId "your-gcp-project-id"
```

## 🔍 배포 확인 체크리스트

### GitHub Actions 확인
- [ ] 워크플로우가 성공적으로 실행됨
- [ ] 테스트 단계 통과
- [ ] 빌드 단계 성공
- [ ] 배포 단계 완료

### Cloud Run 서비스 확인
- [ ] `ai-portfolio-backend-staging` 서비스 생성됨
- [ ] `ai-portfolio-frontend-staging` 서비스 생성됨
- [ ] 서비스 URL 접속 가능
- [ ] 헬스체크 엔드포인트 응답

### 데이터베이스 연결 확인
- [ ] 백엔드에서 Railway DB 연결 성공
- [ ] API 엔드포인트에서 데이터 조회 가능
- [ ] 로그에 DB 연결 오류 없음

### 프론트엔드-백엔드 연동 확인
- [ ] 프론트엔드에서 백엔드 API 호출 성공
- [ ] CORS 설정 정상 동작
- [ ] 포트폴리오 데이터 정상 표시

## 🚨 문제 해결

### 일반적인 오류와 해결방법

**1. GitHub Actions 빌드 실패**
```bash
# 로컬에서 빌드 테스트
cd backend
mvn clean package -DskipTests

cd ../frontend
npm ci
npm run build
```

**2. Cloud Run 배포 실패**
- GCP Service Account 권한 확인
- 프로젝트 ID 정확성 확인
- 리전 설정 확인 (asia-northeast3)

**3. 데이터베이스 연결 실패**
- Railway DATABASE_URL 정확성 확인
- 네트워크 연결 상태 확인
- 환경변수 설정 확인

**4. CORS 오류**
- `ALLOWED_ORIGINS_STAGING` 설정 확인
- 프론트엔드 도메인 정확성 확인
- 백엔드 CORS 설정 확인

## 📞 지원 및 문의

### 로그 확인 방법
```bash
# GitHub Actions 로그
# GitHub → Actions → 해당 워크플로우 클릭

# Cloud Run 로그
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ai-portfolio-backend-staging" --limit=50

# Railway 로그
# Railway Dashboard → PostgreSQL → Logs
```

### 유용한 명령어
```bash
# Cloud Run 서비스 목록
gcloud run services list --region=asia-northeast3

# 특정 서비스 상세 정보
gcloud run services describe ai-portfolio-backend-staging --region=asia-northeast3

# 최근 배포 리비전 확인
gcloud run revisions list --service=ai-portfolio-backend-staging --region=asia-northeast3
```

## 🎉 성공 기준

모든 단계가 완료되면:
- ✅ 스테이징 환경에서 애플리케이션 정상 동작
- ✅ Railway PostgreSQL 연결 및 데이터 조회 성공
- ✅ GitHub Actions 자동 배포 파이프라인 구축
- ✅ 프로덕션과 동일한 환경에서 테스트 가능

이제 안전하게 새로운 기능을 스테이징에서 테스트한 후 프로덕션에 배포할 수 있습니다!