resource "aws_cloudfront_origin_access_control" "main" {
  count = var.create_origin_access_control ? 1 : 0

  name                              = var.origin_access_control_name
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"

  lifecycle {
    ignore_changes = [description]
  }
}

locals {
  origin_access_control_id = var.create_origin_access_control ? aws_cloudfront_origin_access_control.main[0].id : var.existing_origin_access_control_id
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = var.distribution_comment
  default_root_object = var.default_root_object
  price_class         = var.price_class

  aliases = var.aliases

  origin {
    domain_name              = aws_s3_bucket.main.bucket_regional_domain_name
    origin_id                = var.origin_id
    origin_access_control_id = local.origin_access_control_id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = var.origin_id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  dynamic "ordered_cache_behavior" {
    for_each = var.enable_index_html_cache_behavior ? [1] : []
    content {
      path_pattern     = "index.html"
      allowed_methods  = ["GET", "HEAD"]
      cached_methods   = ["GET", "HEAD"]
      target_origin_id = var.origin_id

      viewer_protocol_policy = "redirect-to-https"
      compress               = true
      cache_policy_id        = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    }
  }

  dynamic "custom_error_response" {
    for_each = var.custom_error_responses
    content {
      error_code            = custom_error_response.value.error_code
      response_page_path    = custom_error_response.value.response_page_path
      response_code         = custom_error_response.value.response_code
      error_caching_min_ttl = custom_error_response.value.error_caching_min_ttl
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = var.distribution_name_tag
  }
}
