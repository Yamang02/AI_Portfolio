# 테마 시스템 마이그레이션 가이드

## 개요

디자인 시스템에 테마 관리 기능을 통합했습니다. 이제 테마 관련 기능은 디자인 시스템에서 제공됩니다.

## 변경 사항

### 이전 구조
- 테마 관리: `shared/providers/ThemeProvider`
- 테마 타입: `shared/types/common.types`

### 새로운 구조
- 테마 관리: `design-system/providers/ThemeProvider`
- 테마 타입: `design-system/types`

## 마이그레이션 방법

### 1. Import 경로 변경

**이전:**
```tsx
import { ThemeProvider, useTheme } from '@/shared/providers/ThemeProvider';
import type { Theme } from '@/shared/types/common.types';
```

**새로운:**
```tsx
import { ThemeProvider, useTheme, type Theme } from '@/design-system';
```

또는

```tsx
import { ThemeProvider, useTheme } from '@/design-system/providers';
import type { Theme } from '@/design-system/types';
```

### 2. 사용 예시

#### App 레벨에서 사용

```tsx
import { ThemeProvider } from '@/design-system';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

#### 컴포넌트에서 사용

```tsx
import { useTheme } from '@/design-system';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      현재 테마: {theme}
    </button>
  );
}
```

## 호환성

기존 `shared/providers/ThemeProvider`는 계속 작동하지만, 새로운 코드에서는 디자인 시스템의 ThemeProvider를 사용하는 것을 권장합니다.

## 장점

1. **일관성**: 디자인 시스템의 CSS 변수와 테마 관리가 통합됨
2. **명확성**: 테마 관련 기능이 디자인 시스템에 명확히 위치함
3. **재사용성**: 디자인 시스템을 독립적으로 사용할 수 있음
4. **유지보수**: 테마 관련 변경사항이 한 곳에 집중됨

## 마이그레이션 체크리스트

- [ ] `MainApp.tsx`에서 import 경로 변경
- [ ] `AdminApp.tsx`에서 import 경로 변경
- [ ] `Header.tsx` 등 컴포넌트에서 import 경로 변경
- [ ] 이스터에그 컴포넌트에서 import 경로 변경
- [ ] 테스트 실행하여 정상 작동 확인
