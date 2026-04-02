# P05: 디버깅 환경 자동화 스크립트

**상태**: ⏳ 대기
**담당**: Infrastructure Team
**예상 기간**: 1일

## 목표

디버깅용 인프라를 빠르게 생성/삭제할 수 있는 자동화 스크립트를 작성하여,
버그 재현 및 테스트를 위한 임시 환경을 5분 내 구축 가능하게 한다.

## 실행 전략 반영 (A 병행 마감)

- 본 Phase는 후순위가 아니라 A 전략의 병행 마감 항목으로 취급한다.
- 생성/삭제 자동화뿐 아니라, 비용/운영 안전장치(TTL 태그, 정리 루틴)를 완료 기준에 포함한다.

## 배경

### 디버깅 환경 요구사항
1. **빠른 생성**: 5분 내 전체 환경 구축
2. **격리**: Production/Staging과 완전 분리
3. **비용 효율**: 사용 후 즉시 삭제 가능
4. **재현성**: 동일한 설정 반복 생성

### 디버깅 환경 구성
- **AWS**: S3 + CloudFront (최소 설정)
- **GCP**: Cloud Run (min_instances=0, 낮은 리소스)
- **DNS**: 서브도메인 자동 생성 (예: `debug-20260402.yamang02.com`)

## 스크립트 구조

### 1. 환경 생성 스크립트

#### `scripts/setup-debug-env.sh`
```bash
#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 디버그 환경 생성 중...${NC}"

# 1. 타임스탬프 기반 환경 이름 생성
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ENV_NAME="debug-${TIMESTAMP}"

echo -e "${GREEN}📋 환경 이름: ${ENV_NAME}${NC}"

# 2. Terraform 디렉토리로 이동
cd infrastructure/terraform/environments/debug

# 3. 환경변수 설정
export TF_VAR_environment="${ENV_NAME}"
export TF_VAR_bucket_name="ai-portfolio-fe-${ENV_NAME}"
export TF_VAR_service_name="ai-portfolio-${ENV_NAME}"

# 4. Terraform 초기화 (필요시만)
if [ ! -d ".terraform" ]; then
  echo -e "${BLUE}🔧 Terraform 초기화...${NC}"
  terraform init
fi

# 5. Plan 실행
echo -e "${BLUE}📝 Plan 생성 중...${NC}"
terraform plan -out="${ENV_NAME}.tfplan"

# 6. 사용자 확인
echo -e "${BLUE}🤔 위 Plan을 적용하시겠습니까? (y/n)${NC}"
read -r CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "취소되었습니다."
  exit 0
fi

# 7. Apply 실행
echo -e "${GREEN}🚀 환경 생성 중...${NC}"
terraform apply "${ENV_NAME}.tfplan"

# 8. 출력값 저장
terraform output -json > "${ENV_NAME}-info.json"

# 9. 결과 출력
echo -e "${GREEN}✅ 디버그 환경 생성 완료!${NC}"
echo ""
echo -e "${BLUE}📋 환경 정보:${NC}"
echo "  - 환경 이름: ${ENV_NAME}"
echo "  - S3 Bucket: $(terraform output -raw s3_bucket_name)"
echo "  - CloudFront URL: $(terraform output -raw cloudfront_url)"
echo "  - Cloud Run URL: $(terraform output -raw cloud_run_url)"
echo ""
echo -e "${BLUE}🗑️  삭제 명령어:${NC}"
echo "  ./scripts/teardown-debug-env.sh ${ENV_NAME}"
```

### 2. 환경 삭제 스크립트

#### `scripts/teardown-debug-env.sh`
```bash
#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
  echo -e "${RED}❌ 환경 이름을 지정해주세요${NC}"
  echo "사용법: $0 <environment-name>"
  exit 1
fi

ENV_NAME=$1

echo -e "${YELLOW}🗑️  디버그 환경 삭제 중: ${ENV_NAME}${NC}"

# 1. Terraform 디렉토리로 이동
cd infrastructure/terraform/environments/debug

# 2. 환경변수 설정
export TF_VAR_environment="${ENV_NAME}"
export TF_VAR_bucket_name="ai-portfolio-fe-${ENV_NAME}"
export TF_VAR_service_name="ai-portfolio-${ENV_NAME}"

# 3. S3 버킷 비우기 (삭제 전 필수)
BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
if [ -n "$BUCKET" ]; then
  echo -e "${YELLOW}📦 S3 버킷 비우는 중...${NC}"
  aws s3 rm "s3://${BUCKET}" --recursive || true
fi

# 4. Terraform Destroy
echo -e "${RED}⚠️  정말 삭제하시겠습니까? (yes 입력)${NC}"
read -r CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "취소되었습니다."
  exit 0
fi

terraform destroy -auto-approve

# 5. 임시 파일 정리
rm -f "${ENV_NAME}.tfplan"
rm -f "${ENV_NAME}-info.json"

echo -e "${YELLOW}✅ 디버그 환경 삭제 완료!${NC}"
```

### 3. Windows 버전 스크립트

