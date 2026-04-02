# Phase 3: Production Issue Bugfix

## Overview

프로덕션 환경에서 발생한 Article 관련 버그와 테마 시스템 개선 사항을 다룹니다.

---

## Issue 1: Article 목록/상세 페이지 미표시 문제

### 문제 상황
- DB에 `status = 'published'`로 데이터가 존재함
- `published_at = '2026-01-11 13:44:00.595'` (미래 시간!)
- 프로덕션 환경에서 아티클 목록 및 상세 페이지에 데이터가 표시되지 않음
- **로컬/스테이징에서는 정상 작동** (V005 테스트 데이터 사용)

### 근본 원인: Article API에서 VITE_API_BASE_URL 미사용 🚨

**문제 진단 결과:**

✅ **백엔드 API 정상 동작 확인**
```bash
curl "https://ai-portfolio-493721639129.asia-northeast3.run.app/api/articles"
# → {"success": true, "data": {"content": [...]}}
```

✅ **다른 도메인 (Project 등) 정상 작동**
- 이유: `VITE_API_BASE_URL` 환경 변수를 사용하여 백엔드 직접 호출

❌ **Article API만 상대 경로 사용**
```typescript
// frontend/src/main/entities/article/api/articleApi.ts:48
const response = await fetch(`/api/articles?${queryParams.toString()}`);
// ❌ 상대 경로 → www.yamang02.com/api/articles (HTML 반환)
```

**근본 원인:**
Article API만 `VITE_API_BASE_URL` 환경 변수를 사용하지 않고 상대 경로(`/api/articles`)를 하드코딩했습니다.

**다른 API와의 비교:**
```typescript
// ✅ Project API (올바른 구현)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const url = `${API_BASE_URL}/api/projects`;
// → https://ai-portfolio-493721639129.asia-northeast3.run.app/api/projects

// ❌ Article API (문제 코드)
const response = await fetch(`/api/articles`);
// → https://www.yamang02.com/api/articles (프록시 안 됨 → HTML 반환)
```

**증상:**
- Project, Experience, Education 등: ✅ 정상 작동
- Article만: ❌ HTML 반환 (프록시 미설정으로 React 앱 라우팅됨)

### 왜 로컬에서는 문제없이 동작했는가? 🔍

**로컬 개발 환경 (Vite Dev Server):**
```typescript
// vite.config.ts:13-24
proxy: {
  '/api': {
    target: env.VITE_API_BASE_URL || 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
    // ...
  }
}
```

**동작 원리:**
1. **로컬 개발 환경 (`npm run dev`)**:
   - Vite 개발 서버가 `http://localhost:3000`에서 실행
   - 브라우저에서 `/api/articles` 요청 시
   - Vite 프록시가 자동으로 `http://localhost:8080/api/articles`로 전달
   - ✅ **상대 경로(`/api/articles`)가 프록시를 통해 백엔드로 전달됨**

2. **프로덕션 환경 (정적 파일 배포)**:
   - 빌드된 정적 파일이 `https://www.yamang02.com`에 배포
   - 브라우저에서 `/api/articles` 요청 시
   - 프록시가 없으므로 `https://www.yamang02.com/api/articles`로 직접 요청
   - ❌ **프론트엔드 도메인으로 요청 → HTML 반환 (React Router가 처리)**

**요약:**
- **로컬**: Vite 프록시가 상대 경로를 백엔드로 자동 전달 → ✅ 정상 동작
- **프로덕션**: 프록시 없음, 상대 경로는 프론트엔드 도메인으로 요청 → ❌ 실패
- **해결**: `VITE_API_BASE_URL` 환경 변수를 사용하여 절대 경로로 백엔드 직접 호출

### 프로덕션 DB 데이터 확인

**데이터베이스 정보:**
```
Host: turntable.proxy.rlwy.net:11437
Database: railway
User: postgres
```

**확인이 필요한 쿼리:**

```sql
-- 1. 현재 DB 시간대 확인
SHOW timezone;
SELECT NOW();
SELECT CURRENT_TIMESTAMP;

-- 2. Article 데이터 상세 확인
SELECT
    business_id,
    title,
    status,
    published_at,
    published_at AT TIME ZONE 'UTC' AS published_at_utc,
    published_at AT TIME ZONE 'Asia/Seoul' AS published_at_kst,
    NOW() AS current_time,
    CASE
        WHEN published_at > NOW() THEN 'FUTURE'
        WHEN published_at <= NOW() THEN 'PAST'
    END AS time_status
FROM articles
WHERE status = 'published'
ORDER BY published_at DESC;

-- 3. 로컬 테스트 데이터와 비교
SELECT business_id, title, status, published_at
FROM articles
WHERE business_id LIKE 'article-%'
ORDER BY business_id;
```

