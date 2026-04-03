# SEO/AEO 최적화 - 기술 설계서

**에픽**: [SEO/AEO 최적화](./README.md)
**작성일**: 2026-03-09

---

## 1. 아키텍처 개요

### 메타 태그 관리 흐름

```
페이지 컴포넌트
    ↓ props
SeoHead (react-helmet-async)
    ↓ 렌더링
<Helmet> → <head> 내 meta 태그 주입
    ↓ jsonLd prop
<script type="application/ld+json"> 주입
```

### 디렉토리 구조 변경사항

```
frontend/
├── public/
│   ├── robots.txt          ← NEW
│   ├── sitemap.xml         ← NEW (빌드 타임 생성)
│   └── llms.txt            ← NEW
├── src/
│   └── shared/
│       ├── config/
│       │   └── seo.config.ts   ← NEW
│       ├── ui/
│       │   └── seo/
│       │       └── SeoHead.tsx ← NEW
│       └── lib/
│           ├── analytics.ts    ← NEW
│           └── web-vitals.ts   ← NEW
```

---

## 2. SeoHead 컴포넌트 설계

### 인터페이스

```typescript
// src/shared/ui/seo/SeoHead.tsx
import { Helmet } from 'react-helmet-async';
import { seoConfig } from '@/shared/config/seo.config';

interface SeoHeadProps {
  title?: string;                          // 페이지 고유 제목 (없으면 defaultTitle 사용)
  description?: string;                    // 페이지 설명 (없으면 defaultDescription)
  ogImage?: string;                        // OG 이미지 URL (없으면 defaultOgImage)
  ogType?: 'website' | 'article' | 'profile';  // OG 타입 (기본값: 'website')
  canonicalPath?: string;                  // 정규 URL 경로 (예: '/projects/my-project')
  noindex?: boolean;                       // 검색 색인 제외 (Admin 페이지용)
  jsonLd?: object | object[];              // JSON-LD 구조화 데이터
  article?: {                              // article 타입일 때 추가 메타
    publishedTime: string;                 // ISO 8601
    modifiedTime: string;
    author: string;
    tags?: string[];
  };
}

export const SeoHead = ({
  title,
  description,
  ogImage,
  ogType = 'website',
  canonicalPath,
  noindex = false,
  jsonLd,
  article,
}: SeoHeadProps) => {
  const fullTitle = title
    ? `${title} | ${seoConfig.siteName}`
    : seoConfig.defaultTitle;
  const metaDescription = description || seoConfig.defaultDescription;
  const ogImageUrl = ogImage || seoConfig.defaultOgImage;
  const canonicalUrl = canonicalPath
    ? `${seoConfig.siteUrl}${canonicalPath}`
    : undefined;

  return (
    <Helmet>
      {/* 기본 메타 태그 */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Article 메타 */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:author" content={article.author} />
          {article.tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* JSON-LD 구조화 데이터 */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
```

---

## 3. SEO Config 설계

```typescript
// src/shared/config/seo.config.ts
export const seoConfig = {
  siteName: 'YamangSolution',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://www.yamang02.com',
  defaultTitle: 'YamangSolution | AI 풀스택 개발자 포트폴리오',
  defaultDescription:
    'AI와 함께 꿈을 실현하는 풀스택 개발자 YamangSolution의 포트폴리오. ' +
    'Spring Boot, React, TypeScript, AI 서비스 개발 프로젝트와 기술 아티클을 확인하세요.',
  defaultOgImage: `${import.meta.env.VITE_SITE_URL || 'https://www.yamang02.com'}/images/og-default.png`,
  twitterHandle: '@yamang02',
  locale: 'ko_KR',
  author: 'YamangSolution',
  contactEmail: 'ljj0210@gmail.com',
} as const;

// 페이지별 기본 메타 설정 (오버라이드 가능)
export const pageMetaDefaults = {
  home: {
    title: 'YamangSolution | AI 풀스택 개발자 포트폴리오',
    description:
      'AI와 함께 꿈을 실현하는 풀스택 개발자의 포트폴리오. 프로젝트, 기술 아티클, AI 챗봇을 경험해보세요.',
    canonicalPath: '/',
  },
  profile: {
    title: '프로필',
    description:
      'YamangSolution의 경력, 기술 스택, 교육 이력을 확인하세요. Java/Spring Boot, React/TypeScript 전문 풀스택 개발자.',
    canonicalPath: '/profile',
  },
  projects: {
    title: '프로젝트',
    description:
      'AI 통합 웹 서비스, 포트폴리오 사이트, 백엔드 API 등 YamangSolution의 주요 프로젝트를 확인하세요.',
    canonicalPath: '/projects',
  },
  articles: {
    title: '기술 아티클',
    description:
      'Spring Boot, React, AI/ML, 시스템 아키텍처에 대한 YamangSolution의 기술 아티클과 개발 노트를 읽어보세요.',
    canonicalPath: '/articles',
  },
  chat: {
    title: 'AI 챗봇',
    description:
      'Claude API 기반 AI 챗봇으로 YamangSolution의 프로젝트, 기술 스택, 경험에 대해 자연어로 질문해보세요.',
    canonicalPath: '/chat',
  },
} as const;
```

