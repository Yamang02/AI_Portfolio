# 자기소개 랜딩 페이지 분리 배포 & 도메인 전환

> 기술 블로그 초안용 참고 문서. 수치·키 값 등 민감 정보는 제외.

---

## 배경

기존에 `www.yamang02.com`에서 React SPA(포트폴리오 앱)가 서빙되고 있었고, 순수 HTML로 만든 자기소개 profile 페이지를 별도로 분리해서 배포하는 작업을 진행했다.

목표 도메인 구조:
- `www.yamang02.com` / `staging.yamang02.com` → profile 정적 사이트
- `www.yamangsolution.com` / `staging.yamangsolution.com` → 기존 React 앱

---

## 1. 정적 HTML에서 환경변수 주입하기

### 문제

profile 페이지는 Tailwind CDN과 EmailJS CDN을 사용하는 순수 HTML 파일이었다. EmailJS API 키를 코드에 하드코딩하지 않고 CI/CD 시 주입해야 했다.

### 시도한 방법들

**`import.meta.env`를 HTML에 직접 쓰는 방법** — 동작하지 않는다. Vite는 `import.meta.env`를 `<script type="module">` 안에서만 치환하고, HTML 속성이나 일반 `<script>` 블록에는 적용되지 않는다.

### 해결책

`profile/src/emailjs-config.ts` 파일을 별도로 만들어서 `import.meta.env`로 키를 읽은 뒤 전역 객체(`globalThis`)에 노출하는 방식을 택했다.

```ts
// profile/src/emailjs-config.ts
(globalThis as Record<string, unknown>).EMAILJS_CONFIG = {
  serviceId:  import.meta.env.VITE_EMAILJS_SERVICE_ID  ?? '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '',
  publicKey:  import.meta.env.VITE_EMAILJS_PUBLIC_KEY  ?? '',
};
```

그리고 `index.html`에 module script로 로드:

```html
<script type="module" src="/src/emailjs-config.ts"></script>
```

HTML 내 EmailJS 호출부에서는 `globalThis.EMAILJS_CONFIG`를 참조하면 빌드 결과물에 실제 값이 인라인된다.

### 추가 트러블슈팅: TypeScript 오류

```
error TS2339: Property 'env' does not exist on type 'ImportMeta'.
```

`profile/tsconfig.json`에 `vite/client` 타입이 없어서 발생. `compilerOptions`에 추가로 해결:

```json
"types": ["vite/client"]
```

---

## 2. CloudFront CNAMEAlreadyExists 오류

### 문제

새 profile용 CloudFront distribution을 만들 때 다음 오류가 발생했다:

```
An error occurred (CNAMEAlreadyExists) when calling the CreateDistribution operation:
One or more of the CNAMEs you provided are already associated with a different resource.
```

`www.yamang02.com`이 기존 React 앱 CloudFront에 alternate domain으로 등록되어 있었기 때문이다.

### 해결책

**신규 CF를 먼저 만들 수 없다. 기존 CF에서 도메인을 먼저 제거해야 한다.**

순서가 중요하다:
1. 기존 CF config 전체를 JSON으로 저장 (`get-distribution-config`)
2. JSON에서 `Aliases`를 남길 도메인만 남기도록 수정
3. `update-distribution`으로 적용 (ETag 필수)
4. 그 후 신규 CF 생성

```bash
# 1. config 저장
aws cloudfront get-distribution-config --id {ID} \
  --query "DistributionConfig" --output json > config.json

# 2. Aliases 수정 (Node.js로 JSON 편집)
node -e "
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('config.json'));
cfg.Aliases = { Quantity: 1, Items: ['admin.yamang02.com'] };
fs.writeFileSync('config-updated.json', JSON.stringify(cfg));
"

# 3. 업데이트 (--if-match에 ETag 값 필요)
aws cloudfront update-distribution --id {ID} \
  --if-match {ETag} \
  --distribution-config file://config-updated.json
```

`--if-match`에 넣는 ETag는 `get-distribution-config` 응답의 최상위 `ETag` 값이다 (`DistributionConfig` 내부가 아님).

---

## 3. IAM 정책 버전 한도 초과

### 문제

GitHub Actions 배포 사용자(`github-actions-ai-portfolio`)에 연결된 `AI-Portfolio-S3-Policy`에 새 버킷을 추가하려고 `create-policy-version`을 실행했더니:

```
An error occurred (LimitExceeded): A managed policy can have up to 5 versions.
Before you create a new version, you must delete an existing version.
```

AWS IAM managed policy는 버전을 최대 5개까지만 유지한다.

