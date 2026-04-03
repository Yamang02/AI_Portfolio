# 에픽: SEO / AEO 최적화

**작성일**: 2026-03-09
**상태**: 📋 Backlog
**우선순위**: High
**예상 기간**: 3-4주
**브랜치명**: `seo-aeo-optimization`

---

## 🔄 변경 이력

| 날짜 | 변경 내용 |
|------|-----------|
| 2026-03-09 | 에픽 초안 작성 |

---

## 개요

포트폴리오 사이트의 검색 엔진 노출도(SEO)와 AI 답변 엔진 노출도(AEO)를 개선합니다.
현재 사이트는 메타 태그, 구조화 데이터, robots.txt, sitemap.xml이 **전혀 없는 상태**입니다.
Google, Bing 등의 전통적인 검색 엔진뿐만 아니라 ChatGPT, Perplexity, Google SGE 등의 AI 기반 답변 엔진에도 효과적으로 노출될 수 있도록 최적화합니다.

### 현황 진단

| 항목 | 현재 상태 | 목표 |
|------|----------|------|
| `<title>` | `Yamang02` (단순) | 페이지별 동적 타이틀 |
| `<meta description>` | ❌ 없음 | 페이지별 150자 설명 |
| Open Graph 태그 | ❌ 없음 | 페이지별 OG 태그 |
| Twitter Card 태그 | ❌ 없음 | summary_large_image |
| `robots.txt` | ❌ 없음 | 크롤러 허용/차단 규칙 |
| `sitemap.xml` | ❌ 없음 | 정적 + 동적 sitemap |
| JSON-LD 구조화 데이터 | ❌ 없음 | 5가지 schema 타입 |
| Canonical URL | ❌ 없음 | 페이지별 canonical |
| `llms.txt` | ❌ 없음 | AI 크롤러 지침 |
| Google Analytics | ❌ 없음 | GA4 연동 |

---

## 목표

### 1. SEO 기반 인프라 구축 (Phase 1-2)
- 메타 태그 관리 시스템 구축 (react-helmet-async)
- robots.txt 및 sitemap.xml 생성
- 페이지별 동적 메타 태그 적용
- 구조화 데이터(JSON-LD) 5가지 schema 구현

### 2. AEO 최적화 (Phase 3)
- `llms.txt` 파일 생성 (AI 크롤러 지침)
- FAQ / HowTo schema 추가
- AI 답변 엔진을 위한 콘텐츠 구조화
- 마크업 시맨틱 개선

### 3. 분석 및 모니터링 (Phase 4)
- Google Analytics 4 연동
- Google Search Console 등록
- Core Web Vitals 측정 및 모니터링

### 4. 배포 파이프라인 통합 (Phase 5)
- GitHub Actions에 sitemap 자동 생성 스텝 추가
- AWS CloudFront 보안 헤더 및 캐시 설정 최적화
- GCP Cloud Run 응답 헤더 최적화

---

## 비즈니스 가치

- **검색 노출 증가**: Google에서 이름/기술 스택 검색 시 포트폴리오 상위 노출
- **AI 답변 엔진 노출**: ChatGPT, Perplexity 등에서 개발자 정보 검색 시 참조
- **SNS 공유 효과**: LinkedIn, Twitter 공유 시 OG 이미지·설명 자동 표시
- **면접관 신뢰도**: 검색 결과에서 구조화된 정보 제공으로 전문성 강조
- **콘텐츠 발견성**: 블로그 아티클·프로젝트가 검색 결과에 노출

---

## 포함된 작업

### Phase 1: SEO 기반 인프라 (Week 1)

#### 1-1. `robots.txt` 생성
**파일**: `frontend/public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /admin/

# AI 크롤러 허용
User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

Sitemap: https://www.yamang02.com/sitemap.xml
```

**작업**:
- [ ] `frontend/public/robots.txt` 생성
- [ ] 프로덕션 도메인 확정 후 Sitemap URL 업데이트

---