---

## 4. JSON-LD Schema 유틸리티

```typescript
// src/shared/lib/schema.ts
import { seoConfig } from '@/shared/config/seo.config';

export const createPersonSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'YamangSolution',
  url: seoConfig.siteUrl,
  image: `${seoConfig.siteUrl}/images/profile.jpg`,
  jobTitle: 'AI 풀스택 개발자',
  description: 'AI와 함께 꿈을 실현하는 풀스택 개발자',
  email: seoConfig.contactEmail,
  sameAs: [
    'https://github.com/Yamang02',
    // LinkedIn, etc.
  ],
  knowsAbout: [
    'Java', 'Spring Boot', 'TypeScript', 'React', 'PostgreSQL',
    'AI/ML', 'Claude API', 'AWS', 'GCP',
  ],
});

export const createOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'YamangSolution',
  url: seoConfig.siteUrl,
  logo: `${seoConfig.siteUrl}/favicons/favicon-96x96.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    email: seoConfig.contactEmail,
    contactType: 'technical support',
  },
});

export const createWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: `${seoConfig.siteName} Portfolio`,
  url: seoConfig.siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${seoConfig.siteUrl}/projects?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export const createProjectSchema = (project: {
  id: string;
  title: string;
  description: string;
  updatedAt?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: project.title,
  description: project.description,
  author: { '@type': 'Person', name: 'YamangSolution' },
  applicationCategory: 'WebApplication',
  operatingSystem: 'Web',
  url: `${seoConfig.siteUrl}/projects/${project.id}`,
  ...(project.updatedAt && { dateModified: project.updatedAt }),
});

