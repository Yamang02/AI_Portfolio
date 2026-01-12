# 아티클 상세 페이지 데이터 플래싱 문제

**에픽**: [UX 및 데이터 로딩 최적화](../epic/ux-data-loading-optimization.md)
**작성일**: 2026-01-12
**우선순위**: High
**카테고리**: UX, Data Fetching
**상태**: Backlog

---

## 문제 요약

아티클 상세 페이지([ArticleDetailPage.tsx](../../frontend/src/main/pages/ArticleDetailPage.tsx))에 접근할 때, **데이터가 정상적으로 로드된 후 갑자기 "아티클을 찾을 수 없습니다" 메시지가 표시되는 현상**이 간헐적으로 발생합니다.

### 관찰된 현상
1. 페이지 진입 시 로딩 스켈레톤 표시
2. 아티클 데이터 정상 렌더링 (제목, 본문, 메타데이터 등)
3. **짧은 시간 후 갑자기 EmptyCard로 전환** ("요청한 아티클이 존재하지 않습니다")
4. 페이지 새로고침 시 정상 동작하거나 같은 현상 반복

### 영향 범위
- **사용자 경험**: 콘텐츠를 읽다가 갑자기 사라지는 혼란스러운 경험
- **SEO**: 검색 엔진 크롤러가 빈 페이지로 인식할 가능성
- **신뢰도**: 사이트의 안정성에 대한 신뢰 저하

---

## 원인 분석

### 1. React Query 캐시 무효화 패턴

#### 문제 1: 다중 쿼리의 staleTime 불일치

