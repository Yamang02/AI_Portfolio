# 인프라 및 도메인 구조 현황 (Source of Truth)

**날짜**: 2026-04-12
**결정 유형**: 인프라/아키텍처
**영향도**: BLOCKER
**상태**: 현황 정리 완료, 정합성 감사 필요

---

## 목적

이 문서는 AI Portfolio 프로젝트의 인프라 및 도메인 구조의 **실제 상태(as-is)**를 기록한 single source of truth입니다.

**중요**: 다른 결정 문서들([infrastructure-and-domain-structure.md], [yamangsolution-site-architecture.md], [technical-portfolio-schema-design.md])은 이 문서와 정합성을 맞춰야 합니다.

---

## 1. 도메인 구조 현황

### 1.1 실제 운영 중인 도메인

```
yamang02.com
├── www.yamang02.com          ← profile/ 개인 허브 페이지 (운영 중)
├── design.yamang02.com       ← YamangDesign 디자인 갤러리 (운영 중)
└── (portfolio.yamang02.com)  ← 미래 계획 (현재 미사용)

yamangsolution.com
└── www.yamangsolution.com    ← frontend/ React 포트폴리오 (운영 중)
```

### 1.2 도메인별 인프라 매핑

| 도메인 | 디렉토리 | 빌드 서빙 | 배포 워크플로우 | 상태 |
|--------|----------|-----------|----------------|------|
| `www.yamang02.com` | `profile/` | AWS S3 + CloudFront | `profile-production-aws.yml` | 운영 중 |
| `www.yamangsolution.com` | `frontend/` | AWS S3 + CloudFront | `frontend-production-aws.yml` | 운영 중 |
| `design.yamang02.com` | (별도 레포) | AWS S3 + CloudFront | (별도 워크플로우) | 운영 중 |

---

## 2. 환경별 도메인 매핑

### 2.1 Production

**프런트엔드**:
- **도메인**: `www.yamangsolution.com`
- **인프라**: AWS S3 + CloudFront
- **GitHub Secrets**: `AWS_S3_NAME`, `AWS_CLOUDFRONT_DISTRIBUTION_ID`
- **워크플로우**: `.github/workflows/frontend-production-aws.yml`

**백엔드**:
- **도메인**: `ai-portfolio-493721639129.asia-northeast3.run.app` (Cloud Run 직접 도메인)
- **인프라**: GCP Cloud Run
- **CORS 허용**:
  - `https://yamang02.com`
  - `https://www.yamang02.com`
  - `https://yamangsolution.com`
  - `https://www.yamangsolution.com`
  - `https://admin.yamang02.com`
  - `https://ai-portfolio-493721639129.asia-northeast3.run.app`

**프로필**:
- **도메인**: `www.yamang02.com`
- **인프라**: AWS S3 + CloudFront
- **워크플로우**: `.github/workflows/profile-production-aws.yml`

### 2.2 Staging

**프런트엔드**:
- **도메인**: `staging.yamangsolution.com` (CORS에서 사용)
- **CloudFront alias**: 문서에는 `staging.yamang02.com`으로 언급되나, 실제 확인 필요
- **인프라**: AWS S3 + CloudFront
- **워크플로우**: `.github/workflows/frontend-staging-aws.yml`

**백엔드**:
- **도메인**: `ai-portfolio-staging-493721639129.asia-northeast3.run.app`
- **인프라**: GCP Cloud Run
- **CORS 허용**:
  - `https://staging.yamangsolution.com`
  - `https://admin.staging.yamang02.com`
  - `https://ai-portfolio-staging-493721639129.asia-northeast3.run.app`
  - `https://ai-portfolio-chatbot-493721639129.asia-northeast3.run.app`

---

## 3. 인프라 구성 요소

### 3.1 AWS 인프라

**S3 Buckets**:
- Frontend production: `${{ vars.AWS_S3_NAME }}`
- Frontend staging: `${{ vars.AWS_S3_NAME }}` (staging environment)
- Profile production: `${{ vars.PROFILE_AWS_S3_NAME }}`

**CloudFront Distributions**:
- Frontend production: `${{ vars.AWS_CLOUDFRONT_DISTRIBUTION_ID }}`
- Frontend staging: `${{ vars.AWS_CLOUDFRONT_DISTRIBUTION_ID }}` (staging environment)
- Profile production: `${{ vars.PROFILE_AWS_CLOUDFRONT_DISTRIBUTION_ID }}`

