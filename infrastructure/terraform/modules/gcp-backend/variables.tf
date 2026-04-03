variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "Cloud Run region"
  type        = string
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
}

variable "service_account_email" {
  description = "Runtime service account email"
  type        = string
}

variable "container_image" {
  description = "Placeholder container image for import-safe config"
  type        = string
}

