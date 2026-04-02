# SEO/AEO 최적화 - 작업 체크리스트

**에픽**: [SEO/AEO 최적화](./README.md)
**작성일**: 2026-03-09

---

## Phase 1: SEO 기반 인프라 (Week 1)

### 1-1. robots.txt
- [ ] `frontend/public/robots.txt` 파일 생성
- [ ] Sitemap URL을 `VITE_SITE_URL` 기반으로 빌드 시 치환하거나, 프로덕션 도메인 확정 후 수동 업데이트

### 1-2. sitemap.xml
- [ ] `vite-plugin-sitemap` 패키지 설치
- [ ] **빌드 전 스크립트** `scripts/generate-sitemap-routes.mjs` 작성 (API 호출로 동적 URL 수집 → `sitemap-routes.json` 저장)
  - [ ] 프로젝트: `GET /api/data/projects` → `data[].id` → `/projects/{id}`
  - [ ] 아티클: `GET /api/data/article-ids` 사용 권장 (백엔드에 경량 전용 API 추가). 없으면 `GET /api/articles?page=0&size=2000` → `data.content[].businessId` 로 수집
- [ ] `vite.config.ts`에서 위 JSON을 동기 로드해 `dynamicRoutes`로 전달
- [ ] 정적 URL 목록 정의 (/, /profile, /projects, /articles)
- [ ] `lastmod`, `changefreq`, `priority` 설정
- [ ] 빌드 후 sitemap.xml 정상 생성 확인

### 1-3. react-helmet-async 도입
- [ ] `npm install react-helmet-async` 설치
- [ ] `src/main.tsx`에 `HelmetProvider` 추가
- [ ] `src/shared/config/seo.config.ts` 생성
- [ ] `src/shared/ui/seo/SeoHead.tsx` 컴포넌트 구현
- [ ] `index.html` 수정
  - [ ] `<html lang="ko">` 로 변경 (한글 포트폴리오)
  - [ ] 기본 메타 태그 추가: `<meta name="description">`, `<meta name="author" content="YamangSolution">`, `<meta name="robots" content="index, follow">`, `<meta property="og:site_name">`, `<meta property="og:locale" content="ko_KR">`, `<meta name="twitter:card" content="summary_large_image">`
- [ ] OG 기본 이미지: `frontend/public/images/og-default.png` (1200×630) 생성 또는 배치

### 1-4. 페이지별 메타 태그
- [ ] `HomePage` - `SeoHead` 적용
- [ ] `ProfilePage` - `SeoHead` 적용
- [ ] `ProjectsListPage` - `SeoHead` 적용
- [ ] `ProjectDetailPage` - 동적 `SeoHead` (API 데이터 기반)
- [ ] `ArticleListPage` - `SeoHead` 적용
- [ ] `ArticleDetailPage` - 동적 `SeoHead` (API 데이터 기반)
- [ ] `ChatPage` - `SeoHead` 적용
- [ ] **Admin** (`/admin/*`): Admin 레이아웃 또는 AdminApp 루트에서 `SeoHead`에 `noindex={true}` 적용
- [ ] (선택) 404 페이지에 `SeoHead` + `noindex` 적용

---

## Phase 2: 구조화 데이터 (JSON-LD) (Week 2)

### 2-1. Person Schema
- [ ] `ProfilePage`에 Person schema 추가
- [ ] sameAs 배열에 GitHub, LinkedIn 등 SNS URL 추가
- [ ] knowsAbout 기술 목록 작성

### 2-2. Organization + WebSite Schema
- [ ] `HomePage`에 Organization schema 추가
- [ ] `HomePage`에 WebSite schema 추가 (SearchAction 포함)

### 2-3. SoftwareApplication Schema
- [ ] `ProjectDetailPage`에 SoftwareApplication schema 추가
- [ ] 백엔드 `ProjectDataResponse`에 `updatedAt` 필드 확인/추가

### 2-4. BlogPosting Schema
- [ ] `ArticleDetailPage`에 BlogPosting schema 추가
- [ ] **백엔드** Public `ArticleDetailResponse`에 필드 추가
  - [ ] `summary` (String) 추가
  - [ ] `updatedAt` (ISO 8601 문자열 또는 LocalDateTime 직렬화) 추가
  - [ ] `publishedAt` 는 이미 있음. `thumbnailUrl` 은 선택(없으면 프론트에서 defaultOgImage 사용)

### 2-5. BreadcrumbList Schema
- [ ] `ProjectDetailPage`에 BreadcrumbList schema 추가
- [ ] `ArticleDetailPage`에 BreadcrumbList schema 추가

---

## Phase 3: AEO 최적화 (Week 3)

