# 모바일 UI 관리 가이드

## 개요

이 문서는 프론트엔드 애플리케이션에서 모바일 환경을 위한 반응형 UI 관리 전략을 설명합니다.

## 전략: 완전 비활성화 + 안내 메시지

모바일 환경에서는 특정 고급 기능(이스터에그, 히스토리 패널)을 **완전히 비활성화**하고, 사용자에게 안내 메시지를 표시합니다.

### 장점

1. **간단하고 명확한 UX**: 복잡한 기능을 모바일에서 억지로 제공하지 않음
2. **성능 최적화**: 불필요한 컴포넌트 렌더링 방지
3. **화면 공간 효율**: 작은 화면에서 핵심 기능에 집중

---

## 구현 구조

### 1. 반응형 기준

#### Breakpoints (Tailwind 기준)

```typescript
// shared/lib/constants/responsive.ts
export const FEATURE_BREAKPOINTS = {
  EASTER_EGG: 768,           // md - 모바일에서는 이스터에그 비활성화
  CHAT_HISTORY_PANEL: 768,   // md - 모바일에서는 히스토리 패널 비활성화
  FULL_CHAT_HISTORY: 1024,   // lg - 태블릿은 축약 버전
} as const;
```

- **모바일**: `< 768px` (Tailwind `md` 이하)
- **태블릿**: `768px ~ 1024px` (Tailwind `md` ~ `lg`)
- **데스크톱**: `>= 1024px` (Tailwind `lg` 이상)

---

### 2. 핵심 훅

#### `useResponsive`

디바이스 타입을 감지합니다.

```typescript
// shared/lib/hooks/useResponsive.ts
import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
  };
};
```

#### `useFeatureAvailability`

기능 사용 가능 여부를 반환합니다.

```typescript
// shared/lib/hooks/useFeatureAvailability.ts
import { useResponsive } from './useResponsive';

export const useFeatureAvailability = () => {
  const { isMobile, isTablet } = useResponsive();

  return {
    canUseEasterEgg: !isMobile,          // 모바일에서 이스터에그 비활성화
    canUseChatHistoryPanel: !isMobile,   // 모바일에서 히스토리 패널 비활성화
    canUseFullChatHistory: !isMobile && !isTablet,  // 데스크톱만 전체 히스토리
    shouldShowMobileNotice: isMobile,    // 모바일에 안내 메시지 표시
  };
};
```

---

### 3. UI 컴포넌트

#### `MobileFeatureNotice`

모바일 사용자에게 PC 전용 기능을 안내합니다.

```typescript
// shared/ui/MobileFeatureNotice.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const MobileFeatureNotice = () => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('mobile-feature-notice-dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('mobile-feature-notice-dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-4 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="pr-8">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>PC 환경</strong>에서 채팅 히스토리 및 특별 기능을 이용하실 수 있습니다.
        </p>
        <button
          onClick={handleDismiss}
          className="text-xs text-blue-600 dark:text-blue-400 underline mt-2 hover:text-blue-800 dark:hover:text-blue-200"
        >
          다시 보지 않기
        </button>
      </div>
    </div>
  );
};
```

**특징**:
- localStorage를 통해 "다시 보지 않기" 기능 제공
- 다크모드 지원
- 닫기 버튼 제공

---

## 적용 예시

### 1. 이스터에그 제한

#### HomePage.tsx

```typescript
import { useFeatureAvailability } from '../../shared/lib/hooks/useFeatureAvailability';

const HomePage = () => {
  const { canUseEasterEgg } = useFeatureAvailability();

  const handleChatInputSend = (message: string) => {
    // 모바일에서는 이스터에그 체크 안 함
    if (canUseEasterEgg) {
      const { shouldBlock, triggers } = checkEasterEggTrigger(message, isEasterEggMode);

      if (triggers.length > 0) {
        triggerEasterEggs(triggers, message, triggerEasterEgg);
        if (shouldBlock) return;
      }

      if (isEasterEggMode) return;
    }

    // 일반 챗봇 메시지 처리
    setPendingMessage(message);
    setMessageToSend(message);
  };

  // ...
};
```

### 2. 히스토리 패널 제한

#### PortfolioSection.tsx

```typescript
import { useFeatureAvailability } from '../../../shared/lib/hooks/useFeatureAvailability';

const PortfolioSection = () => {
  const { canUseChatHistoryPanel } = useFeatureAvailability();

  return (
    <section>
      {/* 프로젝트, 경력, 교육, 자격증 카드들... */}

      {/* 모바일에서는 히스토리 패널 렌더링 안 함 */}
      {canUseChatHistoryPanel && (
        isEasterEggMode ? (
          <EasterEggListPanel ... />
        ) : (
          <HistoryPanel ... />
        )
      )}
    </section>
  );
};
```

### 3. 안내 메시지 표시

#### MainApp.tsx

```typescript
import { MobileFeatureNotice } from '../shared/ui/MobileFeatureNotice';
import { useFeatureAvailability } from '../shared/lib/hooks/useFeatureAvailability';

const MainAppContent = () => {
  const { shouldShowMobileNotice } = useFeatureAvailability();

  return (
    <div>
      <Header />

      {/* 모바일에만 안내 메시지 표시 */}
      {shouldShowMobileNotice && (
        <div className="container mx-auto px-4 pt-4">
          <MobileFeatureNotice />
        </div>
      )}

      <Routes>
        {/* 페이지들... */}
      </Routes>
    </div>
  );
};
```

---