#### 1-2. `sitemap.xml` 생성 (정적 + 동적)
**방식**: `vite-plugin-sitemap` 또는 빌드 후 스크립트

**정적 URL** (빌드 시 고정):
- `/` (홈)
- `/profile`
- `/projects`
- `/articles`

**동적 URL** (API 기반 빌드 타임 생성):
- `/projects/:id` (각 프로젝트)
- `/articles/:businessId` (각 아티클)

**작업**:
- [ ] `package.json`에 `vite-plugin-sitemap` 추가
- [ ] `vite.config.ts`에 sitemap 플러그인 설정
- [ ] 빌드 타임 API 호출로 동적 URL 목록 가져오기
- [ ] `lastmod`, `changefreq`, `priority` 설정

**우선순위 설정**:
```xml
<url><loc>.../</loc><priority>1.0</priority><changefreq>weekly</changefreq></url>
<url><loc>.../projects</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>
<url><loc>.../articles</loc><priority>0.9</priority><changefreq>daily</changefreq></url>
<url><loc>.../projects/:id</loc><priority>0.8</priority><changefreq>monthly</changefreq></url>
<url><loc>.../articles/:id</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>
<url><loc>.../profile</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>
```

---

#### 1-3. `react-helmet-async` 도입 및 메타 태그 시스템 구축

**설치**:
```bash
npm install react-helmet-async
```

**SEO 설정 파일**: `frontend/src/shared/config/seo.config.ts`
```typescript
export const seoConfig = {
  siteName: 'YamangSolution',
  siteUrl: 'https://www.yamang02.com',
  defaultTitle: 'YamangSolution | AI 풀스택 개발자 포트폴리오',
  defaultDescription: 'AI와 함께 꿈을 실현하는 풀스택 개발자 YamangSolution의 포트폴리오. Spring Boot, React, AI 서비스 개발 프로젝트와 기술 아티클을 확인하세요.',
  defaultOgImage: 'https://www.yamang02.com/images/og-default.png',
  twitterHandle: '@yamang02',
  locale: 'ko_KR',
};
```

**공용 SEO 컴포넌트**: `frontend/src/shared/ui/seo/SeoHead.tsx`
```typescript
interface SeoHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  canonicalPath?: string;  // 예: '/projects/my-project'
  noindex?: boolean;
  jsonLd?: object | object[];
}
```

**작업**:
- [ ] `react-helmet-async` 설치 및 `App.tsx`에 `HelmetProvider` 추가
- [ ] `seo.config.ts` 생성
- [ ] `SeoHead` 컴포넌트 구현
- [ ] `index.html` 기본 메타 태그 추가:
  - `<meta name="description">`
  - `<meta name="author" content="YamangSolution">`
  - `<meta name="robots" content="index, follow">`
  - Open Graph 태그 (og:type, og:site_name, og:locale)
  - Twitter Card 태그

---

#### 1-4. 페이지별 동적 메타 태그 적용

각 페이지에 `SeoHead` 컴포넌트 적용:

| 페이지 | title | description | og:type |
|--------|-------|-------------|---------|
| HomePage | `YamangSolution \| AI 풀스택 개발자` | 포트폴리오 소개 | `website` |
| ProfilePage | `프로필 \| YamangSolution` | 경력·기술 스택 소개 | `profile` |
| ProjectsListPage | `프로젝트 \| YamangSolution` | 프로젝트 목록 | `website` |
| ProjectDetailPage | `{title} \| YamangSolution` | 프로젝트 설명 | `website` |
| ArticleListPage | `기술 아티클 \| YamangSolution` | 블로그/아티클 목록 | `website` |
| ArticleDetailPage | `{title} \| YamangSolution` | 아티클 내용 요약 | `article` |
| ChatPage | `AI 챗봇 \| YamangSolution` | 챗봇 소개 | `website` |

