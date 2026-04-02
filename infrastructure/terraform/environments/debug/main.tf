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

data "aws_route53_zone" "root" {
  name         = "${var.domain_name}."
  private_zone = false
}

locals {
  fqdn = "${var.environment}.${var.domain_name}"
  # Cloud Run 서비스명: 소문자·숫자·하이픈만, 최대 63자 (Terraform 구버전 호환을 위해 replace 체인 사용)
  run_service_name = substr(
    replace(
      replace(
        replace(lower("ai-${var.environment}"), ".", "-"),
        "_", "-"),
      " ", "-"),
    0, 63
  )
}

module "frontend" {
  source = "../../modules/aws-frontend"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  environment          = var.environment
  bucket_name          = "ai-portfolio-fe-${var.environment}"
  certificate_arn      = var.acm_certificate_arn
  aliases              = [local.fqdn]
  origin_id            = "debug-${var.environment}-origin"
  price_class          = var.cloudfront_price_class
  distribution_comment = "debug ${var.environment}"

  create_origin_access_control      = false
  existing_origin_access_control_id = var.shared_origin_access_control_id

  default_root_object              = ""
  enable_index_html_cache_behavior = false
  custom_error_responses = [
    {
      error_code            = 403
      response_page_path    = "/index.html"
      response_code         = "200"
      error_caching_min_ttl = 10
    }
  ]
  distribution_name_tag = "ai-portfolio-frontend-debug"
}

resource "aws_route53_record" "debug" {
  zone_id = data.aws_route53_zone.root.zone_id
  name    = var.environment
  type    = "A"

  alias {
    name                   = module.frontend.cloudfront_domain_name
    zone_id                = module.frontend.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

module "debug_run" {
  source = "../../modules/gcp-debug-hello"

  project_id            = var.gcp_project_id
  region                = var.gcp_region
  service_name          = local.run_service_name
  service_account_email = var.cloud_run_service_account_email
}
