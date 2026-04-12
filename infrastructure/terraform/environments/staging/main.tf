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
  certificate_arn = var.acm_certificate_arn
  aliases = [
    "staging.yamangsolution.com",
    "staging.admin.yamang02.com",
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

  # Cloud SQL Postgres: db-f1-micro (공유 코어·~0.6GB RAM). Railway 메트릭 피크(~130MB RAM) 대비 여유.
  # 티어·디스크·REGIONAL(HA)는 콘솔/terraform로 상향 용이. DB/사용자는 마이그레이션·수동 생성.
  create_database = false

  tier              = "db-f1-micro"
  disk_size_gb      = 10
  availability_type = "ZONAL"

  deletion_protection = false

  backup_enabled                 = true
  point_in_time_recovery_enabled = false
  retained_backups               = 3

  query_insights_enabled = false
}