**작업**:
- [ ] `HomePage`에 `SeoHead` 적용
- [ ] `ProfilePage`에 `SeoHead` 적용
- [ ] `ProjectsListPage`에 `SeoHead` 적용
- [ ] `ProjectDetailPage`에 동적 `SeoHead` 적용 (API 응답 데이터 활용)
- [ ] `ArticleListPage`에 `SeoHead` 적용
- [ ] `ArticleDetailPage`에 동적 `SeoHead` 적용 (API 응답 데이터 활용)
- [ ] `ChatPage`에 `SeoHead` 적용

---

### Phase 2: 구조화 데이터 (JSON-LD) (Week 2)

구조화 데이터는 Google 리치 결과(Rich Results)와 AI 답변 엔진에 구조화된 정보를 제공합니다.
`SeoHead`의 `jsonLd` prop을 통해 `<script type="application/ld+json">` 태그로 삽입합니다.

#### 2-1. Person Schema (프로필 페이지)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "YamangSolution",
  "url": "https://www.yamang02.com",
  "image": "https://www.yamang02.com/images/profile.jpg",
  "jobTitle": "AI 풀스택 개발자",
  "description": "AI와 함께 꿈을 실현하는 풀스택 개발자",
  "email": "ljj0210@gmail.com",
  "sameAs": [
    "https://github.com/Yamang02",
    "https://www.linkedin.com/in/yamang02"
  ],
  "knowsAbout": ["Spring Boot", "React", "TypeScript", "AI/ML", "PostgreSQL"]
}
```

**작업**:
- [ ] `ProfilePage`에 Person schema JSON-LD 추가

---

#### 2-2. Organization + WebSite Schema (홈 페이지)

```json
[
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "YamangSolution",
    "url": "https://www.yamang02.com",
    "logo": "https://www.yamang02.com/favicons/favicon-96x96.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "ljj0210@gmail.com",
      "contactType": "technical support"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "YamangSolution Portfolio",
    "url": "https://www.yamang02.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.yamang02.com/projects?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }
]
```

**작업**:
- [ ] `HomePage`에 Organization + WebSite schema 추가

---

#### 2-3. SoftwareApplication Schema (프로젝트 상세 페이지)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{project.title}",
  "description": "{project.description}",
  "author": {
    "@type": "Person",
    "name": "YamangSolution"
  },
  "applicationCategory": "WebApplication",
  "operatingSystem": "Web",
  "url": "https://www.yamang02.com/projects/{project.id}",
  "dateModified": "{project.updatedAt}"
}
```

**작업**:
- [ ] `ProjectDetailPage`에 SoftwareApplication schema 동적 생성 추가
- [ ] 백엔드 `ProjectDataResponse`에 `updatedAt` 필드 확인

---

#### 2-4. BlogPosting Schema (아티클 상세 페이지)

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{article.title}",
  "description": "{article.summary}",
  "image": "{article.thumbnailUrl}",
  "author": {
    "@type": "Person",
    "name": "YamangSolution",
    "url": "https://www.yamang02.com/profile"
  },
  "publisher": {
    "@type": "Organization",
    "name": "YamangSolution",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.yamang02.com/favicons/favicon-96x96.png"
    }
  },
  "datePublished": "{article.publishedAt}",
  "dateModified": "{article.updatedAt}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.yamang02.com/articles/{article.businessId}"
  }
}
```

**작업**:
- [ ] `ArticleDetailPage`에 BlogPosting schema 동적 생성 추가
- [ ] 백엔드 아티클 API 응답에 `publishedAt`, `updatedAt`, `summary` 필드 확인
- [ ] 없는 필드는 백엔드 `ArticleResponse` DTO에 추가

---

#### 2-5. BreadcrumbList Schema (프로젝트·아티클 상세 페이지)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "홈",
      "item": "https://www.yamang02.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "프로젝트",
      "item": "https://www.yamang02.com/projects"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{project.title}",
      "item": "https://www.yamang02.com/projects/{project.id}"
    }
  ]
}
```

**작업**:
- [ ] `ProjectDetailPage`에 BreadcrumbList schema 추가
- [ ] `ArticleDetailPage`에 BreadcrumbList schema 추가

---

### Phase 3: AEO (Answer Engine Optimization) (Week 3)

