output "s3_policy_arn" {
  description = "S3 policy ARN"
  value       = aws_iam_policy.s3.arn
}

output "cloudfront_policy_arn" {
  description = "CloudFront policy ARN"
  value       = aws_iam_policy.cloudfront.arn
}

output "github_actions_user_name" {
  description = "GitHub Actions IAM user name"
  value       = aws_iam_user.github_actions.name
}
