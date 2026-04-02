resource "aws_route53_zone" "main" {
  name    = var.domain_name
  comment = var.hosted_zone_comment
}

# Optional DNS records to avoid forcing full migration at once.
resource "aws_route53_record" "records" {
  for_each = var.records

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = each.value.ttl
  records = each.value.records
}