AEO는 ChatGPT, Perplexity, Google SGE, Claude 등의 AI 답변 엔진이 콘텐츠를 이해하고 인용할 수 있도록 최적화합니다.

#### 3-1. `llms.txt` 생성

AI LLM 크롤러를 위한 콘텐츠 가이드 파일. `robots.txt`의 AI 버전입니다.

**파일**: `frontend/public/llms.txt`

```markdown
# YamangSolution Portfolio

> YamangSolution은 AI와 함께 꿈을 실현하는 풀스택 개발자입니다.
> Spring Boot, React, TypeScript, PostgreSQL, AI/ML 기술을 활용하여
> 실제 비즈니스 문제를 해결하는 AI 기반 웹 서비스를 개발합니다.

## 개발자 정보
- 이름: YamangSolution
- 이메일: ljj0210@gmail.com
- GitHub: https://github.com/Yamang02
- 주요 기술: Java/Spring Boot, TypeScript/React, AI/LLM Integration

## 주요 프로젝트
[프로젝트 목록은 API에서 동적으로 제공됩니다]
- 전체 목록: https://www.yamang02.com/projects

## 기술 아티클
[아티클 목록은 API에서 동적으로 제공됩니다]
- 전체 목록: https://www.yamang02.com/articles

## 콘텐츠 정책
- 이 사이트의 콘텐츠는 AI 학습 및 참조 목적으로 사용할 수 있습니다.
- 출처 표기를 권장합니다: YamangSolution (https://www.yamang02.com)
```

**작업**:
- [ ] `frontend/public/llms.txt` 생성
- [ ] `frontend/public/llms-full.txt` 생성 (전체 상세 콘텐츠 버전)
- [ ] `index.html`에 `<link rel="alternate" type="text/plain" href="/llms.txt">` 추가

---

#### 3-2. FAQ Schema (홈 페이지 / 챗봇 페이지)

AI 답변 엔진이 자주 묻는 질문을 직접 인용할 수 있도록 FAQ schema 추가

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "YamangSolution은 어떤 개발자인가요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI와 함께 꿈을 실현하는 풀스택 개발자로, Spring Boot와 React를 기반으로 AI 통합 웹 서비스를 개발합니다."
      }
    },
    {
      "@type": "Question",
      "name": "어떤 기술 스택을 사용하나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "백엔드: Java/Spring Boot, PostgreSQL, GCP Cloud Run. 프론트엔드: TypeScript/React, Vite, AWS S3/CloudFront. AI: Claude API, OpenAI API 연동."
      }
    },
    {
      "@type": "Question",
      "name": "포트폴리오 AI 챗봇은 어떻게 작동하나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Claude API를 활용하여 개발자의 프로젝트, 경험, 기술 스택에 대해 자연어로 질문하고 답변받을 수 있는 AI 챗봇입니다."
      }
    }
  ]
}
```

**작업**:
- [ ] FAQ 콘텐츠 정의 (실제 챗봇 FAQ 기반으로)
- [ ] `HomePage` 또는 `ChatPage`에 FAQPage schema 추가
- [ ] FAQ 섹션 UI 컴포넌트 추가 (시각적으로도 표시)

---

#### 3-3. HowTo Schema (기술 아티클)

튜토리얼성 아티클에 HowTo schema 적용 (AI 답변 엔진이 단계별 가이드로 인용)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "{article.title}",
  "description": "{article.summary}",
  "step": [
    {
      "@type": "HowToStep",
      "name": "단계 1",
      "text": "..."
    }
  ]
}
```

**작업**:
- [ ] 아티클에 `type: 'tutorial' | 'article'` 필드 추가 (백엔드)
- [ ] 튜토리얼 타입 아티클에 HowTo schema 자동 생성

---

#### 3-4. 시맨틱 마크업 개선

AI 크롤러가 콘텐츠 구조를 파악할 수 있도록 HTML 시맨틱 개선:
- `<main>`, `<article>`, `<section>`, `<aside>`, `<nav>` 적절히 사용
- `<h1>` ~ `<h6>` 헤딩 계층 구조 검토
- `<time datetime="">` 날짜 마크업
- `aria-label`, `aria-describedby` 접근성 속성

