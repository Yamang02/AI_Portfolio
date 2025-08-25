# AI Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 설치 (레이어별 캐싱 최적화)
RUN pip install --no-cache-dir --upgrade pip

# 1단계: 기본 FastAPI 의존성
COPY requirements-base.txt .
RUN pip install --no-cache-dir -r requirements-base.txt

# 2단계: PyTorch CPU 전용 (가장 무거움, 캐시 효율성 최대화)
RUN pip install --no-cache-dir torch==2.1.1 \
    --index-url https://download.pytorch.org/whl/cpu

# 3단계: 기타 ML 라이브러리
COPY requirements-ml.txt .
RUN pip install --no-cache-dir -r requirements-ml.txt

# 애플리케이션 코드 (가장 마지막 - 자주 변경됨)
COPY . .

# 빌드 도구 제거 (이미지 크기 최소화)
RUN apt-get purge -y --auto-remove gcc g++ \
    && rm -rf requirements*.txt

# 보안 설정 및 캐시 디렉토리 생성
RUN groupadd -r appuser && useradd -r -g appuser -m -d /home/appuser appuser \
    && mkdir -p /app/.cache/huggingface \
    && chown -R appuser:appuser /app
USER appuser

# 환경변수
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV HF_HOME=/app/.cache/huggingface

EXPOSE 8000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

# Gunicorn으로 실행
CMD gunicorn app.main:app \
    -w 2 \
    -k uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 300 \
    --max-requests 1000 \
    --max-requests-jitter 50 \
    --preload \
    --access-logfile - \
    --error-logfile - \
    --log-level info