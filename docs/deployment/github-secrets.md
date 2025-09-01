# GitHub Secrets 설정

## 개요
GitHub Secrets를 사용한 안전한 환경 변수 관리 방법입니다.

## 필수 Secrets

### GCP 관련
- `GCP_PROJECT_ID`: Google Cloud 프로젝트 ID
- `GCP_SA_KEY`: 서비스 계정 키 (JSON)

### API 키
- `GEMINI_API_KEY`: Google Gemini API 키
- `GITHUB_TOKEN`: GitHub API 토큰 (선택사항)

## 설정 방법

### 1. 서비스 계정 생성
```bash
# 서비스 계정 생성
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# 필요한 권한 부여
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# 서비스 계정 키 생성
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 2. GitHub Secrets 추가
1. GitHub 레포지토리 → Settings → Secrets and variables → Actions
2. `GCP_SA_KEY`에 key.json 내용 추가
3. `GCP_PROJECT_ID`에 프로젝트 ID 추가
4. `GEMINI_API_KEY`에 API 키 추가

## 보안 원칙
- **절대 커밋 금지**: API 키를 코드에 직접 포함하지 않음
- **최소 권한**: 필요한 권한만 부여
- **정기 갱신**: 서비스 계정 키 정기적 갱신