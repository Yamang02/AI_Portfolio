# SEO/AEO 최적화 - 구현 전 점검 결과

**작성일**: 2026-03-09  
**대상**: design.md, checklist.md, aeo-strategy.md  
**반영 완료**: 2026-03-09 — 권장안으로 design.md, checklist.md에 반영됨.

---

## 1. 누락·수정이 필요한 영향도 항목

### 1-1. 백엔드 API 응답 필드 (BlogPosting Schema)

| 항목 | design/checklist | 현재 백엔드 | 조치 |
|------|------------------|-------------|------|
| **summary** | ArticleDetailResponse에 필요 | ❌ 없음 (도메인에는 있음) | Public `ArticleDetailResponse`에 `summary` 필드 추가 |
| **updatedAt** | BlogPosting `dateModified` | ❌ 없음 (도메인에는 있음) | Public `ArticleDetailResponse`에 `updatedAt` 필드 추가 |
| **thumbnailUrl** | createArticleSchema에서 사용 | ❌ 아티클 단건에는 없음 (시리즈에만 있음) | 설계 선택: (A) 시리즈 썸네일 사용 (B) content 첫 이미지 파싱 (C) optional로 두고 없으면 defaultOgImage |

**권장**: summary, updatedAt는 백엔드 DTO 추가. thumbnailUrl은 optional로 두고, 있으면 시리즈 썸네일 또는 defaultOgImage 사용.

---

### 1-2. Sitemap 동적 URL 수집

| 항목 | design.md 기술 | 실제 API | 조치 |
|------|----------------|----------|------|
| **프로젝트 목록** | `fetch(apiBase + '/api/data/projects')` → `projects.data` | ✅ `GET /api/data/projects` → `response.data` (배열) | 응답 구조 일치 |
| **아티클 목록** | `fetch(apiBase + '/api/articles')` → `articles.data` | ❌ `GET /api/articles` 는 **페이지네이션** (page, size). 응답은 `data: { content: [], totalElements, ... }` | design 예시 코드 수정 필요 |

**권장**:
- sitemap용으로 **아티클 ID만 반환하는 경량 API** 추가: `GET /api/articles/sitemap-ids` (또는 `/api/data/article-ids`)  
  또는
- 빌드 시 `page=0&size=2000` 등으로 여러 번 호출해 `data.content`에서 businessId 수집 (문서에 명시).

---

### 1-3. Vite Sitemap 플러그인과 비동기

design.md 5절 예시:

```ts
async function getDynamicRoutes(): Promise<string[]> { ... }
// ...
sitemap({
  dynamicRoutes: await getDynamicRoutes(),  // ← top-level await
})
```

- `vite.config.ts`는 동기 export가 일반적이며, `vite-plugin-sitemap`이 **async dynamicRoutes**를 공식 지원하는지 불명확.
- **영향**: 빌드 시 sitemap 플러그인에서 에러나 빈 동적 라우트 가능.

**권장**:
- **옵션 A**: 빌드 전에 Node 스크립트로 동적 URL 목록을 JSON/파일로 생성하고, vite config에서는 해당 파일을 읽어 `dynamicRoutes`에 넣기 (동기).
- **옵션 B**: `@pyyupsk/vite-plugin-sitemap` 등 async를 지원하는 플러그인 사용 여부 조사 후 design에 명시.

---

### 1-4. index.html 언어 속성

- **현재**: `<html lang="en">`
- **권장**: 한글 포트폴리오이므로 `lang="ko"` 로 변경. SEO·스크린리더 일관성에 유리.

---

### 1-5. Admin 페이지 noindex

- design: `noindex` (Admin 페이지용) → SeoHead `noindex` prop.
- checklist: Admin 레이아웃/각 Admin 페이지에 **SeoHead + noindex 적용**이 명시되어 있지 않음.