**작업**:
- [ ] 주요 페이지 시맨틱 마크업 감사(audit)
- [ ] `ProjectDetailPage` 시맨틱 개선
- [ ] `ArticleDetailPage` 시맨틱 개선 (article 태그 래핑)

---

### Phase 4: 분석 및 모니터링 (Week 3)

#### 4-1. Google Analytics 4 연동

**방식**: `gtag.js` 직접 삽입 (번들 크기 최소화)

**파일**: `index.html` `<head>` 내 추가

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', { 'anonymize_ip': true });
</script>
```

**커스텀 이벤트 트래킹**:
- 챗봇 대화 시작/종료
- 프로젝트 상세 페이지 방문
- 아티클 읽기 완료 (스크롤 깊이 90%)
- GitHub/외부 링크 클릭
- 이력서 다운로드 (있을 경우)

**작업**:
- [ ] GA4 속성 생성 (Google Analytics 콘솔)
- [ ] `VITE_GA_MEASUREMENT_ID` 환경 변수 추가
- [ ] `index.html` 또는 `App.tsx`에 GA4 초기화 코드 추가
- [ ] 커스텀 이벤트 훅 `useAnalytics.ts` 생성
- [ ] 프로덕션 배포 시에만 GA 활성화 (개발 환경 제외)

---

#### 4-2. Google Search Console 등록

**작업**:
- [ ] Google Search Console에 사이트 등록
- [ ] 도메인 소유권 확인 (TXT 레코드 또는 HTML 파일)
- [ ] sitemap.xml 제출
- [ ] 색인 생성 요청 (주요 페이지)

---

#### 4-3. 성능 모니터링 스크립트 추가

Core Web Vitals를 실제 사용자 데이터로 측정:

```typescript
// src/shared/lib/web-vitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

export const reportWebVitals = (onPerfEntry?: Function) => {
  if (onPerfEntry) {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onLCP(onPerfEntry);
    onFCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};
```

**작업**:
- [ ] `web-vitals` 패키지 설치
- [ ] Web Vitals 측정 및 GA4 전송 연동
- [ ] 목표 지표 설정: LCP < 2.5s, CLS < 0.1, INP < 200ms

---

### Phase 5: 배포 파이프라인 통합 (Week 4)

#### 5-1. GitHub Actions - 프론트엔드 (AWS)

**현재 워크플로우**: `frontend-production-aws.yml`
- S3 sync → CloudFront invalidation

**추가 스텝**:

```yaml
# sitemap 생성 (빌드 전)
- name: Generate sitemap
  run: npm run generate:sitemap
  env:
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}

# robots.txt, llms.txt 업로드 (캐시 없음)
- name: Upload SEO files
  run: |
    aws s3 cp dist/robots.txt s3://${{ secrets.S3_BUCKET }}/robots.txt \
      --cache-control "public, max-age=86400"
    aws s3 cp dist/sitemap.xml s3://${{ secrets.S3_BUCKET }}/sitemap.xml \
      --cache-control "public, max-age=3600"
    aws s3 cp dist/llms.txt s3://${{ secrets.S3_BUCKET }}/llms.txt \
      --cache-control "public, max-age=86400"
```

**작업**:
- [ ] `frontend-production-aws.yml`에 sitemap 생성 스텝 추가
- [ ] SEO 파일 개별 캐시 설정 추가 (robots.txt, sitemap.xml 단기 캐시)
- [ ] `frontend-staging-aws.yml` 동일하게 업데이트

---

#### 5-2. AWS CloudFront 보안 헤더 설정

CloudFront Response Headers Policy 또는 `.htaccess`에 보안 헤더 추가:

```apache
# Security Headers (SEO에도 긍정적 영향)
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"

# Canonical URL 헤더 (중복 URL 방지)
# CloudFront Function 또는 Lambda@Edge로 구현 권장
```

**Gzip 압축** (sitemap.xml 용량 최소화):
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE text/plain
</IfModule>
```

