# aws-frontend module

S3 + CloudFront 기반 프론트엔드 정적 호스팅 모듈입니다.

## 포함 리소스

- `aws_s3_bucket.main`
- `aws_s3_bucket_public_access_block.main`
- `aws_cloudfront_origin_access_control.main` (선택: `create_origin_access_control = false`이면 생성하지 않고 기존 OAC ID만 참조)
- `aws_cloudfront_distribution.main`
- `aws_s3_bucket_policy.main`

## 공유 OAC (staging)

production과 동일한 Origin Access Control을 쓰는 경우, staging 워크스페이스에서는 OAC 리소스를 **중복 관리하지 않도록** `create_origin_access_control = false`와 `existing_origin_access_control_id`를 설정합니다.

## Import 예시

```bash
terraform import module.frontend.aws_s3_bucket.main <BUCKET_NAME>
terraform import module.frontend.aws_cloudfront_distribution.main <DISTRIBUTION_ID>
terraform import module.frontend.aws_cloudfront_origin_access_control.main <OAC_ID>
```

OAC를 생성하지 않는 환경에서는 OAC import를 생략합니다.
