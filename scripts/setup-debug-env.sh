#!/usr/bin/env bash
# 디버그용 AWS+GCP Terraform 스택 생성 (Linux/macOS)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEBUG_DIR="$REPO_ROOT/infrastructure/terraform/environments/debug"
TFVARS="${TFVARS:-$DEBUG_DIR/terraform.tfvars}"
PLAN_ONLY=0
SKIP_CONFIRM=0
TERRAFORM="${TERRAFORM:-terraform}"

usage() {
  echo "Usage: $0 [--tfvars PATH] [--plan-only] [--yes]" >&2
  echo "  --tfvars PATH   terraform.tfvars (default: \$DEBUG_DIR/terraform.tfvars)" >&2
  echo "  --plan-only     plan 만 실행" >&2
  echo "  --yes           apply 확인 생략" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tfvars) TFVARS="$2"; shift 2 ;;
    --plan-only) PLAN_ONLY=1; shift ;;
    --yes) SKIP_CONFIRM=1; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1" >&2; usage ;;
  esac
done

if [[ ! -d "$DEBUG_DIR" ]]; then
  echo "Debug dir missing: $DEBUG_DIR" >&2
  exit 1
fi
if [[ ! -f "$TFVARS" ]]; then
  echo "Missing terraform.tfvars (copy from terraform.tfvars.example): $TFVARS" >&2
  exit 1
fi

ENV_NAME="debug-$(date +%Y%m%d-%H%M%S)"
BACKEND_KEY="debug/${ENV_NAME}/terraform.tfstate"

echo "환경 이름: $ENV_NAME"
echo "State key: $BACKEND_KEY"

export GOOGLE_OAUTH_ACCESS_TOKEN
GOOGLE_OAUTH_ACCESS_TOKEN="$(gcloud auth print-access-token)"

cd "$DEBUG_DIR"
$TERRAFORM init -reconfigure -backend-config="key=$BACKEND_KEY"
PLAN_FILE="${ENV_NAME}.tfplan"
$TERRAFORM plan -var-file="$TFVARS" -var="environment=$ENV_NAME" -out="$PLAN_FILE"

if [[ "$PLAN_ONLY" -eq 1 ]]; then
  echo "Plan-only: $PLAN_FILE"
  exit 0
fi

if [[ "$SKIP_CONFIRM" -ne 1 ]]; then
  read -r -p "위 plan 을 apply 하시겠습니까? (y/N) " CONFIRM
  if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "취소됨"
    exit 0
  fi
fi

$TERRAFORM apply "$PLAN_FILE"
$TERRAFORM output -json > "${ENV_NAME}-info.json"
echo "완료. 삭제: $SCRIPT_DIR/teardown-debug-env.sh '$ENV_NAME'"
