# 멀티스테이지 빌드를 위한 Dockerfile
# Stage 1: 빌드 단계
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# --- 환경 변수 선언 추가 시작 ---
ARG VITE_GEMINI_API_KEY
ARG VITE_EMAILJS_PUBLIC_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_EMAILJS_PUBLIC_KEY=$VITE_EMAILJS_PUBLIC_KEY
# --- 환경 변수 선언 추가 끝 ---

# 프로덕션 빌드
RUN npm run build

# Stage 2: 프로덕션 단계
FROM nginx:alpine

# nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 파일들을 nginx 서버로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 8080 노출 (Cloud Run 요구사항)
EXPOSE 8080

# nginx 시작
CMD ["nginx", "-g", "daemon off;"] 