### 해결책

기본 버전(IsDefaultVersion: true)이 아닌 가장 오래된 버전을 먼저 삭제한 후 새 버전 생성:

```bash
# 비기본 버전 목록 확인
aws iam list-policy-versions --policy-arn {ARN} \
  --query "Versions[?IsDefaultVersion==\`false\`].VersionId"

# 가장 오래된 버전 삭제
aws iam delete-policy-version --policy-arn {ARN} --version-id v1

# 새 버전 생성 (기본값으로 설정)
aws iam create-policy-version --policy-arn {ARN} \
  --set-as-default \
  --policy-document file://new-policy.json
```

---

## 4. CloudFront 인증서 전략 — 여러 도메인을 하나의 CF로

### 문제

하나의 CloudFront distribution에 서로 다른 apex 도메인(`admin.yamang02.com`, `www.yamangsolution.com`)을 alternate domain으로 등록하려고 했다.

CloudFront는 distribution당 ACM 인증서를 **하나만** 연결할 수 있는데, 두 도메인이 서로 다른 인증서에 있었다.

### 해결책

**하나의 인증서에 두 도메인을 모두 SAN으로 포함**해서 새로 발급받는다.

```bash
aws acm request-certificate \
  --domain-name "yamangsolution.com" \
  --subject-alternative-names "*.yamangsolution.com" "admin.yamang02.com" \
  --validation-method DNS \
  --region us-east-1  # CloudFront용 인증서는 반드시 us-east-1
```

여러 도메인이 서로 다른 DNS 공급자(Route 53, Cloudflare)에 있어도 문제없다. 각 도메인의 검증 CNAME을 각자의 DNS에 추가하면 된다.

**주의**: 이미 발급된 인증서에 SAN을 추가할 수 없다. 처음부터 모든 도메인을 포함해서 새로 발급해야 한다.

---

## 5. Cloudflare 도메인을 AWS CloudFront에 연결하기

### 구조

`yamangsolution.com`은 Cloudflare에서 관리하는 도메인이고, 실제 서버는 AWS CloudFront다. 이 조합에서 주의할 점들이 있다.

### ACM 인증서 DNS 검증

CloudFront용 ACM 인증서는 `us-east-1`에서 발급해야 한다. DNS 검증 방식을 쓰면 Cloudflare DNS에 검증 CNAME을 추가하면 된다.

같은 도메인(`yamangsolution.com`, `*.yamangsolution.com`)의 검증 CNAME은 동일한 레코드 하나로 처리된다 — 둘 다 같은 Name/Value를 쓴다.

### Cloudflare에서 CloudFront로 CNAME 연결 시 주의사항

- **Proxy 설정**: DNS only(회색 구름)로 설정해야 한다. Cloudflare 프록시(주황 구름)를 켜면 CloudFront가 `Host` 헤더에서 원래 도메인을 인식하지 못해 `403`이 발생할 수 있다.
- **루트 도메인 CNAME**: Cloudflare는 CNAME Flattening을 지원하므로 `yamangsolution.com` 루트 도메인도 CNAME으로 설정 가능하다 (일반 DNS에서는 루트 도메인에 CNAME을 쓸 수 없다).
- **SSL 모드**: Cloudflare SSL/TLS → Full로 설정. CloudFront는 HTTPS로 응답하기 때문이다.

---

## 6. S3 + CloudFront OAC 구성

퍼블릭 액세스를 완전히 차단한 S3 버킷에 CloudFront만 접근 가능하도록 OAC(Origin Access Control)를 사용했다.

```bash
# OAC 생성
aws cloudfront create-origin-access-control \
  --origin-access-control-config '{
    "Name": "my-profile-oac",
    "SigningProtocol": "sigv4",
    "SigningBehavior": "always",
    "OriginAccessControlOriginType": "s3"
  }'

# S3 bucket policy — CloudFront 배포판의 ARN으로 조건 제한
{
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "cloudfront.amazonaws.com"},
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::버킷명/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::계정ID:distribution/배포판ID"
      }
    }
  }]
}
```

OAC는 기존 OAI(Origin Access Identity)보다 보안이 강화된 방식이다. `S3OriginConfig`의 `OriginAccessIdentity`는 빈 문자열로 두고, `OriginAccessControlId`에 OAC ID를 넣는다.

### SPA 정적 배포 시 에러 페이지 처리

React SPA처럼 클라이언트 사이드 라우팅을 사용하거나, 단일 `index.html`만 있는 정적 사이트는 CloudFront Custom Error Response 설정이 필요하다.

