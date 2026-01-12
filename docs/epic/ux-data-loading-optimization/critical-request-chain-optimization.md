# 크리티컬 요청 체인 최적화

## 문제 분석

**최상 경로 최대 지연 시간**: 1,723ms

### 주요 병목 지점

1. **홈페이지에서 불필요한 데이터 로딩**
   - `projects` API: 1,723ms
   - `education` API: 1,636ms
   - `experiences` API: 1,616ms
   - `certifications` API: 1,599ms
   - 홈페이지에서는 이 데이터가 필요 없음

2. **ArticleCard가 초기 번들에 포함**
   - `ArticleCard`가 `design-system/components/index.ts`에서 export되어 초기 로드 체인에 포함
   - ArticleCard는 ArticleListPage에서만 사용됨 (lazy loading 페이지)

3. **Admin 관련 코드가 초기 체인에 포함**
   - `antd.js`: 3,428.92 KiB
   - `@ant-design_icons.js`: 1,239.55 KiB
   - AdminApp은 lazy loading이지만, 일부 admin 코드가 초기 체인에 포함됨

## 적용된 최적화

### ✅ 1. 홈페이지 데이터 로딩 지연

**변경 사항**:
- `AppProvider`에서 홈페이지(`/`)일 때 데이터 로딩 비활성화
- 다른 페이지로 이동할 때만 데이터 로드

**수정 파일**:
- `frontend/src/main/app/providers/AppProvider.tsx`
- `frontend/src/main/entities/project/api/useProjectsQuery.ts`
- `frontend/src/main/entities/experience/api/useExperienceQuery.ts`
- `frontend/src/main/entities/education/api/useEducationQuery.ts`
- `frontend/src/main/entities/certification/api/useCertificationQuery.ts`

**코드 변경**:
```typescript
// AppProvider.tsx
const location = useLocation();
const isHomePage = location.pathname === '/';
const shouldLoadData = !isHomePage;

const { data: projects = [] } = useProjectsQuery(undefined, {
  enabled: shouldLoadData,
});
```

### ✅ 2. ArticleCard를 design-system에서 제거

**변경 사항**:
- `ArticleCard`를 `design-system/components/index.ts`에서 제거
- 필요한 페이지에서만 직접 import

**수정 파일**:
- `frontend/src/design-system/components/index.ts`
- `frontend/src/main/pages/ArticleListPage.tsx`
- `frontend/src/main/pages/ArticleDetailPage.tsx`

**코드 변경**:
```typescript
// 이전
import { ArticleCard } from '@/design-system';

// 이후
import { ArticleCard } from '@/design-system/components/Card/ArticleCard';
```

## 예상 효과

### 홈페이지 로딩 시간
- **데이터 API 호출 제거**: 4개 API 호출 지연 (약 1.5-1.7초 절감)
- **초기 번들 크기 감소**: ArticleCard 관련 코드 제거
- **크리티컬 체인 길이 단축**: 불필요한 의존성 제거

### 전체 성능
- **LCP 개선**: 홈페이지 초기 로딩 속도 향상
- **TTI 개선**: Time to Interactive 단축
- **네트워크 페이로드 감소**: 불필요한 리소스 로딩 방지

## 추가 최적화 가능 항목

### 1. ARTICLE_CATEGORIES 분리
현재 `ARTICLE_CATEGORIES`가 admin에서 import되어 있음:
- 상수이므로 큰 영향은 없지만, 필요시 공유 상수로 분리 가능

### 2. Prefetch 전략
다른 페이지로 이동할 가능성이 높을 때 데이터 prefetch:
```typescript
// 홈페이지에서 링크 hover 시 prefetch
const handleLinkHover = () => {
  queryClient.prefetchQuery({ ... });
};
```

### 3. 코드 스플리팅 추가
- 무거운 컴포넌트 추가 lazy loading
- 라이브러리 지연 초기화

## 측정 방법

### Chrome DevTools
1. Network 탭에서 "Critical Request Chains" 확인
2. Performance 탭에서 "Main" 스레드 확인
3. Coverage 탭에서 사용하지 않는 코드 확인

### Lighthouse
1. "Avoid long main-thread tasks" 확인
2. "Reduce JavaScript execution time" 확인
3. "Minimize main-thread work" 확인

## 모니터링

### 빌드 후 확인
```bash
npm run build
# dist 폴더에서 청크 크기 확인
# 초기 번들 크기 감소 확인
```

### 런타임 확인
- Network 탭에서 초기 로드 시 API 호출 확인
- 홈페이지에서는 데이터 API 호출이 없어야 함
