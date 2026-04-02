# AWS Staging Frontend 캐시 문제 분석

**작성일**: 2026-04-02
**환경**: Staging (staging.yamang02.com)
**CloudFront Distribution ID**: E7KKBCETIHDH6

## 문제 개요

AWS Staging 환경에서 프론트엔드 배포 후 지속적으로 이전 버전이 서빙되는 캐시 문제가 발생하고 있습니다.

## 현재 인프라 구성 분석

### 1. CloudFront 캐시 설정

#### Default Cache Behavior
- **Cache Policy ID**: `658327ea-f89d-4fab-a63d-7e88639e58f6` (Managed-CachingOptimized)
- **정책 특성**:
  - MinTTL: 1초
  - DefaultTTL: **86,400초 (24시간)**
  - MaxTTL: 31,536,000초 (1년)
  - Gzip/Brotli 압축 활성화
  - 헤더/쿠키/쿼리스트링 무시

#### Ordered Cache Behaviors
- **현재 상태**: 없음 (Quantity: 0)
- **문제**: `index.html`에 대한 별도 캐시 정책이 없음

### 2. S3 업로드 전략

#### 일반 에셋 (60행)
```bash
aws s3 sync dist/ s3://$BUCKET --delete --cache-control "public, max-age=31536000"
```
- 모든 파일에 1년 캐시 적용

#### index.html 덮어쓰기 (62-68행)
```bash
aws s3 cp dist/index.html s3://$BUCKET/index.html \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html"
```
- S3에서는 `max-age=0`으로 설정
- 하지만 **CloudFront는 이를 무시함**

### 3. CloudFront 무효화 (90-94행)
```bash
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```
- 전체 경로 무효화 실행
- 하지만 완료까지 시간 소요

## 근본 원인 분석

### 🔴 Critical Issue 1: CloudFront 캐시 정책 우선순위

**문제점**:
CloudFront는 S3 객체의 `Cache-Control` 헤더를 **무시**하고, 할당된 Cache Policy를 우선 적용합니다.

**현재 동작**:
1. GitHub Actions에서 `index.html`을 `max-age=0`으로 S3에 업로드 ✅
2. S3에는 올바르게 저장됨 ✅
3. CloudFront는 Cache Policy ID `658327ea...`를 적용 ❌
4. 결과: **24시간 캐시 적용** (DefaultTTL: 86400초)

### 🔴 Critical Issue 2: index.html 전용 캐시 정책 미설정

