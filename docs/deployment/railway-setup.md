# Railway PostgreSQL 설정 가이드

## 1. Railway 프로젝트 생성

1. [Railway](https://railway.app) 접속 및 로그인
2. "New Project" → "Provision PostgreSQL"
3. 프로젝트 이름: `ai-portfolio-db-staging`

## 2. 데이터베이스 초기화

### 연결 정보 확인
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 환경변수 확인
railway variables
```

### 스키마 및 데이터 배포
```bash
# 로컬에서 Railway DB에 스키마 배포
export DATABASE_URL="postgresql://username:password@host:port/database"
./scripts/deploy-db-schema.sh $DATABASE_URL
```

## 3. Railway 환경변수 설정

Railway 대시보드에서 다음 환경변수들을 설정:

### PostgreSQL 설정 (자동 생성됨)
- `DATABASE_URL`: PostgreSQL 연결 URL
- `PGDATABASE`: 데이터베이스 이름
- `PGHOST`: 호스트
- `PGPASSWORD`: 비밀번호
- `PGPORT`: 포트
- `PGUSER`: 사용자명

## 4. 백업 및 모니터링

### 자동 백업 설정
Railway는 자동으로 백업을 제공하지만, 추가 백업 스크립트를 설정할 수 있습니다:

```bash
# 백업 스크립트
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 모니터링
- Railway 대시보드에서 메트릭 확인
- 연결 수, CPU, 메모리 사용량 모니터링
- 알림 설정 (선택사항)

## 5. 보안 설정

### IP 화이트리스트 (Pro 플랜)
필요시 특정 IP만 접근 허용 설정

### SSL 연결
Railway는 기본적으로 SSL 연결을 제공합니다.

## 6. 비용 관리

### Free Tier 제한
- 월 $5 크레딧
- 500시간 실행 시간
- 1GB RAM
- 1GB 디스크

### 사용량 모니터링
Railway 대시보드에서 실시간 사용량 확인