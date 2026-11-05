# aws-frontend module

S3 + CloudFront 기반 프론트엔드 정적 호스팅 모듈입니다.

## 포함 리소스

- `aws_s3_bucket.main`
- `aws_s3_bucket_public_access_block.main`
- `aws_cloudfront_origin_access_control.main` (선택: `create_origin_access_control = false`이면 생성하지 않고 기존 OAC ID만 참조)
- `aws_cloudfront_distribution.main`
- `aws_s3_bucket_policy.main`

## 경로 라우팅

- `directory_index_routes`는 지정한 호스트의 정확한 디렉터리 경로(`/en`, `/en/` 등)를 해당 디렉터리의 `index.html` 객체로 내부 rewrite합니다. 목록에 없는 호스트와 경로는 그대로 전달합니다.
- `admin_html_rewrite_hostnames`는 지정한 호스트의 정적 자산이 아닌 경로를 `/admin.html`로 내부 rewrite합니다. 두 경로 규칙은 같은 viewer-request 함수에서 독립적으로 처리합니다.

## 공유 OAC (staging)

production과 동일한 Origin Access Control을 쓰는 경우, staging 워크스페이스에서는 OAC 리소스를 **중복 관리하지 않도록** `create_origin_access_control = false`와 `existing_origin_access_control_id`를 설정합니다.

## Import 예시

```bash
terraform import module.frontend.aws_s3_bucket.main <BUCKET_NAME>
terraform import module.frontend.aws_cloudfront_distribution.main <DISTRIBUTION_ID>
terraform import module.frontend.aws_cloudfront_origin_access_control.main <OAC_ID>
```

OAC를 생성하지 않는 환경에서는 OAC import를 생략합니다.