### 3-1. llms.txt
- [ ] `frontend/public/llms.txt` 생성
- [ ] `frontend/public/llms-full.txt` 생성 (선택)
- [ ] `index.html`에 llms.txt 링크 추가: `<link rel="alternate" type="text/plain" href="/llms.txt" />` (llmstxt.org 권장)

### 3-2. FAQ Schema
- [ ] 실제 FAQ 콘텐츠 작성 (최소 5개 질문)
- [ ] `HomePage` 또는 `ChatPage`에 FAQPage schema 추가
- [ ] FAQ UI 섹션 컴포넌트 생성 (시각적 표시)

### 3-3. HowTo Schema (선택)
- [ ] 아티클 타입 필드 확인 (tutorial vs article)
- [ ] 튜토리얼 아티클에 HowTo schema 자동 생성 로직 추가

### 3-4. 시맨틱 마크업 개선
- [ ] 주요 페이지 시맨틱 감사(audit) 수행
- [ ] `ProjectDetailPage` - `<article>`, `<section>` 구조 개선
- [ ] `ArticleDetailPage` - `<article>` 태그 래핑 확인
- [ ] `<time datetime="">` 날짜 마크업 적용

---

## Phase 4: 분석 및 모니터링 (Week 3)

### 4-1. Google Analytics 4
- [ ] GA4 속성 생성 (Google Analytics 콘솔)
- [ ] Measurement ID 발급
- [ ] `VITE_GA_MEASUREMENT_ID` GitHub Secrets에 추가
- [ ] GA4 초기화 코드 추가 (index.html 또는 App.tsx)
- [ ] 프로덕션 환경에서만 활성화 처리
- [ ] `src/shared/lib/analytics.ts` - 커스텀 이벤트 훅 생성
  - [ ] 챗봇 대화 시작 이벤트
  - [ ] 프로젝트 상세 방문 이벤트
  - [ ] 외부 링크 클릭 이벤트
- [ ] (추후 검토) 쿠키/개인정보 동의 배너 필요 시 GA 로드 시점 조정

### 4-2. Google Search Console
- [ ] Search Console에 사이트 등록
- [ ] 소유권 확인 완료
- [ ] sitemap.xml 제출
- [ ] 초기 색인 생성 요청

### 4-3. Web Vitals
- [ ] `npm install web-vitals` 설치
- [ ] `src/shared/lib/web-vitals.ts` 생성
- [ ] GA4 이벤트로 Web Vitals 데이터 전송 연동

---

## Phase 5: 배포 파이프라인 통합 (Week 4)

### 5-1. GitHub Actions 업데이트
- [ ] `frontend-production-aws.yml` - Build 단계 전에 `npm run generate:sitemap-routes` 실행, Build 시 `VITE_SITE_URL`, `VITE_API_BASE_URL`, `VITE_GA_MEASUREMENT_ID` env 전달 (sitemap은 빌드 시 플러그인으로 생성)
- [ ] `frontend-production-aws.yml` - S3 업로드 후 SEO 파일(robots.txt, sitemap.xml, llms.txt) 개별 캐시 설정
- [ ] `frontend-staging-aws.yml` - 동일 방식 적용
- [ ] GA Measurement ID Secrets 추가

### 5-2. AWS CloudFront 보안 헤더
- [ ] **CloudFront Response Headers Policy**로 보안 헤더 추가 (배포는 S3+CloudFront이므로 .htaccess 미적용)
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: SAMEORIGIN
  - [ ] X-XSS-Protection, Referrer-Policy, Permissions-Policy 등
- [ ] Gzip 압축(CloudFront 컴프레션 설정), HTTPS 강제 리다이렉트 확인

### 5-3. GCP Cloud Run 헤더
- [ ] 백엔드 API 응답에 `X-Robots-Tag: noindex` 추가
- [ ] (선택) sitemap 빌드용 경량 API: `GET /api/data/article-ids` → `{ "data": [ { "businessId": "..." }, ... ] }` 응답

---

## 최종 검증

### 도구별 검증
- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results) - 구조화 데이터 검증
- [ ] [Open Graph Debugger](https://developers.facebook.com/tools/debug/) - OG 태그 검증
- [ ] [Twitter Card Validator](https://cards-dev.twitter.com/validator) - Twitter Card 검증
- [ ] [Schema Markup Validator](https://validator.schema.org/) - JSON-LD 오류 확인
- [ ] Lighthouse SEO 탭 - 점수 90점 이상 확인
- [ ] `/robots.txt` 200 응답 확인
- [ ] `/sitemap.xml` 200 응답 확인
- [ ] `/llms.txt` 200 응답 확인

### Google Search Console
- [ ] 색인 오류 없음 확인
- [ ] 모바일 사용성 문제 없음 확인
- [ ] Core Web Vitals 통과 확인

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2026-03-09
