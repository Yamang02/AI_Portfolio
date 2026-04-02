# Infrastructure Inventory (Public)

> 실제 리소스 ID/ARN은 `inventory.private.md` 참조 (로컬 전용)

## 📋 리소스 개요

### AWS 리소스 (Total: 13개 주요 리소스)

| 카테고리 | 리소스 타입 | 개수 | 용도 |
|---------|------------|------|------|
| DNS | Route53 Hosted Zone | 1 | yamang02.com 도메인 관리 |
| DNS | Route53 Records | 11 | A, AAAA, CNAME, TXT 레코드 |
| SSL | ACM Certificate | 2 | SSL/TLS 인증서 |
| Storage | S3 Bucket | 2 | Frontend 정적 파일 (Prod, Staging) |
| CDN | CloudFront Distribution | 2 | 글로벌 CDN (Prod, Staging) |
| IAM | Custom Policy | 2 | S3, CloudFront 접근 정책 |
| IAM | User | 5 | CI/CD, 관리용 |
| Network | VPC | 1 | Default VPC (ap-northeast-2) |

### GCP 리소스 (Total: 8개 주요 리소스)

| 카테고리 | 리소스 타입 | 개수 | 용도 |
|---------|------------|------|------|
| Compute | Cloud Run Service | 2 | Backend 실행 (Prod, Staging) |
| Registry | Container Image | 2 | Docker 이미지 (Prod, Staging) |
| Registry | Artifact Registry | 1 | 이미지 저장소 (14.6GB) |
| Data | BigQuery Dataset | 1 | 비용 분석 데이터 |
| IAM | Service Account | 1 | GitHub Actions 배포용 |
| Logging | Log Sink | 2 | 감사/일반 로그 (자동 생성) |

### 외부 서비스

| 서비스 | 타입 | 용도 |
|--------|------|------|
| Railway | PostgreSQL | 메인 데이터베이스 |
| Railway | Redis | 캐싱 및 세션 저장소 |
| Cloudinary | CDN | 이미지 저장 및 최적화 |
| Google Gemini | API | AI 챗봇 기능 |

## 🔄 DNS 레코드 구성

| 도메인 | 타입 | 대상 | 용도 |
|--------|------|------|------|
| yamang02.com | A/AAAA | CloudFront (Production) | 메인 도메인 |
| www.yamang02.com | A/AAAA | CloudFront (Production) | WWW 리다이렉트 |
| staging.yamang02.com | A | CloudFront (Staging) | 스테이징 환경 |
| design.yamang02.com | CNAME | GitHub Pages | 디자인 시스템 문서 |
| _acm-validation | CNAME | ACM Validation | SSL 인증서 검증 |
| @ | TXT | Google Site Verification | 구글 서치 콘솔 |

## 🌍 리전 분포

### AWS
- **ap-northeast-2** (Seoul): S3 Buckets
- **us-east-1** (N. Virginia): ACM Certificates, CloudFront
- **Global**: Route53, CloudFront Edge Locations

### GCP
- **asia-northeast3** (Seoul): Cloud Run Services
- **us** (Multi-region): Container Registry, BigQuery
- **global**: Logging, IAM

## 📈 리소스 사용량 (추정)

### 스토리지
- AWS S3: ~100MB (Frontend 빌드 파일)
- GCP Container Registry: 14.6GB (Docker 이미지)
- Cloudinary: 별도 관리

### 컴퓨팅
- Cloud Run (Production): 최소 1 인스턴스
- Cloud Run (Staging): 최소 0 인스턴스 (비용 절감)

### 네트워크
- CloudFront: 글로벌 엣지 분산
- Cloud Run: Public 엔드포인트

## 🔐 IAM 구조

### AWS
```
IAM Users:
├── admin (관리자)
├── ai-portfolio-user (애플리케이션)
└── github-actions-ai-portfolio (CI/CD)

Custom Policies:
├── AI-Portfolio-S3-Policy
└── AI-Portfolio-CloudFront-Policy
```

### GCP
```
Service Accounts:
└── github-actions@yamang02-ai-portfolio.iam.gserviceaccount.com
    ├── Cloud Run Admin
    ├── Artifact Registry Writer
    └── Service Account User
```

## 📊 비용 모니터링

- **BigQuery**: GCP 비용 분석 자동화
- **AWS Cost Explorer**: 수동 확인
- **애플리케이션**: 백엔드에서 비용 대시보드 제공

## ⚠️ 중요 사항

1. **실제 리소스 ID/ARN**: `inventory.private.md` 파일에만 기록 (Git에 커밋 금지)
2. **Access Key**: `.aws/credentials` 파일 (Git에 커밋 금지)
3. **환경변수**: GitHub Secrets로 관리
4. **SSL 인증서**: ACM 자동 갱신 (수동 작업 불필요)

## 🔄 업데이트 주기

- 새 리소스 추가 시: 즉시 문서 업데이트
- 정기 검토: 월 1회 (불필요한 리소스 정리)
- 비용 리뷰: 주 1회 (BigQuery 대시보드)

---

**마지막 업데이트**: 2026-04-02
**작성자**: Infrastructure Team
**참조**: [terraform-migration-plan.md](./terraform-migration-plan.md)
