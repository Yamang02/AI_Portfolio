# Optimized AI Service Dockerfile with Multi-stage build
FROM python:3.11-slim as base

# 시스템 의존성 최적화
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Stage 1: Dependencies installation (heavy caching layer)
FROM base as deps

# 기본 의존성 먼저 설치 (변경 빈도 낮음)
COPY requirements-base.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements-base.txt

# ML 의존성 분리 설치 (PyTorch CPU 전용으로 크기 줄이기)
COPY requirements-ml.txt .
RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch==2.1.1 \
    && pip install --no-cache-dir -r requirements-ml.txt

# Stage 2: Production image
FROM python:3.11-slim as production

# 시스템 의존성 (런타임만)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Python dependencies 복사 (deps 스테이지에서)
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# 애플리케이션 코드 복사 (마지막에)
COPY . .

# 비root 사용자 생성
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app
USER appuser

# 환경변수
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

# 프로덕션 실행
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