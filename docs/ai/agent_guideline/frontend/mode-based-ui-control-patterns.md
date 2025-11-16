# FSD에서 모드별 UI 통제 패턴 가이드

## 📋 목차
1. [개요](#개요)
2. [FSD 계층별 처리 방법](#fsd-계층별-처리-방법)
3. [구조적 패턴](#구조적-패턴)
4. [실제 구현 예시](#실제-구현-예시)
5. [패턴 비교 및 선택 가이드](#패턴-비교-및-선택-가이드)

---

## 개요

FSD(Feature-Sliced Design) 아키텍처에서 모드별 UI 통제를 구조적으로 처리하는 방법들을 정리합니다.

### 핵심 원칙
- **관심사 분리**: 모드 로직과 UI 로직 분리
- **재사용성**: 공통 패턴을 shared 레벨로 추출
- **확장성**: 새로운 모드 추가 시 기존 코드 영향 최소화
- **테스트 용이성**: 모드 로직을 독립적으로 테스트 가능

---

## FSD 계층별 처리 방법

### 1. App 레벨: 전역 상태 관리

**역할**: 모드 상태를 전역에서 관리하고 Provider로 제공

**구조**:
```
app/
└── providers/
    └── ModeProvider.tsx  # Context API로 모드 상태 제공
```

**예시**:
```typescript
// app/providers/ModeProvider.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface ModeContextValue {
  currentMode: 'normal' | 'easterEgg' | 'admin';
  setMode: (mode: string) => void;
  isMode: (mode: string) => boolean;
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

export const ModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMode, setCurrentMode] = useState<'normal' | 'easterEgg' | 'admin'>('normal');

  const setMode = (mode: string) => {
    setCurrentMode(mode as any);
  };

  const isMode = (mode: string) => currentMode === mode;

  return (
    <ModeContext.Provider value={{ currentMode, setMode, isMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode must be used within ModeProvider');
  return context;
};
```

### 2. Features 레벨: 모드별 비즈니스 로직

**역할**: 특정 기능의 모드별 동작 정의

**구조**:
```
features/
└── easter-eggs/
    ├── hooks/
    │   ├── useEasterEggMode.ts      # 모드별 로직 훅
    │   └── useModeAwareAction.ts    # 모드 인식 액션 훅
    ├── lib/
    │   └── mode-guards.ts           # 모드 체크 유틸리티
    └── components/
        └── ModeAwareComponent.tsx   # 모드 인식 컴포넌트
```

**예시 1: 모드 가드 유틸리티**
```typescript
// features/easter-eggs/lib/mode-guards.ts

/**
 * 모드별 동작을 제어하는 가드 함수들
 */
export const createModeGuard = <T extends string>(
  allowedModes: T[],
  currentMode: string
) => {
  return allowedModes.includes(currentMode as T);
};

/**
 * 특정 모드에서만 실행되는 함수 래퍼
 */
export const withModeGuard = <T extends (...args: any[]) => any>(
  fn: T,
  allowedModes: string[],
  currentMode: string
): T | (() => void) => {
  if (!allowedModes.includes(currentMode)) {
    return (() => {}) as T; // 빈 함수 반환
  }
  return fn;
};

/**
 * 모드별 값 매핑
 */
export const modeValue = <T>(
  modeMap: Record<string, T>,
  currentMode: string,
  defaultValue: T
): T => {
  return modeMap[currentMode] ?? defaultValue;
};
```

**예시 2: 모드 인식 훅**
```typescript
// features/easter-eggs/hooks/useModeAwareAction.ts

import { useCallback } from 'react';
import { useEasterEggStore } from '../store/easterEggStore';

/**
 * 모드에 따라 다른 동작을 수행하는 훅
 */
export const useModeAwareAction = <T extends (...args: any[]) => any>(
  normalAction: T,
  easterEggAction?: T
) => {
  const { isEasterEggMode } = useEasterEggStore();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (isEasterEggMode && easterEggAction) {
        return easterEggAction(...args);
      }
      return normalAction(...args);
    }) as T,
    [isEasterEggMode, normalAction, easterEggAction]
  );
};
```

### 3. Shared 레벨: 재사용 가능한 패턴

**역할**: 여러 feature에서 공통으로 사용하는 모드 통제 패턴

**구조**:
```
shared/
├── hooks/
│   ├── useConditionalHandler.ts    # 조건부 핸들러 훅
│   └── useModeAwareProps.ts        # 모드별 Props 변환 훅
├── lib/
│   └── mode-utils.ts               # 모드 유틸리티
└── ui/
    └── ModeAwareWrapper.tsx        # 모드 인식 래퍼 컴포넌트
```

**예시 1: 조건부 핸들러 훅**
```typescript
// shared/hooks/useConditionalHandler.ts

import { useCallback } from 'react';

interface UseConditionalHandlerOptions<T extends (...args: any[]) => any> {
  handler: T;
  condition: boolean;
  fallback?: T | (() => void);
}

/**
 * 조건에 따라 핸들러를 실행하거나 차단하는 훅
 */
export const useConditionalHandler = <T extends (...args: any[]) => any>({
  handler,
  condition,
  fallback,
}: UseConditionalHandlerOptions<T>): T => {
  return useCallback(
    ((...args: Parameters<T>) => {
      if (!condition) {
        if (fallback) {
          return (fallback as T)(...args);
        }
        return;
      }
      return handler(...args);
    }) as T,
    [handler, condition, fallback]
  );
};
```

**예시 2: 모드별 Props 변환 훅**
```typescript
// shared/hooks/useModeAwareProps.ts

import { useMemo } from 'react';

interface ModeAwarePropsConfig<T> {
  normal: T;
  easterEgg?: T;
  admin?: T;
}

/**
 * 모드에 따라 다른 Props를 반환하는 훅
 */
export const useModeAwareProps = <T>(
  config: ModeAwarePropsConfig<T>,
  currentMode: string
): T => {
  return useMemo(() => {
    switch (currentMode) {
      case 'easterEgg':
        return config.easterEgg ?? config.normal;
      case 'admin':
        return config.admin ?? config.normal;
      default:
        return config.normal;
    }
  }, [config, currentMode]);
};
```

**예시 3: 모드 인식 래퍼 컴포넌트**
```typescript
// shared/ui/ModeAwareWrapper.tsx

import React, { ReactNode } from 'react';

interface ModeAwareWrapperProps {
  children: ReactNode;
  allowedModes?: string[];
  currentMode: string;
  fallback?: ReactNode;
}

/**
 * 특정 모드에서만 자식 컴포넌트를 렌더링하는 래퍼
 */
export const ModeAwareWrapper: React.FC<ModeAwareWrapperProps> = ({
  children,
  allowedModes,
  currentMode,
  fallback = null,
}) => {
  if (allowedModes && !allowedModes.includes(currentMode)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

---

## 구조적 패턴

### 패턴 1: Custom Hook 패턴 (가장 일반적)

**장점**:
- 로직 재사용 용이
- 테스트 쉬움
- 컴포넌트 코드 간결

**구조**:
```typescript
// features/easter-eggs/hooks/useEasterEggModeControl.ts

import { useEasterEggStore } from '../store/easterEggStore';
import { useCallback } from 'react';

/**
 * 이스터에그 모드별 UI 통제를 위한 통합 훅
 */
export const useEasterEggModeControl = () => {
  const { isEasterEggMode } = useEasterEggStore();

  // 이벤트 핸들러 차단
  const createConditionalHandler = useCallback(
    <T extends (...args: any[]) => any>(
      handler: T,
      allowInEasterEggMode: boolean = false
    ): T => {
      return ((...args: Parameters<T>) => {
        if (isEasterEggMode && !allowInEasterEggMode) {
          return;
        }
        return handler(...args);
      }) as T;
    },
    [isEasterEggMode]
  );

  // 조건부 렌더링
  const renderByMode = useCallback(
    <T,>(normal: T, easterEgg: T): T => {
      return isEasterEggMode ? easterEgg : normal;
    },
    [isEasterEggMode]
  );

  // 스타일 클래스 생성
  const getModeAwareClass = useCallback(
    (normalClass: string, easterEggClass: string): string => {
      return isEasterEggMode ? easterEggClass : normalClass;
    },
    [isEasterEggMode]
  );

  return {
    isEasterEggMode,
    createConditionalHandler,
    renderByMode,
    getModeAwareClass,
  };
};
```

**사용 예시**:
```typescript
// pages/HomePage.tsx
const HomePage: React.FC = () => {
  const { createConditionalHandler } = useEasterEggModeControl();
  
  const handleFocus = () => {
    if (!isChatbotOpen) {
      onChatbotToggle();
    }
  };

  // 모드별로 핸들러 차단
  const handleChatInputFocus = createConditionalHandler(handleFocus, false);

  return (
    <ChatInputBar
      onFocus={handleChatInputFocus}
      // ...
    />
  );
};
```

### 패턴 2: HOC (Higher-Order Component) 패턴

**장점**:
- 컴포넌트 레벨에서 자동 처리
- 여러 컴포넌트에 일괄 적용 가능

**구조**:
```typescript
// shared/ui/hoc/withModeControl.tsx

import React, { ComponentType } from 'react';
import { useEasterEggStore } from '@features/easter-eggs';

interface WithModeControlOptions {
  blockInEasterEggMode?: boolean;
  modeAwareProps?: string[]; // 모드에 따라 변경될 Props 이름들
}

/**
 * 모드별 통제를 자동으로 적용하는 HOC
 */
export const withModeControl = <P extends object>(
  Component: ComponentType<P>,
  options: WithModeControlOptions = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { isEasterEggMode } = useEasterEggStore();

    // 이스터에그 모드에서 차단
    if (options.blockInEasterEggMode && isEasterEggMode) {
      return null;
    }

    // 모드별 Props 변환
    const modeAwareProps = options.modeAwareProps
      ? transformPropsForMode(props, isEasterEggMode, options.modeAwareProps)
      : props;

    return <Component {...(modeAwareProps as P)} />;
  };

  WrappedComponent.displayName = `withModeControl(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

const transformPropsForMode = (
  props: any,
  isEasterEggMode: boolean,
  modeAwareProps: string[]
): any => {
  const transformed = { ...props };
  
  modeAwareProps.forEach(propName => {
    if (propName in props) {
      const propValue = props[propName];
      if (typeof propValue === 'object' && propValue !== null) {
        // 객체인 경우 모드별 값 선택
        transformed[propName] = isEasterEggMode
          ? propValue.easterEgg ?? propValue.normal
          : propValue.normal;
      }
    }
  });

  return transformed;
};
```

**사용 예시**:
```typescript
// components/ChatInputBar.tsx
const ChatInputBarBase: React.FC<ChatInputBarProps> = ({ onFocus, ... }) => {
  // ...
};

// HOC로 래핑
export const ChatInputBar = withModeControl(ChatInputBarBase, {
  blockInEasterEggMode: false,
  modeAwareProps: ['onFocus'], // onFocus를 모드별로 변환
});
```

### 패턴 3: Render Props 패턴

**장점**:
- 유연한 컴포넌트 조합
- 명시적인 제어 흐름

**구조**:
```typescript
// shared/ui/ModeRenderer.tsx

import React, { ReactNode } from 'react';
import { useEasterEggStore } from '@features/easter-eggs';

interface ModeRendererProps {
  normal: ReactNode | (() => ReactNode);
  easterEgg?: ReactNode | (() => ReactNode);
  admin?: ReactNode | (() => ReactNode);
  fallback?: ReactNode;
}

/**
 * 모드에 따라 다른 컴포넌트를 렌더링하는 컴포넌트
 */
export const ModeRenderer: React.FC<ModeRendererProps> = ({
  normal,
  easterEgg,
  admin,
  fallback = null,
}) => {
  const { isEasterEggMode } = useEasterEggStore();
  // const { isAdminMode } = useAdminMode(); // 예시

  if (isEasterEggMode && easterEgg) {
    return <>{typeof easterEgg === 'function' ? easterEgg() : easterEgg}</>;
  }

  // if (isAdminMode && admin) {
  //   return <>{typeof admin === 'function' ? admin() : admin}</>;
  // }

  return <>{typeof normal === 'function' ? normal() : normal}</>;
};
```

**사용 예시**:
```typescript
// pages/HomePage.tsx
<ModeRenderer
  normal={<HistoryPanel {...props} />}
  easterEgg={<EasterEggListPanel {...props} />}
/>
```

### 패턴 4: Strategy 패턴 (복잡한 모드 로직)

**장점**:
- 모드별 전략을 독립적으로 관리
- 새로운 모드 추가 시 확장 용이

**구조**:
```typescript
// features/easter-eggs/lib/mode-strategies.ts

interface ModeStrategy {
  handleFocus: (defaultHandler: () => void) => void;
  handleSubmit: (defaultHandler: (message: string) => void, message: string) => void;
  getPlaceholder: () => string;
  shouldShowButton: () => boolean;
}

class NormalModeStrategy implements ModeStrategy {
  handleFocus(defaultHandler: () => void) {
    defaultHandler();
  }

  handleSubmit(defaultHandler: (message: string) => void, message: string) {
    defaultHandler(message);
  }

  getPlaceholder() {
    return '프로젝트에 대해 궁금한 점을 물어보세요...';
  }

  shouldShowButton() {
    return false;
  }
}

class EasterEggModeStrategy implements ModeStrategy {
  handleFocus(_defaultHandler: () => void) {
    // 이스터에그 모드에서는 아무것도 하지 않음
    return;
  }

  handleSubmit(_defaultHandler: (message: string) => void, message: string) {
    // 이스터에그 트리거만 처리
    // ...
  }

  getPlaceholder() {
    return '이스터에그 모드: 이스터에그를 찾아보세요...';
  }

  shouldShowButton() {
    return true;
  }
}

// Strategy 팩토리
export const createModeStrategy = (mode: string): ModeStrategy => {
  switch (mode) {
    case 'easterEgg':
      return new EasterEggModeStrategy();
    default:
      return new NormalModeStrategy();
  }
};
```

**사용 예시**:
```typescript
// components/ChatInputBar.tsx
const ChatInputBar: React.FC = ({ onSendMessage, onFocus }) => {
  const { isEasterEggMode } = useEasterEggStore();
  const strategy = useMemo(
    () => createModeStrategy(isEasterEggMode ? 'easterEgg' : 'normal'),
    [isEasterEggMode]
  );

  const handleFocus = useCallback(() => {
    strategy.handleFocus(() => onFocus?.());
  }, [strategy, onFocus]);

  const handleSubmit = useCallback((message: string) => {
    strategy.handleSubmit(onSendMessage, message);
  }, [strategy, onSendMessage]);

  return (
    <input
      onFocus={handleFocus}
      placeholder={strategy.getPlaceholder()}
      // ...
    />
  );
};
```

### 패턴 5: Compound Component 패턴

**장점**:
- 관련 컴포넌트들을 논리적으로 그룹화
- 유연한 조합 가능

**구조**:
```typescript
// shared/ui/ModeAwarePanel.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useEasterEggStore } from '@features/easter-eggs';

interface ModeAwarePanelContextValue {
  currentMode: string;
}

const ModeAwarePanelContext = createContext<ModeAwarePanelContextValue | undefined>(undefined);

const ModeAwarePanel: React.FC<{ children: ReactNode }> & {
  Normal: React.FC<{ children: ReactNode }>;
  EasterEgg: React.FC<{ children: ReactNode }>;
} = ({ children }) => {
  const { isEasterEggMode } = useEasterEggStore();

  return (
    <ModeAwarePanelContext.Provider value={{ currentMode: isEasterEggMode ? 'easterEgg' : 'normal' }}>
      {children}
    </ModeAwarePanelContext.Provider>
  );
};

const Normal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const context = useContext(ModeAwarePanelContext);
  if (context?.currentMode !== 'normal') return null;
  return <>{children}</>;
};

const EasterEgg: React.FC<{ children: ReactNode }> = ({ children }) => {
  const context = useContext(ModeAwarePanelContext);
  if (context?.currentMode !== 'easterEgg') return null;
  return <>{children}</>;
};

ModeAwarePanel.Normal = Normal;
ModeAwarePanel.EasterEgg = EasterEgg;

export { ModeAwarePanel };
```

**사용 예시**:
```typescript
// pages/HomePage.tsx
<ModeAwarePanel>
  <ModeAwarePanel.Normal>
    <HistoryPanel {...props} />
  </ModeAwarePanel.Normal>
  <ModeAwarePanel.EasterEgg>
    <EasterEggListPanel {...props} />
  </ModeAwarePanel.EasterEgg>
</ModeAwarePanel>
```

### 패턴 6: 모드 전환 사이드 이펙트 처리

**시나리오**: 모드 전환 시 열려있는 챗봇창 자동 닫기

**방법 1: useEffect로 모드 변경 감지** (추천)
```typescript
// pages/HomePage.tsx
const HomePage: React.FC = () => {
  const { isEasterEggMode } = useEasterEggStore();
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // 모드 전환 시 챗봇 닫기
  useEffect(() => {
    if (isEasterEggMode && isChatbotOpen) {
      setIsChatbotOpen(false);
    }
  }, [isEasterEggMode, isChatbotOpen]);

  return <Chatbot isOpen={isChatbotOpen} onToggle={() => setIsChatbotOpen(!isChatbotOpen)} />;
};
```

**방법 2: Store에서 콜백 제공** (복잡한 경우)
```typescript
// features/easter-eggs/store/easterEggStore.tsx
const toggleEasterEggMode = useCallback(() => {
  setIsEasterEggMode(prev => {
    const newMode = !prev;
    // 모드 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('easterEggModeChanged', { detail: { mode: newMode } }));
    return newMode;
  });
}, []);

// pages/HomePage.tsx
useEffect(() => {
  const handleModeChange = (e: CustomEvent) => {
    if (e.detail.mode && isChatbotOpen) {
      setIsChatbotOpen(false);
    }
  };
  window.addEventListener('easterEggModeChanged', handleModeChange as EventListener);
  return () => window.removeEventListener('easterEggModeChanged', handleModeChange as EventListener);
}, [isChatbotOpen]);
```

**방법 3: 훅으로 추상화**
```typescript
// shared/hooks/useModeTransition.ts
export const useModeTransition = (onModeChange?: (isEasterEggMode: boolean) => void) => {
  const { isEasterEggMode } = useEasterEggStore();
  const prevModeRef = useRef(isEasterEggMode);

  useEffect(() => {
    if (prevModeRef.current !== isEasterEggMode) {
      onModeChange?.(isEasterEggMode);
      prevModeRef.current = isEasterEggMode;
    }
  }, [isEasterEggMode, onModeChange]);
};

// 사용
useModeTransition((isEasterEggMode) => {
  if (isEasterEggMode && isChatbotOpen) {
    setIsChatbotOpen(false);
  }
});
```

---

## 실제 구현 예시

### 예시 1: 현재 프로젝트의 실제 패턴

**현재 사용 중인 패턴**: Custom Hook + 조건부 렌더링

```typescript
// 1. Store에서 모드 상태 제공 (features/easter-eggs/store/)
const { isEasterEggMode } = useEasterEggStore();

// 2. 조건부 렌더링 (pages/HomePage.tsx)
{isEasterEggMode ? (
  <EasterEggListPanel isOpen={isHistoryPanelOpen} onToggle={onHistoryPanelToggle} />
) : (
  <HistoryPanel isOpen={isHistoryPanelOpen} onToggle={onHistoryPanelToggle} {...props} />
)}

// 3. 이벤트 핸들러 차단 (pages/HomePage.tsx)
const handleChatInputFocus = () => {
  if (isEasterEggMode) return; // 조기 반환
  if (!isChatbotOpen) {
    onChatbotToggle();
  }
};

// 4. 스타일 동적 변경 (components/PanelToggle.tsx)
const getColorClass = () => {
  return isEasterEggMode 
    ? 'bg-yellow-500 ...' 
    : 'bg-primary-600 ...';
};
```

### 예시 2: 개선된 구조적 접근

**제안**: Shared 레벨에 재사용 가능한 훅 추가

```typescript
// shared/hooks/useModeControl.ts
import { useEasterEggStore } from '@features/easter-eggs';

export const useModeControl = () => {
  const { isEasterEggMode } = useEasterEggStore();

  // 조건부 핸들러 생성
  const conditionalHandler = useCallback(
    <T extends (...args: any[]) => any>(
      handler: T,
      options?: { allowInEasterEggMode?: boolean }
    ): T => {
      return ((...args: Parameters<T>) => {
        if (isEasterEggMode && !options?.allowInEasterEggMode) {
          return;
        }
        return handler(...args);
      }) as T;
    },
    [isEasterEggMode]
  );

  // 모드별 값 선택
  const modeValue = useCallback(
    <T,>(normal: T, easterEgg: T): T => {
      return isEasterEggMode ? easterEgg : normal;
    },
    [isEasterEggMode]
  );

  // 모드별 클래스 선택
  const modeClass = useCallback(
    (normal: string, easterEgg: string): string => {
      return isEasterEggMode ? easterEgg : normal;
    },
    [isEasterEggMode]
  );

  return {
    isEasterEggMode,
    conditionalHandler,
    modeValue,
    modeClass,
  };
};
```

**사용**:
```typescript
// pages/HomePage.tsx
const HomePage: React.FC = () => {
  const { conditionalHandler, modeValue } = useModeControl();

  const handleFocus = () => {
    if (!isChatbotOpen) {
      onChatbotToggle();
    }
  };

  // 자동으로 모드 체크
  const handleChatInputFocus = conditionalHandler(handleFocus, {
    allowInEasterEggMode: false,
  });

  // 모드별 컴포넌트 선택
  const PanelComponent = modeValue(HistoryPanel, EasterEggListPanel);

  return (
    <>
      <ChatInputBar onFocus={handleChatInputFocus} />
      <PanelComponent {...props} />
    </>
  );
};
```

---

## 패턴 비교 및 선택 가이드

| 패턴 | 복잡도 | 재사용성 | 테스트 용이성 | 사용 시기 |
|------|--------|---------|-------------|----------|
| **Custom Hook** | 낮음 | 높음 | 높음 | 가장 일반적, 추천 |
| **조건부 렌더링** | 매우 낮음 | 낮음 | 중간 | 간단한 컴포넌트 전환 |
| **HOC** | 중간 | 높음 | 중간 | 여러 컴포넌트에 일괄 적용 |
| **Render Props** | 중간 | 높음 | 높음 | 유연한 조합 필요 시 |
| **Strategy** | 높음 | 매우 높음 | 매우 높음 | 복잡한 모드별 로직 |
| **Compound Component** | 중간 | 높음 | 중간 | 관련 컴포넌트 그룹화 |

### 선택 가이드

1. **간단한 조건부 렌더링** → 조건부 렌더링 패턴
   ```typescript
   {isEasterEggMode ? <A /> : <B />}
   ```

2. **이벤트 핸들러 차단** → Custom Hook 패턴
   ```typescript
   const handler = conditionalHandler(originalHandler, { allowInEasterEggMode: false });
   ```

3. **여러 컴포넌트 일괄 적용** → HOC 패턴
   ```typescript
   export const Component = withModeControl(ComponentBase);
   ```

4. **복잡한 모드별 로직** → Strategy 패턴
   ```typescript
   const strategy = createModeStrategy(mode);
   strategy.handleAction();
   ```

5. **유연한 컴포넌트 조합** → Render Props 또는 Compound Component
   ```typescript
   <ModeRenderer normal={<A />} easterEgg={<B />} />
   ```

---

## FSD 계층별 권장 사항

### App 레벨
- ✅ 모드 상태 Provider 제공
- ✅ 전역 모드 설정

### Features 레벨
- ✅ 모드별 비즈니스 로직
- ✅ 모드 인식 훅
- ✅ 모드별 컴포넌트

### Shared 레벨
- ✅ 재사용 가능한 모드 통제 훅
- ✅ 모드 인식 래퍼 컴포넌트
- ✅ 모드 유틸리티 함수

### Pages 레벨
- ✅ 모드별 컴포넌트 조합
- ✅ 모드 인식 훅 사용

---

## 실제 적용 예시: 통합 패턴

```typescript
// shared/hooks/useModeControl.ts (통합 훅)
export const useModeControl = () => {
  const { isEasterEggMode } = useEasterEggStore();

  return {
    // 조건부 핸들러
    conditionalHandler: <T extends (...args: any[]) => any>(
      handler: T,
      options?: { allowInEasterEggMode?: boolean }
    ) => {
      return ((...args: Parameters<T>) => {
        if (isEasterEggMode && !options?.allowInEasterEggMode) return;
        return handler(...args);
      }) as T;
    },

    // 모드별 값
    modeValue: <T,>(normal: T, easterEgg: T) => 
      isEasterEggMode ? easterEgg : normal,

    // 모드별 클래스
    modeClass: (normal: string, easterEgg: string) =>
      isEasterEggMode ? easterEgg : normal,

    // 모드 체크
    isMode: (mode: string) => 
      mode === 'easterEgg' ? isEasterEggMode : !isEasterEggMode,
  };
};

// 사용 예시
const HomePage: React.FC = () => {
  const { conditionalHandler, modeValue, modeClass } = useModeControl();

  // 1. 이벤트 핸들러 차단
  const handleFocus = conditionalHandler(
    () => { if (!isChatbotOpen) onChatbotToggle(); },
    { allowInEasterEggMode: false }
  );

  // 2. 모드별 컴포넌트
  const Panel = modeValue(HistoryPanel, EasterEggListPanel);

  // 3. 모드별 스타일
  const buttonClass = modeClass('bg-primary-600', 'bg-yellow-500');

  return (
    <>
      <ChatInputBar onFocus={handleFocus} />
      <Panel {...props} />
      <button className={buttonClass}>...</button>
    </>
  );
};
```

---

## 요약

### 핵심 원칙
1. **모드 상태는 Feature 레벨에서 관리** (features/easter-eggs/store)
2. **재사용 가능한 패턴은 Shared 레벨로 추출** (shared/hooks)
3. **페이지 레벨에서는 훅을 사용하여 간단하게 조합**
4. **복잡한 로직은 Strategy 패턴으로 분리**

### 추천 구조
```
features/easter-eggs/
  └── store/easterEggStore.tsx      # 모드 상태 관리

shared/hooks/
  └── useModeControl.ts             # 재사용 가능한 모드 통제 훅

pages/
  └── HomePage.tsx                  # 훅을 사용하여 조합
```

이렇게 하면 모드별 UI 통제가 구조적이고 재사용 가능하며 테스트하기 쉬운 코드가 됩니다.

