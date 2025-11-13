# 이스터에그 기능

채팅 입력에서 특정 문구를 감지하여 이스터에그를 트리거하는 기능입니다.

## 아키텍처

이 기능은 리뷰에서 제안된 아키텍처를 따릅니다:

1. **감지와 프레젠테이션 분리**: 트리거 감지 로직과 이펙트 렌더링이 완전히 분리되어 있습니다.
2. **확장 가능한 구조**: 새로운 트리거와 이펙트를 쉽게 추가할 수 있습니다.
3. **상태 관리**: React Context API를 사용하여 전역 상태를 관리합니다.
4. **성능 최적화**: 디바운스와 lazy loading을 지원합니다.

## 사용 방법

### 1. 프로바이더 설정

앱의 루트에 `EasterEggProvider`를 추가합니다:

```tsx
import { EasterEggProvider } from '@features/easter-eggs';

function App() {
  return (
    <EasterEggProvider maxConcurrent={1} initialEnabled={true}>
      {/* 앱 내용 */}
    </EasterEggProvider>
  );
}
```

### 2. 이스터에그 레이어 추가

이펙트를 렌더링할 위치에 `EasterEggLayer`를 추가합니다:

```tsx
import { EasterEggLayer } from '@features/easter-eggs';

function App() {
  return (
    <>
      {/* 앱 내용 */}
      <EasterEggLayer />
    </>
  );
}
```

### 3. 채팅 입력에 트리거 훅 연결

`ChatInputBar` 컴포넌트에 `useEasterEggTrigger` 훅을 추가합니다:

```tsx
import { useEasterEggTrigger } from '@features/easter-eggs';

function ChatInputBar({ inputValue }) {
  useEasterEggTrigger({
    inputValue,
    debounceMs: 300,
  });

  // ... 나머지 코드
}
```

### 4. ESC 키 지원 (선택사항)

ESC 키로 모든 이스터에그를 종료하려면:

```tsx
import { useEasterEggEscapeKey } from '@features/easter-eggs';

function App() {
  useEasterEggEscapeKey();
  // ...
}
```

### 5. 트리거 및 이펙트 등록

앱 초기화 시 트리거와 이펙트를 등록합니다:

```tsx
import {
  easterEggRegistry,
  defaultTriggers,
  defaultEffects,
} from '@features/easter-eggs';

// 기본 트리거 및 이펙트 등록
defaultTriggers.forEach(trigger => {
  easterEggRegistry.registerTrigger(trigger);
});

defaultEffects.forEach(effect => {
  easterEggRegistry.registerEffect(effect);
});
```

## 새로운 이스터에그 추가하기

### 1. 트리거 정의

`config/defaultTriggers.ts`에 새로운 트리거를 추가합니다:

```typescript
{
  id: 'my-easter-egg',
  type: 'exact', // 또는 'regex', 'hashtag'
  pattern: '특정 문구',
  name: '내 이스터에그',
  description: '설명',
  enabled: true,
}
```

### 2. 이펙트 컴포넌트 생성

`effects/` 폴더에 새로운 이펙트 컴포넌트를 만듭니다:

```tsx
export const MyEffect: React.FC<{ context: EasterEggContext; onClose: () => void }> = ({
  context,
  onClose,
}) => {
  // 이펙트 구현
  return <div>이펙트 내용</div>;
};
```

### 3. 이펙트 등록

`config/defaultEffects.ts`에 이펙트를 등록합니다:

```typescript
{
  id: 'my-easter-egg',
  component: MyEffect,
  duration: 3000,
  zIndex: 1000,
  isHeavy: false, // WebGL 등 무거운 리소스 사용 시 true
}
```

## 트리거 타입

- **exact**: 정확한 문자열 매칭
- **regex**: 정규식 매칭
- **hashtag**: 해시태그 매칭 (#pattern)

## Feature Flag 지원

환경 변수를 통해 이스터에그를 활성화/비활성화할 수 있습니다:

```typescript
const isEasterEggEnabled = import.meta.env.VITE_EASTER_EGG_ENABLED !== 'false';

<EasterEggProvider initialEnabled={isEasterEggEnabled}>
  {/* ... */}
</EasterEggProvider>
```

## 테스트

트리거 매칭 로직은 순수 함수이므로 쉽게 테스트할 수 있습니다:

```typescript
import { matchTrigger } from '@features/easter-eggs';

const trigger = {
  id: 'test',
  type: 'exact',
  pattern: 'test',
  name: 'Test',
};

expect(matchTrigger('test', trigger)).toBe(true);
expect(matchTrigger('TEST', trigger)).toBe(true); // caseSensitive: false
```

## 성능 고려사항

- **디바운스**: 입력 이벤트를 디바운스하여 불필요한 트리거 검사를 방지합니다.
- **Lazy Loading**: 무거운 이펙트(`isHeavy: true`)는 첫 트리거 시에만 로드됩니다.
- **동시 실행 제한**: `maxConcurrent`로 동시에 실행 가능한 이스터에그 수를 제한합니다.

