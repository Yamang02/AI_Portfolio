# P05: 디버깅 환경 자동화 스크립트

**상태**: ✅ 완료  
**담당**: Infrastructure Team  
**예상 기간**: 1일

## 목표

디버깅용 인프라를 빠르게 생성·삭제할 수 있는 자동화 스크립트를 제공하고,
버그 재현·테스트용 임시 환경을 **state 기준으로 재현 가능**하게 한다.

## 실행 전략 반영 (A 병행 마감)

- 본 Phase는 A 전략의 병행 마감 항목으로 취급했다.
- 생성·삭제 자동화와 함께, **환경별 원격 state 분리**(`debug/<env>/terraform.tfstate`)로 격리를 보장한다.

## 구현 요약

### Terraform 스택

- **경로**: `infrastructure/terraform/environments/debug/`
- **AWS**: `aws-frontend` 모듈(S3·CloudFront·공유 OAC)·Route53 A(alias)
- **GCP**: `gcp-debug-hello` 모듈(공개 이미지 `gcr.io/cloudrun/hello`, `allUsers` invoker)
- **Backend**: S3 `ai-portfolio-terraform-state`, 키는 **환경마다** `debug/<환경이름>/terraform.tfstate`
- **GCP 인증**: `GOOGLE_OAUTH_ACCESS_TOKEN=(gcloud auth print-access-token)` — 스크립트가 설정

### 스크립트

| 스크립트 | 설명 |
|---------|------|
| `scripts/setup-debug-env.ps1` | Windows — 타임스탬프 `debug-YYYYMMDD-HHmmss` 생성, `init -reconfigure` + backend key, `plan` / `apply` |
| `scripts/teardown-debug-env.ps1` | Windows — 동일 state로 `init`, S3 비우기 후 `destroy` |
| `scripts/setup-debug-env.sh` | Linux/macOS — 위와 동일 흐름 |
| `scripts/teardown-debug-env.sh` | Linux/macOS |

**사전 준비**

1. `infrastructure/terraform/environments/debug/terraform.tfvars.example` → `terraform.tfvars` 복사 후 `domain_name`, `gcp_project_id`, `acm_certificate_arn`, `cloud_run_service_account_email` 등 입력  
2. AWS CLI·프로필, `gcloud` 로그인  
3. Terraform 실행 경로(`terraform` 또는 `winget` 설치 경로)  

**참고**: `environment` 변수는 스크립트가 `-var="environment=<이름>"`으로 전달하므로, 생성 시 tfvars의 플레이스홀더는 덮어씌워진다. 수동 `terraform plan`만 할 때는 tfvars에서 고유 `environment`를 지정한다.

### 운영·비용

- CloudFront `price_class` 기본값은 `PriceClass_100`(tfvars에서 변경 가능)
- Cloud Run `min`/`max` 스케일은 `gcp-debug-hello` 모듈 주석 참고
- 사용 후 `teardown`으로 정리; 장기 방치 시 수동 점검

## 완료 기준

- [x] Linux/Mac 스크립트 작성 (`setup-debug-env.sh`, `teardown-debug-env.sh`)
- [x] Windows 스크립트 작성 (`setup-debug-env.ps1`, `teardown-debug-env.ps1`)
- [x] Debug 환경 Terraform 스택 및 원격 state 키 분리
- [x] `terraform validate` 통과 (로컬 `init -backend=false` 기준)
- [x] `.gitignore`에 `*-info.json` 등 로컬 산출물 패턴
- [ ] 실제 클라우드에서 5분 내 생성·삭제 검증 (팀이 수행)

## 추가 기능 (선택)

- TTL/만료 태그 기반 정리 배치
- CI에서 `workflow_dispatch`로 디버그 스택 생성 (시크릿·승인 프로세스 필수)

## 참조 문서

- [P04: GCP Terraform](./P04-gcp-terraform.md)
- [Terraform backend S3](https://developer.hashicorp.com/terraform/language/settings/backends/s3)

---

**이전 Phase**: [P04: GCP Terraform 코드](./P04-gcp-terraform.md)  
**에픽**: [README](./README.md)
