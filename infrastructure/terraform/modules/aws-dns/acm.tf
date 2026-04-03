resource "aws_acm_certificate" "main" {
  provider = aws.us_east_1

  domain_name               = var.domain_name
  subject_alternative_names = length(var.main_certificate_sans) > 0 ? var.main_certificate_sans : ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate" "wildcard" {
  provider = aws.us_east_1

  domain_name               = "*.${var.domain_name}"
  subject_alternative_names = var.wildcard_certificate_sans
  validation_method         = "DNS"
  tags                      = var.wildcard_tags

  lifecycle {
    create_before_destroy = true
  }
}