### 가능한 원인 분석

#### 1. React Query 캐시 문제
**위치**: `frontend/src/main/entities/article/api/useArticleQuery.ts:21`

```typescript
staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
```

**문제점**:
- 프로덕션 배포 직후 이전 빈 데이터가 캐시되어 있을 수 있음
- 사용자가 페이지를 새로고침하기 전까지 오래된 캐시 사용

**해결 방안**:
1. 배포 후 Cache Invalidation 전략 적용
2. `staleTime` 조정 (개발 환경과 프로덕션 환경 분리)
3. 수동 캐시 무효화 버튼 제공 (임시)

#### 2. API 응답 구조 불일치
**위치**: `frontend/src/main/entities/article/api/articleApi.ts:48-53`

```typescript
const apiResponse: ApiResponse<{ content: ArticleListItem[]; totalElements: number }> = await response.json();
return apiResponse.data || { content: [], totalElements: 0 };
```

**문제점**:
- 백엔드 API가 예상하지 못한 형태로 응답할 경우 `content: []` 반환
- 에러가 발생해도 빈 배열로 fallback되어 문제 파악 어려움

**디버깅 방법**:
```typescript
// 개발자 도구 Network 탭에서 확인
// 1. /api/articles 응답 상태 코드
// 2. 응답 body 구조
// 3. apiResponse.data의 실제 값
```

**해결 방안**:
1. API 응답 로깅 추가
2. 에러 발생 시 빈 배열 대신 에러 throw
3. 타입 검증 강화

#### 3. publishedAt 필드 NULL 문제
**위치**: `backend/src/main/resources/db/migration/V005__create_articles_tables.sql`

**체크 사항**:
```sql
-- DB에서 직접 확인
SELECT business_id, title, status, published_at
FROM articles
WHERE status = 'published';
```

**문제점**:
- `published_at`이 NULL인 경우 정렬 시 문제 발생 가능
- 트리거가 제대로 작동하지 않았을 가능성

**해결 방안**:
1. DB에서 `published_at IS NULL`인 레코드 확인
2. 트리거 재실행 또는 수동 업데이트
3. Application 레벨에서 NULL 체크 추가

#### 4. 백엔드 필터링 로직 문제
**위치**: `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/PostgresArticleRepository.java:275`

```java
predicates.add(cb.equal(root.get("status"), "published"));
```

**체크 사항**:
- DB에 저장된 status 값이 정확히 "published"인지 확인 (대소문자, 공백)
- JPA Entity와 DB 컬럼 매핑 확인

**디버깅 방법**:
```java
// 로그 추가
log.info("Filtering articles with status: published");
log.info("Total predicates: {}", predicates.size());
```

#### 5. CORS 또는 Proxy 설정 문제
**프로덕션 환경 체크 사항**:
- Nginx/Apache 프록시 설정
- `/api/articles` 경로가 올바르게 라우팅되는지
- CORS 헤더 설정

**디버깅 방법**:
```bash
# 프로덕션 서버에서 직접 API 호출
curl https://your-domain.com/api/articles

# 응답 확인
curl -v https://your-domain.com/api/articles
```

---

## Issue 2: 테마 토글 시스템 설정 무시

### 요구사항
라이트모드/다크모드 토글 시 디바이스의 시스템 설정을 무시하고 사용자가 설정한 값을 우선 적용

### 현재 구현 상태 ✅

**위치**: `frontend/src/shared/hooks/useTheme.ts`

현재 구현이 이미 요구사항을 충족하고 있습니다:

```typescript
// 1. 초기 테마 로드 (우선순위)
function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored; // ✅ localStorage 값 우선
  }
  return getSystemTheme(); // localStorage 없을 때만 시스템 테마 사용
}

// 2. 테마 토글 시 localStorage에 저장
function applyTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme); // ✅ 사용자 선택 저장
}
```

**동작 방식**:
1. 최초 방문: 시스템 설정 따름
2. 사용자가 테마 토글: localStorage에 저장
3. 이후 방문: localStorage 값 우선 (시스템 설정 무시)

### 검증 방법

