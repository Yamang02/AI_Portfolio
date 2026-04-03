# AWS 수동 작업 메모 (Admin 호스트 · HTML 엣지 캐시)

Terraform만으로 반영하지 않고 **AWS CLI/콘솔에서 먼저 적용한 항목**과, 저장소의 Terraform/모듈과의 관계를 정리한다.  
상세 ARN·전체 검증 레코드·**Admin 전용 호스트 FQDN**은 AWS 콘솔 또는 로컬 `inventory.private.md`에 둔다.

## 1. 배경

- **E06**: Admin을 `admin.html` MPA로 분리하고, **Staging·Production 각각 전용 호스트**로 서빙(호스트명은 비공개).
- **캐시**: 기본 Cache Behavior의 Managed-CachingOptimized는 S3 `Cache-Control`만으로는 엣지에서 구 HTML이 남을 수 있어, **`index.html` / `admin.html`에 CachingDisabled(ordered behavior)** 를 추가하는 것이 권장된다. (`cache-analysis-staging.md` 참고)

## 2. CloudFront Distribution

| 환경 | Distribution ID | 비고 |
|------|-----------------|------|
| Staging | `E7KKBCETIHDH6` | 별칭에 **Staging Admin 전용 호스트** 추가 |
| Production | `E384L5ALEPZ14U` | 별칭에 **Production Admin 전용 호스트** 추가 |

- **Viewer-request CloudFront Function** (해당 Admin 호스트에서 `/admin.html` 리라이트):
  - `ai-portfolio-staging-viewer-request-admin-spa` — Staging
  - `ai-portfolio-prod-viewer-request-admin-spa` — Production  
  Terraform 모듈 변수 `cloudfront_admin_function_name`과 동일 이름을 쓴다.
- 소스 참고: `infrastructure/terraform/scripts/cf-admin-html/index.js`, `index-prod.js` (Terraform `functions/admin-html-rewrite.js.tftpl`과 동일 로직).
- **캐시 키에 Host 미포함 (중요)**: 기본 Cache Behavior에 **Managed-CachingOptimized**만 쓰면 캐시 키에 **Host가 들어가지 않아**, `www`와 `admin`이 **같은 경로 `/`** 로 요청할 때 **동일 엣지 객체(메인 `index.html`)**를 공유할 수 있다(Etag 동일). **해결**: Default behavior용 캐시 정책에 **`Host` 헤더를 캐시 키에 포함**(Terraform 모듈 `aws_cloudfront_cache_policy.default_with_host`).
- **Default root object**: Production은 **`default_root_object`를 비우는 것**을 권장(스테이징과 동일). `index.html`이면 `/`가 **`/index.html`로 치환**되어 viewer-request의 확장자 분기에 걸릴 수 있다. 함수에서는 Admin 호스트의 **`/index.html` → `/admin.html`** 분기로 보완한다.

## 3. ACM (us-east-1)

CloudFront **Alternate domain names**에 맞춰 **한 인증서에 필요한 SAN을 모두 포함**해야 한다.

- **Staging**: 메인 스테이징 호스트 + **Staging Admin 전용 호스트** (와일드카드만으로 Admin 서브도메인이 빠지는지 검토).
- **Production**: apex·www + **Production Admin 전용 호스트** (기존 인증서가 Admin 이름을 커버하는지 검토).

발급 후 Route53에 **DNS 검증용 CNAME**을 추가하고 `ISSUED` 확인.

## 4. Route53 (Hosted Zone: yamang02.com)

- **ACM 검증**: 인증서별로 요구되는 `_xxxx.` CNAME 레코드.
- **별칭 A**: Staging/Production **Admin 전용 호스트** → 각각 해당 CloudFront Distribution 도메인 (호스티드 존 ID `Z2FDTNDATAQYW2`).

## 5. HTML 엣지 캐시 (구버전 서빙 완화)

두 Distribution 모두 **Cache behaviors**에 다음 경로를 두고, **Cache policy = Managed-CachingDisabled** (`4135ea2d-6df8-44a3-9df3-4b5a84be39ad`)를 사용한다.

- `index.html`
- `admin.html`

Terraform 모듈에서는 `enable_index_html_cache_behavior` + `extra_edge_no_cache_path_patterns` 로 동일 구성을 코드화한다.  
**수동 적용 후에는 Terraform state와 실제 AWS가 어긋날 수 있으므로**, 이후 `terraform plan`으로 드리프트를 확인하고 import/코드 정리를 권장한다.

## 6. GitHub Actions와의 관계

프론트 워크플로는 그대로 **`index.html` / `admin.html`을 no-cache로 재업로드**하고 **`/*` 무효화**한다.  
엣지 **CachingDisabled**는 S3 헤더와 별개로 **HTML 경로의 장기 캐시**를 막는 보조 장치다.

## 7. 로컬 개발에서 Admin 접근

- Vite dev 서버에서 **`/admin/login` 등 `/admin/*` 경로**로 접근한다.  
- `vite.config.ts`의 `admin-html-spa-fallback` 플러그인이 해당 요청을 `admin.html`로 넘긴다.

## 8. 로컬 Terraform 컨텍스트 덤프

- 스크립트: `infrastructure/terraform/scripts/export-local-context.ps1`  
- PowerShell에서 실행. 출력은 기본적으로 `%USERPROFILE%\Documents\AI_PortFolio-terraform-local\<타임스탬프>\` (Git에 넣지 말 것).

---

**갱신일**: 2026-04-03
