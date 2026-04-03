# aws-dns module

AWS Route53 Hosted Zone과 ACM 인증서를 관리하는 모듈입니다.

## 포함 리소스

- `aws_route53_zone.main`
- `aws_route53_record.records` (선택)
- `aws_acm_certificate.main` (us-east-1)
- `aws_acm_certificate.wildcard` (us-east-1)

## Import 예시

```bash
terraform import module.dns.aws_route53_zone.main <HOSTED_ZONE_ID>
terraform import module.dns.aws_acm_certificate.main <MAIN_CERT_ARN>
terraform import module.dns.aws_acm_certificate.wildcard <WILDCARD_CERT_ARN>
```
