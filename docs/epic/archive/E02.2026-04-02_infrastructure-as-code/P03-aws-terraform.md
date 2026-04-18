# P03: AWS 인프라 Terraform 코드 작성

**상태**: ⏳ 대기
**담당**: Infrastructure Team
**예상 기간**: 2일

## 목표

기존 AWS 인프라 (Route53, ACM, S3, CloudFront, IAM)를 Terraform 코드로 작성하고,
`terraform import`를 통해 기존 리소스를 State에 등록한다.

## 실행 전략 반영 (A: 빠른 이행형)

- 본 Phase는 AWS 핵심 경로를 우선 코드화하여 조기 안정화한다.
- 우선순위 리소스는 운영 영향도가 큰 순서(Route53/ACM → S3/CloudFront → IAM)로 고정한다.
- 각 import 단위마다 `terraform plan` 검증을 수행하고, 대규모 diff 발생 시 즉시 코드/설정 정합성을 맞춘다.

## 작업 순서

### 우선순위
1. **Route53 + ACM** (도메인/SSL - 가장 중요)
2. **S3 + CloudFront** (Frontend 배포)
3. **IAM** (권한 관리)

## 모듈 구조

### 1. Route53 + ACM 모듈 (`modules/aws-dns/`)

#### 파일 구조
```
modules/aws-dns/
├── main.tf           # Route53 Hosted Zone, Records
├── acm.tf            # SSL Certificates
├── variables.tf      # 입력 변수
├── outputs.tf        # 출력값
└── README.md         # 모듈 문서
```

#### 주요 리소스
- `aws_route53_zone` - Hosted Zone
- `aws_route53_record` - DNS Records (A, AAAA, CNAME, TXT)
- `aws_acm_certificate` - SSL Certificates
- `aws_acm_certificate_validation` - Certificate 검증

#### Import 명령
```bash
# Hosted Zone
terraform import module.dns.aws_route53_zone.main Z01437241DGHDFQHEDV82

# ACM Certificates
terraform import module.dns.aws_acm_certificate.main \
  arn:aws:acm:us-east-1:601326494743:certificate/18e7ebbd-e492-4aa9-9667-9cbec395a66c

terraform import module.dns.aws_acm_certificate.wildcard \
  arn:aws:acm:us-east-1:601326494743:certificate/f3d39247-2fd7-4baa-aa3b-26b0b475363f
```

### 2. S3 + CloudFront 모듈 (`modules/aws-frontend/`)

#### 파일 구조
```
modules/aws-frontend/
├── s3.tf             # S3 Bucket
├── cloudfront.tf     # CloudFront Distribution
├── policies.tf       # Bucket Policies
├── variables.tf
├── outputs.tf
└── README.md
```

#### 주요 리소스
- `aws_s3_bucket` - Frontend 파일 저장
- `aws_s3_bucket_public_access_block` - Public Access 차단
- `aws_cloudfront_distribution` - CDN
- `aws_cloudfront_origin_access_identity` - S3 접근 제어

#### Import 명령
```bash
# S3 Buckets
terraform import module.frontend_prod.aws_s3_bucket.main ai-portfolio-fe-production
terraform import module.frontend_staging.aws_s3_bucket.main ai-portfolio-fe-staging

# CloudFront Distributions
terraform import module.frontend_prod.aws_cloudfront_distribution.main E384L5ALEPZ14U
terraform import module.frontend_staging.aws_cloudfront_distribution.main E7KKBCETIHDH6
```

### 3. IAM 모듈 (`modules/aws-iam/`)

#### 파일 구조
```
modules/aws-iam/
├── policies.tf       # Custom Policies
├── users.tf          # IAM Users
├── attachments.tf    # Policy Attachments
├── variables.tf
├── outputs.tf
└── README.md
```

#### 주요 리소스
- `aws_iam_policy` - Custom Policies
- `aws_iam_user` - IAM Users
- `aws_iam_user_policy_attachment` - Policy 연결

#### Import 명령
```bash
# Policies
terraform import module.iam.aws_iam_policy.s3 \
  arn:aws:iam::601326494743:policy/AI-Portfolio-S3-Policy

terraform import module.iam.aws_iam_policy.cloudfront \
  arn:aws:iam::601326494743:policy/AI-Portfolio-CloudFront-Policy

# Users
terraform import module.iam.aws_iam_user.github_actions github-actions-ai-portfolio
```

