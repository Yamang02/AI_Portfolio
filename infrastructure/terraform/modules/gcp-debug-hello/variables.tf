variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "Cloud Run region"
  type        = string
}

variable "service_name" {
  description = "Cloud Run service name (DNS-compliant)"
  type        = string
}

variable "service_account_email" {
  description = "Runtime service account"
  type        = string
}
