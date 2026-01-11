# 프론트엔드 성능 최적화 가이드

## 📚 목차
1. [중복 컴포넌트 방지](#중복-컴포넌트-방지)
2. [React Query 캐싱 전략](#react-query-캐싱-전략)
3. [유틸리티 함수 통일](#유틸리티-함수-통일)
4. [CSS 기반 최적화](#css-기반-최적화)
5. [체크리스트](#체크리스트)

---

## 중복 컴포넌트 방지

### 문제 정의

동일한 목적의 컴포넌트가 여러 위치에 존재하면 유지보수성이 저하됩니다.

- **문제점**:
  - 버그 수정 시 여러 곳을 수정해야 함
  - 일관성 없는 UI/UX
  - 코드 중복으로 인한 번들 크기 증가

### 예시: 잘못된 구조

```
❌ Bad: 동일한 목적의 컴포넌트가 2개 존재
frontend/src/
├── main/features/article-view/ui/
│   └── ArticleCard.tsx          # 구버전
└── design-system/components/Card/
    └── ArticleCard.tsx          # 신버전
```

**문제점**: 두 컴포넌트가 공존하여 혼란 야기

### 해결 방법: 디자인 시스템 우선 사용

#### 1. 디자인 시스템 컴포넌트 확인

새 컴포넌트를 만들기 전에 디자인 시스템에 이미 존재하는지 확인합니다.

```typescript
// ✅ Good: 디자인 시스템 컴포넌트 사용
import { ArticleCard } from '@/design-system';

export const ArticleListPage = () => {
  return (
    <div>
      {articles.map(article => (
        <ArticleCard key={article.businessId} article={article} />
      ))}
    </div>
  );
};
```

#### 2. 중복 컴포넌트 제거

구버전 컴포넌트를 제거하고 디자인 시스템 컴포넌트로 통일합니다.

```bash
# 중복 컴포넌트 제거
rm frontend/src/main/features/article-view/ui/ArticleCard.tsx
rm frontend/src/main/features/article-view/ui/ArticleCard.module.css
```

#### 3. import 경로 업데이트

```typescript
// ❌ Bad: 구버전 컴포넌트 import
import { ArticleCard } from '@/main/features/article-view/ui/ArticleCard';

// ✅ Good: 디자인 시스템 컴포넌트 import
import { ArticleCard } from '@/design-system';
```

### 컴포넌트 생성 체크리스트

새 컴포넌트를 만들기 전에 다음을 확인하세요:

1. **디자인 시스템 확인**: `frontend/src/design-system/components/` 또는 Storybook에서 확인
2. **기존 컴포넌트 검색**: 프로젝트 전체에서 유사한 컴포넌트 검색
3. **재사용성 검토**: 다른 곳에서도 사용할 가능성이 있는가?
4. **디자인 시스템 등록**: 재사용 가능하면 디자인 시스템에 등록

---

## React Query 캐싱 전략

### 기본 원칙

- **자주 변경되는 데이터**: 짧은 `staleTime` (5분)
- **자주 변경되지 않는 데이터**: 긴 `staleTime` (30분 이상)
- **통계 데이터**: 긴 `staleTime` (30분)

### 예시: 통계 API 캐싱

```typescript
// ❌ Bad: 짧은 staleTime (통계는 자주 변경되지 않음)
const { data: statistics } = useQuery({
  queryKey: ['article', 'statistics'],
  queryFn: fetchArticleStatistics,
  staleTime: 5 * 60 * 1000, // 5분
});

// ✅ Good: 긴 staleTime (통계는 자주 변경되지 않음)
const { data: statistics } = useQuery({
  queryKey: ['article', 'statistics'],
  queryFn: fetchArticleStatistics,
  staleTime: 30 * 60 * 1000, // 30분
});
```

### 캐싱 전략 가이드라인

| 데이터 유형 | staleTime | 이유 |
|------------|-----------|------|
| 목록 조회 | 5분 | 자주 변경될 수 있음 |
| 상세 조회 | 5분 | 수정 가능성 있음 |
| 통계 데이터 | 30분 | 자주 변경되지 않음 |
| 설정 데이터 | 60분 | 거의 변경되지 않음 |

---

## 유틸리티 함수 통일

### 문제: 중복된 날짜 포맷 로직

여러 컴포넌트에서 동일한 날짜 포맷 로직이 중복됩니다.

```typescript
// ❌ Bad: 각 컴포넌트마다 날짜 포맷 로직 중복
// ArticleCard.tsx
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

// ArticleTable.tsx
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};
```

### 해결 방법: 공통 유틸리티 함수 생성

#### 1. 유틸리티 함수 생성

```typescript
// shared/utils/dateUtils.ts
export function formatArticleDate(dateString?: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
}

export function formatArticleDateTime(dateString?: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
```

#### 2. 컴포넌트에서 사용

```typescript
// ✅ Good: 공통 유틸리티 함수 사용
import { formatArticleDate } from '@shared/utils/dateUtils';

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <div>
      <span>{formatArticleDate(article.publishedAt)}</span>
    </div>
  );
};
```

### 유틸리티 함수 위치

- **공통 유틸리티**: `frontend/src/shared/utils/`
- **도메인별 유틸리티**: `frontend/src/main/features/{feature}/utils/`
- **컴포넌트별 유틸리티**: 컴포넌트 파일 내부 (재사용 불가능한 경우만)

---

## CSS 기반 최적화

### 문제: JavaScript 기반 폰트 크기 조정

ResizeObserver와 DOM 조작으로 성능 저하가 발생할 수 있습니다.

```typescript
// ❌ Bad: JavaScript로 폰트 크기 조정
useEffect(() => {
  const adjustFontSize = () => {
    if (!titleRef.current) return;
    
    const titleElement = titleRef.current;
    const containerWidth = container.clientWidth - 32;
    const minFontSize = 0.75;
    const maxFontSize = 1.125;
    
    // 복잡한 DOM 조작 로직...
    const textWidth = titleElement.scrollWidth;
    // ...
  };
  
  const resizeObserver = new ResizeObserver(() => {
    adjustFontSize();
  });
  
  resizeObserver.observe(titleRef.current.parentElement);
  
  return () => {
    resizeObserver.disconnect();
  };
}, [article.title]);
```

### 해결 방법: CSS로 단순화

```css
/* ✅ Good: CSS로 텍스트 줄임 처리 */
.article-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  max-height: 3em; /* line-height * 2 */
}
```

```typescript
// ✅ Good: CSS만 사용
export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <h3 className={styles.title}>
      {article.title}
    </h3>
  );
};
```

### CSS 최적화 원칙

1. **JavaScript 최소화**: 가능한 한 CSS로 해결
2. **ResizeObserver 사용 최소화**: CSS로 대체 가능한 경우 사용하지 않음
3. **DOM 조작 최소화**: 스타일 조정은 CSS로 처리

---

## 체크리스트

### 컴포넌트 개발 시

- [ ] 디자인 시스템에 이미 존재하는 컴포넌트가 없는가?
- [ ] 프로젝트 전체에서 유사한 컴포넌트가 없는가?
- [ ] 재사용 가능하면 디자인 시스템에 등록했는가?
- [ ] 중복 컴포넌트를 제거했는가?

### React Query 사용 시

- [ ] `staleTime`이 데이터 특성에 맞게 설정되었는가?
- [ ] 통계 데이터는 긴 `staleTime`을 사용하는가?
- [ ] `queryKey`가 적절히 구조화되었는가?

### 유틸리티 함수 사용 시

- [ ] 공통 유틸리티 함수가 있는가?
- [ ] 각 컴포넌트에서 중복된 로직을 작성하지 않았는가?
- [ ] 유틸리티 함수 위치가 적절한가?

### 성능 최적화 시

- [ ] JavaScript 기반 스타일 조정을 CSS로 대체할 수 있는가?
- [ ] ResizeObserver 사용이 필요한가?
- [ ] DOM 조작을 최소화했는가?

---

## 참고 자료

- [React Query 공식 문서](https://tanstack.com/query/latest)
- [CSS 텍스트 줄임 처리](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-line-clamp)
- [프론트엔드 성능 최적화](https://web.dev/performance/)

---

**작성일**: 2025-01-25
**버전**: 1.0
**작성자**: AI Agent (Claude)
