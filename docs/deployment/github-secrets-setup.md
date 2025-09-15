# GitHub Secrets 설정 가이드

## 개요
GitHub Secrets를 사용한 안전한 환경 변수 관리 설정 가이드입니다.

## 설정 단계

### 1. GitHub Secrets 접근
1. GitHub 레포지토리 → Settings
2. Secrets and variables → Actions
3. New repository secret 클릭

### 2. 필수 Secrets 설정

#### GCP 관련
- `GCP_PROJECT_ID`: Google Cloud 프로젝트 ID
- `GCP_SA_KEY`: 서비스 계정 JSON 키 (전체 내용)

#### 데이터베이스
- `RAILWAY_DATABASE_URL_STAGING`: 스테이징 PostgreSQL 연결 URL
- `RAILWAY_DATABASE_URL_PRODUCTION`: 프로덕션 PostgreSQL 연결 URL

#### API 키
- `GEMINI_API_KEY`: Google Gemini API 키
- `GITHUB_USERNAME`: GitHub 사용자명

#### 애플리케이션 설정
- `CONTACT_EMAIL`: 연락처 이메일
- `ALLOWED_ORIGINS_STAGING`: 스테이징 환경 허용 도메인

### 3. 서비스 계정 생성
```bash
# 서비스 계정 생성
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# 권한 부여
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# JSON 키 생성
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@PROJECT_ID.iam.gserviceaccount.com
```

## 보안 원칙
- **절대 커밋 금지**: API 키를 코드에 직접 포함하지 않음
- **최소 권한**: 필요한 권한만 부여
- **정기 갱신**: 서비스 계정 키 정기적 갱신
- **환경 분리**: 스테이징과 프로덕션 환경별 Secrets 분리