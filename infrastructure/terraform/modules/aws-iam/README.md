# aws-iam module

프론트엔드 배포에 필요한 최소 IAM 사용자/정책을 관리하는 모듈입니다.

## 포함 리소스

- `aws_iam_policy.s3`
- `aws_iam_policy.cloudfront`
- `aws_iam_user.github_actions`
- `aws_iam_user_policy_attachment.*`

## Import 예시

```bash
terraform import module.iam.aws_iam_policy.s3 <S3_POLICY_ARN>
terraform import module.iam.aws_iam_policy.cloudfront <CLOUDFRONT_POLICY_ARN>
terraform import module.iam.aws_iam_user.github_actions <USER_NAME>
```
