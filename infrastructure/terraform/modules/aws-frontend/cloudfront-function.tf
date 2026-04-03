resource "aws_cloudfront_function" "admin_html_rewrite" {
  count = length(var.admin_html_rewrite_hostnames) > 0 ? 1 : 0

  name    = "${var.distribution_name_tag}-admin-html"
  runtime = "cloudfront-js-1.0"
  comment = "Admin-only hostnames: non-asset paths -> /admin.html"
  publish = true
  code = templatefile("${path.module}/functions/admin-html-rewrite.js.tftpl", {
    hosts_json = jsonencode(var.admin_html_rewrite_hostnames)
  })
}
