output "hosted_zone_id" {
  description = "Route53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "certificate_arn" {
  description = "Main ACM certificate ARN"
  value       = aws_acm_certificate.main.arn
}

output "wildcard_certificate_arn" {
  description = "Wildcard ACM certificate ARN"
  value       = aws_acm_certificate.wildcard.arn
}