```javascript
// 브라우저 개발자 도구 Console에서 확인
localStorage.getItem('portfolio-theme') // 'light' 또는 'dark'

// 초기화 (시스템 설정으로 돌아감)
localStorage.removeItem('portfolio-theme')
```

---

## 해결 방법

### Solution 1: Article API에 VITE_API_BASE_URL 적용 (추천) ⭐

**문제 파일:** `frontend/src/main/entities/article/api/articleApi.ts`

**수정 전:**
```typescript
export const articleApi = {
  getAll: async (params) => {
    // ❌ 상대 경로 사용
    const response = await fetch(`/api/articles?${queryParams.toString()}`);
    // ...
  },

  getByBusinessId: async (businessId: string) => {
    // ❌ 상대 경로 사용
    const response = await fetch(`/api/articles/${businessId}`);
    // ...
  },

  getStatistics: async () => {
    // ❌ 상대 경로 사용
    const response = await fetch('/api/articles/statistics');
    // ...
  },

  getNavigation: async (businessId: string) => {
    // ❌ 상대 경로 사용
    const response = await fetch(`/api/articles/${businessId}/navigation`);
    // ...
  },
};
```

**수정 후:**
```typescript
// 파일 상단에 추가
const API_BASE_URL = typeof window !== 'undefined'
  ? (import.meta.env.VITE_API_BASE_URL || '')
  : (import.meta.env?.VITE_API_BASE_URL || '');

export const articleApi = {
  getAll: async (params) => {
    // ✅ API_BASE_URL 사용
    const response = await fetch(`${API_BASE_URL}/api/articles?${queryParams.toString()}`);
    // ...
  },

  getByBusinessId: async (businessId: string) => {
    // ✅ API_BASE_URL 사용
    const response = await fetch(`${API_BASE_URL}/api/articles/${businessId}`);
    // ...
  },

  getStatistics: async () => {
    // ✅ API_BASE_URL 사용
    const response = await fetch(`${API_BASE_URL}/api/articles/statistics`);
    // ...
  },

  getNavigation: async (businessId: string) => {
    // ✅ API_BASE_URL 사용
    const response = await fetch(`${API_BASE_URL}/api/articles/${businessId}/navigation`);
    // ...
  },
};
```

**환경 변수 설정 확인:**
```bash
# 프로덕션 배포 시 환경 변수 설정
VITE_API_BASE_URL=https://ai-portfolio-493721639129.asia-northeast3.run.app
```

---

### Solution 2: 프론트엔드 배포 환경에 API 프록시 설정 추가 (대안)

**비추천 이유:**
- 다른 도메인은 이미 `VITE_API_BASE_URL`을 사용하고 있음
- 일관성을 위해 Article도 동일한 방식 사용 권장
- 프록시 설정은 복잡하고 플랫폼마다 다름

프론트엔드가 어디에 배포되어 있는지에 따라 설정 방법이 다릅니다:

#### A. Vercel/Netlify 등 정적 호스팅 사용 시

**vercel.json** 또는 **netlify.toml** 파일에 rewrite 규칙 추가:

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ai-portfolio-493721639129.asia-northeast3.run.app/api/:path*"
    }
  ]
}
```

```toml
# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://ai-portfolio-493721639129.asia-northeast3.run.app/api/:splat"
  status = 200
  force = true
