# GitHub Secrets 설정 가이드

## 필수 Secrets

### Google Cloud Platform
- `GCP_PROJECT_ID`: Google Cloud 프로젝트 ID
- `GCP_SA_KEY`: Service Account JSON 키 (전체 JSON 내용)

### Railway Database
- `RAILWAY_DATABASE_URL`: Railway에서 제공하는 PostgreSQL 연결 URL
  - 형식: `postgresql://username:password@host:port/database`

### API Keys
- `GEMINI_API_KEY`: Google Gemini API 키
- `GITHUB_USERNAME`: GitHub 사용자명 (기본: Yamang02)

### Application Settings
- `CONTACT_EMAIL`: 연락처 이메일
- `ALLOWED_ORIGINS_STAGING`: 스테이징 환경 허용 도메인들 (쉼표로 구분)

## Secrets 설정 방법

1. GitHub 리포지토리 → Settings
2. Secrets and variables → Actions
3. New repository secret 클릭
4. 각 시크릿 이름과 값 입력

## Railway Database URL 확인 방법

```bash
# Railway CLI로 확인
railway variables

# 또는 Railway 대시보드에서 확인
# Project → PostgreSQL → Connect → Connection URL
```

## Google Cloud Service Account 생성

```bash
# Service Account 생성
gcloud iam service-accounts create github-actions \
    --description="GitHub Actions deployment" \
    --display-name="GitHub Actions"

# 권한 부여
gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# JSON 키 생성
gcloud iam service-accounts keys create key.json \
    --iam-account=github-actions@PROJECT_ID.iam.gserviceaccount.com
```