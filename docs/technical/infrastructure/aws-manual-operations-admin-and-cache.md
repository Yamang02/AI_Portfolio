# AWS 수동 작업 메모 (Admin 호스트 · HTML 엣지 캐시)

Terraform만으로 반영하지 않고 **AWS CLI/콘솔에서 먼저 적용한 항목**과, 저장소의 Terraform/모듈과의 관계를 정리한다.  
상세 ARN·전체 검증 레코드는 AWS 콘솔 또는 로컬 `inventory.private.md`에 둔다.

## 1. 배경

- **E06**: Admin을 `admin.html` MPA로 분리하고, **전용 호스트**(`admin.staging.yamang02.com`, `admin.yamang02.com`)로 서빙.
- **캐시**: 기본 Cache Behavior의 Managed-CachingOptimized는 S3 `Cache-Control`만으로는 엣지에서 구 HTML이 남을 수 있어, **`index.html` / `admin.html`에 CachingDisabled(ordered behavior)** 를 추가하는 것이 권장된다. (`cache-analysis-staging.md` 참고)

## 2. CloudFront Distribution

| 환경 | Distribution ID | 비고 |
|------|-----------------|------|
| Staging | `E7KKBCETIHDH6` | 별칭에 `admin.staging.yamang02.com` 추가 |
| Production | `E384L5ALEPZ14U` | 별칭에 `admin.yamang02.com` 추가 |

- **Viewer-request CloudFront Function** (호스트별 `/admin.html` 리라이트):
  - `ai-portfolio-staging-admin-html` — Host `admin.staging.yamang02.com`
  - `ai-portfolio-production-admin-html` — Host `admin.yamang02.com`
- 소스 참고: `infrastructure/terraform/scripts/cf-admin-html/index.js`, `index-prod.js` (Terraform `functions/admin-html-rewrite.js.tftpl`과 동일 로직).

## 3. ACM (us-east-1)

CloudFront **Alternate domain names**에 맞춰 **한 인증서에 필요한 SAN을 모두 포함**해야 한다.

- **Staging**: `staging.yamang02.com` + `admin.staging.yamang02.com` (와일드카드 `*.yamang02.com`만으로는 `admin.staging...` 미커버).
- **Production**: `yamang02.com` + `www.yamang02.com` + `admin.yamang02.com` (기존 apex+www 전용 인증서만으로는 `admin` 미포함이었음).

발급 후 Route53에 **DNS 검증용 CNAME**을 추가하고 `ISSUED` 확인.

## 4. Route53 (Hosted Zone: yamang02.com)

- **ACM 검증**: 위 인증서별로 요구되는 `_xxxx.` CNAME 레코드.
- **별칭 A**: `admin.staging.yamang02.com` → Staging Distribution 도메인, `admin.yamang02.com` → Production Distribution 도메인 (CloudFront 호스티드 존 ID `Z2FDTNDATAQYW2`).

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

- Vite dev 서버(예: `http://localhost:3000`)에서 **`/admin/login` 등 `/admin/*` 경로**로 접근한다.  
- `vite.config.ts`의 `admin-html-spa-fallback` 플러그인이 해당 요청을 `admin.html`로 넘긴다.

## 8. 로컬 Terraform 컨텍스트 덤프

- 스크립트: `infrastructure/terraform/scripts/export-local-context.ps1`  
- PowerShell에서 실행. 출력은 기본적으로 `%USERPROFILE%\Documents\AI_PortFolio-terraform-local\<타임스탬프>\` (Git에 넣지 말 것).

---

**갱신일**: 2026-04-03
