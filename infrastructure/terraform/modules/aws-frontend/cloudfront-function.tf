resource "aws_cloudfront_function" "admin_html_rewrite" {
  # 캐시 키용 x-cf-site-key는 모든 요청에 필요하므로 항상 배포한다(Admin 리라이트 호스트 목록은 비어 있을 수 있음).
  count = 1

  name = (
    var.cloudfront_admin_function_name != ""
    ? var.cloudfront_admin_function_name
    : "${var.distribution_name_tag}-admin-html"
  )
  runtime = "cloudfront-js-1.0"
  comment = "Exact directory index rewrites and admin-only HTML routing"
  publish = true
  code = templatefile("${path.module}/functions/admin-html-rewrite.js.tftpl", {
    hosts_json                  = jsonencode(var.admin_html_rewrite_hostnames)
    directory_index_routes_json = jsonencode(var.directory_index_routes)
  })
}
