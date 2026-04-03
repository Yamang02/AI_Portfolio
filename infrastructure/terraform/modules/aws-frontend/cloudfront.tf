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
  # Managed-CachingDisabled — S3 Cache-Control과 무관하게 엣지에서 재검증/미캐시에 가깝게 (구버전 HTML 서빙 완화)
  edge_no_cache_paths = distinct(concat(
    var.enable_index_html_cache_behavior ? ["index.html"] : [],
    var.extra_edge_no_cache_path_patterns
  ))
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

    dynamic "function_association" {
      for_each = length(var.admin_html_rewrite_hostnames) > 0 ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.admin_html_rewrite[0].arn
      }
    }
  }

  dynamic "ordered_cache_behavior" {
    for_each = toset(local.edge_no_cache_paths)
    content {
      path_pattern     = ordered_cache_behavior.value
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