```json
"CustomErrorResponses": {
  "Quantity": 2,
  "Items": [
    {"ErrorCode": 403, "ResponsePagePath": "/index.html", "ResponseCode": "200"},
    {"ErrorCode": 404, "ResponsePagePath": "/index.html", "ResponseCode": "200"}
  ]
}
```

S3에서 존재하지 않는 경로를 요청하면 403/404가 반환되는데, 이를 `index.html`로 리다이렉트해서 앱이 정상 로딩되게 한다.

---

## 7. Route 53과 Cloudflare 혼용 환경

`yamang02.com`은 Route 53, `yamangsolution.com`은 Cloudflare에서 관리하는 상황이었다.

도메인이 두 공급자에 분산되어도 AWS 인프라 작업 자체는 동일하다. 다만:

- **Route 53**: `aws route53 change-resource-record-sets`로 A 레코드를 CloudFront Alias로 자동화 가능
- **Cloudflare**: UI 또는 API로 직접 추가해야 하고, ACM 검증 CNAME / 서비스 CNAME 두 종류를 별도로 추가해야 한다

CloudFront의 Hosted Zone ID는 `Z2FDTNDATAQYW2`로 고정이다 (모든 리전 동일).

---

## 8. gitignore와 정적 에셋 누락 문제

### 문제

`staging.yamang02.com`에 profile이 배포됐는데 이미지와 비디오가 전혀 뜨지 않았다.

### 원인

루트 `.gitignore`에 `public/` 디렉토리 전체가 제외되어 있었고, `profile/public/`에 대한 예외가 없었다.

```gitignore
# 기존 — profile/public/ 전체가 git에서 제외됨
public/
!frontend/public/
```

Vite는 `public/` 폴더의 파일을 `dist/`로 그대로 복사하는데, GitHub Actions에서 빌드할 때 `profile/public/img/`, `profile/public/video/` 등이 checkout되지 않아 dist에 포함되지 않았다.

### 해결책

`.gitignore`에 `profile/public/` 예외를 추가하고 에셋을 커밋:

```gitignore
public/
!frontend/public/
frontend/public/*
!profile/public/
profile/public/*
!profile/public/img/
!profile/public/img/**
!profile/public/video/
!profile/public/video/**
!profile/public/favicons/
!profile/public/favicons/**
!profile/public/*.ttf
```

**교훈**: 정적 사이트를 모노레포에 추가할 때 루트 `.gitignore`의 전역 규칙이 새 프로젝트 경로에 영향을 주는지 반드시 확인해야 한다. 빌드는 성공해도 에셋 파일이 없으면 조용히 빈 상태로 배포된다.

---

## 9. GitHub Actions 워크플로우 — profile 배포 자동화

### staging 자동 트리거

`profile/**` 경로 변경이 포함된 커밋이 `staging` 브랜치에 push되면 자동으로 배포된다.

```yaml
on:
  push:
    branches: [ staging ]
    paths:
      - 'profile/**'
      - '.github/workflows/profile-staging-aws.yml'
  workflow_dispatch:
```

**주의**: 워크플로우 파일 자체가 GitHub에 없으면 트리거되지 않는다. 워크플로우 파일을 추가하는 커밋이 push되는 시점부터 동작한다.

### production은 workflow_dispatch만

production 배포는 자동 트리거 없이 수동으로만 실행한다. staging에서 검증 후 main 브랜치에 머지하고 나서 실행하는 흐름이다.

```
staging 브랜치 작업 → staging 자동 배포 → 확인 → main 머지 → production workflow_dispatch
```

---

## 10. SEO / OG 태그 설정

도메인 전환 후 두 사이트 모두 SEO 메타데이터를 새로 정비했다.

### profile (`www.yamang02.com`)

`profile/index.html` `<head>`에 추가한 항목:

```html
<!-- SEO -->
<meta name="description" content="야망솔루션 대표 이정준의 소개 페이지입니다. 교육자, 개발자, 아티스트, 창업가로서의 이야기를 담았습니다." />
<meta name="author" content="이정준 (Yamang02)" />
<link rel="canonical" href="https://www.yamang02.com" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.yamang02.com" />
<meta property="og:title" content="이정준 | 야망솔루션 대표" />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://www.yamang02.com/img/OG_Yamang02.png" />
<meta property="og:image:width" content="1065" />
<meta property="og:image:height" content="528" />
<meta property="og:locale" content="ko_KR" />
<meta property="og:site_name" content="Yamang02" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
...
```

OG 이미지: `profile/public/img/OG_Yamang02.png` (1065×528px)
— 표준(1200×630)보다 작으므로 추후 교체 권장.