**권장**: Phase 1-4에 체크 항목 추가  
- [ ] Admin 레이아웃 또는 AdminApp 루트에서 `SeoHead noindex={true}` 적용 (모든 /admin/* 에 noindex)

---

### 1-6. 배포 환경과 보안 헤더 (.htaccess)

checklist 5-2: “.htaccess 보안 헤더 추가”

- **실제 배포**: 프론트는 **AWS S3 + CloudFront** (README·워크플로우 기준). Apache가 아니므로 **.htaccess는 동작하지 않음**.

**권장**:
- 체크리스트를 “CloudFront Response Headers Policy (또는 Lambda@Edge)로 보안 헤더 설정”으로 수정.
- .htaccess는 “Apache 사용 시 참고용”으로만 언급.

---

### 1-7. GitHub Actions와 Sitemap 생성 순서

design 6절: “기존 build 스텝 **앞에** Generate sitemap 스텝 추가”  
현재 설계는 “sitemap 생성”을 **별도 run**으로 두고, 실제로는 **같은 run에서 `npm run build`**만 실행.

- **의도**: sitemap이 **빌드 결과물(dist)** 에 포함되려면, sitemap 플러그인이 **빌드 내부**에서 동작해야 함. 즉 “sitemap 생성”은 `npm run build` **안**에서 이루어지는 것이 맞음.
- **환경 변수**: 빌드 시 `VITE_API_BASE_URL`, `VITE_SITE_URL` 등이 필요하므로, design 6절의 “Generate sitemap” 스텝은 **실제로는 기존 Build 단계에 env 추가**하는 것으로 이해하는 것이 맞음. “빌드 앞에 sitemap만 따로 돌린다”는 설명은 오해 소지 있음.

**권장**:  
- “sitemap은 `npm run build` 시 Vite 플러그인으로 생성됨”이라고 명시.  
- “Generate sitemap” 단계는 “Build 단계에 `VITE_API_BASE_URL`, `VITE_SITE_URL` 등 env 추가”로 정리.

---

## 2. 설계·체크리스트 정합성

| 구분 | 내용 |
|------|------|
| **WebSite Schema** | design 4절에는 `potentialAction`(SearchAction) 없음. README/aeo-strategy에는 있음. design의 `createWebSiteSchema()`에 SearchAction 추가 여부를 design에 명시하는 것이 좋음. |
| **프로필 이미지** | Person schema에 `image: .../images/profile.jpg`. 해당 경로에 파일 존재 여부 확인 필요 (public 폴더 구조). |
| **OG 기본 이미지** | `og-default.png` (1200×630) 생성 여부를 checklist Phase 1 또는 5에 명시 권장. |
| **llms.txt 링크** | checklist 3-1: “index.html에 llms.txt 링크 태그 추가”. llmstxt.org 권장 방식이면 `<link rel="alternate" type="text/plain" href="/llms.txt">` 등으로 문서화. |

---

## 3. 추가로 권장하는 개선사항

1. **Canonical과 트레일링 슬래시**  
   - SPA에서 `/projects` vs `/projects/` 일관성 정책(리다이렉트 또는 canonical 일원화)을 한 줄이라도 설계에 적어 두면 좋음.

2. **GA4와 쿠키 동의**  
   - README에서 “쿠키 동의 배너는 MVP 제외”로 되어 있음. checklist나 완료 기준에 “추후 쿠키 동의 배너 검토” 한 줄 추가 시 법적 리스크 관리에 유리.

3. **robots.txt Sitemap URL**  
   - checklist 1-1: “프로덕션 도메인 확정 후 Sitemap URL 업데이트”.  
   - `VITE_SITE_URL` 기반으로 빌드 시점에 robots.txt에 sitemap URL을 넣는 스크립트/플러그인을 두면 환경별로 안전함.

4. **에러/404 페이지**  
   - 404 페이지에 `SeoHead` + `noindex` 적용 여부를 Phase 1-4에 포함할지 결정 후 체크리스트 반영.

---

## 4. 요약 체크리스트 (구현 전 반영 권장)

- [ ] **design.md**: sitemap 동적 라우트 수집 시 아티클은 `data.content` 또는 전용 API 사용으로 명시
- [ ] **design.md**: Vite sitemap 비동기 처리 방식(스크립트 선생성 vs async 지원 플러그인) 확정 및 반영
- [ ] **design.md**: GitHub Actions는 “빌드 시 env로 sitemap 생성”으로 정리
- [ ] **checklist**: Admin noindex 적용 항목 추가
- [ ] **checklist**: 5-2 보안 헤더를 “CloudFront (또는 Lambda@Edge)” 기준으로 수정
- [ ] **백엔드**: Public ArticleDetailResponse에 `summary`, `updatedAt` 추가
- [ ] **프론트**: index.html `lang="ko"` 로 변경
- [ ] **문서**: WebSite schema SearchAction, og-default.png 생성, llms.txt 링크 방식 등 위 항목 반영

이 문서를 design.md / checklist.md 보완 시 참고하면 구현 시 누락과 재작업을 줄일 수 있습니다.