#### `scripts/setup-debug-env.bat`
```batch
@echo off
setlocal enabledelayedexpansion

echo [94m🚀 디버그 환경 생성 중...[0m

:: 1. 타임스탬프 생성
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%-%datetime:~8,6%
set ENV_NAME=debug-%TIMESTAMP%

echo [92m📋 환경 이름: %ENV_NAME%[0m

:: 2. Terraform 디렉토리로 이동
cd infrastructure\terraform\environments\debug

:: 3. 환경변수 설정
set TF_VAR_environment=%ENV_NAME%
set TF_VAR_bucket_name=ai-portfolio-fe-%ENV_NAME%
set TF_VAR_service_name=ai-portfolio-%ENV_NAME%

:: 4. Terraform 초기화
if not exist ".terraform" (
  echo [94m🔧 Terraform 초기화...[0m
  terraform init
)

:: 5. Plan 실행
echo [94m📝 Plan 생성 중...[0m
terraform plan -out=%ENV_NAME%.tfplan

:: 6. Apply 실행
echo [92m🚀 환경 생성 중...[0m
terraform apply %ENV_NAME%.tfplan

:: 7. 출력값 저장
terraform output -json > %ENV_NAME%-info.json

echo [92m✅ 디버그 환경 생성 완료![0m
echo.
echo [94m🗑️  삭제 명령어:[0m
echo   scripts\teardown-debug-env.bat %ENV_NAME%

endlocal
```

## Debug 환경 Terraform 설정

### `environments/debug/main.tf`
```hcl
locals {
  # 타임스탬프 기반 리소스 이름
  environment = var.environment
  bucket_name = var.bucket_name
}

module "frontend" {
  source = "../../modules/aws-frontend"

  bucket_name    = local.bucket_name
  environment    = local.environment
  domain_name    = "${local.environment}.yamang02.com"

  # 디버깅 최적화 설정
  cloudfront_ttl = 60  # 짧은 캐시
  price_class    = "PriceClass_100"  # 저렴한 옵션
}

module "backend" {
  source = "../../modules/gcp-backend"

  project_id    = var.gcp_project_id
  region        = var.gcp_region
  service_name  = var.service_name
  environment   = local.environment

  # 디버깅 최적화 설정
  min_instances = 0  # 비용 절감
  max_instances = 1  # 제한적 스케일
  cpu           = "1000m"
  memory        = "512Mi"
}
```

### `environments/debug/variables.tf`
```hcl
variable "environment" {
  description = "Debug environment name (auto-generated)"
  type        = string
}

variable "bucket_name" {
  description = "S3 bucket name (auto-generated)"
  type        = string
}

variable "service_name" {
  description = "Cloud Run service name (auto-generated)"
  type        = string
}
```

## 사용 시나리오

### 시나리오 1: 버그 재현
```bash
# 1. 디버깅 환경 생성
./scripts/setup-debug-env.sh

# 출력:
# ✅ 디버그 환경 생성 완료!
# 환경 이름: debug-20260402-143022
# S3 Bucket: ai-portfolio-fe-debug-20260402-143022
# CloudFront URL: https://d1a2b3c4d5e6f7.cloudfront.net
# Cloud Run URL: https://ai-portfolio-debug-20260402-143022-xxx.run.app

# 2. 버그 재현 및 테스트

# 3. 환경 삭제
./scripts/teardown-debug-env.sh debug-20260402-143022
```

### 시나리오 2: 여러 환경 동시 운영
```bash
# Feature A 테스트
./scripts/setup-debug-env.sh
# → debug-20260402-140000

# Feature B 테스트 (별도 환경)
./scripts/setup-debug-env.sh
# → debug-20260402-150000

# 각각 독립적으로 테스트 가능
```

## 완료 기준

- [ ] Linux/Mac 스크립트 작성 및 테스트
- [ ] Windows 스크립트 작성 및 테스트
- [ ] Debug 환경 Terraform 설정 완료
- [ ] 5분 내 환경 생성 확인
- [ ] 삭제 스크립트 정상 동작 확인
- [ ] 사용자 가이드 작성
- [ ] TTL/만료 기준 기반 정리 절차 문서화 또는 스크립트화

## 추가 기능 (선택)

### 1. 환경 목록 조회
```bash
# scripts/list-debug-envs.sh
terraform state list | grep debug
```

### 2. 자동 정리 (7일 이상된 환경)
```bash
# scripts/cleanup-old-debug-envs.sh
# Terraform State에서 7일 이상된 debug 환경 자동 삭제
```

### 3. CI/CD 통합
```yaml
# .github/workflows/debug-env.yml
name: Create Debug Environment

on:
  workflow_dispatch:
    inputs:
      reason:
        description: '디버깅 이유'
        required: true

jobs:
  create-debug:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
      - name: Create Debug Environment
        run: ./scripts/setup-debug-env.sh
```

## 참조 문서

- [Terraform Workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces) (대안 방법)
- [AWS CLI S3 Commands](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/)

---

**이전 Phase**: [P04: GCP Terraform 코드](./P04-gcp-terraform.md)
**에픽 완료**: 모든 Phase 완료 시 [README](./README.md) 업데이트
