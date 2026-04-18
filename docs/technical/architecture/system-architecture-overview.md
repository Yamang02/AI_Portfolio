# AI 포트폴리오 시스템 구성도

## 클라우드 아키텍처

> eraser.io Cloud Architecture Diagram — [eraser.io](https://eraser.io) 에서 붙여넣어 렌더링

```
title cloud architecture
direction top-bottom

// ─── DOMAINS ───────────────────────────────────────
www       [icon: globe, label: "www.yamang02.com"]
admin     [icon: globe, label: "admin.yamang02.com"]
portfolio [icon: globe, label: "portfolio.yamang02.com"]

// ─── AWS ───────────────────────────────────────────
AWS [icon: aws, color: orange] {
  Route53 [icon: aws-route-53, label: "Route 53"]

  CF_www  [icon: aws-cloudfront, label: "CloudFront\n(www)"]
  S3_www  [icon: aws-s3,        label: "S3 · Profile Site"]

  CF_app  [icon: aws-cloudfront, label: "CloudFront\n(admin + portfolio)"]
  CF_fn   [icon: aws-lambda,     label: "CloudFront Function\nadmin.* → /admin.html"]
  S3_app  [icon: aws-s3,         label: "S3 · App Bundle"]

  AdminSPA     [icon: react, label: "Admin SPA\n(admin.html)"]
  PortfolioSPA [icon: react, label: "Portfolio SPA\n(index.html)"]
}

// ─── GCP ───────────────────────────────────────────
GCP [icon: gcp, color: blue] {
  CloudRun [icon: gcp-cloud-run, label: "Cloud Run\n(Spring Boot)"]
  CloudSQL [icon: gcp-cloud-sql, label: "Cloud SQL\nPostgreSQL 15"]
}

// ─── EXTERNAL ──────────────────────────────────────
External [color: gray] {
  Redis      [icon: redis,  label: "Redis Cache"]
  Cloudinary [icon: cloud,  label: "Cloudinary"]
  Gemini     [icon: google, label: "Gemini AI"]
}

// ─── CONNECTIONS ───────────────────────────────────

www       -> Route53
admin     -> Route53
portfolio -> Route53

Route53 -> CF_www: "www"
Route53 -> CF_app: "admin / portfolio"

CF_www -> S3_www: "OAC"

CF_app -> CF_fn
CF_fn  -> S3_app: "OAC"

S3_app -> AdminSPA:     "admin.html"
S3_app -> PortfolioSPA: "index.html"

AdminSPA     -> CloudRun: "REST API"
PortfolioSPA -> CloudRun: "REST API"

CloudRun -> CloudSQL
CloudRun -> Redis
CloudRun -> Cloudinary
CloudRun -> Gemini
```

## 구성 요약

| 도메인 | CDN | Origin | 비고 |
|--------|-----|--------|------|
| `www.yamang02.com` | CloudFront | S3 · Profile Site | 정적 사이트 |
| `admin.yamang02.com` | CloudFront | S3 · App Bundle → `admin.html` | CF Function으로 URI 재작성 |
| `portfolio.yamang02.com` | CloudFront | S3 · App Bundle → `index.html` | admin과 동일 배포본 공유 |

| 레이어 | 서비스 | 비고 |
|--------|--------|------|
| **AWS** | Route53, CloudFront ×2, S3 ×2, CloudFront Function | 정적 호스팅 |
| **GCP** | Cloud Run (Spring Boot 3.2), Cloud SQL PostgreSQL 15 | API + DB |
| **External** | Redis, Cloudinary, Gemini AI | 관리형 외부 서비스 |
