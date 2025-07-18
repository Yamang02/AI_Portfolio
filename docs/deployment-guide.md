# Google Cloud Run 배포 가이드

## 📋 사전 요구사항

### 1. Google Cloud 계정 및 프로젝트
- Google Cloud 계정 생성
- 새 프로젝트 생성 또는 기존 프로젝트 선택
- 결제 계정 연결

### 2. 필요한 도구 설치
```bash
# Google Cloud CLI 설치
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Docker 설치 (Windows/Mac/Linux)
# https://docs.docker.com/get-docker/

# Node.js 18+ 설치
# https://nodejs.org/
```

### 3. Google Cloud 서비스 활성화
```bash
# 필요한 API 활성화
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🔧 환경 설정

### 1. 환경 변수 파일 생성
```bash
# env.example을 복사하여 .env.local 생성
cp env.example .env.local
```

### 2. .env.local 파일 편집
```bash
# 실제 값으로 변경
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
VITE_GITHUB_USERNAME=your_github_username
```

### 3. Google Cloud 프로젝트 설정
```bash
# 프로젝트 ID 설정
gcloud config set project YOUR_PROJECT_ID

# 기본 리전 설정
gcloud config set run/region asia-northeast3
```

## 🔐 Secret Manager 설정

### 1. Gemini API 키 설정
```bash
# Secret 생성
echo -n "your_gemini_api_key" | gcloud secrets create gemini-api-key --data-file=-

# 또는 파일에서 생성
echo "your_gemini_api_key" > gemini-key.txt
gcloud secrets create gemini-api-key --data-file=gemini-key.txt
rm gemini-key.txt
```

### 2. GitHub 사용자명 설정
```bash
echo -n "your_github_username" | gcloud secrets create github-username --data-file=-
```

## 🚀 배포 방법

### 방법 1: 수동 배포 (스크립트 사용)

1. **배포 스크립트 수정**
```bash
# scripts/deploy.sh 파일에서 PROJECT_ID 수정
PROJECT_ID="your-actual-project-id"
```

2. **스크립트 실행 권한 부여**
```bash
chmod +x scripts/deploy.sh
```

3. **배포 실행**
```bash
./scripts/deploy.sh
```

### 방법 2: GitHub Actions 자동 배포

1. **GitHub Secrets 설정**
   - `GCP_PROJECT_ID`: Google Cloud 프로젝트 ID
   - `GCP_SA_KEY`: 서비스 계정 키 (JSON)

2. **서비스 계정 생성**
```bash
# 서비스 계정 생성
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# 필요한 권한 부여
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# 서비스 계정 키 생성
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

3. **GitHub에 Secret 추가**
   - GitHub 레포지토리 → Settings → Secrets and variables → Actions
   - `GCP_SA_KEY`에 key.json 내용 추가
   - `GCP_PROJECT_ID`에 프로젝트 ID 추가

4. **main 브랜치에 푸시**
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

## 🔍 배포 확인

### 1. 서비스 상태 확인
```bash
gcloud run services describe ai-portfolio-chatbot --region=asia-northeast3
```

### 2. 로그 확인
```bash
gcloud logs read --service=ai-portfolio-chatbot --limit=50
```

### 3. 브라우저에서 접속
- 배포 완료 후 제공되는 URL로 접속
- AI 챗봇 기능 테스트

## 🛠 문제 해결

### 일반적인 문제들

1. **API 키 오류**
   - Secret Manager에서 API 키 확인
   - Cloud Run 서비스에 Secret 연결 확인

2. **GitHub API 제한**
   - GitHub API 요청 제한 확인
   - 인증 토큰 사용 고려

3. **메모리 부족**
   - Cloud Run 서비스 메모리 증가
   - 이미지 최적화

4. **빌드 실패**
   - Docker 로그 확인
   - 의존성 문제 해결

### 로그 확인 명령어
```bash
# 실시간 로그 확인
gcloud logs tail --service=ai-portfolio-chatbot

# 특정 시간대 로그
gcloud logs read --service=ai-portfolio-chatbot --format="table(timestamp,textPayload)" --limit=100
```

## 📊 모니터링

### 1. Cloud Monitoring 설정
- Google Cloud Console → Monitoring
- 대시보드 생성
- 알림 정책 설정

### 2. 주요 메트릭
- 요청 수
- 응답 시간
- 에러율
- 메모리 사용량

## 🔄 업데이트

### 자동 업데이트 (GitHub Actions)
- main 브랜치에 푸시하면 자동 배포

### 수동 업데이트
```bash
# 새 이미지 빌드 및 배포
docker build -t gcr.io/YOUR_PROJECT_ID/ai-portfolio-chatbot .
docker push gcr.io/YOUR_PROJECT_ID/ai-portfolio-chatbot
gcloud run deploy ai-portfolio-chatbot --image gcr.io/YOUR_PROJECT_ID/ai-portfolio-chatbot
```

## 💰 비용 최적화

### 1. 리소스 설정
- 메모리: 512Mi (필요시 조정)
- CPU: 1 (필요시 조정)
- 최대 인스턴스: 10 (트래픽에 따라 조정)

### 2. 비용 모니터링
- Google Cloud Console → Billing
- 예산 알림 설정
- 사용량 분석

---

*마지막 업데이트: 2024년 12월* 