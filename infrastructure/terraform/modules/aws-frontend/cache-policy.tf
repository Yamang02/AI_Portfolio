# 여러 Alternate domain names(www / admin 등)을 한 Distribution에 둘 때,
# Managed-CachingOptimized는 Host를 캐시 키에 넣지 않아 / 등 동일 경로가 호스트 간 공유된다.
# 그 결과 admin 호스트에서도 메인 index.html 캐시가 그대로 맞을 수 있음 → Host를 캐시 키에 포함.

resource "aws_cloudfront_cache_policy" "default_with_host" {
  name    = "${var.distribution_name_tag}-default-host-key"
  comment = "Like CachingOptimized but Host in cache key (multi-alias SPA + admin)"

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
        items = ["host"]
      }
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}
