# 이스터에그 통합 가이드

이 문서는 이스터에그 기능을 프로젝트에 통합하는 방법을 설명합니다.

## 통합 단계

### 1. 앱 루트에 프로바이더 추가

`frontend/src/main/app/MainApp.tsx` 파일을 수정합니다:

```tsx
import { EasterEggProvider } from '@features/easter-eggs';

const MainApp: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <EasterEggProvider maxConcurrent={1} initialEnabled={true}>
          <MainAppContent />
        </EasterEggProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};
```

### 2. 이스터에그 레이어 추가

`frontend/src/main/app/MainApp.tsx`의 `MainAppContent` 컴포넌트에 레이어를 추가합니다:

```tsx
import { EasterEggLayer, useEasterEggEscapeKey } from '@features/easter-eggs';

const MainAppContent: React.FC = () => {
  // ESC 키로 이스터에그 종료
  useEasterEggEscapeKey();

  // ... 기존 코드 ...

  return (
    <div>
      {/* 기존 내용 */}
      <Routes>
        {/* ... */}
      </Routes>
      
      {/* 이스터에그 레이어 추가 */}
      <EasterEggLayer />
    </div>
  );
};
```

### 3. 트리거 및 이펙트 초기화

앱 시작 시 트리거와 이펙트를 등록합니다. `frontend/src/main/app/MainApp.tsx`에 추가:

```tsx
import { useEffect } from 'react';
import {
  easterEggRegistry,
  defaultTriggers,
  defaultEffects,
} from '@features/easter-eggs';

const MainApp: React.FC = () => {
  // 이스터에그 초기화
  useEffect(() => {
    // 기본 트리거 및 이펙트 등록
    defaultTriggers.forEach(trigger => {
      easterEggRegistry.registerTrigger(trigger);
    });

    defaultEffects.forEach(effect => {
      easterEggRegistry.registerEffect(effect);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <EasterEggProvider maxConcurrent={1} initialEnabled={true}>
          <MainAppContent />
        </EasterEggProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};
```

### 4. ChatInputBar에 트리거 훅 통합

`frontend/src/shared/ui/chat/ChatInputBar.tsx` 파일을 수정합니다:

```tsx
import { useEasterEggTrigger } from '@features/easter-eggs';

const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  onFocus,
  isLoading = false,
  placeholder = '프로젝트에 대해 궁금한 점을 물어보세요...',
  speedDialButton,
  isFabOpen = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // 이스터에그 트리거 감지
  useEasterEggTrigger({
    inputValue,
    debounceMs: 300,
  });

  // ... 나머지 코드는 동일 ...
};
```

### 5. Chatbot 컴포넌트에도 통합 (선택사항)

`Chatbot` 컴포넌트 내부의 입력 필드에도 트리거를 추가할 수 있습니다:

```tsx
import { useEasterEggTrigger } from '@features/easter-eggs';

const Chatbot: React.FC<ChatbotProps> = ({ ... }) => {
  const [inputValue, setInputValue] = useState('');

  // 이스터에그 트리거 감지
  useEasterEggTrigger({
    inputValue,
    debounceMs: 300,
  });

  // ... 나머지 코드 ...
};
```

## 환경 변수 설정 (선택사항)

`.env` 파일에 다음을 추가하여 이스터에그를 제어할 수 있습니다:

```env
# 이스터에그 활성화 여부 (기본값: true)
VITE_EASTER_EGG_ENABLED=true
```

그리고 `MainApp.tsx`에서:

```tsx
const isEasterEggEnabled = import.meta.env.VITE_EASTER_EGG_ENABLED !== 'false';

<EasterEggProvider initialEnabled={isEasterEggEnabled}>
  {/* ... */}
</EasterEggProvider>
```

## 테스트

통합 후 다음을 테스트하세요:

1. 채팅 입력창에 "축하해"를 입력하면 컨페티가 터지는지 확인
2. ESC 키를 누르면 모든 이스터에그가 종료되는지 확인
3. 여러 번 트리거해도 동시에 하나만 실행되는지 확인

## 문제 해결

### 이스터에그가 작동하지 않는 경우

1. `EasterEggProvider`가 올바르게 설정되었는지 확인
2. `EasterEggLayer`가 렌더링되고 있는지 확인
3. 트리거와 이펙트가 올바르게 등록되었는지 확인
4. 브라우저 콘솔에서 오류 확인

### 성능 문제

- `debounceMs` 값을 조정하여 트리거 검사 빈도 조절
- `maxConcurrent` 값을 조정하여 동시 실행 수 제한
- 무거운 이펙트는 `isHeavy: true`로 설정하여 lazy loading 활용

