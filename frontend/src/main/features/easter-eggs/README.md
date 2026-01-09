# 이스터에그 기능

채팅 입력에서 특정 문구를 감지하여 이스터에그를 트리거하는 기능입니다.

## 주요 기능

- **이스터에그 모드**: 특정 조건 충족 시 활성화되는 특별 모드
- **발견 추적**: 사용자가 발견한 이스터에그를 localStorage에 저장
- **리소스 프리로딩**: 모드 활성화 시 백그라운드에서 비디오/오디오 미리 로드
- **모드 전환 UI**: 일반 모드 ↔ 이스터에그 모드 간 전환 가능
- **설정 기반 관리**: JSON 파일로 트리거와 이펙트 관리

## 아키텍처

이 기능은 확장 가능하고 유지보수가 쉬운 아키텍처를 따릅니다:

1. **감지와 프레젠테이션 분리**: 트리거 감지 로직과 이펙트 렌더링이 완전히 분리되어 있습니다.
2. **설정 기반 확장**: JSON 파일만 수정하여 새로운 트리거와 이펙트를 추가할 수 있습니다.
3. **상태 관리**: React Context API를 사용하여 전역 상태를 관리합니다.
4. **성능 최적화**: 리소스 프리로딩, lazy loading, 디바운스를 지원합니다.
5. **모드 기반 제어**: 일반 모드에서는 제한된 이펙트만 작동, 이스터에그 모드에서는 모든 기능 활성화

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

### 5. 트리거 및 이펙트 등록 (설정 파일 기반)

트리거와 이펙트는 `config/easterEggConfig.json`에서 관리됩니다:

```json
{
  "triggers": [
    {
      "id": "confetti-celebration",
      "type": "regex",
      "pattern": "(축하|축하해|축하합니다)",
      "name": "축하 컨페티",
      "description": "축하 관련 문구를 입력하면 컨페티가 터집니다",
      "enabled": true,
      "caseSensitive": false,
      "blockMessage": false
    }
  ],
  "effects": [
    {
      "id": "confetti-celebration",
      "componentPath": "effects/confetti/ConfettiEffect",
      "duration": 3000,
      "zIndex": 1000,
      "isHeavy": false,
      "resources": [],
      "alwaysEnabled": false
    }
  ]
}
```

앱 초기화 시 자동으로 설정 파일을 읽어 등록합니다.

## 이스터에그 모드

### 모드 개념

1. **일반 모드**: `alwaysEnabled: true`인 이펙트만 작동
2. **이스터에그 모드**: 모든 이펙트가 작동

### 모드 활성화 조건

- 이름 클릭 5회 연속 (`name-click-5` 이펙트)
- UI 버튼을 통한 수동 전환 (개발/테스트용)

### 발견 추적

```typescript
const {
  discoveredEasterEggs,      // Set<string>: 발견한 이스터에그 ID 목록
  isEasterEggDiscovered,     // (id: string) => boolean
  markEasterEggDiscovered    // (id: string) => void
} = useEasterEggStore();
```

- 발견한 이스터에그는 localStorage에 영구 저장
- 재방문 시에도 발견 기록 유지

## 새로운 이스터에그 추가하기

### 1. 트리거 정의 (`config/easterEggConfig.json`)

```json
{
  "triggers": [
    {
      "id": "my-easter-egg",
      "type": "exact",
      "pattern": "특정 문구",
      "name": "내 이스터에그",
      "description": "설명",
      "enabled": true,
      "caseSensitive": false,
      "blockMessage": false
    }
  ]
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

### 3. 이펙트 등록 (`config/easterEggConfig.json`)

```json
{
  "effects": [
    {
      "id": "my-easter-egg",
      "componentPath": "effects/my-effect/MyEffect",
      "duration": 3000,
      "zIndex": 1000,
      "isHeavy": false,
      "resources": [
        {
          "type": "video",
          "path": "/easter-eggs/videos/my-video.mp4",
          "preload": true
        }
      ],
      "alwaysEnabled": false
    }
  ]
}
```

### 4. 레지스트리에 등록 (`registry/easterEggRegistry.ts`)

동적 import를 사용하여 이펙트 컴포넌트를 lazy loading합니다:

```typescript
easterEggRegistry.registerEffect({
  id: 'my-easter-egg',
  component: lazy(() => import('../effects/my-effect/MyEffect')),
  duration: 3000,
  zIndex: 1000,
  isHeavy: false,
  alwaysEnabled: false,
});
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

## 리소스 프리로딩

### 개념

이스터에그 모드 활성화 시 백그라운드에서 비디오/오디오 리소스를 미리 다운로드하여, 사용자가 트리거를 입력했을 때 즉시 재생할 수 있도록 합니다.

### 설정 방법

`config/easterEggConfig.json`의 각 이펙트에서 리소스를 정의합니다:

```json
{
  "effects": [
    {
      "id": "video-surprise",
      "resources": [
        {
          "type": "video",
          "path": "/easter-eggs/videos/surprise.mp4",
          "preload": true    // 프리로드 활성화
        }
      ]
    },
    {
      "id": "audio-surprise",
      "resources": [
        {
          "type": "audio",
          "path": "/easter-eggs/audio/surprise.mp3",
          "preload": false,   // 프리로드 비활성화 (필요 시에만 로드)
          "loop": false,
          "volume": 0.7
        }
      ]
    }
  ]
}
```

