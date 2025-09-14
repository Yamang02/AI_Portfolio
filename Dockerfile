# 멀티스테이지 빌드를 위한 Dockerfile
# Stage 1: Frontend 빌드
FROM node:18-alpine AS frontend-builder

# 작업 디렉토리 설정
WORKDIR /app/frontend

# Frontend 의존성 설치
COPY frontend/package*.json ./
RUN npm ci

# Frontend 소스 코드 복사
COPY frontend/ ./

# 환경 변수 설정
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Frontend 빌드
RUN npm run build

# Stage 2: Backend 빌드
FROM maven:3.8.4-openjdk-17 AS backend-builder

# 작업 디렉토리 설정
WORKDIR /app/backend

# Backend 소스 코드 복사
COPY backend/ ./

# Backend 빌드
RUN mvn clean package -DskipTests

# Stage 3: 프로덕션 단계
FROM eclipse-temurin:17-jre-alpine

# 필수 패키지 설치 (curl for health checks)
RUN apk add --no-cache curl

# 작업 디렉토리 설정
WORKDIR /app

# Backend JAR 파일 복사
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Frontend 빌드 결과를 정적 파일로 서빙하기 위한 설정
COPY --from=frontend-builder /app/frontend/dist /app/static

# 포트 8080 노출 (Cloud Run에서는 동적 PORT 사용)
EXPOSE 8080

# Health check (로컬 테스트용)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

# JVM 최적화 설정으로 Spring Boot 애플리케이션 실행
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"] 