sitemap과 robots.txt도 신규 추가:
- `profile/public/sitemap.xml` — `https://www.yamang02.com/` 단일 URL
- `profile/public/robots.txt` — `Sitemap: https://www.yamang02.com/sitemap.xml`

### React 앱 (`www.yamangsolution.com`)

`frontend/index.html`에 누락된 OG 항목 보완:

```html
<link rel="canonical" href="https://www.yamangsolution.com" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.yamangsolution.com" />
<meta property="og:title" content="야망솔루션 | YamangSolution" />
<meta property="og:description" content="AI 시대 빌더들의 꿈을 기술로 풀어내는 야망솔루션의 포트폴리오 페이지입니다." />
<meta property="og:image" content="https://www.yamangsolution.com/images/og-default.png" />
<meta property="og:image:width" content="1058" />
<meta property="og:image:height" content="546" />
```

OG 이미지: `frontend/public/images/og-default.png` (1058×546px)

sitemap과 robots.txt 신규 추가:
- `frontend/public/sitemap.xml` — `/`, `/profile`, `/projects`, `/articles` 포함. `/projects/:id`·`/articles/:businessId`는 동적이라 제외. `/chat`·`/admin`은 robots.txt에서 크롤 차단.
- `frontend/public/robots.txt` — `Disallow: /chat`, `Disallow: /admin`

---

## 9. 전체 인프라 최종 구조

작업 완료 후 도메인-인프라 매핑:

| 도메인 | CloudFront ID | S3 버킷 | 역할 |
|--------|--------------|---------|------|
| `www.yamang02.com`, `yamang02.com` | 신규 production | `ai-portfolio-profile-production` | profile 정적 사이트 |
| `staging.yamang02.com` | 신규 staging | `ai-portfolio-profile-staging` | profile staging |
| `www.yamangsolution.com`, `yamangsolution.com`, `admin.yamang02.com` | 기존 production | `ai-portfolio-fe-production` | frontend React 앱 |
| `staging.yamangsolution.com`, `staging.admin.yamang02.com` | 기존 staging | `ai-portfolio-fe-staging` | frontend staging |

기존 CloudFront 2개를 재활용하고 신규 CloudFront 2개를 추가한 구조다. 신규 생성이 아닌 재활용 방식을 택한 이유는 기존 S3 버킷, IAM 정책, 배포 파이프라인을 그대로 유지할 수 있기 때문이다.

### ACM 인증서 최종 현황

| 인증서 | 커버 도메인 | 연결된 CF |
|--------|------------|-----------|
| `*.yamang02.com` | `*.yamang02.com` | profile production, profile staging |
| `yamangsolution.com` + `*.yamangsolution.com` + `admin.yamang02.com` | 세 도메인 | 기존 production CF |
| `staging.yamangsolution.com` + `staging.admin.yamang02.com` | 두 도메인 | 기존 staging CF |

---

## 11. Google Search Console & GA4 마무리

### Google Search Console

**`yamang02.com` property (기존)**
- 기존에 React 앱 기준으로 제출된 sitemap(`/profile`, `/projects`, `/articles` 등) 삭제
- 새 sitemap 제출: `https://www.yamang02.com/sitemap.xml` (profile 단일 페이지)
- 기존 sitemap을 그대로 두면 `/projects`, `/articles` 등이 404로 크롤 오류 발생하므로 반드시 교체해야 한다

**`yamangsolution.com` property (신규)**
- Search Console에서 신규 property 추가 → 소유권 확인 완료
- sitemap 제출: `https://www.yamangsolution.com/sitemap.xml`

### GA4

**기존 데이터 스트림 URL 변경**
- 관리 → 데이터 스트림 → 기존 스트림
- 웹사이트 URL: `www.yamang02.com` → `www.yamangsolution.com` 으로 수정
- 측정 ID·gtag 코드는 변경 없음. URL은 GA4 메타데이터 필드라 재배포 불필요

**profile용 신규 데이터 스트림 추가**
- 관리 → 데이터 스트림 → 스트림 추가 → 웹
- URL: `www.yamang02.com`, 스트림명: 야망솔루션 대표 소개 (profile)
- 발급된 측정 ID(`G-XYQN07J7KX`)를 `profile/index.html`에 gtag 스니펫으로 삽입

**확인 방법**
- 브라우저 Network 탭 → `collect` 필터 → `google-analytics.com/g/collect` 요청 확인
- GA4 실시간 보고서에서 활성 사용자 수 확인
- `tid` 파라미터로 올바른 측정 ID 발화 여부 검증