**작업**:
- [ ] `frontend/public/.htaccess`에 보안 헤더 추가
- [ ] `frontend/public/.htaccess`에 Gzip 압축 설정 추가
- [ ] HTTPS 강제 리다이렉트 활성화 (현재 주석 처리됨)

---

#### 5-3. GCP Cloud Run - 백엔드 응답 헤더

백엔드 API 응답에 SEO 관련 헤더 추가:

```java
// Spring Boot - CorsConfig 또는 Filter
response.setHeader("X-Robots-Tag", "noindex");  // API는 검색 색인 제외
response.setHeader("Cache-Control", "public, max-age=300");  // 5분 캐시
```

**선택사항 - 백엔드 sitemap 엔드포인트**:
```
GET /api/sitemap/projects  → 프로젝트 ID 목록 (빌드 타임 sitemap 생성용)
GET /api/sitemap/articles  → 아티클 businessId 목록
```

**작업**:
- [ ] Spring Boot API 응답에 `X-Robots-Tag: noindex` 헤더 추가
- [ ] sitemap 생성을 위한 경량 엔드포인트 추가 (선택)

---

## 완료 기준

### 필수 조건

- [ ] 모든 페이지에 적절한 `<title>`, `<meta description>` 존재
- [ ] 모든 페이지에 Open Graph 태그 존재 (og:title, og:description, og:image)
- [ ] `robots.txt` 접근 가능 (`/robots.txt`)
- [ ] `sitemap.xml` 접근 가능 (`/sitemap.xml`)
- [ ] `llms.txt` 접근 가능 (`/llms.txt`)
- [ ] 홈 페이지에 Organization + WebSite JSON-LD 존재
- [ ] 프로필 페이지에 Person JSON-LD 존재
- [ ] 프로젝트 상세에 SoftwareApplication + BreadcrumbList JSON-LD 존재
- [ ] 아티클 상세에 BlogPosting + BreadcrumbList JSON-LD 존재
- [ ] Google Search Console에 sitemap.xml 제출 완료
- [ ] Lighthouse SEO 점수 **90점 이상**

### 검증 항목

