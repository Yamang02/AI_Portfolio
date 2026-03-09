# SEO/AEO 최적화 — 사용자가 할 일

구현은 완료되었습니다. 아래 작업만 **직접** 진행해 주세요.

---

## 1. OG 기본 이미지 (필수)

- **작업**: `frontend/public/images/og-default.png` 이미지 추가
- **규격**: 1200×630px (Open Graph 권장)
- **내용**: 사이트명/브랜드 또는 대표 비주얼
- **참고**: 설계서의 "옵션 A: 정적 이미지" — Figma 등으로 제작 후 해당 경로에 저장

---

## 2. GitHub / 배포 설정

- **Variables**:  
  - `VITE_SITE_URL`: 프로덕션 도메인 (예: `https://www.yamang02.com`)  
  - (이미 있다면) Staging용 `VITE_SITE_URL` (Staging 도메인)
- **Secrets**:  
  - `VITE_GA_MEASUREMENT_ID`: GA4 Measurement ID (예: `G-XXXXXXXXXX`)  
  - GA4 사용하지 않으면 비워 두어도 됨 (analytics는 ID가 있을 때만 동작)

---

## 3. Google Analytics 4 (선택)

- GA4 속성 생성 후 Measurement ID 발급
- 위 `VITE_GA_MEASUREMENT_ID`에 설정
- 프로덕션 빌드 시 해당 ID가 주입되며, `analytics.ts` / `web-vitals.ts`가 자동 연동됨

---

## 4. Google Search Console (선택)

- Search Console에 사이트 등록 및 소유권 확인
- `https://www.yamang02.com/sitemap.xml` 제출
- 필요 시 URL 검사로 색인 요청

---

## 5. 배포 후 검증 (권장)

- [Google Rich Results Test](https://search.google.com/test/rich-results) — JSON-LD 검증
- [Open Graph Debugger](https://developers.facebook.com/tools/debug/) — OG 태그 확인
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) — 트위터 카드 확인
- `/robots.txt`, `/sitemap.xml`, `/llms.txt` 200 응답 및 내용 확인
- Lighthouse SEO 탭 점수 확인

---

## 구현된 항목 요약

| 항목 | 상태 |
|------|------|
| robots.txt | ✅ 빌드 시 플러그인 생성 (Sitemap URL 포함) |
| sitemap.xml | ✅ vite-plugin-sitemap + 빌드 전 동적 라우트 수집 |
| react-helmet-async + SeoHead | ✅ 모든 페이지 및 Admin(noindex) 적용 |
| seo.config.ts, pageMetaDefaults | ✅ |
| JSON-LD (Person, Organization, WebSite, SoftwareApplication, BlogPosting, BreadcrumbList) | ✅ 해당 페이지 적용 |
| ArticleDetailResponse (summary, updatedAt) | ✅ 백엔드·프론트 타입 반영 |
| llms.txt | ✅ public 배치, index.html 링크 추가 |
| analytics.ts, web-vitals.ts | ✅ GA4·Web Vitals 연동 (ID 있을 때만) |
| GitHub Actions (frontend-production-aws, frontend-staging-aws) | ✅ sitemap 생성, SEO 파일 캐시, VITE_SITE_URL·VITE_GA_MEASUREMENT_ID 전달 |

OG 이미지만 추가하시면 SEO/AEO 기반 구성은 모두 반영된 상태입니다.