**Route53/DNS**:
- Cloudflare에서 관리 (yamangsolution.com)
- 실제 DNS 레코드 확인 필요

### 3.2 GCP 인프라

**Cloud Run Services**:
- Backend production: `ai-portfolio-493721639129.asia-northeast3.run.app`
- Backend staging: `ai-portfolio-staging-493721639129.asia-northeast3.run.app`
- Chatbot: `ai-portfolio-chatbot-493721639129.asia-northeast3.run.app`
- FastAPI (AI 서비스): 확인 필요

**기타 GCP 서비스**:
- BigQuery (billing export)
- Cloud Storage (확인 필요)

### 3.3 데이터베이스

**Railway PostgreSQL**:
- Production DB: `${{ POSTGRE_URL }}`
- Staging DB: `${{ POSTGRE_URL }}` (staging environment)
- Local DB: 별도 로컬 PostgreSQL

### 3.4 Redis

**Redis Cloud**:
- Production: `${{ REDIS_HOST }}:${{ REDIS_PORT }}`
- Staging: 별도 인스턴스 (확인 필요)
- SSL: `${{ REDIS_SSL }}`

### 3.5 기타 서비스

- **Cloudinary**: 이미지 호스팅
- **EmailJS**: 이메일 전송
- **Google Analytics**: 분석
- **Cloudflare**: DNS 관리 + Tunnel (로컬 LLM, 미완)

---

## 4. 정합성 이슈 (BLOCKER)

### 4.1 도메인 매핑 불일치

**이슈**: 문서마다 도메인 전략이 다름

| 문서 | Frontend 도메인 | 근거 |
|------|----------------|------|
| [infrastructure-and-domain-structure.md] | `portfolio.yamang02.com` (미래) | Line 28 |
| [yamangsolution-site-architecture.md] | `portfolio.yamang02.com` (미래) | Line 20 |
| **실제 Production CORS** | `yamangsolution.com`, `www.yamangsolution.com` | [application-production.yml]:L71-74 |
| **실제 배포 워크플로우** | `www.yamangsolution.com` (추정) | [frontend-production-aws.yml] |

**영향**:
- 새 feature 개발 시 "어느 도메인을 기준으로 설계할지" 불명확
- DB 스키마 설계 시 `project_visibility.site` 필드 값이 모호

### 4.2 Staging 도메인 불일치

**이슈**: CloudFront alias와 CORS allowed-origin이 다름

| 항목 | 도메인 | 근거 |
|------|--------|------|
| **CORS allowed-origin** | `staging.yamangsolution.com` | [application-staging.yml]:L82 |
| **리뷰 언급 (CloudFront alias)** | `staging.yamang02.com` | (리뷰 코멘트) |

**영향**:
- 프런트엔드 API 호출 시 CORS 에러 발생 가능
- Staging 테스트 불안정

### 4.3 문서 간 충돌

**이슈**: 미래 계획과 현재 상태가 섞여 있음

| 문서 | 선언 | 실제 상태 |
|------|------|----------|
| [infrastructure-and-domain-structure.md] | `frontend/` → `portfolio.yamang02.com` 분리 예정 | 아직 `yamangsolution.com` 사용 중 |
| [yamangsolution-site-architecture.md] | `yamangsolution.com`은 비즈니스 전용 사이트로 새로 구축 | 현재 `yamangsolution.com`이 포트폴리오 |
| [technical-portfolio-schema-design.md] | `project_visibility.site` 필드 전제 | 도메인 전략 미확정으로 설계 불가 |

---

## 5. 필요한 감사 작업 (E1)

### 5.1 AWS 인프라 감사

```bash
# CloudFront Distribution 확인
aws cloudfront get-distribution --id <DISTRIBUTION_ID>
# → Aliases 필드에서 실제 도메인 확인

# S3 Bucket 정책 확인
aws s3api get-bucket-policy --bucket <BUCKET_NAME>

# Route53 DNS 레코드 확인 (Cloudflare 사용 시 스킵)
aws route53 list-hosted-zones
```

### 5.2 GCP 인프라 감사

