# GitHub Secrets 설정 단계별 가이드

## 🔐 필수 Secrets 목록 (기존 + Railway DB만 추가)

### 1. Google Cloud Platform (기존과 동일)
```
GCP_PROJECT_ID=your-gcp-project-id
GCP_SA_KEY={"type":"service_account","project_id":"..."}  # 전체 JSON
```

### 2. API Keys (기존과 동일)
```
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Railway Database (새로 추가)
```
RAILWAY_DATABASE_URL_STAGING=postgresql://postgres:password@staging-host:port/railway
RAILWAY_DATABASE_URL_PRODUCTION=postgresql://postgres:password@production-host:port/railway
```

## 📋 설정 단계

### Step 1: GitHub Repository Settings
1. GitHub 리포지토리 페이지로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Secrets and variables** → **Actions** 클릭

### Step 2: Railway Database URL 확인
1. Railway 대시보드 접속
2. PostgreSQL 프로젝트 선택
3. **Connect** 탭에서 **Database URL** 복사
4. 형식: `postgresql://postgres:password@host:port/railway`

### Step 3: Google Cloud Service Account 생성
```bash
# 1. Service Account 생성
gcloud iam service-accounts create github-actions-staging \
    --description="GitHub Actions for staging deployment" \
    --display-name="GitHub Actions Staging"

# 2. 필요한 권한 부여
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions-staging@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions-staging@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:github-actions-staging@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# 3. JSON 키 생성
gcloud iam service-accounts keys create github-actions-staging-key.json \
    --iam-account=github-actions-staging@YOUR_PROJECT_ID.iam.gserviceaccount.com

# 4. JSON 파일 내용을 복사해서 GCP_SA_KEY에 추가
cat github-actions-staging-key.json
```

### Step 4: 새로운 Secrets 추가 (Railway DB만)
기존 3개 Secrets은 그대로 두고, Railway DB URL 2개만 추가:

**기존 Secrets (이미 설정됨):**
- ✅ `GCP_PROJECT_ID`
- ✅ `GCP_SA_KEY` 
- ✅ `GEMINI_API_KEY`

**새로 추가할 Secrets:**

4. **RAILWAY_DATABASE_URL_STAGING**
   - Name: `RAILWAY_DATABASE_URL_STAGING`
   - Secret: Railway Staging 인스턴스의 DATABASE_URL

5. **RAILWAY_DATABASE_URL_PRODUCTION**
   - Name: `RAILWAY_DATABASE_URL_PRODUCTION`
   - Secret: Railway Production 인스턴스의 DATABASE_URL

## ✅ 설정 확인

### Secrets 목록 확인
GitHub → Settings → Secrets and variables → Actions에서 다음 5개 Secrets이 있는지 확인:
- ✅ GCP_PROJECT_ID (기존)
- ✅ GCP_SA_KEY (기존)
- ✅ GEMINI_API_KEY (기존)
- ✅ RAILWAY_DATABASE_URL_STAGING (새로 추가)
- ✅ RAILWAY_DATABASE_URL_PRODUCTION (새로 추가)

### 연결 테스트
```bash
# Railway DB 연결 테스트
./scripts/connect-railway.ps1

# 또는 직접 테스트
psql "postgresql://postgres:password@host:port/railway" -c "SELECT version();"
```

## 🚨 보안 주의사항

1. **Service Account JSON 키는 절대 코드에 포함하지 마세요**
2. **DATABASE_URL에 비밀번호가 포함되어 있으니 주의하세요**
3. **API 키들은 정기적으로 로테이션하세요**
4. **불필요한 권한은 부여하지 마세요**

## 🔧 문제 해결

### 일반적인 오류
- **GCP 권한 오류**: Service Account 권한 재확인
- **Database 연결 실패**: Railway URL 및 네트워크 확인
- **API 키 오류**: 키 유효성 및 할당량 확인