# 이스터에그 시스템 가이드

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [아키텍처 분석](#아키텍처-분석)
3. [모드 전환 메커니즘](#모드-전환-메커니즘)
4. [UI 통제 전략](#ui-통제-전략)
5. [확장 시 고려사항](#확장-시-고려사항)
6. [모범 사례 및 패턴](#모범-사례-및-패턴)

---

## 시스템 개요

### 핵심 개념

이스터에그 시스템은 **"원 시스템과 병렬로 동작하는 독립적인 모드"**를 구현합니다. 이는 다음과 같은 특징을 가집니다:

- **이중 모드 운영**: 일반 모드와 이스터에그 모드가 공존
- **선택적 UI 제어**: 모드에 따라 일부 UI 요소의 동작이 변경
- **비침투적 구조**: 기존 시스템을 파괴하지 않고 확장

### 주요 기능

1. **모드 토글**: 이스터에그 모드 활성화/비활성화
2. **트리거 감지**: 특정 패턴 입력 시 이스터에그 실행
3. **진행 추적**: 발견한 이스터에그 저장 및 표시
4. **패널 전환**: 모드에 따라 히스토리 패널 ↔ 이스터에그 목록 패널 전환

---

## 아키텍처 분석

### 1. Feature-Sliced Design 구조

```
frontend/src/features/easter-eggs/
├── components/              # UI 컴포넌트
│   ├── EasterEggLayer.tsx  # 이스터에그 렌더링 레이어
│   └── EasterEggListPanel.tsx  # 발견한 이스터에그 목록
├── config/                  # 설정
│   ├── defaultTriggers.ts  # 기본 트리거 정의
│   └── defaultEffects.ts   # 기본 이펙트 정의
├── effects/                 # 이스터에그 이펙트 컴포넌트
│   └── index.ts
├── hooks/                   # 커스텀 훅
│   ├── useEasterEggTrigger.ts  # 트리거 감지 훅
│   └── useClickCounter.ts  # 클릭 카운터 훅
├── lib/                     # 유틸리티 함수
│   ├── trigger-matcher.ts  # 트리거 매칭 로직
│   ├── easter-egg-utils.ts # 이스터에그 유틸
│   └── debounce.ts         # 디바운스
├── model/                   # 타입 정의
│   └── easter-egg.types.ts
├── registry/                # 레지스트리
│   └── easterEggRegistry.ts  # 트리거/이펙트 등록 관리
├── store/                   # 전역 상태
│   └── easterEggStore.tsx  # Context API 기반 스토어
└── index.ts                 # Public API
```

### 2. 핵심 컴포넌트 분석

#### A. EasterEggStore (전역 상태 관리)

**파일**: `store/easterEggStore.tsx`

**역할**:
- 이스터에그 모드 상태 관리 (`isEasterEggMode`)
- 활성화된 이펙트 관리 (`activeEffects`)
- 발견한 이스터에그 추적 (`discoveredEasterEggs`)
- localStorage를 통한 진행 상태 영속화

**주요 API**:
```typescript
interface EasterEggStoreValue {
  // 상태
  isEasterEggMode: boolean;           // 이스터에그 모드 활성화 여부
  isEnabled: boolean;                 // 전체 시스템 활성화 여부
  activeEffects: ActiveEasterEgg[];   // 현재 실행 중인 이펙트
  discoveredEasterEggs: Set<string>;  // 발견한 이스터에그 ID

  // 액션
  toggleEasterEggMode: () => void;    // 모드 토글
  enableEasterEggMode: () => void;    // 모드 강제 활성화
  triggerEasterEgg: (id, context) => void;  // 이스터에그 실행
  dismissEasterEgg: (id) => void;     // 이스터에그 제거
  markEasterEggDiscovered: (id) => void;    // 발견 기록
  isEasterEggDiscovered: (id) => boolean;   // 발견 여부 확인
}
```

**핵심 로직**:
```typescript
const triggerEasterEgg = useCallback(
  (id: string, context: EasterEggContext) => {
    if (!isEnabled) return;

    // 🎯 모드 제어: 이스터에그 모드가 아니면 특정 트리거만 허용
    if (!isEasterEggMode && id !== 'name-click-5') {
      return;
    }

    // 발견 기록 (localStorage)
    setDiscoveredEasterEggs(prev => {
      if (prev.has(id)) return prev;
      const newSet = new Set(prev);
      newSet.add(id);
      saveDiscoveredEasterEggs(newSet);
      return newSet;
    });

    // 이펙트 활성화 (최대 동시 실행 수 제한)
    setActiveEffects(prev => {
      if (prev.some(effect => effect.id === id)) return prev;
      const effectsToKeep = prev.length >= maxConcurrent
        ? prev.slice(1)
        : prev;
      return [...effectsToKeep, { id, context, startTime: new Date() }];
    });
  },
  [isEnabled, isEasterEggMode, maxConcurrent]
);
```

#### B. EasterEggRegistry (트리거/이펙트 등록)

**파일**: `registry/easterEggRegistry.ts`

**역할**:
- 트리거와 이펙트를 중앙에서 관리
- 런타임에 동적으로 추가/제거 가능
- Singleton 패턴으로 구현

**주요 API**:
```typescript
class EasterEggRegistry {
  registerTrigger(trigger: EasterEggTrigger): void;
  getTriggers(): EasterEggTrigger[];
  getEnabledTriggers(): EasterEggTrigger[];

  registerEffect(effect: EasterEggEffect): void;
  getEffect(id: string): EasterEggEffect | undefined;
  getEffectByTriggerId(triggerId: string): EasterEggEffect | undefined;
}

export const easterEggRegistry = new EasterEggRegistry();
```

**트리거 타입**:
```typescript
export type TriggerType = 'exact' | 'regex' | 'hashtag';

interface EasterEggTrigger {
  id: string;              // 고유 ID
  type: TriggerType;       // 트리거 타입
  pattern: string;         // 매칭 패턴
  caseSensitive?: boolean; // 대소문자 구분
  name: string;            // 이스터에그 이름
  description?: string;    // 설명
  enabled?: boolean;       // 활성화 여부
  blockMessage?: boolean;  // 챗봇 전송 차단 여부
}
```

#### C. Trigger Matcher (패턴 매칭)

**파일**: `lib/trigger-matcher.ts`

**역할**:
- 입력값과 트리거 패턴 매칭
- 다양한 트리거 타입 지원 (exact, regex, hashtag)

**핵심 로직**:
```typescript
export function matchTrigger(
  input: string,
  trigger: EasterEggTrigger
): boolean {
  const text = trigger.caseSensitive ? input : input.toLowerCase();
  const pattern = trigger.caseSensitive ? trigger.pattern : trigger.pattern.toLowerCase();

  switch (trigger.type) {
    case 'exact':
      return text === pattern;

    case 'regex':
      try {
        const flags = trigger.caseSensitive ? '' : 'i';
        const regex = new RegExp(pattern, flags);
        return regex.test(input);
      } catch {
        return false;
      }

    case 'hashtag':
      const hashtagPattern = trigger.caseSensitive
        ? `#${pattern}`
        : `#${pattern}`.toLowerCase();
      return text.includes(hashtagPattern);

    default:
      return false;
  }
}
```

---

## 모드 전환 메커니즘

### 1. 모드 활성화 트리거

**시나리오**: 테마 토글 버튼 최초 클릭

**구현**: [Header.tsx](../../frontend/src/main/layout/components/Header.tsx#L10-L23)

```typescript
const THEME_TOGGLE_FIRST_CLICK_KEY = 'portfolio-theme-toggle-first-click';

const handleThemeToggle = () => {
  const hasClickedBefore = localStorage.getItem(THEME_TOGGLE_FIRST_CLICK_KEY);

  if (!hasClickedBefore) {
    // 최초 클릭 시 이스터에그 버튼 표시 플래그 저장
    localStorage.setItem(THEME_TOGGLE_FIRST_CLICK_KEY, 'true');

    // 🎯 커스텀 이벤트를 통한 느슨한 결합
    window.dispatchEvent(new CustomEvent('easterEggButtonRevealed'));
  }

  toggleTheme();
};
```

**수신**: [ChatInputBar.tsx](../../frontend/src/shared/ui/chat/ChatInputBar.tsx#L67-L87)

```typescript
const [showEasterEggButton, setShowEasterEggButton] = useState(false);

useEffect(() => {
  // 초기 로드 시 localStorage 확인
  const checkButtonVisibility = () => {
    const hasThemeToggleClicked = localStorage.getItem(THEME_TOGGLE_FIRST_CLICK_KEY);
    const shouldShow = hasThemeToggleClicked === 'true';
    setShowEasterEggButton(shouldShow);
  };

  checkButtonVisibility();

  // 🎯 이벤트 리스너: 테마 토글 최초 클릭 시 버튼 표시
  const handleEasterEggButtonRevealed = () => {
    setShowEasterEggButton(true);
  };

  window.addEventListener('easterEggButtonRevealed', handleEasterEggButtonRevealed);
  return () => {
    window.removeEventListener('easterEggButtonRevealed', handleEasterEggButtonRevealed);
  };
}, []);
```

### 2. 모드 전환 시 동작

**A. 이스터에그 모드 ON**:
1. 챗봇 입력창 → 이스터에그 전용 입력창으로 변경
2. 모든 입력이 챗봇으로 전송되지 않음
3. 트리거 패턴 매칭 활성화
4. 패널 토글 버튼 색상 변경 (파란색 → 노란색)
5. 히스토리 패널 → 이스터에그 목록 패널로 교체
6. **열려있는 챗봇창 자동 닫기** (선택적)

**B. 이스터에그 모드 OFF**:
1. 일반 챗봇 입력창 복원
2. 일반 메시지 챗봇으로 전송
3. 트리거 패턴 매칭 비활성화
4. 패널 토글 버튼 색상 복원
5. 이스터에그 목록 패널 → 히스토리 패널로 복원

**모드 전환 사이드 이펙트 처리**:
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

---

## UI 통제 전략

### 1. 조건부 렌더링 패턴

#### A. 패널 전환 (PortfolioSection.tsx)

**원리**: 동일한 토글 상태를 공유하되, 모드에 따라 다른 패널 렌더링

```typescript
const PortfolioSection: React.FC = ({ ... }) => {
  const { isEasterEggMode } = useEasterEggStore();
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  return (
    <section id="portfolio">
      {/* ... 포트폴리오 콘텐츠 ... */}

      {/* 🎯 조건부 렌더링: 동일한 토글 상태, 다른 컴포넌트 */}
      {isEasterEggMode ? (
        <EasterEggListPanel
          isOpen={isHistoryPanelOpen}
          onToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
        />
      ) : (
        <HistoryPanel
          isOpen={isHistoryPanelOpen}
          onToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
          {...otherProps}
        />
      )}
    </section>
  );
};
```

**핵심 포인트**:
- ✅ **토글 상태는 하나만 존재** (`isHistoryPanelOpen`)
- ✅ **모드 전환 시 패널 상태 유지** (열려있으면 계속 열림)
- ✅ **Props 인터페이스 통일** (isOpen, onToggle)

#### B. 버튼 스타일 변경 (PanelToggle.tsx)

**원리**: 모드에 따라 아이콘, 색상, 라벨 동적 변경

```typescript
const PanelToggle: React.FC<PanelToggleProps> = ({ isOpen, onToggle }) => {
  const { isEasterEggMode } = useEasterEggStore();

  const getIcon = () => {
    if (isOpen) return <CloseIcon />;
    return <ClockIcon />;
  };

  const getAriaLabel = () => {
    if (isOpen) {
      return isEasterEggMode ? '이스터에그 목록 패널 닫기' : '히스토리 패널 닫기';
    }
    return isEasterEggMode ? '이스터에그 목록 패널 열기' : '히스토리 패널 열기';
  };

  const getColorClass = () => {
    if (isEasterEggMode) {
      return 'bg-yellow-500 dark:bg-yellow-600 text-white ...';
    }
    return 'bg-primary-600 dark:bg-primary-500 text-white ...';
  };

  return (
    <button
      onClick={onToggle}
      className={`... ${getColorClass()}`}
      aria-label={getAriaLabel()}
    >
      {getIcon()}
    </button>
  );
};
```

**핵심 포인트**:
- ✅ **단일 버튼, 다중 상태**
- ✅ **접근성 고려** (aria-label 동적 변경)
- ✅ **시각적 피드백** (색상 변경)

### 2. 이벤트 핸들러 차단 패턴

#### A. 포커스 이벤트 조건부 처리 (HomePage.tsx)

**원리**: 모드에 따라 특정 이벤트 핸들러의 동작을 차단

```typescript
// 채팅 입력창 포커스 시 챗봇 자동 열기 (이스터에그 모드에서는 비활성화)
const handleChatInputFocus = () => {
  // 🎯 이스터에그 모드에서는 챗봇 자동 열기 비활성화
  if (isEasterEggMode) {
    return;
  }
  
  if (!isChatbotOpen) {
    onChatbotToggle();
  }
};
```

**핵심 포인트**:
- ✅ **조기 반환 (Early Return)**: 모드 체크를 먼저 수행
- ✅ **명확한 의도**: 주석으로 차단 이유 명시
- ✅ **일관된 패턴**: 모든 이벤트 핸들러에서 동일한 패턴 사용

**적용 가능한 이벤트**:
- `onFocus`: 포커스 시 자동 동작 차단
- `onClick`: 클릭 시 특정 동작 차단
- `onKeyDown`: 키보드 단축키 차단
- `onSubmit`: 폼 제출 동작 차단

#### B. 조건부 동작 패턴 (일반적)

**패턴 1: 조기 반환**
```typescript
const handleAction = () => {
  if (isEasterEggMode) {
    // 이스터에그 모드 전용 동작
    return;
  }
  
  // 일반 모드 동작
  performNormalAction();
};
```

**패턴 2: 조건부 실행**
```typescript
const handleAction = () => {
  if (!isEasterEggMode) {
    performNormalAction();
  } else {
    performEasterEggAction();
  }
};
```

**패턴 3: 플래그 기반**
```typescript
const shouldPerformAction = !isEasterEggMode || allowInEasterEggMode;

if (shouldPerformAction) {
  performAction();
}
```

### 3. 입력 제어 패턴

#### A. 챗봇 메시지 전송 차단 (ChatInputBar.tsx)

**원리**: 이스터에그 모드에서는 모든 입력을 차단하거나 이스터에그로만 처리

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!inputValue.trim() || isLoading) return;

  // 🎯 1단계: 이스터에그 트리거 체크
  const { shouldBlock, triggers } = checkEasterEggTrigger(inputValue, isEasterEggMode);

  // 🎯 2단계: 이스터에그 트리거 실행
  if (triggers.length > 0) {
    triggerEasterEggs(triggers, inputValue, triggerEasterEgg);

    // 이스터에그 전용 문구는 챗봇으로 전송하지 않음
    if (shouldBlock) {
      setInputValue('');
      return;
    }
  }

  // 🎯 3단계: 이스터에그 모드에서는 모든 입력 차단
  if (isEasterEggMode) {
    setInputValue('');
    return;
  }

  // 🎯 4단계: 일반 메시지는 챗봇으로 전송
  onSendMessage(inputValue);
  setInputValue('');
};
```

**제어 흐름**:
```
입력 제출
  ↓
이스터에그 트리거 매칭?
  ├─ YES → 이스터에그 실행
  │         ↓
  │       blockMessage: true?
  │         ├─ YES → 입력 클리어, 종료 (챗봇 전송 X)
  │         └─ NO → 계속 진행
  │
  ↓
isEasterEggMode: true?
  ├─ YES → 입력 클리어, 종료 (챗봇 전송 X)
  └─ NO → 챗봇으로 전송
```

#### B. 포커스 이벤트 차단 (HomePage.tsx)

**원리**: 입력창 포커스 시 챗봇 자동 열기 비활성화

```typescript
// 채팅 입력창 포커스 시 챗봇 자동 열기 (이스터에그 모드에서는 비활성화)
const handleChatInputFocus = () => {
  // 🎯 이스터에그 모드에서는 챗봇 자동 열기 비활성화
  if (isEasterEggMode) {
    return;
  }
  
  if (!isChatbotOpen) {
    onChatbotToggle();
  }
};
```

**사용 사례**:
- 이스터에그 모드에서는 입력창이 독립적으로 동작
- 챗봇 패널과의 자동 연동 비활성화
- 사용자가 수동으로 챗봇을 열어야 함

#### C. 실시간 트리거 감지 (useEasterEggTrigger.ts)

**원리**: Debounce를 활용한 입력 중 패턴 매칭

```typescript
export function useEasterEggTrigger({
  debounceMs = 300,
  inputValue,
}: UseEasterEggTriggerOptions): void {
  const { triggerEasterEgg, isEnabled, isEasterEggMode } = useEasterEggStore();

  useEffect(() => {
    // 🎯 모드가 아니면 무시
    if (!isEasterEggMode) return;

    // 🎯 Debounce를 통한 성능 최적화
    const debouncedCheck = debounce(() => {
      const triggers = easterEggRegistry.getEnabledTriggers();
      const matchingTriggers = findMatchingTriggers(inputValue, triggers);

      if (matchingTriggers.length > 0) {
        triggerEasterEggs(matchingTriggers, inputValue, triggerEasterEgg);
      }
    }, debounceMs);

    debouncedCheck();
  }, [inputValue, isEasterEggMode, ...]);
}
```

### 3. 모드 상태 공유 패턴

**원리**: Context API를 통한 전역 상태 공유

```typescript
// 제공자 (App.tsx 또는 최상위)
<EasterEggProvider>
  <App />
</EasterEggProvider>

// 소비자 (모든 컴포넌트에서)
const { isEasterEggMode, toggleEasterEggMode } = useEasterEggStore();
```

**상태 참조 위치**:
- `ChatInputBar`: 입력 제어, 모드 토글 버튼
- `PanelToggle`: 버튼 스타일 변경
- `PortfolioSection`: 패널 전환
- `EasterEggLayer`: 이펙트 렌더링
- `HomePage`: 포커스 이벤트 차단

### 4. 모드별 UI 통제 패턴 요약

| 통제 유형 | 패턴 | 예시 | 사용 시기 |
|---------|------|------|---------|
| **조건부 렌더링** | `{isEasterEggMode ? <A /> : <B />}` | 패널 전환 | 완전히 다른 컴포넌트 표시 |
| **스타일 변경** | `getColorClass()` 헬퍼 함수 | 버튼 색상 변경 | 동일 컴포넌트, 다른 스타일 |
| **이벤트 차단** | `if (isEasterEggMode) return;` | 포커스 이벤트 차단 | 자동 동작 비활성화 |
| **조건부 실행** | `if (!isEasterEggMode) { ... }` | 메시지 전송 | 특정 동작만 차단 |
| **Props 조건부 전달** | `{...(!isEasterEggMode && { prop: value })}` | 선택적 Props | Props를 조건부로 전달 |

---

## 확장 시 고려사항

### 1. 아키텍처 원칙

#### A. 단방향 데이터 흐름 유지

```
사용자 액션 (클릭, 입력)
  ↓
Store 업데이트 (toggleEasterEggMode, triggerEasterEgg)
  ↓
상태 변경 (isEasterEggMode, activeEffects)
  ↓
UI 자동 업데이트 (React 리렌더링)
```

#### B. 느슨한 결합 (Loose Coupling)

**나쁜 예** ❌:
```typescript
// Header.tsx
import { ChatInputBar } from '@shared/ui/chat/ChatInputBar';

const handleThemeToggle = () => {
  // 직접 참조 → 강한 결합
  ChatInputBar.showEasterEggButton();
};
```

**좋은 예** ✅:
```typescript
// Header.tsx
const handleThemeToggle = () => {
  localStorage.setItem(THEME_TOGGLE_FIRST_CLICK_KEY, 'true');
  window.dispatchEvent(new CustomEvent('easterEggButtonRevealed'));
};

// ChatInputBar.tsx
useEffect(() => {
  const handler = () => setShowEasterEggButton(true);
  window.addEventListener('easterEggButtonRevealed', handler);
  return () => window.removeEventListener('easterEggButtonRevealed', handler);
}, []);
```

#### C. Registry 패턴 활용

**장점**:
- 런타임에 동적으로 이스터에그 추가/제거 가능
- 이스터에그 정의와 실행 로직 분리
- 플러그인 형태로 확장 가능

**예시**:
```typescript
// 앱 초기화 시
import { easterEggRegistry } from '@features/easter-eggs';
import { defaultTriggers } from '@features/easter-eggs/config/defaultTriggers';
import { confettiEffect } from '@features/easter-eggs/effects/confetti';

// 트리거 등록
easterEggRegistry.registerTriggers(defaultTriggers);

// 이펙트 등록
easterEggRegistry.registerEffect(confettiEffect);

// 플러그인처럼 추가
easterEggRegistry.registerTrigger({
  id: 'new-easter-egg',
  type: 'regex',
  pattern: '비밀번호',
  name: '비밀번호 이스터에그',
  enabled: true,
});
```

### 2. 확장 시나리오별 가이드

#### A. 새로운 이스터에그 추가

**1단계: 트리거 정의**
```typescript
// config/defaultTriggers.ts
export const defaultTriggers: EasterEggTrigger[] = [
  // 기존 트리거...
  {
    id: 'konami-code',
    type: 'exact',
    pattern: '↑↑↓↓←→←→BA',
    name: '코나미 코드',
    description: '코나미 코드를 입력하면...',
    enabled: true,
    blockMessage: true,  // 챗봇으로 전송하지 않음
  },
];
```

**2단계: 이펙트 컴포넌트 작성**
```typescript
// effects/KonamiCodeEffect.tsx
import React from 'react';
import type { EasterEggContext } from '../model/easter-egg.types';

interface KonamiCodeEffectProps {
  context: EasterEggContext;
  onClose: () => void;
}

const KonamiCodeEffect: React.FC<KonamiCodeEffectProps> = ({ context, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-8 rounded-lg">
        <h2>🎮 코나미 코드 발견!</h2>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export { KonamiCodeEffect };
```

**3단계: 이펙트 등록**
```typescript
// config/defaultEffects.ts
import { KonamiCodeEffect } from '../effects/KonamiCodeEffect';

export const defaultEffects: EasterEggEffect[] = [
  // 기존 이펙트...
  {
    id: 'konami-code',  // 트리거 ID와 동일
    component: KonamiCodeEffect,
    duration: undefined,  // 수동으로 닫을 때까지
    isHeavy: false,  // Lazy Loading 여부
  },
];
```

#### B. 복잡한 트리거 조건 추가

**시나리오**: 특정 순서로 버튼 3번 클릭

```typescript
// hooks/useSequenceClicker.ts
import { useState, useCallback } from 'react';

interface UseSequenceClickerOptions {
  sequence: string[];  // ['button1', 'button2', 'button3']
  onComplete: () => void;
  timeout?: number;  // 시퀀스 타임아웃 (ms)
}

export function useSequenceClicker({
  sequence,
  onComplete,
  timeout = 5000,
}: UseSequenceClickerOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const handleClick = useCallback((buttonId: string) => {
    if (buttonId !== sequence[currentIndex]) {
      // 잘못된 순서 → 초기화
      setCurrentIndex(0);
      if (timeoutId) clearTimeout(timeoutId);
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= sequence.length) {
      // 완료!
      onComplete();
      setCurrentIndex(0);
      if (timeoutId) clearTimeout(timeoutId);
    } else {
      setCurrentIndex(nextIndex);

      // 타임아웃 설정
      if (timeoutId) clearTimeout(timeoutId);
      const newTimeoutId = window.setTimeout(() => {
        setCurrentIndex(0);
      }, timeout);
      setTimeoutId(newTimeoutId);
    }
  }, [currentIndex, sequence, onComplete, timeout, timeoutId]);

  return { handleClick };
}
```

**사용 예시**:
```typescript
const MyComponent = () => {
  const { triggerEasterEgg } = useEasterEggStore();

  const { handleClick } = useSequenceClicker({
    sequence: ['logo', 'theme-toggle', 'admin'],
    onComplete: () => {
      triggerEasterEgg('secret-sequence', {
        message: '비밀 시퀀스 완료',
        timestamp: new Date(),
      });
    },
  });

  return (
    <>
      <button onClick={() => handleClick('logo')}>로고</button>
      <button onClick={() => handleClick('theme-toggle')}>테마</button>
      <button onClick={() => handleClick('admin')}>관리자</button>
    </>
  );
};
```

#### C. 모드 확장: 이스터에그 서브 모드

**시나리오**: 이스터에그 모드 내에서 "챌린지 모드" 추가

**구현**:
```typescript
// store/easterEggStore.tsx
interface EasterEggStoreValue {
  // 기존...
  isEasterEggMode: boolean;

  // 추가 ✨
  easterEggSubMode: 'normal' | 'challenge' | 'speedrun';
  setEasterEggSubMode: (mode: string) => void;
}

// 챌린지 모드에서는 힌트 숨김
const EasterEggItem: React.FC<EasterEggItemProps> = ({ trigger, isDiscovered }) => {
  const { easterEggSubMode } = useEasterEggStore();

  return (
    <div>
      <h4>{trigger.name}</h4>
      {!isDiscovered && easterEggSubMode !== 'challenge' && (
        <p>힌트: "{trigger.pattern}"</p>
      )}
    </div>
  );
};
```

### 3. 성능 최적화 전략

#### A. Lazy Loading 이펙트

**문제**: 무거운 이펙트(애니메이션, 비디오)가 초기 번들 크기 증가

**해결**: `isHeavy` 플래그 + React.lazy

```typescript
// config/defaultEffects.ts
export const defaultEffects: EasterEggEffect[] = [
  {
    id: 'heavy-animation',
    component: HeavyAnimationEffect,  // 실제로는 lazy로 로드됨
    isHeavy: true,  // 🎯 Lazy Loading 활성화
  },
];

// components/EasterEggLayer.tsx
const LazyEffectWrapper: React.FC = ({ effectId, context, onClose }) => {
  const effect = easterEggRegistry.getEffect(effectId);
  if (!effect) return null;

  if (effect.isHeavy) {
    const LazyComponent = lazy(() =>
      Promise.resolve({ default: effect.component })
    );
    return (
      <Suspense fallback={<div>로딩 중...</div>}>
        <LazyComponent context={context} onClose={onClose} />
      </Suspense>
    );
  }

  const Component = effect.component;
  return <Component context={context} onClose={onClose} />;
};
```

#### B. Debounce 입력 감지

**문제**: 매 키 입력마다 패턴 매칭 → 성능 저하

**해결**: Debounce (현재 300ms)

```typescript
// hooks/useEasterEggTrigger.ts
export function useEasterEggTrigger({
  debounceMs = 300,  // 🎯 조정 가능
  inputValue,
}: UseEasterEggTriggerOptions) {
  // Debounce를 통해 입력이 멈춘 후 300ms 후에만 패턴 매칭
  const debouncedCheck = debounce(() => {
    // 패턴 매칭 로직
  }, debounceMs);

  useEffect(() => {
    debouncedCheck();
  }, [inputValue]);
}
```

#### C. 동시 실행 수 제한

**문제**: 여러 이스터에그 동시 실행 → 화면 혼잡

**해결**: `maxConcurrent` 옵션

```typescript
<EasterEggProvider maxConcurrent={2}>
  <App />
</EasterEggProvider>

// Store에서 자동으로 제한
const triggerEasterEgg = (id, context) => {
  setActiveEffects(prev => {
    // 최대 개수 초과 시 가장 오래된 것 제거
    const effectsToKeep = prev.length >= maxConcurrent
      ? prev.slice(1)
      : prev;
    return [...effectsToKeep, newEffect];
  });
};
```

### 4. 보안 및 안정성

#### A. Regex 안전성

**문제**: 사용자 정의 정규식 → ReDoS 공격 가능성

**해결**: Try-Catch + 타임아웃

```typescript
// lib/trigger-matcher.ts
export function matchTrigger(input: string, trigger: EasterEggTrigger): boolean {
  if (trigger.type === 'regex') {
    try {
      const regex = new RegExp(trigger.pattern, flags);

      // 🎯 타임아웃 설정 (선택적)
      const timeoutMs = 100;
      const startTime = Date.now();

      if (regex.test(input)) {
        if (Date.now() - startTime > timeoutMs) {
          console.warn(`Regex timeout: ${trigger.pattern}`);
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error(`Invalid regex: ${trigger.pattern}`, error);
      return false;
    }
  }
  // ...
}
```

#### B. localStorage 용량 관리

**문제**: 발견한 이스터에그 무한 증가 → localStorage 한계 초과

**해결**: 용량 체크 + 주기적 정리

```typescript
const MAX_DISCOVERED_EGGS = 100;

const markEasterEggDiscovered = (id: string) => {
  setDiscoveredEasterEggs(prev => {
    if (prev.size >= MAX_DISCOVERED_EGGS) {
      console.warn('Too many discovered easter eggs. Clearing oldest entries.');
      const sorted = Array.from(prev).slice(-50);  // 최근 50개만 유지
      return new Set([...sorted, id]);
    }

    const newSet = new Set(prev);
    newSet.add(id);
    saveDiscoveredEasterEggs(newSet);
    return newSet;
  });
};
```

---

## 모범 사례 및 패턴

### 1. UI 통제 체크리스트

새로운 UI 요소를 이스터에그 모드에서 제어해야 할 때:

- [ ] **모드 상태 접근**: `useEasterEggStore()` 훅 사용
- [ ] **조건부 렌더링**: `{isEasterEggMode ? <A /> : <B />}` 패턴
- [ ] **스타일 변경**: `getColorClass()` 같은 헬퍼 함수
- [ ] **접근성**: `aria-label` 동적 변경
- [ ] **상태 유지**: 모드 전환 시에도 사용자 입력 상태 보존 (필요 시)
- [ ] **이벤트 핸들러 차단**: `if (isEasterEggMode) return;` 패턴으로 자동 동작 차단
- [ ] **조기 반환**: 모드 체크를 먼저 수행하여 불필요한 로직 실행 방지

### 2. 모드 전환 체크리스트

새로운 모드 전환 트리거 추가 시:

- [ ] **트리거 이벤트**: 명확한 사용자 액션
- [ ] **localStorage 키**: 고유한 키 사용 (`portfolio-*`)
- [ ] **커스텀 이벤트**: `window.dispatchEvent` 활용
- [ ] **초기 로드**: localStorage 확인 → 상태 복원
- [ ] **정리 작업**: `useEffect` cleanup 함수에서 이벤트 리스너 제거

### 3. 이스터에그 설계 원칙

#### A. 발견 가능성 vs 숨김성 균형

| 난이도 | 특징 | 예시 |
|-------|------|------|
| 쉬움 | 명확한 힌트, 자주 사용하는 UI | 테마 토글 클릭 |
| 중간 | 설명 필요, 특정 문구 입력 | "축하해" 입력 |
| 어려움 | 힌트 없음, 복잡한 조건 | 코나미 코드 |

#### B. 사용자 경험 우선

- ✅ **비간섭성**: 일반 사용자 경험을 방해하지 않음
- ✅ **선택적**: 원하는 사용자만 즐김
- ✅ **보상감**: 발견 시 재미있는 피드백
- ✅ **진행 추적**: 발견한 이스터에그 저장

#### C. 점진적 공개 (Progressive Disclosure)

```
1단계: 테마 토글 클릭
  → 이스터에그 버튼 표시

2단계: 이스터에그 모드 활성화
  → 입력창에 힌트 표시

3단계: 첫 이스터에그 발견
  → 패널에서 진행률 표시

4단계: 특정 개수 발견
  → 숨겨진 이스터에그 해금
```

### 4. 코드 구조 패턴

#### A. Feature-First 구조

```
features/easter-eggs/
├── components/     # 이스터에그 전용 UI
├── config/         # 트리거/이펙트 정의
├── effects/        # 이펙트 컴포넌트
├── hooks/          # 재사용 가능한 로직
├── lib/            # 유틸리티 함수
├── model/          # 타입 정의
├── registry/       # 중앙 레지스트리
├── store/          # 전역 상태
└── index.ts        # Public API (명시적 export)
```

**핵심**:
- 외부에서는 `index.ts`를 통해서만 import
- 내부 구현 변경 시 외부 영향 최소화

#### B. Barrel Export 패턴

```typescript
// index.ts
export { EasterEggProvider, useEasterEggStore } from './store/easterEggStore';
export { EasterEggLayer } from './components/EasterEggLayer';
export { easterEggRegistry } from './registry/easterEggRegistry';

// 타입만 export
export type {
  EasterEggTrigger,
  EasterEggEffect,
  EasterEggContext,
} from './model/easter-egg.types';

// 사용처
import {
  EasterEggProvider,
  useEasterEggStore,
  type EasterEggTrigger
} from '@features/easter-eggs';
```

#### C. Registry 초기화 패턴

```typescript
// app/App.tsx (또는 최상위)
import { easterEggRegistry } from '@features/easter-eggs';
import { defaultTriggers } from '@features/easter-eggs/config/defaultTriggers';
import { defaultEffects } from '@features/easter-eggs/config/defaultEffects';

// 앱 초기화 시 한 번만 등록
useEffect(() => {
  easterEggRegistry.registerTriggers(defaultTriggers);
  defaultEffects.forEach(effect => easterEggRegistry.registerEffect(effect));
}, []);

// Provider로 감싸기
<EasterEggProvider maxConcurrent={2} initialEnabled={true}>
  <App />
</EasterEggProvider>
```

---

## 실전 예제: 새로운 모드 추가

### 시나리오: "스토리 모드" 추가

**요구사항**:
- 이스터에그를 순서대로 발견하면 스토리가 진행
- 스토리 모드 전용 UI 표시
- 진행 상황을 저장

### 구현 단계

#### 1. 타입 확장

```typescript
// model/easter-egg.types.ts
export interface EasterEggState {
  activeEffects: ActiveEasterEgg[];
  maxConcurrent: number;
  isEnabled: boolean;
  isEasterEggMode: boolean;

  // ✨ 추가
  isStoryMode: boolean;
  currentStoryChapter: number;
}
```

#### 2. Store 확장

```typescript
// store/easterEggStore.tsx
const STORY_PROGRESS_KEY = 'portfolio-story-progress';

interface EasterEggStoreValue extends EasterEggState {
  // 기존...

  // ✨ 추가
  toggleStoryMode: () => void;
  advanceStoryChapter: () => void;
  resetStory: () => void;
}

export const EasterEggProvider: React.FC = ({ children }) => {
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [currentStoryChapter, setCurrentStoryChapter] = useState(() => {
    const saved = localStorage.getItem(STORY_PROGRESS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const toggleStoryMode = useCallback(() => {
    setIsStoryMode(prev => !prev);
  }, []);

  const advanceStoryChapter = useCallback(() => {
    setCurrentStoryChapter(prev => {
      const next = prev + 1;
      localStorage.setItem(STORY_PROGRESS_KEY, next.toString());
      return next;
    });
  }, []);

  const resetStory = useCallback(() => {
    setCurrentStoryChapter(0);
    localStorage.removeItem(STORY_PROGRESS_KEY);
  }, []);

  const value: EasterEggStoreValue = {
    // 기존...
    isStoryMode,
    currentStoryChapter,
    toggleStoryMode,
    advanceStoryChapter,
    resetStory,
  };

  return <EasterEggContext.Provider value={value}>{children}</EasterEggContext.Provider>;
};
```

#### 3. 스토리 트리거 정의

```typescript
// config/storyTriggers.ts
export const storyTriggers: EasterEggTrigger[] = [
  {
    id: 'story-chapter-1',
    type: 'exact',
    pattern: '시작',
    name: '스토리 시작',
    description: '스토리 모드의 시작',
    enabled: true,
  },
  {
    id: 'story-chapter-2',
    type: 'exact',
    pattern: '모험',
    name: '모험의 시작',
    description: '첫 번째 챕터를 완료해야 활성화됩니다',
    enabled: true,
  },
  // ...
];
```

#### 4. 순차적 트리거 제어

```typescript
// lib/story-controller.ts
export function checkStoryTrigger(
  triggerId: string,
  currentChapter: number,
  storyTriggers: EasterEggTrigger[]
): boolean {
  const triggerIndex = storyTriggers.findIndex(t => t.id === triggerId);

  // 현재 챕터와 트리거 순서가 일치하는지 확인
  return triggerIndex === currentChapter;
}

// hooks/useStoryMode.ts
export function useStoryMode() {
  const {
    isStoryMode,
    currentStoryChapter,
    advanceStoryChapter,
    triggerEasterEgg
  } = useEasterEggStore();

  const handleStoryTrigger = useCallback((triggerId: string) => {
    if (!isStoryMode) return;

    const storyTriggers = easterEggRegistry.getTriggers()
      .filter(t => t.id.startsWith('story-chapter-'));

    if (checkStoryTrigger(triggerId, currentStoryChapter, storyTriggers)) {
      // 올바른 순서 → 이펙트 실행 + 챕터 진행
      triggerEasterEgg(triggerId, {
        message: `Chapter ${currentStoryChapter + 1} 완료`,
        timestamp: new Date(),
      });
      advanceStoryChapter();
    } else {
      // 잘못된 순서 → 힌트 표시
      alert('이전 챕터를 먼저 완료해야 합니다.');
    }
  }, [isStoryMode, currentStoryChapter, advanceStoryChapter, triggerEasterEgg]);

  return { handleStoryTrigger };
}
```

#### 5. UI 통합

```typescript
// components/StoryModePanel.tsx
const StoryModePanel: React.FC = () => {
  const { isStoryMode, currentStoryChapter, toggleStoryMode, resetStory } = useEasterEggStore();

  return (
    <div className="story-mode-panel">
      <h3>스토리 모드</h3>
      <p>현재 챕터: {currentStoryChapter}</p>
      <button onClick={toggleStoryMode}>
        {isStoryMode ? '스토리 모드 종료' : '스토리 모드 시작'}
      </button>
      <button onClick={resetStory}>처음부터 다시 시작</button>
    </div>
  );
};

// PortfolioSection.tsx (조건부 렌더링)
const PortfolioSection: React.FC = ({ ... }) => {
  const { isEasterEggMode, isStoryMode } = useEasterEggStore();

  return (
    <section>
      {/* 기존 콘텐츠 */}

      {/* 패널 전환 */}
      {isStoryMode ? (
        <StoryModePanel />
      ) : isEasterEggMode ? (
        <EasterEggListPanel {...} />
      ) : (
        <HistoryPanel {...} />
      )}
    </section>
  );
};
```

---

## 요약

### 핵심 개념 정리

| 측면 | 전략 |
|------|------|
| **상태 관리** | Context API + localStorage 영속화 |
| **모드 전환** | 커스텀 이벤트 + 느슨한 결합 |
| **UI 통제** | 조건부 렌더링 + 동적 스타일 |
| **트리거 감지** | Registry 패턴 + Debounce |
| **확장성** | Feature-Sliced Design + Barrel Export |

### 우아한 구조의 핵심

1. **단일 진실 공급원 (Single Source of Truth)**
   - 모드 상태는 Store에만 존재
   - 모든 컴포넌트가 동일한 상태 참조

2. **명시적 API**
   - `index.ts`를 통한 Public API 정의
   - 내부 구현 변경 시 외부 영향 최소화

3. **관심사 분리 (Separation of Concerns)**
   - 트리거 감지 ≠ 이펙트 실행 ≠ UI 렌더링
   - 각 모듈이 하나의 책임만 가짐

4. **점진적 향상 (Progressive Enhancement)**
   - 기본 기능은 모든 사용자에게
   - 이스터에그는 선택적 발견
   - 모드 전환이 일반 사용 경험을 해치지 않음

### 다음 단계 제안

1. **메트릭 추가**: 이스터에그 발견 시간, 빈도 추적
2. **공유 기능**: 발견한 이스터에그 SNS 공유
3. **리더보드**: 전체 이스터에그 발견 순위
4. **시즌제**: 기간 한정 이스터에그 추가

---

**문서 버전**: 1.0
**작성일**: 2025-01-15
**작성자**: AI Agent (Claude)
