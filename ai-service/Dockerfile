# Staging/Production Dockerfile (환경변수로 구분)
FROM python:3.11-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 포트 노출
EXPOSE 8000

# 환경변수 설정 (배포 시 덮어씌워짐)
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV DEBUG_MODE=false

# 헬스체크
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# 환경에 따라 다른 실행 방식
# DEBUG_MODE=true면 uvicorn (개발/스테이징), false면 gunicorn (프로덕션)
CMD if [ "$DEBUG_MODE" = "true" ]; then \
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload; \
    else \
        gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000; \
    fi
