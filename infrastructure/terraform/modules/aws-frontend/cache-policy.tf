# 여러 Alternate domain names(www / admin 등)을 한 Distribution에 둘 때,
# Managed-CachingOptimized는 캐시 키에 호스트를 넣지 않아 / 등이 호스트 간 공유될 수 있다.
# Host 헤더는 캐시 정책에 넣으면 S3 오리진과 충돌(콘솔 비활성화)하므로,
# Viewer-request 함수가 넣는 x-cf-site-key만 캐시 키에 포함한다.

resource "aws_cloudfront_cache_policy" "default_with_host" {
  name    = "${var.distribution_name_tag}-default-host-key"
  comment = "Like CachingOptimized but x-cf-site-key in cache key (multi-alias; set by viewer-request function)"

  min_ttl     = 1
  default_ttl = 86400
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["x-cf-site-key"]
      }
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}
