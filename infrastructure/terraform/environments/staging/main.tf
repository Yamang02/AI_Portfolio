terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Staging shares Route53/ACM/IAM with production; only S3 + CloudFront are managed here.
module "frontend" {
  source = "../../modules/aws-frontend"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  environment = var.environment
  bucket_name = var.frontend_bucket_name
  # ACM 인증서(us-east-1)에 staging.admin.yamang02.com SAN이 있어야 함(*.yamang02.com만으로는 이 3단계 호스트가 커버되지 않음)
  # ACM 인증서(us-east-1): 966f1542 — staging.admin.yamang02.com + staging.portfolio.yamang02.com 커버
  certificate_arn = var.acm_certificate_arn
  aliases = [
    "staging.admin.yamang02.com",
    "staging.portfolio.yamang02.com",
  ]
  admin_html_rewrite_hostnames   = ["staging.admin.yamang02.com"]
  cloudfront_admin_function_name = "ai-portfolio-staging-viewer-request-admin-spa"
  origin_id                      = var.cloudfront_origin_id
  price_class                    = var.cloudfront_price_class
  distribution_comment           = var.cloudfront_comment

  create_origin_access_control      = false
  existing_origin_access_control_id = var.shared_origin_access_control_id

  default_root_object               = ""
  enable_index_html_cache_behavior  = true
  extra_edge_no_cache_path_patterns = ["admin.html"]
  custom_error_responses = [
    {
      error_code            = 403
      response_page_path    = "/index.html"
      response_code         = "200"
      error_caching_min_ttl = 10
    }
  ]
  distribution_name_tag = "ai-portfolio-frontend-staging"
}

module "backend" {
  source = "../../modules/gcp-backend"

  project_id            = var.gcp_project_id
  region                = var.gcp_region
  service_name          = "ai-portfolio-staging"
  service_account_email = var.cloud_run_service_account_email
  container_image       = var.cloud_run_container_image
}

module "postgres" {
  source = "../../modules/gcp-cloud-sql-postgres"

  project_id        = var.gcp_project_id
  region            = var.gcp_region
  environment_label = var.environment
  instance_name     = "ai-portfolio-pg-staging"

  # Cloud SQL Postgres: db-f1-micro (공유 코어·~0.6GB RAM). 스테이징 워로드 기준.
  # 티어·디스크·REGIONAL(HA)는 콘솔/terraform로 상향 용이. DB/사용자는 마이그레이션·수동 생성.
  create_database = false

  tier              = "db-f1-micro"
  disk_size_gb      = 10
  availability_type = "ZONAL"

  # 콘솔/정책에서 켜진 삭제 방지와 일치 (apply 시 false로 되돌리지 않도록)
  deletion_protection = true

  backup_enabled                 = true
  point_in_time_recovery_enabled = false
  retained_backups               = 3

  query_insights_enabled = false

  cloudsql_client_service_account_email = var.cloud_run_service_account_email
  cloudsql_admin_member                 = var.gcp_cloudsql_admin_member
}

# GitHub Actions가 Cloud Run에 런타임 전용 SA를 지정해 배포하려면 해당 SA에 대해 actAs 권한 필요
# (오류: Permission iam.serviceaccounts.actAs denied on ... )
resource "google_service_account_iam_member" "github_actions_act_as_cloud_run_runtime" {
  service_account_id = "projects/${var.gcp_project_id}/serviceAccounts/${var.cloud_run_service_account_email}"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${var.github_actions_deployer_service_account_email}"
}