## 환경별 설정

### Production (`environments/production/`)

#### main.tf
```hcl
module "dns" {
  source = "../../modules/aws-dns"

  domain_name = var.domain_name
  environment = var.environment
}

module "frontend" {
  source = "../../modules/aws-frontend"

  bucket_name       = "ai-portfolio-fe-production"
  environment       = var.environment
  domain_name       = var.domain_name
  certificate_arn   = module.dns.certificate_arn
  hosted_zone_id    = module.dns.hosted_zone_id
}

module "iam" {
  source = "../../modules/aws-iam"

  environment       = var.environment
  s3_bucket_arn     = module.frontend.bucket_arn
  cloudfront_arn    = module.frontend.cloudfront_arn
}
```

#### terraform.tfvars (실제 값 - Git 제외)
```hcl
environment = "production"
domain_name = "yamang02.com"
aws_region  = "ap-northeast-2"
```

### Debug (`environments/debug/`)

#### 차이점
- 짧은 TTL (캐시 60초)
- 최소 인스턴스 0
- 자동 삭제 태그

## 작업 단계

### Step 1: 모듈 작성
1. [x] Route53 모듈 작성
2. [x] ACM 모듈 작성
3. [x] S3 모듈 작성
4. [x] CloudFront 모듈 작성
5. [x] IAM 모듈 작성

### Step 2: 환경별 설정
1. [x] Production 환경 설정
2. [x] Staging 환경 설정 (프론트 S3+CloudFront만; Route53/ACM/IAM은 production state에서 관리, OAC는 공유 참조)
3. [ ] Debug 환경 템플릿

### Step 3: Import 실행
1. [x] Route53 Import
2. [x] ACM Import
3. [x] S3 Import
4. [x] CloudFront Import
5. [x] IAM Import

### Step 4: 검증
1. [x] `terraform plan` (No changes 확인)
2. [x] 드리프트 확인
3. [x] 문서 업데이트
4. [x] import 단위별 검증 로그 기록

## 완료 기준

- [x] 모든 AWS 리소스가 Terraform 코드로 정의됨 (production/staging 기준)
- [x] `terraform import` 완료 (production 전체, staging 프론트)
- [x] `terraform plan` 결과가 "No changes" 또는 최소 변경
- [ ] 환경별 (production, staging, debug) 설정 완료 — staging·production 완료, debug 미완
- [ ] README 및 주석 작성
- [x] Route53/ACM/S3/CloudFront 핵심 경로 먼저 안정화 완료

## 체크리스트

### Import 전 백업
```bash
# 현재 Route53 설정 백업
aws route53 list-resource-record-sets \
  --hosted-zone-id Z01437241DGHDFQHEDV82 > backup-route53.json

# CloudFront 설정 백업
aws cloudfront get-distribution --id E384L5ALEPZ14U > backup-cloudfront.json
```

### Import 후 검증
```bash
# Plan 실행 (변경사항 확인)
terraform plan

# 예상 결과: No changes, or minor formatting differences
```

## 참조 문서

- [Terraform AWS Route53](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_zone)
- [Terraform AWS ACM](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate)
- [Terraform AWS S3](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket)
- [Terraform AWS CloudFront](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution)
- [Terraform Import](https://developer.hashicorp.com/terraform/cli/commands/import)

## 트러블슈팅

### 문제: Import 실패 - 리소스 찾을 수 없음
**원인**: 잘못된 리소스 ID 또는 리전 불일치
**해결**: `inventory.private.md`에서 정확한 ID 확인

### 문제: Plan에서 많은 변경사항 표시
**원인**: Terraform 코드와 실제 설정 불일치
**해결**: 실제 설정을 확인하고 코드 수정 (또는 무시 가능한 변경인지 확인)

### 문제: CloudFront OAI 관련 오류
**원인**: Origin Access Identity가 코드에 없음
**해결**: OAI도 별도 리소스로 Import 필요

---

**이전 Phase**: [P02: Terraform 환경 구축](./P02-terraform-setup.md)
**다음 Phase**: [P04: GCP Terraform 코드](./P04-gcp-terraform.md)