## Public API (Shared Layer)

### Export 구조

```typescript
// shared/index.ts
export { useResponsive, useFeatureAvailability } from './lib/hooks';
export { FEATURE_BREAKPOINTS } from './lib/constants';
export { MobileFeatureNotice } from './ui/MobileFeatureNotice';
```

### 사용 예시

```typescript
// 다른 계층(features, pages)에서 사용
import {
  useFeatureAvailability,
  MobileFeatureNotice
} from '@shared';

// 또는 상대 경로
import { useFeatureAvailability } from '../../shared';
```

---

## 테스트 전략

### 반응형 테스트

```typescript
describe('Mobile UI Management', () => {
  it('should disable easter egg on mobile', () => {
    window.innerWidth = 375; // iPhone size
    const { result } = renderHook(() => useFeatureAvailability());
    expect(result.current.canUseEasterEgg).toBe(false);
  });

  it('should hide history panel on mobile', () => {
    window.innerWidth = 375;
    const { queryByTestId } = render(<PortfolioSection />);
    expect(queryByTestId('history-panel')).toBeNull();
  });

  it('should show mobile notice on mobile', () => {
    window.innerWidth = 375;
    const { result } = renderHook(() => useFeatureAvailability());
    expect(result.current.shouldShowMobileNotice).toBe(true);
  });

  it('should enable all features on desktop', () => {
    window.innerWidth = 1920;
    const { result } = renderHook(() => useFeatureAvailability());
    expect(result.current.canUseEasterEgg).toBe(true);
    expect(result.current.canUseChatHistoryPanel).toBe(true);
  });
});
```

---

## 향후 확장 가능성

### 옵션 B: 모바일 전용 간소화 UI

모바일 전용 간소화 UI를 제공하고 싶다면:

```typescript
// shared/ui/MobileChatHistory.tsx
const MobileChatHistory = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 하단 시트 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 rounded-full bg-blue-500 p-3"
      >
        <HistoryIcon />
      </button>

      {/* 하단 시트 모달 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="absolute bottom-0 w-full bg-white rounded-t-xl max-h-[60vh] overflow-auto">
            {/* 축약된 히스토리 목록 */}
          </div>
        </div>
      )}
    </>
  );
};

// PortfolioSection에서 조건부 렌더링
{canUseChatHistoryPanel ? (
  isMobile ? <MobileChatHistory /> : <DesktopHistoryPanel />
) : null}
```

---

## 베스트 프랙티스

### ✅ DO

1. **조기 리턴**: 모바일에서는 기능을 조기 리턴하여 불필요한 연산 방지
   ```typescript
   if (!canUseEasterEgg) return;
   ```

2. **조건부 렌더링**: 컴포넌트 자체를 렌더링하지 않음
   ```typescript
   {canUseChatHistoryPanel && <HistoryPanel />}
   ```

3. **사용자 안내**: 기능 제한 시 안내 메시지 제공
   ```typescript
   {shouldShowMobileNotice && <MobileFeatureNotice />}
   ```

4. **localStorage 활용**: 사용자 선택 기억
   ```typescript
   localStorage.setItem('mobile-feature-notice-dismissed', 'true');
   ```

### ❌ DON'T

1. **CSS만으로 숨기기**: DOM에는 남아있어 성능 저하
   ```typescript
   // ❌ 나쁨
   <div className="hidden md:block">
     <HistoryPanel />
   </div>

   // ✅ 좋음
   {canUseChatHistoryPanel && <HistoryPanel />}
   ```

2. **중복 체크**: 여러 곳에서 같은 조건 체크
   ```typescript
   // ❌ 나쁨
   if (window.innerWidth < 768) { ... }

   // ✅ 좋음
   const { isMobile } = useResponsive();
   if (isMobile) { ... }
   ```

3. **hard-coded breakpoints**: 상수 사용
   ```typescript
   // ❌ 나쁨
   if (width < 768) { ... }

   // ✅ 좋음
   import { FEATURE_BREAKPOINTS } from '@shared';
   if (width < FEATURE_BREAKPOINTS.EASTER_EGG) { ... }
   ```

---

## 파일 구조 요약

```
frontend/src/main/
├── shared/
│   ├── lib/
│   │   ├── hooks/
│   │   │   ├── useResponsive.ts
│   │   │   ├── useFeatureAvailability.ts
│   │   │   └── index.ts
│   │   └── constants/
│   │       ├── responsive.ts
│   │       └── index.ts
│   ├── ui/
│   │   └── MobileFeatureNotice.tsx
│   └── index.ts
├── layout/components/
│   └── HomePage.tsx (이스터에그 제한 적용)
├── features/projects/components/
│   └── PortfolioSection.tsx (히스토리 패널 제한 적용)
└── app/
    └── MainApp.tsx (안내 메시지 통합)
```

---

## 마이그레이션 체크리스트

새로운 기능을 모바일에서 제한하려면:

- [ ] `FEATURE_BREAKPOINTS`에 새 breakpoint 추가
- [ ] `useFeatureAvailability`에 새 기능 플래그 추가
- [ ] 해당 기능 컴포넌트에서 조건부 렌더링 적용
- [ ] 필요 시 `MobileFeatureNotice` 메시지 업데이트
- [ ] 테스트 코드 작성
- [ ] 다양한 디바이스에서 수동 테스트

---

**작성일**: 2025-11-15
**버전**: 1.0
**관련 문서**: [Mode-Based UI Control Patterns](./mode-based-ui-control-patterns.md)
