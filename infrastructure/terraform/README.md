# Terraform Infrastructure

AI Portfolio 인프라를 Terraform으로 관리하기 위한 루트 디렉토리입니다.

## 디렉토리 구조

- `modules/`: 재사용 가능한 모듈
- `environments/`: 환경별 진입점 (production, staging, debug)

## 공통 원칙

- 환경별 state key를 분리한다.
- 민감 정보는 `terraform.tfvars` 또는 시크릿 매니저로 관리한다.
- 적용 전 `terraform fmt`, `terraform validate`, `terraform plan`을 수행한다.
