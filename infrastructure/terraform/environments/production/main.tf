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

module "dns" {
  source = "../../modules/aws-dns"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  environment         = var.environment
  domain_name         = var.domain_name
  hosted_zone_comment = var.route53_zone_comment
}

module "frontend" {
  source = "../../modules/aws-frontend"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  environment                = var.environment
  bucket_name                = var.frontend_bucket_name
  certificate_arn            = module.dns.certificate_arn
  aliases                    = [var.domain_name, "www.${var.domain_name}"]
  origin_id                  = var.cloudfront_origin_id
  price_class                = var.cloudfront_price_class
  distribution_comment       = var.cloudfront_comment
  origin_access_control_name = var.cloudfront_oac_name
}

module "iam" {
  source = "../../modules/aws-iam"

  environment              = var.environment
  s3_bucket_arn            = module.frontend.bucket_arn
  extra_bucket_arns        = var.extra_iam_bucket_arns
  cloudfront_arn           = module.frontend.cloudfront_arn
  s3_policy_name           = var.s3_policy_name
  cloudfront_policy_name   = var.cloudfront_policy_name
  github_actions_user_name = var.github_actions_user_name
}

module "backend" {
  source = "../../modules/gcp-backend"

  project_id            = var.gcp_project_id
  region                = var.gcp_region
  service_name          = "ai-portfolio"
  service_account_email = var.cloud_run_service_account_email
  container_image       = var.cloud_run_container_image
}

module "registry" {
  source = "../../modules/gcp-registry"

  project_id    = var.gcp_project_id
  location      = "us"
  repository_id = "gcr.io"
  description   = "AI_portfolio"
}

module "gcp_iam" {
  source = "../../modules/gcp-iam"

  project_id   = var.gcp_project_id
  account_id   = "github-actions"
  display_name = "github-actions"
}