```bash
# Cloud Run 서비스 목록
gcloud run services list --region=asia-northeast3

# Custom domain 매핑 확인
gcloud run domain-mappings list --region=asia-northeast3

# Cloud SQL 존재 여부 (Railway 전환 계획 확인)
gcloud sql instances list
```

### 5.3 Cloudflare 감사

```bash
# DNS 레코드 확인 (Cloudflare Dashboard 또는 API)
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records" \
  -H "Authorization: Bearer <TOKEN>"

# Tunnel 상태 확인
cloudflare-tunnel list
```

### 5.4 실제 동작 확인

```bash
# Frontend → Backend API 호출 확인
curl -I https://ai-portfolio-493721639129.asia-northeast3.run.app/health

# CORS preflight 확인
curl -X OPTIONS https://ai-portfolio-493721639129.asia-northeast3.run.app/api/projects \
  -H "Origin: https://www.yamangsolution.com" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Staging CORS 확인
curl -X OPTIONS https://ai-portfolio-staging-493721639129.asia-northeast3.run.app/api/projects \
  -H "Origin: https://staging.yamangsolution.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

---

## 6. 도메인 전략 결정 필요 (E1)

### Option A: 현재 상태 유지 + 문서 정렬

**전략**:
- `yamangsolution.com` = 포트폴리오 (현재 상태 유지)
- `yamang02.com` = 개인 허브 (현재 상태 유지)
- `portfolio.yamang02.com` 계획 폐기

**장점**:
- Breaking change 없음
- 즉시 실행 가능
- 도메인 비용 추가 없음

**단점**:
- "yamangsolution"이 비즈니스 브랜드인데 포트폴리오 도메인으로 사용
- 미래 비즈니스 사이트 구축 시 도메인 충돌

### Option B: 단계적 분리 (문서 원안)

**전략**:
1. `yamangsolution.com` → `portfolio.yamang02.com` 이전
2. `yamangsolution.com` 비즈니스 사이트 새로 구축

**장점**:
- 브랜드 정체성 명확
- 비즈니스 사이트 확장 용이

**단점**:
- 도메인 이전 작업 필요 (DNS, CloudFront, CORS, 하드코딩된 URL 수정)
- SEO 영향
- 기존 링크 리디렉션 필요

### Option C: 서브도메인 구조

**전략**:
- `portfolio.yamangsolution.com` = 포트폴리오
- `www.yamangsolution.com` = 비즈니스 사이트
- `yamang02.com` = 개인 허브

**장점**:
- 도메인 구매 불필요
- 브랜드 통일 (yamangsolution)

**단점**:
- URL이 길어짐
- SEO 관점에서 루트 도메인보다 약함

---

## 7. 다음 단계

### 7.1 즉시 실행 (E1)

1. **인프라 감사 실행** (위 5.1~5.4 명령 실행)
2. **실제 도메인 매핑 확인** (CloudFront alias, DNS 레코드)
3. **CORS 동작 테스트** (production, staging 모두)
4. **도메인 전략 결정** (Option A/B/C 중 선택)
5. **이 문서 업데이트** (감사 결과 반영)

### 7.2 문서 정렬 (E1)

도메인 전략 확정 후:
1. `infrastructure-and-domain-structure.md` 업데이트 또는 폐기
2. `yamangsolution-site-architecture.md` 업데이트 (도메인 전략 반영)
3. `technical-portfolio-schema-design.md` 재검토 (`project_visibility` 설계)

### 7.3 인프라 정비 (E1 완료 후)

- Terraform 작성 (현재 수동 관리 중인 AWS/GCP 리소스 IaC화)
- DNS 레코드 정리
- CORS 정책 통일
- Custom domain 매핑 (Cloud Run)

---

## 8. 관련 문서

- [infrastructure-and-domain-structure.md](./infrastructure-and-domain-structure.md) (이 문서로 통합 예정)
- [yamangsolution-site-architecture.md](./yamangsolution-site-architecture.md) (도메인 전략 반영 필요)
- [technical-portfolio-schema-design.md](./technical-portfolio-schema-design.md) (E1 완료 후 재검토)

---

## 9. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2026-04-12 | 초안 작성 (as-is 현황 정리) | AI Assistant |
| (TBD) | 인프라 감사 결과 반영 | - |
| (TBD) | 도메인 전략 확정 | - |
