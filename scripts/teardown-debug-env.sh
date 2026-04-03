#!/usr/bin/env bash
# 디버그 Terraform 스택 삭제 (Linux/macOS)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEBUG_DIR="$REPO_ROOT/infrastructure/terraform/environments/debug"
TFVARS="${TFVARS:-$DEBUG_DIR/terraform.tfvars}"
TERRAFORM="${TERRAFORM:-terraform}"
FORCE=0
SKIP_EMPTY=0

usage() {
  echo "Usage: $0 <environment-name> [--tfvars PATH] [--force] [--skip-empty-bucket]" >&2
  exit 1
}

if [[ $# -lt 1 ]]; then usage; fi
ENV_NAME="$1"
shift

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tfvars) TFVARS="$2"; shift 2 ;;
    --force) FORCE=1; shift ;;
    --skip-empty-bucket) SKIP_EMPTY=1; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown: $1" >&2; usage ;;
  esac
done

if [[ ! -f "$TFVARS" ]]; then
  echo "Missing: $TFVARS" >&2
  exit 1
fi

BACKEND_KEY="debug/${ENV_NAME}/terraform.tfstate"
echo "삭제 대상: $ENV_NAME"
echo "State key: $BACKEND_KEY"

export GOOGLE_OAUTH_ACCESS_TOKEN
GOOGLE_OAUTH_ACCESS_TOKEN="$(gcloud auth print-access-token)"

cd "$DEBUG_DIR"
$TERRAFORM init -reconfigure -backend-config="key=$BACKEND_KEY"

if [[ "$SKIP_EMPTY" -ne 1 ]]; then
  BUCKET="$($TERRAFORM output -raw s3_bucket 2>/dev/null || true)"
  if [[ -n "${BUCKET:-}" ]]; then
    echo "Emptying s3://$BUCKET"
    aws s3 rm "s3://$BUCKET" --recursive
  fi
fi

if [[ "$FORCE" -ne 1 ]]; then
  read -r -p "terraform destroy 를 실행합니다. 계속하려면 yes 입력: " CONFIRM
  if [[ "$CONFIRM" != "yes" ]]; then
    echo "취소됨"
    exit 0
  fi
fi

$TERRAFORM destroy -var-file="$TFVARS" -var="environment=$ENV_NAME" -auto-approve

rm -f "${ENV_NAME}.tfplan" "${ENV_NAME}-info.json" 2>/dev/null || true
echo "삭제 완료."