// article.summary, article.updatedAt: Public API(ArticleDetailResponse)에 필드 추가 필요.
// article.thumbnailUrl: 없으면 defaultOgImage 사용 권장 (시리즈 썸네일 또는 생략 시 site default).
export const createArticleSchema = (article: {
  businessId: string;
  title: string;
  summary?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: article.title,
  ...(article.summary && { description: article.summary }),
  ...(article.thumbnailUrl ? { image: article.thumbnailUrl } : { image: seoConfig.defaultOgImage }),
  author: {
    '@type': 'Person',
    name: 'YamangSolution',
    url: `${seoConfig.siteUrl}/profile`,
  },
  publisher: {
    '@type': 'Organization',
    name: 'YamangSolution',
    logo: {
      '@type': 'ImageObject',
      url: `${seoConfig.siteUrl}/favicons/favicon-96x96.png`,
    },
  },
  ...(article.publishedAt && { datePublished: article.publishedAt }),
  ...(article.updatedAt && { dateModified: article.updatedAt }),
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${seoConfig.siteUrl}/articles/${article.businessId}`,
  },
});

export const createBreadcrumbSchema = (items: Array<{ name: string; path: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '홈', item: seoConfig.siteUrl },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item.name,
      item: `${seoConfig.siteUrl}${item.path}`,
    })),
  ],
});
```

---

## 5. Vite Sitemap 플러그인 설정

**권장**: Vite config는 동기 로딩이 일반적이므로, 동적 URL은 **빌드 전 스크립트**로 미리 생성하고 플러그인은 해당 파일을 읽도록 한다.

### 5-1. 빌드 전 동적 라우트 생성 스크립트

- `scripts/generate-sitemap-routes.mjs` (또는 `.ts`) 실행 시 다음을 수행:
  - `GET /api/data/projects` → `response.data` 배열에서 `id` 수집 → `/projects/{id}`
  - `GET /api/data/article-ids` (권장) → `response.data` 배열에서 `businessId` 수집 → `/articles/{businessId}`  
    - **백엔드 (선택)**: `GET /api/data/article-ids` → `{ "data": [ { "businessId": "ART001" }, ... ] }` 형태로 발행된 아티클 businessId 목록만 반환. 없으면 `GET /api/articles?page=0&size=2000` 호출 후 `response.data.content`에서 `businessId` 수집.
  - 결과를 `frontend/sitemap-routes.json` 등에 저장 (배열 형태).

### 5-2. vite.config.ts

```typescript
// vite.config.ts
import sitemap from 'vite-plugin-sitemap';
import fs from 'fs';
import path from 'path';

// 동적 라우트는 빌드 전 스크립트로 생성된 JSON에서 동기 로드
function getDynamicRoutes(): string[] {
  const p = path.resolve(__dirname, 'sitemap-routes.json');
  if (!fs.existsSync(p)) return [];
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// plugins 배열에 추가
sitemap({
  hostname: process.env.VITE_SITE_URL || 'https://www.yamang02.com',
  dynamicRoutes: getDynamicRoutes(),
  exclude: ['/admin', '/admin/**'],
  changefreq: 'weekly',
  priority: 0.8,
  routes: {
    '/': { priority: 1.0, changefreq: 'weekly' },
    '/profile': { priority: 0.7, changefreq: 'monthly' },
    '/projects': { priority: 0.9, changefreq: 'weekly' },
    '/articles': { priority: 0.9, changefreq: 'daily' },
  },
})
```

### 5-3. package.json

- `"prebuild": "node scripts/generate-sitemap-routes.mjs"` 또는 `"generate:sitemap-routes": "node scripts/generate-sitemap-routes.mjs"` 후 빌드 전에 한 번 실행하도록 문서화.

---

## 6. GitHub Actions 업데이트 설계

- **sitemap 생성**: `npm run build` 실행 시 Vite 플러그인이 `sitemap-routes.json`을 읽어 `dist/sitemap.xml`을 생성한다. 따라서 **별도 "Generate sitemap" job이 아니라**, 기존 Build 단계에 환경 변수만 추가하면 된다.
- 빌드 전에 `generate-sitemap-routes` 스크립트가 CI에서 실행되어 `sitemap-routes.json`이 생성되어 있어야 한다.

```yaml
# .github/workflows/frontend-production-aws.yml

# 기존 Build 단계에 env 추가 (sitemap 플러그인 + GA4용)
- name: Build frontend
  run: |
    cd frontend
    npm run generate:sitemap-routes   # 동적 라우트 JSON 생성 (API 호출)
    npm run build
  env:
    VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }}
    VITE_SITE_URL: ${{ vars.VITE_SITE_URL }}
    VITE_GA_MEASUREMENT_ID: ${{ secrets.VITE_GA_MEASUREMENT_ID }}

# S3 sync 후 SEO 파일 캐시 개별 설정
- name: Upload SEO files with short cache
  run: |
    # robots.txt - 1일 캐시
    aws s3 cp dist/robots.txt s3://${{ secrets.S3_BUCKET }}/robots.txt \
      --cache-control "public, max-age=86400" \
      --content-type "text/plain"

    # sitemap.xml - 1시간 캐시 (자주 업데이트)
    aws s3 cp dist/sitemap.xml s3://${{ secrets.S3_BUCKET }}/sitemap.xml \
      --cache-control "public, max-age=3600" \
      --content-type "application/xml"

    # llms.txt - 1일 캐시
    aws s3 cp dist/llms.txt s3://${{ secrets.S3_BUCKET }}/llms.txt \
      --cache-control "public, max-age=86400" \
      --content-type "text/plain"
```

---

## 7. OG 기본 이미지 생성

SEO에서 OG 이미지는 SNS 공유 시 핵심입니다. 별도 디자인 툴 없이 자동 생성하는 방법:

### 옵션 A: 정적 이미지 (추천 - 단순)
- Figma 등으로 `og-default.png` 제작 (1200×630px)
- `frontend/public/images/og-default.png`에 저장

### 옵션 B: 동적 OG 이미지 (미래 확장)
- Cloudinary URL 기반 동적 이미지 생성
- `https://res.cloudinary.com/[cloud]/image/upload/l_text:Arial_60:{title}/og-template.jpg`
- 프로젝트·아티클 상세 페이지에 동적으로 적용

**현재 Phase: 옵션 A (정적 이미지)로 시작, 추후 옵션 B로 확장**

---

## 8. 기타 권장 사항

- **index.html**: 한글 포트폴리오이므로 `<html lang="ko">` 사용 권장.
- **Canonical / 트레일링 슬래시**: SPA에서 `/projects` vs `/projects/` 중 하나로 통일하고, canonical URL을 그에 맞게 설정 (필요 시 리다이렉트 정책 명시).
- **robots.txt Sitemap URL**: 빌드 시점에 `VITE_SITE_URL`을 사용해 `Sitemap: ${VITE_SITE_URL}/sitemap.xml` 로 넣으면 환경별로 안전함 (정적 파일이면 빌드 스크립트로 치환).

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2026-03-09