**Staging 설정** ([staging/main.tf:50-51](../../../infrastructure/terraform/environments/staging/main.tf#L50-L51)):
```hcl
default_root_object              = ""
enable_index_html_cache_behavior = false
```

**Production 설정** (기본값):
```hcl
default_root_object              = "index.html"  # 기본값
enable_index_html_cache_behavior = true          # 기본값
```

**차이점**:
- Production은 `index.html`에 대해 별도의 Ordered Cache Behavior 적용
  - Cache Policy ID: `4135ea2d-6df8-44a3-9df3-4b5a84be39ad` (Managed-CachingOptimizedForUncompressedObjects)
- Staging은 모든 파일이 동일한 24시간 캐시 적용

### 🟡 Secondary Issue: Invalidation 타이밍

**무효화 프로세스**:
1. S3 업로드 완료
2. CloudFront 무효화 요청
3. **무효화 전파 시간**: 일반적으로 5-15분 소요
4. 전파 중에는 여전히 **old 캐시 서빙 가능**

**Race Condition**:
- 사용자가 배포 직후 접속하면 무효화 전의 캐시를 받을 수 있음

## 문제 발생 시나리오

### 시나리오 1: 정상 배포 흐름
```
1. [10:00:00] 새 빌드 시작
2. [10:02:00] S3에 업로드 완료
   - index.html: Cache-Control: max-age=0
   - main.js: Cache-Control: max-age=31536000
3. [10:02:05] CloudFront 무효화 시작
4. [10:05:00] 무효화 완료 (3분 소요)
```

**문제**: 10:02:05 ~ 10:05:00 사이 접속 시 old 버전 수신

### 시나리오 2: 브라우저 캐시 충돌
```
1. 사용자가 09:00에 staging.yamang02.com 방문
   - index.html 캐시됨 (CloudFront: 24시간 TTL)
   - main.abc123.js 캐시됨

2. 10:00에 새 배포 (main.xyz789.js)

3. 사용자가 11:00에 재방문
   - 브라우저: index.html 캐시 유효 (24시간 중 2시간 경과)
   - old index.html → old main.abc123.js 참조
   - CloudFront: 무효화했지만 브라우저가 요청 안함
```

**결과**: ChunkLoadError 또는 404 에러

## Terraform 설정 비교

### Staging ([cloudfront.tf:33-56](../../../infrastructure/terraform/modules/aws-frontend/cloudfront.tf#L33-L56))
```hcl
default_cache_behavior {
  allowed_methods  = ["GET", "HEAD"]
  cached_methods   = ["GET", "HEAD"]
  target_origin_id = var.origin_id

  viewer_protocol_policy = "redirect-to-https"
  compress               = true

  cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  # ↑ Managed-CachingOptimized: DefaultTTL=86400 (24시간)
}

# index.html 별도 정책 없음
dynamic "ordered_cache_behavior" {
  for_each = var.enable_index_html_cache_behavior ? [1] : []
  # ↑ staging은 false이므로 실행 안됨
  content {
    path_pattern     = "index.html"
    cache_policy_id  = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  }
}
```

### Production (추정)
```hcl
default_cache_behavior {
  cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  # 일반 에셋: 24시간 캐시
}

ordered_cache_behavior {
  path_pattern    = "index.html"
  cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  # index.html: 다른 정책 (확인 필요)
}
```

## 해결 방안

### 방안 1: Terraform 설정 수정 (권장)

**수정 위치**: [staging/main.tf:50-51](../../../infrastructure/terraform/environments/staging/main.tf#L50-L51)

```hcl
# Before
default_root_object              = ""
enable_index_html_cache_behavior = false

# After
default_root_object              = "index.html"
enable_index_html_cache_behavior = true
```

**효과**:
- `index.html` 요청 시 별도 캐시 정책 적용
- Production과 동일한 동작

**적용 절차**:
```bash
cd infrastructure/terraform/environments/staging
terraform plan
terraform apply
```

**주의사항**:
- CloudFront 배포 업데이트에 5-15분 소요
- 기존 캐시는 수동 무효화 필요

### 방안 2: 커스텀 캐시 정책 생성

**새로운 정책 설정**:
```hcl
resource "aws_cloudfront_cache_policy" "no_cache_html" {
  name        = "NoCacheForHTML"
  min_ttl     = 0
  default_ttl = 0
  max_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true

    headers_config {
      header_behavior = "none"
    }
    cookies_config {
      cookie_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}
```

**장점**:
- 완전한 캐시 무효화 (0초 TTL)
- HTML만 타겟팅 가능

**단점**:
- Terraform 코드 추가 필요
- CloudFront 정책 관리 복잡도 증가

### 방안 3: GitHub Actions 워크플로우 개선

**현재 문제점**:
- 무효화 후 완료 대기 없음
- 업로드 순서 보장 안됨

**개선안**:
```yaml
- name: Upload assets with long cache
  run: |
    cd frontend
    aws s3 sync dist/ s3://${{ vars.AWS_S3_NAME }} \
      --exclude "index.html" \
      --exclude "robots.txt" \
      --exclude "sitemap.xml" \
      --exclude "llms.txt" \
      --delete \
      --cache-control "public, max-age=31536000, immutable"

- name: Upload index.html with no-cache
  run: |
    cd frontend
    aws s3 cp dist/index.html s3://${{ vars.AWS_S3_NAME }}/index.html \
      --cache-control "public, max-age=0, must-revalidate, no-cache" \
      --content-type "text/html; charset=utf-8"

- name: Invalidate CloudFront and wait
  run: |
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
      --distribution-id ${{ vars.AWS_CLOUDFRONT_DISTRIBUTION_ID }} \
      --paths "/*" \
      --query 'Invalidation.Id' \
      --output text)

    echo "Waiting for invalidation $INVALIDATION_ID to complete..."
    aws cloudfront wait invalidation-completed \
      --distribution-id ${{ vars.AWS_CLOUDFRONT_DISTRIBUTION_ID }} \
      --id "$INVALIDATION_ID"

    echo "Invalidation completed!"
```

**개선 사항**:
1. `--exclude` 사용으로 업로드 순서 명확화
2. `--cache-control`에 `no-cache` 추가
3. `wait invalidation-completed`로 완료 대기
4. `immutable` 플래그 추가로 브라우저 재검증 방지

**한계**:
- CloudFront Cache Policy가 여전히 우선순위를 가짐
- 근본적 해결은 방안 1 또는 2 필요

### 방안 4: 하이브리드 접근

**1단계**: Terraform 설정 수정 (방안 1)
**2단계**: GitHub Actions 개선 (방안 3)
**3단계**: 모니터링 추가

```yaml
- name: Verify deployment
  run: |
    sleep 10
    RESPONSE=$(curl -I https://staging.yamang02.com/index.html)
    echo "$RESPONSE"

    # Cache-Control 헤더 확인
    if echo "$RESPONSE" | grep -i "cache-control.*max-age=0"; then
      echo "✅ index.html cache correctly configured"
    else
      echo "❌ index.html cache misconfigured"
      exit 1
    fi
```

## 즉시 조치 사항

### 1. 현재 캐시 강제 초기화
```bash
# CloudFront 무효화
aws cloudfront create-invalidation \
  --distribution-id E7KKBCETIHDH6 \
  --paths "/*"

# 특정 경로만 무효화 (빠름)
aws cloudfront create-invalidation \
  --distribution-id E7KKBCETIHDH6 \
  --paths "/index.html" "/assets/*"
```

### 2. S3 객체 메타데이터 확인
```bash
aws s3api head-object \
  --bucket ai-portfolio-fe-staging \
  --key index.html \
  --query '{CacheControl:CacheControl,ContentType:ContentType}' \
  --output json
```

**예상 출력**:
```json
{
  "CacheControl": "public, max-age=0, must-revalidate",
  "ContentType": "text/html"
}
```

### 3. CloudFront 헤더 확인
```bash
curl -I https://staging.yamang02.com/index.html
```

**확인 사항**:
- `X-Cache`: HIT vs MISS
- `Cache-Control`: CloudFront가 실제로 반환하는 값
- `Age`: 캐시 나이 (초)

## 장기적 개선 방향

### 1. 캐시 전략 표준화
- Production과 Staging의 캐시 정책 일치
- 환경별 차이 최소화

### 2. 배포 파이프라인 개선
- Blue/Green 배포 도입
- 무효화 완료 대기 필수화
- 배포 후 검증 자동화

### 3. 모니터링 강화
- CloudFront 캐시 히트율 모니터링
- 배포 후 에러율 추적
- 사용자 보고 ChunkLoadError 로깅

### 4. 문서화
- 캐시 전략 문서 작성
- 트러블슈팅 가이드 제공
- 배포 체크리스트 관리

## 참고 자료

- [AWS CloudFront Cache Policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html)
- [Terraform aws_cloudfront_distribution](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution)
- [S3 vs CloudFront Cache-Control Priority](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html)

## 다음 단계

1. ✅ 문제 분석 완료
2. ⏳ 해결 방안 선택 (팀 논의 필요)
3. ⏳ Terraform 변경 적용
4. ⏳ 배포 파이프라인 개선
5. ⏳ 검증 및 모니터링
