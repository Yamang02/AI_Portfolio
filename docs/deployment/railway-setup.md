# Railway 설정

## 개요
Railway를 사용한 간편한 배포 및 데이터베이스 호스팅 설정입니다.

## Railway 프로젝트 설정

### 1. 프로젝트 생성
1. Railway 대시보드에서 새 프로젝트 생성
2. GitHub 레포지토리 연결
3. 환경별 서비스 분리 (스테이징/프로덕션)

### 2. PostgreSQL 데이터베이스
- **스테이징**: 별도 PostgreSQL 인스턴스
- **프로덕션**: 별도 PostgreSQL 인스턴스
- **연결 URL**: Railway에서 자동 생성

### 3. 환경 변수 설정
```bash
# 스테이징 환경
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=staging

# 프로덕션 환경  
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

## 배포 설정

### 자동 배포
- GitHub 레포지토리 연결 시 자동 배포 활성화
- 브랜치별 배포 설정 가능
- 환경 변수 자동 주입

### 수동 배포
```bash
# Railway CLI 사용
railway login
railway link
railway up
```

## 장점
- **간편한 설정**: 복잡한 인프라 설정 불필요
- **자동 SSL**: HTTPS 자동 설정
- **데이터베이스 통합**: PostgreSQL 호스팅 제공
- **비용 효율**: 사용량 기반 과금