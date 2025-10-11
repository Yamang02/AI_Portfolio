# Backend 전용 Dockerfile (FE 분리)
FROM maven:3.8.4-openjdk-17 AS backend-builder

# 작업 디렉토리 설정
WORKDIR /app/backend

# Maven 파일만 먼저 복사하여 의존성 캐싱
COPY backend/pom.xml backend/mvnw ./
COPY backend/.mvn .mvn

# 의존성 미리 다운로드 (Docker 레이어 캐싱 활용)
RUN mvn dependency:go-offline -B

# Backend 소스 코드 복사
COPY backend/src ./src

# Backend 빌드
RUN mvn clean package -DskipTests -B

# 프로덕션 단계
FROM eclipse-temurin:17-jre-alpine

# 필수 패키지 설치 (curl for health checks)
RUN apk add --no-cache curl

# 작업 디렉토리 설정
WORKDIR /app

# Backend JAR 파일 복사
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# 포트 8080 노출 (Cloud Run에서는 동적 PORT 사용)
EXPOSE 8080

# Health check (로컬 테스트용)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

# JVM 최적화 설정으로 Spring Boot 애플리케이션 실행
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
