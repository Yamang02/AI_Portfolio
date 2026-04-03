# Infrastructure Documentation

AI Portfolio 프로젝트의 인프라 구성 및 관리 문서입니다.

## 📁 문서 구조

- **[inventory.md](./inventory.md)** - 현재 인프라 리소스 인벤토리 (공개)
- **inventory.private.md** - 실제 리소스 ID/ARN 포함 (`.gitignore` 처리)
- **[terraform-migration-plan.md](./terraform-migration-plan.md)** - IaC 마이그레이션 계획
- **[aws-manual-operations-admin-and-cache.md](./aws-manual-operations-admin-and-cache.md)** - Admin 전용 호스트·ACM·CloudFront 수동 작업 및 HTML 엣지 캐시 정책 메모
- **[cache-analysis-staging.md](./cache-analysis-staging.md)** - 스테이징 캐시 이슈 분석 (CachingDisabled 적용과 함께 참고)

## 🏗️ 인프라 개요

### 아키텍처

```
┌─────────────────────────────────────────────┐
│         Frontend (React + Vite)             │
│   AWS S3 + CloudFront (정적 호스팅)         │
│   DNS: Route53 (yamang02.com)               │
│   SSL: ACM (*.yamang02.com)                 │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────┐
│        Backend (Spring Boot)                │
│      GCP Cloud Run (Container)              │
│   - Production: asia-northeast3             │
│   - Staging: asia-northeast3                │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Data & Services                     │
│   - PostgreSQL (Railway)                    │
│   - Redis (Caching/Session)                 │
│   - BigQuery (Cost Analysis)                │
│   - Cloudinary (Image Storage)              │
└─────────────────────────────────────────────┘
```

### 멀티 클라우드 전략

- **AWS**: Frontend 정적 호스팅 + CDN + DNS
- **GCP**: Backend 컨테이너 실행 + 비용 분석
- **Railway**: Managed PostgreSQL + Redis
- **Cloudinary**: 이미지 저장 및 최적화

## 🚀 배포 환경

| 환경 | Frontend | Backend | 도메인 |
|------|----------|---------|--------|
| **Production** | CloudFront (E384…) | Cloud Run (ai-portfolio) | www.yamang02.com, **admin.yamang02.com** (Admin MPA) |
| **Staging** | CloudFront (E7KK…) | Cloud Run (ai-portfolio-staging) | staging.yamang02.com, **admin.staging.yamang02.com** (Admin MPA) |

## 🔐 보안

- SSL/TLS: AWS ACM 자동 갱신
- IAM: 최소 권한 원칙 적용
- Secrets: 환경변수로 관리 (GitHub Secrets)
- CORS: 화이트리스트 기반 설정

## 📊 모니터링

- **GCP Cloud Run**: 자동 메트릭 수집
- **BigQuery**: 비용 분석 대시보드
- **CloudFront**: Access 로그 (필요 시)

## 🛠️ 인프라 관리

### 현재 상태 (2026-04)
- **Terraform**: `infrastructure/terraform/` 에 모듈·환경 정의 (일부 리소스는 CLI로 선적용 후 state 드리프트 가능 — [aws-manual-operations-admin-and-cache.md](./aws-manual-operations-admin-and-cache.md) 참고)
- **수동/CLI 이력**: Admin 호스트·ACM·CloudFront Function·HTML용 CachingDisabled 등은 위 메모에 정리

### 계획 (IaC 도입)
- **도구**: Terraform
- **목표**: 디버깅 환경 빠른 생성/삭제, 인프라 버전 관리
- **상세**: [terraform-migration-plan.md](./terraform-migration-plan.md) 참조

## 📝 변경 이력

- 2026-04-03: Admin 전용 도메인·엣지 캐시·수동 AWS 작업 메모 추가 (`aws-manual-operations-admin-and-cache.md`)
- 2026-04-02: 인프라 인벤토리 문서화 시작
- 2025-09-15: AWS IAM 정책 생성 (S3, CloudFront)
- 2025-09-15: Frontend AWS 인프라 구축
