data "aws_iam_policy_document" "s3_access" {
  statement {
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:PutBucketVersioning"
    ]

    resources = concat([
      var.s3_bucket_arn,
    ], var.extra_bucket_arns)
  }

  statement {
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject"
    ]

    resources = concat([
      "${var.s3_bucket_arn}/*",
    ], [for arn in var.extra_bucket_arns : "${arn}/*"])
  }
}

data "aws_iam_policy_document" "cloudfront_invalidation" {
  statement {
    effect = "Allow"

    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
      "cloudfront:ListInvalidations",
      "cloudfront:GetDistribution",
      "cloudfront:ListDistributions"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "s3" {
  name   = var.s3_policy_name
  policy = data.aws_iam_policy_document.s3_access.json
}

resource "aws_iam_policy" "cloudfront" {
  name   = var.cloudfront_policy_name
  policy = data.aws_iam_policy_document.cloudfront_invalidation.json
}

resource "aws_iam_user" "github_actions" {
  name = var.github_actions_user_name

  tags = {
    AKIAYYAO2EQLRRVOOG5U = "github actions cicd"
  }
}

resource "aws_iam_user_policy_attachment" "github_actions_s3" {
  user       = aws_iam_user.github_actions.name
  policy_arn = aws_iam_policy.s3.arn
}

resource "aws_iam_user_policy_attachment" "github_actions_cloudfront" {
  user       = aws_iam_user.github_actions.name
  policy_arn = aws_iam_policy.cloudfront.arn
}
