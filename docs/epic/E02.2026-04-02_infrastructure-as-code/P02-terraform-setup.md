# P02: Terraform 환경 구축

**상태**: 🔄 진행 중
**담당**: Infrastructure Team
**예상 기간**: 1일

## 목표

Terraform 설치, 프로젝트 구조 생성, S3 Backend 설정을 완료하여
본격적인 IaC 코드 작성을 위한 기반을 마련한다.

## 실행 결정 연계

- 본 Phase는 에픽 실행 전략 **A(빠른 이행형)**의 시작점이다.
- 목표는 "완벽한 구조 설계"보다 "안전한 최소 기반 + 즉시 적용 가능 상태" 달성이다.
- 본 Phase 완료 직후 P03으로 즉시 전환한다.

## 작업 내용

### 1. Terraform 설치
- [x] Windows에서 Terraform 설치 (`winget install Hashicorp.Terraform`)
- [x] 버전 확인 (`terraform --version`)
- [ ] 기본 명령어 테스트

### 2. 프로젝트 구조 생성
```
infrastructure/
├── terraform/
│   ├── modules/
│   │   ├── aws-dns/              # Route53 + ACM
│   │   ├── aws-frontend/         # S3 + CloudFront
│   │   ├── aws-iam/              # IAM
│   │   ├── gcp-backend/          # Cloud Run
│   │   ├── gcp-registry/         # Container Registry
│   │   └── gcp-iam/              # Service Accounts
│   │
│   ├── environments/
│   │   ├── production/
│   │   │   ├── main.tf
│   │   │   ├── backend.tf
│   │   │   ├── variables.tf
│   │   │   ├── terraform.tfvars.example
│   │   │   └── outputs.tf
│   │   ├── staging/
│   │   └── debug/
│   │
│   └── README.md
│
├── scripts/
│   ├── setup-debug-env.sh
│   └── teardown-debug-env.sh
│
└── docs/
    └── terraform-guide.md
```

### 3. S3 Backend 설정 (State 원격 저장)

#### 3.1 S3 버킷 생성
- [ ] 버킷 이름: `ai-portfolio-terraform-state`
- [ ] 리전: `ap-northeast-2`
- [ ] Versioning: 활성화
- [ ] Encryption: AES-256

#### 3.2 DynamoDB 테이블 생성 (Lock)
- [ ] 테이블 이름: `terraform-locks`
- [ ] Primary Key: `LockID` (String)
- [ ] Billing mode: PAY_PER_REQUEST

#### 3.3 Backend 설정 파일 작성
```hcl
# infrastructure/terraform/environments/production/backend.tf
terraform {
  backend "s3" {
    bucket         = "ai-portfolio-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-northeast-2"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

### 4. Provider 설정

#### 4.1 AWS Provider
```hcl
# infrastructure/terraform/environments/production/main.tf
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ai-portfolio"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
```

#### 4.2 GCP Provider
```hcl
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
```

### 5. 변수 및 출력 설정

#### 5.1 Variables
```hcl
# infrastructure/terraform/environments/production/variables.tf
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast3"
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
}
```

#### 5.2 tfvars 템플릿
```hcl
# infrastructure/terraform/environments/production/terraform.tfvars.example
environment    = "production"
aws_region     = "ap-northeast-2"
gcp_project_id = "your-gcp-project-id"
gcp_region     = "asia-northeast3"
domain_name    = "example.com"
```

### 6. 초기화 및 검증
- [x] `terraform init` 실행 (`-backend=false` 기준, 환경별 스켈레톤 검증)
- [x] Provider 다운로드 확인
- [ ] Backend 연결 확인
- [x] `terraform validate` 성공

### 7. A 전략 착수 기준 (필수)
- [ ] production / staging / debug 환경별 state key 분리
- [ ] 환경별 backend 설정 파일 스켈레톤 작성 완료
- [ ] 공통 변수/태그 규칙 정의 (environment, project, managed-by)
- [ ] P03 import 우선순위 목록 확정 (Route53/ACM → S3/CloudFront → IAM)

## 완료 기준

- [x] Terraform 설치 및 버전 확인
- [x] 프로젝트 디렉토리 구조 생성
- [x] S3 Backend 설정 완료 (버킷 + DynamoDB)
- [x] Provider 설정 파일 작성
- [x] `terraform init` 성공 (로컬 검증 모드)
- [ ] `.gitignore` 검증 (`terraform.tfvars` 제외 확인)

## 체크리스트

### 설치 및 검증
```powershell
# Terraform 설치
winget install HashiCorp.Terraform

# 버전 확인
terraform --version

# 기본 명령어 확인
terraform -help
```

### S3 Backend 준비
```bash
# S3 버킷 생성
aws s3 mb s3://ai-portfolio-terraform-state --region ap-northeast-2

# Versioning 활성화
aws s3api put-bucket-versioning \
  --bucket ai-portfolio-terraform-state \
  --versioning-configuration Status=Enabled

# Encryption 활성화
aws s3api put-bucket-encryption \
  --bucket ai-portfolio-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# DynamoDB 테이블 생성
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-2
```

### 초기화
```bash
cd infrastructure/terraform/environments/production

# Backend 초기화
terraform init

# 검증
terraform validate
```

## 다음 Phase 준비사항

### P03 (AWS Terraform 코드)를 위한 준비
- [ ] `inventory.private.md`에서 AWS 리소스 ID 확인
- [ ] Route53 Hosted Zone ID 복사
- [ ] S3 Bucket 이름 확인
- [ ] CloudFront Distribution ID 확인
- [ ] import 순서별 백업 명령 준비

## 참조 문서

- [Terraform AWS Provider 문서](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform GCP Provider 문서](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Terraform Backend 설정](https://developer.hashicorp.com/terraform/language/settings/backends/s3)

## 트러블슈팅

### 문제: Terraform 명령어 인식 안 됨
```powershell
# 해결: 새 PowerShell 창 열기
# 또는 PATH 확인
$env:PATH
```

### 문제: S3 Backend 연결 실패
```bash
# 해결: AWS 자격증명 확인
aws sts get-caller-identity
```

### 문제: Provider 다운로드 실패
```bash
# 해결: 프록시 설정 확인 또는 재시도
terraform init -upgrade
```

---

**이전 Phase**: [P01: 인프라 분석](./P01-infrastructure-analysis.md)
**다음 Phase**: [P03: AWS Terraform 코드](./P03-aws-terraform.md)