```

#### B. Nginx 사용 시

**/etc/nginx/sites-available/yamang02.com** 설정 파일 수정:

```nginx
server {
    listen 443 ssl;
    server_name www.yamang02.com yamang02.com;

    # 기존 설정...

    # API 프록시 설정 추가
    location /api/ {
        proxy_pass https://ai-portfolio-493721639129.asia-northeast3.run.app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React 앱 (나머지 모든 요청)
    location / {
        root /var/www/yamang02.com;
        try_files $uri $uri/ /index.html;
    }
}
```

설정 후 Nginx 재시작:
```bash
sudo nginx -t  # 설정 검증
sudo systemctl reload nginx
```

#### C. AWS CloudFront/S3 사용 시

CloudFront Behaviors 설정에서:
1. **새 Behavior 추가**: Path pattern = `/api/*`
2. **Origin**: 백엔드 URL (`ai-portfolio-493721639129.asia-northeast3.run.app`)
3. **Viewer Protocol Policy**: HTTPS Only
4. **Cache Policy**: Disable caching (또는 짧은 TTL)

#### D. Firebase Hosting 사용 시

**firebase.json** 파일에 rewrite 규칙 추가:

```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

### Solution 2: 프론트엔드 코드에서 절대 URL 사용 ✅ (적용 완료)

**✅ 적용 완료**: 모든 API를 `apiClient.callApi`를 사용하도록 통일하여 `VITE_API_BASE_URL` 환경 변수를 자동으로 적용

**변경 사항:**

1. **`apiClient.ts`에 공통 메서드 추가**:
```typescript
// frontend/src/shared/api/apiClient.ts
async callApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return this.request<T>(endpoint, options);
}
```

2. **모든 API 파일 통일**:
- ✅ `articleApi.ts` - `apiClient.callApi` 사용
- ✅ `projectApi.ts` - `apiClient.callApi` 사용
- ✅ `techStackApi.ts` - `apiClient.callApi` 사용
- ✅ `experienceApi.ts` - `apiClient.callApi` 사용
- ✅ `educationApi.ts` - `apiClient.callApi` 사용
- ✅ `certificationApi.ts` - `apiClient.callApi` 사용
- ✅ `profileIntroductionApi.ts` - `apiClient.callApi` 사용

**장점:**
- ✅ 재시도 로직 공통화
- ✅ 에러 처리 일관성
- ✅ `VITE_API_BASE_URL` 자동 적용
- ✅ 코드 중복 제거
- ✅ 유지보수성 향상

**변경 전:**
```typescript
// ❌ 각 API마다 자체 request 메서드 중복
class ProjectApi {
  private async request<T>(endpoint: string) {
    const url = `${API_BASE_URL}${endpoint}`;
    // ... 중복 코드
  }
}
```

**변경 후:**
```typescript
// ✅ 공통 apiClient 사용
const response = await apiClient.callApi<Project[]>(`/api/admin/projects`);
```

---

## Action Items

### High Priority (즉시 조치) 🔥

- [x] **Article API 코드 수정** ✅
  - [x] `frontend/src/main/entities/article/api/articleApi.ts` 파일 수정
  - [x] `apiClient.callApi` 사용하도록 변경
  - [x] 모든 `fetch()` 호출을 `apiClient.callApi`로 교체 (4군데)

- [x] **다른 API 파일들 통일** ✅
  - [x] `projectApi.ts` - 자체 `request` 메서드 제거, `apiClient.callApi` 사용
  - [x] `techStackApi.ts` - 자체 `request` 메서드 제거, `apiClient.callApi` 사용
  - [x] `experienceApi.ts` - 자체 `request` 메서드 제거, `apiClient.callApi` 사용
  - [x] `educationApi.ts` - 자체 `request` 메서드 제거, `apiClient.callApi` 사용
  - [x] `certificationApi.ts` - 자체 `request` 메서드 제거, `apiClient.callApi` 사용
  - [x] `profileIntroductionApi.ts` - `apiClient.callApi` 사용

- [x] **apiClient에 공통 메서드 추가** ✅
  - [x] `callApi<T>()` public 메서드 추가
  - [x] 재시도 로직, 에러 처리, baseURL 적용 포함

- [ ] **환경 변수 확인**
  - [ ] 프로덕션 배포 환경에 `VITE_API_BASE_URL` 설정 확인
  - [ ] 값: `https://ai-portfolio-493721639129.asia-northeast3.run.app`

- [ ] **빌드 & 배포**
  ```bash
  cd frontend
  npm run build
  # 배포 (플랫폼에 따라 다름)
  ```

- [ ] **검증**
  ```bash
  # 1. 로컬에서 프로덕션 빌드 테스트
  cd frontend
  VITE_API_BASE_URL=https://ai-portfolio-493721639129.asia-northeast3.run.app npm run build
  npm run preview

  # 2. 배포 후 프로덕션 테스트
  curl -s "https://www.yamang02.com" | grep -q "article-001" && echo "✅ 데이터 로드 성공" || echo "❌ 데이터 로드 실패"
  ```

- [ ] **브라우저 캐시 무효화**
  - [ ] Hard Refresh (Ctrl+Shift+R)
  - [ ] 개발자 도구 → Application → Storage → Clear site data

### Medium Priority (단기 개선)

- [ ] **프론트엔드 개선**
  - [ ] API 응답 로깅 추가
  ```typescript
  const apiResponse = await response.json();
  console.log('[Article API] Response:', apiResponse);
  return apiResponse.data || { content: [], totalElements: 0 };
  ```

  - [ ] 에러 핸들링 개선
  ```typescript
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Article API] Error:', response.status, errorText);
    throw new Error(`Failed to fetch articles: ${response.status}`);
  }
  ```

- [ ] **캐시 무효화 전략**
  - [ ] React Query devtools 추가 (개발 환경)
  - [ ] 수동 새로고침 버튼 추가
  - [ ] 배포 시 자동 캐시 무효화 (service worker 활용)

### Low Priority (장기 개선)

- [ ] **모니터링 추가**
  - [ ] Sentry/LogRocket 등 에러 트래킹 도구 도입
  - [ ] API 응답 시간 모니터링
  - [ ] 사용자 행동 로깅

- [ ] **테스트 추가**
  - [ ] E2E 테스트 (Cypress/Playwright)
  - [ ] API 통합 테스트
  - [ ] 캐시 동작 테스트

---

## Troubleshooting Checklist

### 프론트엔드 체크리스트

- [ ] 브라우저 Console에 에러 없음
- [ ] Network 탭에서 `/api/articles` 요청 성공 (200)
- [ ] 응답 body에 `data.content` 배열 존재
- [ ] React Query devtools에서 캐시 상태 확인
- [ ] localStorage에 이상한 데이터 없음

### 백엔드 체크리스트

- [ ] Application 정상 실행 중
- [ ] DB 연결 정상
- [ ] `/api/articles` 엔드포인트 접근 가능
- [ ] 쿼리 실행 시 데이터 반환됨
- [ ] 로그에 예외 없음

### 인프라 체크리스트

- [ ] 프로덕션 서버 정상 실행
- [ ] Nginx/Apache 설정 정상
- [ ] `/api/*` 경로 프록시 설정 정상
- [ ] CORS 설정 정상
- [ ] SSL 인증서 정상

---

## 해결 후 검증

### 테스트 시나리오

1. **Article 목록 조회**
   - [ ] `/articles` 페이지 접근
   - [ ] 아티클 목록 표시 확인
   - [ ] 페이지네이션 동작 확인
   - [ ] 필터링 동작 확인

2. **Article 상세 조회**
   - [ ] 아티클 카드 클릭
   - [ ] 상세 페이지로 이동
   - [ ] 콘텐츠 렌더링 확인
   - [ ] 이전/다음 네비게이션 확인

3. **캐시 동작 확인**
   - [ ] 페이지 새로고침 시 데이터 유지
   - [ ] 5분 후 자동 갱신 확인
   - [ ] 수동 새로고침 버튼 동작 확인

4. **테마 토글 확인**
   - [ ] 라이트/다크 모드 전환
   - [ ] localStorage 저장 확인
   - [ ] 페이지 새로고침 후 설정 유지
   - [ ] 시스템 설정 변경 시 무시됨 확인

---

## 참고 자료

### 관련 파일

**프론트엔드**:
- `frontend/src/main/pages/ArticleListPage.tsx` - 목록 페이지
- `frontend/src/main/pages/ArticleDetailPage.tsx` - 상세 페이지
- `frontend/src/main/entities/article/api/articleApi.ts` - API 클라이언트
- `frontend/src/main/entities/article/api/useArticleQuery.ts` - React Query 훅
- `frontend/src/shared/hooks/useTheme.ts` - 테마 관리 훅

**백엔드**:
- `backend/src/main/java/com/aiportfolio/backend/infrastructure/web/controller/ArticleController.java` - API 엔드포인트
- `backend/src/main/java/com/aiportfolio/backend/infrastructure/persistence/postgres/adapter/PostgresArticleRepository.java` - 리포지토리
- `backend/src/main/resources/db/migration/V005__create_articles_tables.sql` - DB 스키마

### 유용한 명령어

```bash
# 프론트엔드 캐시 초기화
localStorage.clear()
location.reload()

# React Query 캐시 초기화
queryClient.clear()

# 백엔드 로그 확인 (프로덕션)
tail -f /var/log/application.log | grep "articles"

# DB 직접 확인
psql -U postgres -d aiportfolio -c "SELECT * FROM articles LIMIT 10;"
```

---

## 변경 이력

### v1.0 (2025-01-12)
- 초기 버전 작성
- Issue 1: Article 미표시 문제 분석
- Issue 2: 테마 시스템 검증 완료

---

**작성일**: 2025-01-12
**작성자**: AI Agent (Claude)
