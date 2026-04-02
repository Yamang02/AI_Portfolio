variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
}

variable "hosted_zone_comment" {
  description = "Hosted zone comment"
  type        = string
  default     = "Managed by Terraform"
}

variable "records" {
  description = "Route53 DNS records map"
  type = map(object({
    name    = string
    type    = string
    ttl     = number
    records = list(string)
  }))
  default = {}
}

variable "main_certificate_sans" {
  description = "SANs for main certificate"
  type        = list(string)
  default     = []
}

variable "wildcard_certificate_sans" {
  description = "SANs for wildcard certificate"
  type        = list(string)
  default     = []
}

variable "wildcard_tags" {
  description = "Tags for wildcard ACM certificate"
  type        = map(string)
  default = {
    Project = " AI-Portfolio"
  }
}