- [ ] [Google Rich Results Test](https://search.google.com/test/rich-results) 통과
- [ ] [Open Graph Debugger](https://developers.facebook.com/tools/debug/) 정상
- [ ] [Twitter Card Validator](https://cards-dev.twitter.com/validator) 정상
- [ ] [Schema Markup Validator](https://validator.schema.org/) 오류 없음
- [ ] Lighthouse SEO 90점 이상
- [ ] Google Search Console 색인 오류 없음
- [ ] AI 크롤러 접근 확인 (`/llms.txt` 200 응답)

---

## 우선순위 및 순서

### Week 1: SEO 기반 인프라 ⭐ 최우선
- [ ] Phase 1-1: `robots.txt` 생성 *(30분)*
- [ ] Phase 1-3: `react-helmet-async` 도입 및 `SeoHead` 컴포넌트 *(4시간)*
- [ ] Phase 1-4: 페이지별 동적 메타 태그 적용 *(3시간)*
- [ ] Phase 1-2: `sitemap.xml` 생성 (정적 우선) *(2시간)*

### Week 2: 구조화 데이터 (JSON-LD) ⭐ 높음
- [ ] Phase 2-1: Person schema (프로필) *(1시간)*
- [ ] Phase 2-2: Organization + WebSite schema (홈) *(1시간)*
- [ ] Phase 2-3: SoftwareApplication schema (프로젝트 상세) *(2시간)*
- [ ] Phase 2-4: BlogPosting schema (아티클 상세) *(2시간)*
- [ ] Phase 2-5: BreadcrumbList schema *(1시간)*

### Week 3: AEO + 분석 ⭐ 보통
- [ ] Phase 3-1: `llms.txt` 생성 *(1시간)*
- [ ] Phase 3-2: FAQ schema *(2시간)*
- [ ] Phase 3-4: 시맨틱 마크업 개선 *(3시간)*
- [ ] Phase 4-1: Google Analytics 4 연동 *(2시간)*
- [ ] Phase 4-2: Google Search Console 등록 *(1시간)*

### Week 4: 배포 파이프라인 통합 ⭐ 보통
- [ ] Phase 5-1: GitHub Actions 업데이트 *(2시간)*
- [ ] Phase 5-2: .htaccess 보안 헤더 추가 *(1시간)*
- [ ] Phase 5-3: GCP Cloud Run 헤더 최적화 *(1시간)*
- [ ] Phase 4-3: Web Vitals 모니터링 *(1시간)*

---

## 리스크 및 대응 방안

### 리스크 1: React SPA의 구조화 데이터 크롤링 문제
**영향도**: High
**발생 가능성**: Medium

**문제**: React SPA는 JavaScript 실행 후 DOM이 생성되므로, 일부 크롤러가 JSON-LD를 인식하지 못할 수 있음

**대응 방안**:
- `react-helmet-async`는 SSR에서도 동작 (미래 SSR 전환 시 호환)
- Google bot은 JavaScript 실행 가능 → JSON-LD 인식 문제없음
- 취약한 크롤러를 위해 `index.html`에 기본 정적 JSON-LD 추가 고려
- 필요 시 Vite + React Router 기반의 SSG(Static Site Generation) 도입 검토

---

### 리스크 2: sitemap.xml 동적 URL 생성 실패
**영향도**: Medium
**발생 가능성**: Medium

**문제**: 빌드 타임 API 호출 실패 시 동적 URL 누락

**대응 방안**:
- 빌드 스크립트에 API 실패 시 경고만 출력하고 정적 URL만으로 sitemap 생성
- CI/CD 파이프라인에서 API 서버 가용성 확인 스텝 추가
- sitemap 생성 실패 시 빌드 중단이 아닌 경고 처리

---

### 리스크 3: 개인정보 보호 규정 (GA4 동의)
**영향도**: Low
**발생 가능성**: Low

**문제**: GDPR/개인정보보호법에 따라 분석 쿠키 동의 필요

**대응 방안**:
- `anonymize_ip: true` 설정으로 IP 익명화
- 한국 서비스이므로 개인정보보호법 기준 적용
- 쿠키 동의 배너는 MVP에서 제외, 추후 추가 고려

---

## 기술 스택 추가 사항

### 추가 의존성 (프론트엔드)

```json
{
  "react-helmet-async": "^2.0.5",
  "web-vitals": "^4.2.4",
  "vite-plugin-sitemap": "^0.6.1"
}
```

### 환경 변수 추가

```env
# .env.production
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SITE_URL=https://www.yamang02.com
VITE_OG_DEFAULT_IMAGE=https://www.yamang02.com/images/og-default.png
```

---

## 관련 문서

- [SEO 기술 설계서](./design.md) - 상세 기술 구현 설계
- [AEO 전략 문서](./aeo-strategy.md) - AI 답변 엔진 최적화 전략
- [배포 파이프라인 업데이트](./deployment-update.md) - GitHub Actions 변경 사항
- [체크리스트](./checklist.md) - 작업 진행 체크리스트

---

## 측정 지표

### SEO 지표
- **Lighthouse SEO 점수**: 90점 이상
- **Google Search Console 색인 수**: 전체 페이지 100% 색인
- **Core Web Vitals**: LCP < 2.5s, CLS < 0.1, INP < 200ms

### AEO 지표
- **Rich Results 적격성**: 3가지 이상 (BlogPosting, BreadcrumbList, FAQ)
- **AI 크롤러 접근**: `llms.txt` 200 응답 확인
- **구조화 데이터 오류**: Schema Markup Validator 오류 0건

### 비즈니스 지표 (3개월 후)
- **Organic 검색 트래픽**: 측정 기준선 설정
- **SNS 공유 CTR**: OG 태그 적용 전후 비교
- **검색 키워드 순위**: 개발자 이름 + 주요 기술 키워드

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2026-03-09
