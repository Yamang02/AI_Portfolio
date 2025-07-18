#!/bin/bash

# Google Cloud Run 배포 스크립트
set -e

# 환경 변수 설정 (환경 변수에서 로드하거나 기본값 사용)
PROJECT_ID="${VITE_PROJECT_ID:-your-project-id}"
SERVICE_NAME="${VITE_SERVICE_NAME:-ai-portfolio-chatbot}"
REGION="${VITE_REGION:-asia-northeast3}"  # 서울 리전
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 AI Portfolio Chatbot 배포 시작..."

# 1. Google Cloud 프로젝트 설정
echo "📋 Google Cloud 프로젝트 설정..."
gcloud config set project $PROJECT_ID

# 2. Docker 이미지 빌드
echo "🔨 Docker 이미지 빌드 중..."
docker build -t $IMAGE_NAME .

# 3. 이미지를 Google Container Registry에 푸시
echo "📤 이미지 푸시 중..."
docker push $IMAGE_NAME

# 4. Cloud Run 서비스 배포
echo "🚀 Cloud Run 서비스 배포 중..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "VITE_ENVIRONMENT=production" \
  --set-env-vars "VITE_APP_NAME=AI Portfolio Chatbot"

# 5. 배포 완료 메시지
echo "✅ 배포 완료!"
echo "🌐 서비스 URL: $(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')"

# 6. 환경 변수 설정 안내
echo ""
echo "📝 다음 환경 변수를 Secret Manager에 설정하세요:"
echo "   - VITE_GEMINI_API_KEY"
echo "   - VITE_GITHUB_USERNAME"
echo ""
echo "🔧 Secret Manager 설정 명령어:"
echo "   gcloud secrets create gemini-api-key --data-file=-"
echo "   gcloud secrets create github-username --data-file=-"
echo ""
echo "🔗 Secret을 Cloud Run에 연결:"
echo "   gcloud run services update $SERVICE_NAME --region=$REGION --update-secrets=VITE_GEMINI_API_KEY=gemini-api-key:latest,VITE_GITHUB_USERNAME=github-username:latest" 