[ArticleDetailPage.tsx:31-42](../../frontend/src/main/pages/ArticleDetailPage.tsx#L31-L42)에서 3개의 독립적인 쿼리를 실행합니다:

```typescript
// 아티클 상세 조회 - staleTime: 10분
const { data: article, isLoading, error } = useArticleQuery(businessId!);

// 네비게이션 조회 - staleTime: 10분
const { data: navigationData } = useArticleNavigationQuery(businessId!);

// 시리즈 아티클 조회 - staleTime: 5분
const { data: articlesData } = useArticleListQuery({
  page: 0,
  size: 50,
  sortBy: 'publishedAt',
  sortOrder: 'desc',
});
```

**문제점**:
- `useArticleQuery`: [staleTime 10분](../../frontend/src/main/entities/article/api/useArticleQuery.ts#L32)
- `useArticleListQuery`: [staleTime 5분](../../frontend/src/main/entities/article/api/useArticleQuery.ts#L21)
- 시리즈 목록 쿼리가 먼저 stale 상태가 되어 백그라운드 리페치 발생
- 리페치 중 네트워크 지연 또는 일시적 오류 시 `articlesData`가 `undefined`로 전환될 수 있음

#### 문제 2: 에러 조건 판단 로직

[ArticleDetailPage.tsx:125](../../frontend/src/main/pages/ArticleDetailPage.tsx#L125):

```typescript
const hasError = !!error || (!isLoading && !article);
```

**문제점**:
- `!isLoading && !article` 조건이 **캐시 무효화 중**에도 `true`가 될 수 있음
- React Query는 백그라운드 리페치 중에 `isLoading`을 `false`로 유지하고 이전 데이터를 반환함
- 그러나 특정 조건(캐시 만료, 강제 무효화 등)에서 `data`가 일시적으로 `undefined`가 될 수 있음

### 2. React Query의 백그라운드 리페치 동작

#### 문제 3: 기본 리페치 정책

React Query는 기본적으로 다음 시나리오에서 자동 리페치를 수행합니다:

```typescript
// @tanstack/react-query 기본 설정
{
  refetchOnWindowFocus: true,  // 윈도우 포커스 시 리페치
  refetchOnReconnect: true,    // 네트워크 재연결 시 리페치
  refetchOnMount: true,         // 컴포넌트 마운트 시 리페치
  staleTime: 0,                 // 기본값 0 (즉시 stale)
}
```

**현재 설정 ([useArticleQuery.ts:28-34](../../frontend/src/main/entities/article/api/useArticleQuery.ts#L28-L34))**:
```typescript
export function useArticleQuery(businessId: string) {
  return useQuery({
    queryKey: ['articles', businessId],
    queryFn: () => articleApi.getByBusinessId(businessId),
    staleTime: 10 * 60 * 1000, // 10분
    enabled: !!businessId,
  });
}
```

**문제점**:
- `refetchOnWindowFocus`가 명시적으로 `false`로 설정되지 않음 → **탭 전환 시 리페치 발생**
- `refetchOnMount`가 `true` (기본값) → **뒤로가기 후 재진입 시 리페치 발생**
- `refetchInterval` 미설정 → 폴링 없음 (긍정적)
- **하지만** 리페치 중 일시적 네트워크 오류나 서버 응답 지연 시 `data`가 `undefined`로 전환

#### 문제 4: 쿼리 키 충돌 가능성

[articleApi.ts:57-63](../../frontend/src/main/entities/article/api/articleApi.ts#L57-L63):
```typescript
getByBusinessId: async (businessId: string): Promise<ArticleDetail> => {
  const response = await apiClient.callApi<ArticleDetail>(`/api/articles/${businessId}`);
  if (!response.data) {
    throw new Error('Article not found');
  }
  return response.data;
}
```

**쿼리 키 구조**:
- 상세 조회: `['articles', businessId]`
- 목록 조회: `['articles', { page, size, sortBy, ... }]`

**잠재적 문제**:
- 관리자 페이지에서 아티클 수정/삭제 시 `queryClient.invalidateQueries(['articles'])`를 호출하면 **모든 관련 쿼리 무효화**
- 무효화된 쿼리가 리페치되는 동안 `data`가 일시적으로 `undefined`

### 3. 네트워크 및 API 응답 처리

#### 문제 5: API 응답 타이밍

백엔드 API 응답이 지연되거나 일시적으로 404/500 오류를 반환하는 경우:

```typescript
// apiClient.callApi 내부 (추정)
if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}

// articleApi.getByBusinessId
if (!response.data) {
  throw new Error('Article not found'); // ← 이 에러가 발생
}
```

**문제점**:
- 백엔드 로딩 중이거나 일시적 오류 시 `error` 상태가 `true`로 전환
- `hasError = !!error`로 인해 즉시 EmptyCard 렌더링
- 이전 캐시 데이터도 사라짐 (React Query 기본 동작)

---

## 재현 시나리오

### 시나리오 A: 백그라운드 리페치 중 네트워크 오류
1. 사용자가 아티클 상세 페이지 접속
2. 데이터 정상 로딩 및 렌더링 (캐시 저장)
3. 사용자가 다른 탭으로 전환 후 10분 후 다시 돌아옴
4. `refetchOnWindowFocus: true` → 백그라운드 리페치 시작
5. 네트워크 일시적 불안정 또는 서버 응답 지연
6. `error` 상태가 `true`로 전환
7. `hasError = true` → EmptyCard 렌더링

### 시나리오 B: 쿼리 무효화 체인 반응
1. 사용자가 관리자 페이지에서 아티클 수정
2. `queryClient.invalidateQueries(['articles'])` 호출
3. 메인 페이지에서 보고 있던 상세 페이지의 쿼리도 무효화
4. 리페치 시작 → 짧은 순간 `data = undefined`
5. `!isLoading && !article` → `hasError = true`
6. EmptyCard 렌더링

### 시나리오 C: staleTime 만료 후 리페치 실패
1. 페이지를 10분 이상 열어둠 (staleTime 경과)
2. 스크롤 또는 인터랙션 시 React Query가 백그라운드 리페치 트리거
3. 서버 응답 중 `response.data`가 `null`/`undefined` (백엔드 일시적 버그)
4. `throw new Error('Article not found')` 발생
5. `hasError = true` → EmptyCard 렌더링

---

## 모범 사례 및 개선 방안

### 1. React Query 설정 최적화

#### 개선안 1-1: 상세 페이지는 리페치 최소화

```typescript
// useArticleQuery.ts
export function useArticleQuery(businessId: string) {
  return useQuery({
    queryKey: ['articles', businessId],
    queryFn: () => articleApi.getByBusinessId(businessId),
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 가비지 컬렉션 30분 (이전 cacheTime)
    enabled: !!businessId,

    // 상세 페이지는 포커스 시 리페치 불필요
    refetchOnWindowFocus: false,

    // 마운트 시 stale 상태일 때만 리페치
    refetchOnMount: 'stale' as const,

    // 네트워크 재연결 시 stale 상태일 때만 리페치
    refetchOnReconnect: 'stale' as const,

    // 이전 데이터를 유지하면서 백그라운드 업데이트
    placeholderData: (previousData) => previousData,
  });
}
```

**참고 자료**:
- [React Query: Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [Preventing Unnecessary Refetches](https://tkdodo.eu/blog/react-query-best-practices#use-refetch-on-window-focus-wisely)

#### 개선안 1-2: 에러 재시도 정책 개선

```typescript
export function useArticleQuery(businessId: string) {
  return useQuery({
    queryKey: ['articles', businessId],
    queryFn: () => articleApi.getByBusinessId(businessId),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,

    // 네트워크 오류 시 3번 재시도 (지수 백오프)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // 404는 재시도하지 않음 (진짜 없는 아티클)
    retryOnMount: false,
    throwOnError: false, // 에러를 던지지 않고 error 상태로 관리
  });
}
```

**참고 자료**:
- [React Query: Retry Configuration](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries)

### 2. 컴포넌트 로딩 상태 개선

#### 개선안 2-1: isFetching 상태 구분

[ArticleDetailPage.tsx:31](../../frontend/src/main/pages/ArticleDetailPage.tsx#L31) 수정:

```typescript
const {
  data: article,
  isLoading,      // 최초 로딩 (캐시 없음)
  isFetching,     // 백그라운드 리페치 중
  error,
  isError
} = useArticleQuery(businessId!);

// 에러 조건 개선: 최초 로딩이 아니고 이전 데이터가 있으면 에러 무시
const hasError = isError && !isLoading && !article;

// 백그라운드 리페치 중에도 이전 데이터 유지
const displayArticle = article; // placeholderData 덕분에 유지됨
```

**차이점**:
- `isLoading`: **최초 로딩**만 `true` (캐시 없음 + 로딩 중)
- `isFetching`: **모든 네트워크 요청** 중 `true` (백그라운드 리페치 포함)
- `isError`: 에러 발생 여부 (boolean)
- `error`: 에러 객체 자체

**개선 효과**:
- 백그라운드 리페치 실패 시에도 이전 데이터 유지
- 사용자는 계속 콘텐츠를 볼 수 있음
- 백그라운드 리페치 중임을 표시 가능 (옵션)

#### 개선안 2-2: 에러 세분화 처리

```typescript
// ArticleDetailPage.tsx
const { data: article, isLoading, isFetching, error, isError } = useArticleQuery(businessId!);

// 에러 타입 구분
const is404Error = error?.message?.includes('404') || error?.message?.includes('not found');
const isNetworkError = error?.message?.includes('network') || error?.message?.includes('timeout');

// 에러 상태 판단 로직 개선
const hasError = isError && !isLoading && !article;
const showErrorMessage = hasError && is404Error; // 404만 "없음" 메시지 표시
const showRetryMessage = hasError && isNetworkError; // 네트워크 오류는 재시도 유도

return (
  <div className={styles.container}>
    {isLoading ? (
      // 로딩 스켈레톤
    ) : showErrorMessage ? (
      // 404 에러: 아티클 없음 메시지
      <EmptyCard message="요청한 아티클이 존재하지 않습니다." />
    ) : showRetryMessage ? (
      // 네트워크 에러: 재시도 안내
      <EmptyCard
        message="일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        action={
          <Button onClick={() => refetch()}>다시 시도</Button>
        }
      />
    ) : article ? (
      // 정상 렌더링
      <>...</>
    ) : null}

    {/* 백그라운드 리페치 중 표시 (선택사항) */}
    {isFetching && !isLoading && (
      <div className={styles.refreshIndicator}>
        <Spinner size="sm" /> 업데이트 중...
      </div>
    )}
  </div>
);
```

**참고 자료**:
- [Error Handling in React Query](https://tkdodo.eu/blog/react-query-error-handling)
- [Status Checks in React Query](https://tanstack.com/query/latest/docs/framework/react/guides/queries#query-status)

### 3. 쿼리 키 전략 개선

#### 개선안 3-1: 세분화된 무효화

관리자 페이지에서 아티클 수정 시:

```typescript
// ❌ 나쁜 예: 모든 아티클 쿼리 무효화
queryClient.invalidateQueries(['articles']);

// ✅ 좋은 예: 특정 아티클만 무효화
queryClient.invalidateQueries(['articles', businessId]);

// ✅ 더 좋은 예: 상세 쿼리는 직접 업데이트, 목록만 무효화
queryClient.setQueryData(['articles', businessId], updatedArticle);
queryClient.invalidateQueries(['articles', { page: 0 }]); // 목록만
```

**참고 자료**:
- [Query Invalidation in React Query](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)

### 4. API 응답 처리 개선

#### 개선안 4-1: 백엔드 응답 안정성 검증

```typescript
// articleApi.ts
getByBusinessId: async (businessId: string): Promise<ArticleDetail> => {
  try {
    const response = await apiClient.callApi<ArticleDetail>(`/api/articles/${businessId}`);

    // 응답 데이터 검증 강화
    if (!response) {
      throw new Error('NO_RESPONSE');
    }

    if (!response.data) {
      // HTTP 상태 코드에 따라 구분
      if (response.status === 404) {
        throw new Error('ARTICLE_NOT_FOUND');
      } else {
        throw new Error('INVALID_RESPONSE');
      }
    }

    return response.data;
  } catch (error) {
    // 에러 타입별 로깅
    console.error('[ArticleAPI] Error fetching article:', {
      businessId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
```

#### 개선안 4-2: 백엔드 로깅 강화

백엔드에서 404가 아닌데 `data: null` 응답이 가는 경우를 추적:

```java
// ArticleController.java (추정)
@GetMapping("/api/articles/{businessId}")
public ResponseEntity<ArticleDetailDto> getArticle(@PathVariable String businessId) {
    try {
        ArticleDetailDto article = articleService.getByBusinessId(businessId);

        if (article == null) {
            // 데이터가 없는 이유 로깅
            log.warn("Article not found or returned null: businessId={}", businessId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(article);
    } catch (Exception e) {
        log.error("Error fetching article: businessId={}, error={}", businessId, e.getMessage(), e);
        throw e;
    }
}
```

---

## 제안하는 단계별 개선 계획

### Phase 1: 즉각적인 개선 (High Priority)

1. **React Query 설정 최적화**
   - [useArticleQuery.ts](../../frontend/src/main/entities/article/api/useArticleQuery.ts) 수정
   - `refetchOnWindowFocus: false` 추가
   - `placeholderData` 설정으로 이전 데이터 유지
   - **예상 시간**: 30분

2. **에러 조건 로직 개선**
   - [ArticleDetailPage.tsx:125](../../frontend/src/main/pages/ArticleDetailPage.tsx#L125) 수정
   - `isError`, `isFetching` 상태 활용
   - **예상 시간**: 1시간

3. **API 응답 검증 강화**
   - [articleApi.ts:57-63](../../frontend/src/main/entities/article/api/articleApi.ts#L57-L63) 수정
   - 에러 메시지 세분화 (404 vs 500 vs 네트워크)
   - **예상 시간**: 1시간

### Phase 2: 중기 개선 (Medium Priority)

4. **에러 UI/UX 개선**
   - 404 vs 네트워크 오류 메시지 구분
   - 재시도 버튼 추가
   - **예상 시간**: 2시간

5. **백그라운드 리페치 인디케이터**
   - 리페치 중 미세한 로딩 표시
   - 사용자에게 업데이트 중임을 알림
   - **예상 시간**: 1시간

6. **쿼리 무효화 전략 개선**
   - 관리자 페이지에서 세분화된 무효화
   - Optimistic Updates 도입
   - **예상 시간**: 3시간

### Phase 3: 장기 개선 (Low Priority)

7. **백엔드 로깅 및 모니터링**
   - API 응답 시간 추적
   - 404/500 에러율 모니터링
   - **예상 시간**: 4시간

8. **React Query Devtools 활용**
   - 개발 환경에서 쿼리 상태 실시간 모니터링
   - 프로덕션 환경에서 에러 리포팅 연동
   - **예상 시간**: 2시간

---

## 검증 방법

### 수동 테스트 시나리오

1. **정상 플로우**
   - 아티클 상세 페이지 접속
   - 데이터 로딩 확인
   - 10초 대기 → 에러 없음 확인

2. **탭 전환 테스트**
   - 아티클 페이지 열기
   - 다른 탭으로 전환 (10분 대기)
   - 원래 탭으로 복귀 → 깜빡임 없이 유지 확인

3. **네트워크 오류 시뮬레이션**
   - Chrome DevTools → Network → Throttling → Offline
   - 페이지 새로고침
   - 에러 메시지 + 재시도 버튼 확인
   - Online 전환 후 재시도 → 정상 복구 확인

4. **관리자 페이지 연동 테스트**
   - 메인 페이지에서 아티클 열어두기
   - 관리자 페이지에서 해당 아티클 수정
   - 메인 페이지 반응 확인 (깜빡임 없음)

### 자동화 테스트 (선택사항)

```typescript
// ArticleDetailPage.test.tsx
describe('ArticleDetailPage', () => {
  it('should keep previous data during background refetch', async () => {
    const { rerender } = renderWithQueryClient(<ArticleDetailPage />);

    // 최초 로딩
    await waitFor(() => {
      expect(screen.getByText('Sample Article')).toBeInTheDocument();
    });

    // 백그라운드 리페치 트리거 (stale 상태로 전환)
    act(() => {
      queryClient.invalidateQueries(['articles']);
    });

    // 이전 데이터가 여전히 보여야 함
    expect(screen.getByText('Sample Article')).toBeInTheDocument();
    expect(screen.queryByText('아티클을 찾을 수 없습니다')).not.toBeInTheDocument();
  });

  it('should show retry button on network error', async () => {
    server.use(
      rest.get('/api/articles/:id', (req, res, ctx) => {
        return res.networkError('Failed to connect');
      })
    );

    renderWithQueryClient(<ArticleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/일시적인 오류/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
    });
  });
});
```

---

## 측정 지표

개선 효과를 측정하기 위한 지표:

1. **플래싱 오류 발생률**
   - 목표: 플래싱 버그 리포트 **제로**
   - 측정: 사용자 피드백, Sentry 에러 리포트

2. **페이지 안정성**
   - 목표: 페이지 전환 후 30초 동안 레이아웃 변경 없음
   - 측정: Cumulative Layout Shift (CLS) < 0.1

3. **API 재시도 성공률**
   - 목표: 일시적 네트워크 오류 시 재시도 성공률 **95% 이상**
   - 측정: React Query retry 로그 분석

4. **사용자 만족도**
   - 목표: "페이지가 갑자기 사라진다" 피드백 **제로**
   - 측정: 사용자 설문, 이슈 트래커

---

## 참고 자료

### React Query 모범 사례
- [React Query Best Practices - TkDodo](https://tkdodo.eu/blog/react-query-best-practices)
- [Important Defaults - React Query Docs](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [Query Status Management](https://tanstack.com/query/latest/docs/framework/react/guides/queries#query-status)
- [Error Handling in React Query](https://tkdodo.eu/blog/react-query-error-handling)

### React Query 고급 패턴
- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Query Invalidation Strategies](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
- [Placeholder Data and Initial Data](https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data)
- [Retry Configuration](https://tanstack.com/query/latest/docs/framework/react/guides/query-retries)

### 일반 데이터 페칭 패턴
- [React Data Fetching Patterns](https://www.patterns.dev/react/data-fetching)
- [Preventing UI Flashing During Loading States](https://kentcdodds.com/blog/stop-using-isloading-booleans)

---

## 관련 파일

**프론트엔드:**
- [frontend/src/main/pages/ArticleDetailPage.tsx](../../frontend/src/main/pages/ArticleDetailPage.tsx)
- [frontend/src/main/entities/article/api/useArticleQuery.ts](../../frontend/src/main/entities/article/api/useArticleQuery.ts)
- [frontend/src/main/entities/article/api/articleApi.ts](../../frontend/src/main/entities/article/api/articleApi.ts)

**백엔드:**
- 백엔드 ArticleController (경로 확인 필요)
- 백엔드 ArticleService (경로 확인 필요)

---

**다음 액션**: Phase 1 구현 시작 - React Query 설정 최적화 및 에러 조건 로직 개선

---

## 추가 고려사항

### A. 프로젝트 상세 페이지와의 일관성

[ProjectDetailPage](../../frontend/src/main/pages/ProjectDetailPage)도 동일한 패턴을 사용하는지 확인하고, 개선 사항을 일관되게 적용해야 합니다.

### B. 네트워크 상태 감지

`@tanstack/react-query`는 네트워크 상태를 자동 감지하지만, 사용자에게 명시적으로 오프라인 상태를 알리는 UI 추가를 고려:

```typescript
import { useOnlineManager } from '@tanstack/react-query';

const isOnline = useOnlineManager().isOnline();

{!isOnline && (
  <Banner type="warning">
    오프라인 상태입니다. 일부 기능이 제한될 수 있습니다.
  </Banner>
)}
```

### C. Suspense 경계 활용 (향후 고려)

React 18+ Suspense를 활용하여 로딩 상태를 더 선언적으로 관리:

```typescript
// React Query v5+ with Suspense
export function useArticleQuery(businessId: string) {
  return useSuspenseQuery({
    queryKey: ['articles', businessId],
    queryFn: () => articleApi.getByBusinessId(businessId),
  });
}

// ArticleDetailPage.tsx
<Suspense fallback={<ArticleDetailSkeleton />}>
  <ArticleDetailContent businessId={businessId} />
</Suspense>
```

**참고 자료**:
- [React Query with Suspense](https://tanstack.com/query/latest/docs/framework/react/guides/suspense)
