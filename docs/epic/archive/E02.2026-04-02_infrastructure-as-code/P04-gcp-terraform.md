# P04: GCP 인프라 Terraform 코드 작성

**상태**: ✅ 완료 (BigQuery 제외)
**담당**: Infrastructure Team
**예상 기간**: 2일

## 목표

기존 GCP 인프라 (Cloud Run, Container Registry, BigQuery, IAM)를 Terraform 코드로 작성하고,
`terraform import`를 통해 기존 리소스를 State에 등록한다.

## 실행 전략 반영 (A 후속 단계)

- AWS 핵심 경로 안정화 이후, GCP는 **Cloud Run + IAM**을 우선 적용한다.
- BigQuery는 선택 항목으로 유지하되, 본 Phase 완료를 지연시키지 않는다.
- 운영 안정성을 위해 이미지 버전 전략(`latest` 최소화, 고정 태그/다이제스트 우선)을 병행한다.

## 작업 순서

### 우선순위
1. **Cloud Run** (Backend 서비스 - 가장 중요)
2. **Container Registry** (Docker 이미지 저장소)
3. **IAM** (Service Account)
4. **BigQuery** (비용 분석 - 선택)

## 모듈 구조

### 1. Cloud Run 모듈 (`modules/gcp-backend/`)

#### 파일 구조
```
modules/gcp-backend/
├── cloud-run.tf      # Cloud Run Service
├── iam.tf            # IAM Bindings
├── variables.tf
├── outputs.tf
└── README.md
```

#### 주요 리소스
- `google_cloud_run_service` - Backend 서비스
- `google_cloud_run_service_iam_member` - Public 접근 허용
- `google_service_account` - Service Account

#### Import 명령
```bash
# Cloud Run Services
terraform import module.backend_prod.google_cloud_run_service.main \
  locations/asia-northeast3/namespaces/yamang02-ai-portfolio/services/ai-portfolio

terraform import module.backend_staging.google_cloud_run_service.main \
  locations/asia-northeast3/namespaces/yamang02-ai-portfolio/services/ai-portfolio-staging
```

### 2. Container Registry 모듈 (`modules/gcp-registry/`)

#### 파일 구조
```
modules/gcp-registry/
├── artifact-registry.tf   # Artifact Registry
├── iam.tf                 # Registry IAM
├── variables.tf
├── outputs.tf
└── README.md
```

#### 주요 리소스
- `google_artifact_registry_repository` - Docker 저장소
- `google_artifact_registry_repository_iam_member` - 접근 권한

#### Import 명령
```bash
# Artifact Registry (GCR은 자동 생성되므로 Import 불필요)
terraform import module.registry.google_artifact_registry_repository.gcr \
  projects/yamang02-ai-portfolio/locations/us/repositories/gcr.io
```

### 3. IAM 모듈 (`modules/gcp-iam/`)

#### 파일 구조
```
modules/gcp-iam/
├── service-accounts.tf   # Service Accounts
├── bindings.tf           # IAM Bindings
├── variables.tf
├── outputs.tf
└── README.md
```

#### 주요 리소스
- `google_service_account` - GitHub Actions용 SA
- `google_project_iam_member` - 프로젝트 레벨 권한

#### Import 명령
```bash
# Service Account
terraform import module.iam.google_service_account.github_actions \
  projects/yamang02-ai-portfolio/serviceAccounts/github-actions@yamang02-ai-portfolio.iam.gserviceaccount.com
```

### 4. BigQuery 모듈 (`modules/gcp-bigquery/`) - 선택

#### 파일 구조
```
modules/gcp-bigquery/
├── dataset.tf        # Dataset
├── table.tf          # Tables
├── variables.tf
├── outputs.tf
└── README.md
```

#### 주요 리소스
- `google_bigquery_dataset` - billing_export
- `google_bigquery_table` - 비용 데이터 테이블

#### Import 명령
```bash
# BigQuery Dataset
terraform import module.bigquery.google_bigquery_dataset.billing \
  projects/yamang02-ai-portfolio/datasets/billing_export
```

## 환경별 설정

### Production (`environments/production/`)

#### main.tf
```hcl
module "backend" {
  source = "../../modules/gcp-backend"

  project_id       = var.gcp_project_id
  region           = var.gcp_region
  service_name     = "ai-portfolio"
  environment      = var.environment
  container_image  = var.container_image

  env_vars = {
    SPRING_PROFILES_ACTIVE = var.environment
    DB_HOST                = var.db_host
    REDIS_HOST             = var.redis_host
    # ... 기타 환경변수
  }

  min_instances = 1
  max_instances = 10
  cpu           = "2000m"
  memory        = "1Gi"
}

module "registry" {
  source = "../../modules/gcp-registry"

  project_id = var.gcp_project_id
  location   = "us"
}

module "iam" {
  source = "../../modules/gcp-iam"

  project_id = var.gcp_project_id
  environment = var.environment
}
```