### 동작 방식

1. `enableEasterEggMode()` 호출 시 자동으로 `resourcePreloader.preloadAll()` 실행
2. `easterEggConfig.json`에서 `preload: true`인 리소스만 필터링
3. 병렬로 리소스 다운로드 및 메모리 캐싱
4. 프리로드 상태는 store에서 추적 (`preloadStatus`, `isPreloading`)

### 프리로더 API

```typescript
import { resourcePreloader } from '@features/easter-eggs/lib/resourcePreloader';

// 모든 리소스 프리로드
const status = await resourcePreloader.preloadAll();

// 프리로드된 리소스 가져오기
const video = resourcePreloader.getPreloadedResource('/path/to/video.mp4');

// 프리로드 진행률 확인
const progress = resourcePreloader.getProgress(); // 0-100

// 캐시 초기화
resourcePreloader.clear();
```

### 성능 최적화

- **병렬 다운로드**: 여러 리소스를 동시에 다운로드
- **선택적 프리로드**: `preload: false`로 설정된 리소스는 스킵
- **에러 복구**: 일부 리소스 실패해도 나머지는 정상 로드
- **메모리 캐싱**: 한 번 로드한 리소스는 재사용

## 성능 고려사항

- **디바운스**: 입력 이벤트를 디바운스하여 불필요한 트리거 검사를 방지합니다.
- **Lazy Loading**: 이펙트 컴포넌트는 React.lazy로 동적 import합니다.
- **리소스 프리로딩**: 이스터에그 모드 활성화 시 백그라운드에서 미리 로드합니다.
- **동시 실행 제한**: `maxConcurrent`로 동시에 실행 가능한 이스터에그 수를 제한합니다.
- **모바일 최적화**: 무거운 이펙트(`isHeavy: true`)는 모바일에서 제한될 수 있습니다.

## 파일 구조

```
features/easter-eggs/
├── config/
│   └── easterEggConfig.json       # 트리거 및 이펙트 설정
├── effects/
│   ├── confetti/                  # 컨페티 이펙트
│   ├── giant-block/               # 거대 블록 이펙트 (이름 클릭)
│   ├── video/                     # 비디오 이펙트
│   └── audio/                     # 오디오 이펙트
├── hooks/
│   ├── useEasterEggTrigger.ts     # 트리거 감지 훅
│   └── useEasterEggEscapeKey.ts   # ESC 키 처리 훅
├── lib/
│   ├── resourcePreloader.ts       # 리소스 프리로딩 유틸리티
│   └── triggerMatchers.ts         # 트리거 매칭 로직
├── model/
│   └── easter-egg.types.ts        # 타입 정의
├── registry/
│   └── easterEggRegistry.ts       # 트리거/이펙트 레지스트리
├── store/
│   └── easterEggStore.tsx         # 전역 상태 관리 (Context API)
├── ui/
│   └── EasterEggLayer.tsx         # 이펙트 렌더링 레이어
├── index.ts                       # Public API
└── README.md                      # 문서
```

## API Reference

### Hooks

#### `useEasterEggStore()`
```typescript
const {
  activeEffects,           // 현재 활성화된 이펙트 목록
  isEasterEggMode,         // 이스터에그 모드 활성화 여부
  isEnabled,               // 전체 기능 활성화 여부
  discoveredEasterEggs,    // 발견한 이스터에그 ID Set
  preloadStatus,           // 리소스 프리로드 상태
  isPreloading,            // 프리로딩 진행 중 여부
  triggerEasterEgg,        // 이스터에그 트리거
  dismissEasterEgg,        // 특정 이스터에그 종료
  dismissAll,              // 모든 이스터에그 종료
  toggleEasterEggMode,     // 모드 토글
  enableEasterEggMode,     // 모드 활성화 (프리로딩 포함)
  isEasterEggDiscovered,   // 발견 여부 확인
  markEasterEggDiscovered, // 발견 마킹
} = useEasterEggStore();
```

#### `useEasterEggTrigger(options)`
```typescript
useEasterEggTrigger({
  inputValue: string,      // 감지할 입력 값
  debounceMs?: number,     // 디바운스 지연 (기본: 300ms)
});
```

### ResourcePreloader

```typescript
// 싱글톤 인스턴스
import { resourcePreloader } from '@features/easter-eggs/lib/resourcePreloader';

// 메서드
resourcePreloader.preloadAll(): Promise<PreloadStatus>
resourcePreloader.getPreloadedResource(path: string): HTMLMediaElement | HTMLImageElement | undefined
resourcePreloader.isPreloaded(path: string): boolean
resourcePreloader.getStatus(): PreloadStatus
resourcePreloader.getProgress(): number  // 0-100
resourcePreloader.clear(): void
```

### Registry

```typescript
import { easterEggRegistry } from '@features/easter-eggs/registry/easterEggRegistry';

// 트리거 등록
easterEggRegistry.registerTrigger(trigger: EasterEggTrigger);

// 이펙트 등록
easterEggRegistry.registerEffect(effect: EasterEggEffect);

// 조회
easterEggRegistry.getTrigger(id: string): EasterEggTrigger | undefined;
easterEggRegistry.getEffect(id: string): EasterEggEffect | undefined;
easterEggRegistry.getAllTriggers(): EasterEggTrigger[];
easterEggRegistry.getAllEffects(): EasterEggEffect[];
```

