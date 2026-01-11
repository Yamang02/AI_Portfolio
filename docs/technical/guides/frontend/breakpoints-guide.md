# Breakpoints 토큰 가이드

## 개요

반응형 디자인을 위한 breakpoint 토큰을 중앙 관리합니다.

**⚠️ 중요**: CSS 변수는 미디어 쿼리에서 사용할 수 없습니다. 미디어 쿼리에서는 직접 픽셀 값을 사용해야 합니다.

## Breakpoint 표준

모든 반응형 디자인은 다음 표준 breakpoint를 사용합니다:

| Breakpoint | 값 | 용도 |
|-----------|-----|------|
| `--breakpoint-mobile` | 767px | 모바일 (max-width) |
| `--breakpoint-tablet` | 768px | 태블릿 시작 (min-width) |
| `--breakpoint-tablet-max` | 1023px | 태블릿 끝 (max-width) |
| `--breakpoint-desktop` | 1024px | 데스크톱 (min-width) |

## CSS 변수 정의

`src/design-system/styles/globals.css`에 정의되어 있습니다:

```css
:root {
  --breakpoint-mobile: 767px;
  --breakpoint-tablet: 768px;
  --breakpoint-tablet-max: 1023px;
  --breakpoint-desktop: 1024px;
}
```

## 사용 예시

### ✅ 올바른 사용법

#### 1. 미디어 쿼리: 직접 픽셀 값 사용

```css
/* ✅ 모바일 전용 (max-width: 767px) */
@media (max-width: 767px) {
  .element {
    font-size: 14px;
  }
}

/* ✅ 태블릿 이상 (min-width: 768px) */
@media (min-width: 768px) {
  .element {
    font-size: 16px;
  }
}

/* ✅ 태블릿 범위 (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ✅ 데스크톱 이상 (min-width: 1024px) */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### 2. 스타일 속성: CSS 변수 사용 가능

```css
.container {
  /* ✅ width 값으로는 CSS 변수 사용 가능 */
  max-width: var(--breakpoint-desktop);
  padding: var(--spacing-4);
  color: var(--color-primary);
}
```

### ❌ 잘못된 사용법 (안티패턴)

```css
/* ❌ CSS 변수를 미디어 쿼리에서 사용 - 작동하지 않음 */
@media (max-width: var(--breakpoint-mobile)) {
  /* 이 코드는 적용되지 않습니다 */
}

/* ❌ CSS 변수를 미디어 쿼리에서 사용 - 작동하지 않음 */
@media (min-width: var(--breakpoint-tablet)) and (max-width: var(--breakpoint-tablet-max)) {
  /* 이 코드는 적용되지 않습니다 */
}
```

**원인**: CSS 변수는 런타임에 평가되지만, 미디어 쿼리는 빌드/파싱 시점에 평가되어야 하므로 호환되지 않습니다.

## TypeScript에서 사용

```typescript
import { breakpoints, mediaQueries } from '@design-system/tokens';

// breakpoint 값 사용
const isMobile = window.innerWidth <= parseInt(breakpoints.mobile);

// 미디어 쿼리 문자열 사용
const mobileQuery = mediaQueries.mobile; // "@media (max-width: 767px)"
```

## 이점

1. **일관성**: 모든 breakpoint 값이 중앙에서 관리됨
2. **타입 안전성**: TypeScript에서 breakpoints 토큰 사용 가능
3. **가독성**: 표준 breakpoint 값으로 코드 이해도 향상
4. **브라우저 호환성**: 직접 픽셀 값 사용으로 모든 브라우저에서 동작 보장

## CSS 변수 사용 정책

| 사용 위치 | CSS 변수 사용 | 직접 픽셀 값 사용 |
|-----------|--------------|----------------|
| **미디어 쿼리** | ❌ 불가능 | ✅ 필수 |
| **스타일 속성 (width, max-width 등)** | ✅ 가능 | ✅ 가능 |
| **다른 CSS 변수 (spacing, color 등)** | ✅ 가능 | - |

### 예시

```css
/* ✅ 올바른 조합 */
@media (min-width: 1024px) {  /* 직접 픽셀 값 */
  .container {
    max-width: var(--breakpoint-desktop);  /* CSS 변수 가능 */
    padding: var(--spacing-4);
    color: var(--color-primary);
  }
}

/* ❌ 잘못된 조합 */
@media (min-width: var(--breakpoint-desktop)) {  /* CSS 변수 불가능 */
  .container {
    max-width: 1024px;
  }
}
```

## 주의사항

1. **미디어 쿼리에서는 항상 직접 픽셀 값 사용**
   - `@media (max-width: 767px)` ✅
   - `@media (max-width: var(--breakpoint-mobile))` ❌

2. **Breakpoint 값 변경 시**
   - `breakpoints.ts` 파일 수정
   - `globals.css`의 CSS 변수 수정
   - 주의: 미디어 쿼리는 자동으로 변경되지 않으므로 수동 수정 필요

3. **일관성 유지**
   - 모든 미디어 쿼리는 표준 breakpoint 값 사용
   - 커스텀 breakpoint 값 사용 지양

## 참고

- Breakpoint 토큰 정의: `src/design-system/tokens/breakpoints.ts`
- CSS 변수 정의: `src/design-system/styles/globals.css`
- 관련 이슈: `docs/issues/frontend/responsive-breakpoint-media-query-fix.md`