#### terraform.tfvars (실제 값 - Git 제외)
```hcl
gcp_project_id  = "yamang02-ai-portfolio"
gcp_region      = "asia-northeast3"
container_image = "gcr.io/yamang02-ai-portfolio/ai-portfolio:latest"
```

### Debug (`environments/debug/`)

#### 차이점
- `min_instances = 0` (비용 절감)
- `max_instances = 1` (제한적 스케일)
- `cpu = "1000m"` (낮은 리소스)
- `memory = "512Mi"` (최소 메모리)

## 작업 단계

### Step 1: 모듈 작성
1. [x] Cloud Run 모듈 작성
2. [x] Container Registry 모듈 작성
3. [x] IAM 모듈 작성
4. [ ] BigQuery 모듈 작성 (선택)

### Step 2: 환경별 설정
1. [x] Production 환경 설정
2. [x] Staging 환경 설정
3. [ ] Debug 환경 템플릿

### Step 3: Import 실행
1. [x] Cloud Run Import
2. [x] Service Account Import
3. [x] Artifact Registry Import (필요 시)
4. [ ] BigQuery Import (선택)

### Step 4: 검증
1. [x] `terraform plan` (No changes 확인)
2. [x] 환경변수 민감 정보 확인
3. [x] 문서 업데이트

## 완료 기준

- [x] 모든 GCP 리소스가 Terraform 코드로 정의됨 (Cloud Run + Registry + IAM)
- [x] `terraform import` 완료 (Cloud Run/Registry/ServiceAccount)
- [x] `terraform plan` 결과가 "No changes" 또는 최소 변경
- [x] 환경변수가 안전하게 관리됨 (Terraform 코드에 비밀값 미기록, drift-safe ignore_changes 적용)
- [ ] 환경별 (production, staging, debug) 설정 완료 (debug 미완)
- [x] Cloud Run + IAM 우선 경로 안정화 완료

## 체크리스트

### Import 전 백업
```bash
# Cloud Run 설정 백업
gcloud run services describe ai-portfolio \
  --region=asia-northeast3 \
  --format=json > backup-cloudrun.json

# Service Account 백업
gcloud iam service-accounts describe \
  github-actions@yamang02-ai-portfolio.iam.gserviceaccount.com \
  --format=json > backup-sa.json
```

### Import 후 검증
```bash
# Plan 실행
terraform plan

# 주의: Cloud Run 환경변수 차이 확인
# (민감 정보는 Secret Manager 사용 권장)
```

## 환경변수 관리 전략

### 옵션 1: Terraform Variables (현재)
```hcl
env_vars = {
  DB_HOST = var.db_host
  # ... 직접 입력
}
```

**장점**: 간단함
**단점**: 민감 정보가 State 파일에 평문 저장

### 옵션 2: Secret Manager (권장)
```hcl
env_vars = {
  DB_HOST = {
    name = "DB_HOST"
    value_from = {
      secret_key_ref = {
        name = google_secret_manager_secret.db_host.secret_id
        key  = "latest"
      }
    }
  }
}
```

**장점**: 안전한 비밀 관리
**단점**: 추가 리소스 필요

### 결정: 옵션 1로 시작, 필요 시 옵션 2로 전환

## 참조 문서

- [Terraform GCP Cloud Run](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_service)
- [Terraform GCP Artifact Registry](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/artifact_registry_repository)
- [Terraform GCP Service Account](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_service_account)
- [Terraform GCP BigQuery](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/bigquery_dataset)

## 트러블슈팅

### 문제: Cloud Run Import 실패
**원인**: 리소스 경로 형식 오류
**해결**:
```bash
# 올바른 형식
locations/{region}/namespaces/{project}/services/{service-name}
```

### 문제: 환경변수 드리프트
**원인**: 콘솔에서 수동 변경
**해결**: Terraform 코드 업데이트 후 `terraform apply`

### 문제: Container Image 버전 관리
**원인**: `latest` 태그 사용 시 드리프트 발생
**해결**:
```hcl
# Option 1: latest 사용 (드리프트 무시)
lifecycle {
  ignore_changes = [template[0].spec[0].containers[0].image]
}

# Option 2: 특정 버전 고정
container_image = "gcr.io/project/image:v1.2.3"
```

---

**이전 Phase**: [P03: AWS Terraform 코드](./P03-aws-terraform.md)
**다음 Phase**: [P05: 디버깅 환경 자동화](./P05-debug-automation.md)
