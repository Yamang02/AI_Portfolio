# Breakpoints 토큰 가이드

## 개요

반응형 디자인을 위한 breakpoint 토큰을 CSS 변수로 중앙 관리합니다.

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

### 모바일 전용
```css
@media (max-width: var(--breakpoint-mobile)) {
  /* 모바일 스타일 */
}
```

### 태블릿 이상
```css
@media (min-width: var(--breakpoint-tablet)) {
  /* 태블릿 이상 스타일 */
}
```

### 태블릿 범위
```css
@media (min-width: var(--breakpoint-tablet)) and (max-width: var(--breakpoint-tablet-max)) {
  /* 태블릿 전용 스타일 */
}
```

### 데스크톱 이상
```css
@media (min-width: var(--breakpoint-desktop)) {
  /* 데스크톱 스타일 */
}
```

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
2. **유지보수성**: breakpoint 값 변경 시 한 곳만 수정하면 됨
3. **타입 안전성**: TypeScript에서 breakpoints 토큰 사용 가능
4. **가독성**: 의미 있는 변수명으로 코드 이해도 향상

## 참고

- Breakpoint 토큰 정의: `src/design-system/tokens/breakpoints.ts`
- CSS 변수 정의: `src/design-system/styles/globals.css`
