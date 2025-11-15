# 이스터에그 설정 가이드

## 새로운 구조의 장점

### 1. JSON 기반 설정 파일
- **`easterEggConfig.json`**: 모든 이스터에그 설정을 한 곳에서 관리
- 코드 수정 없이 설정만 변경 가능
- 비개발자도 쉽게 수정 가능

### 2. 리소스 파일 관리
- 비디오, 오디오, 이미지 파일을 별도 폴더에 관리
- 리소스 경로를 설정 파일에 명시
- 동적 로딩으로 초기 번들 크기 최적화

### 3. 동적 컴포넌트 로딩
- 이펙트 컴포넌트를 필요할 때만 로드
- 코드 스플리팅으로 성능 최적화
- 새로운 이펙트 추가 시 기존 코드 수정 불필요

## 사용 방법

### 기존 방식 (하위 호환)
```typescript
import { defaultTriggers, defaultEffects } from '@features/easter-eggs';

// 기존처럼 사용 가능
defaultTriggers.forEach(trigger => {
  easterEggRegistry.registerTrigger(trigger);
});
```

### 새로운 방식 (JSON 설정)
```typescript
import { loadEasterEggConfig } from '@features/easter-eggs/config/easterEggConfigLoader';

// 비동기로 설정 로드
const { triggers, effects } = await loadEasterEggConfig();

triggers.forEach(trigger => {
  easterEggRegistry.registerTrigger(trigger);
});

effects.forEach(effect => {
  easterEggRegistry.registerEffect(effect);
});
```

## 새로운 이스터에그 추가하기

### 1. 리소스 파일 준비
```
public/
  easter-eggs/
    videos/
      surprise.mp4
    audio/
      surprise.mp3
    images/
      surprise.png
```

### 2. JSON 설정 파일에 추가

**트리거 추가:**
```json
{
  "id": "my-video-easter-egg",
  "type": "exact",
  "pattern": "비디오",
  "name": "비디오 재생",
  "description": "비디오를 재생합니다",
  "enabled": true,
  "caseSensitive": false,
  "blockMessage": true
}
```

**이펙트 추가:**
```json
{
  "id": "my-video-easter-egg",
  "componentPath": "effects/video/VideoEffect",
  "duration": 0,
  "zIndex": 2000,
  "isHeavy": true,
  "resources": [
    {
      "type": "video",
      "path": "/easter-eggs/videos/surprise.mp4",
      "preload": true,
      "loop": false
    }
  ]
}
```

### 3. 이펙트 컴포넌트 생성 (필요시)

`effects/video/VideoEffect.tsx` 또는 `effects/audio/AudioEffect.tsx`를 참고하여 새 컴포넌트 생성

## 리소스 타입

### Video
```json
{
  "type": "video",
  "path": "/easter-eggs/videos/surprise.mp4",
  "preload": true,
  "loop": false
}
```

### Audio
```json
{
  "type": "audio",
  "path": "/easter-eggs/audio/surprise.mp3",
  "preload": false,
  "loop": false,
  "volume": 0.7
}
```

### Image
```json
{
  "type": "image",
  "path": "/easter-eggs/images/surprise.png",
  "preload": true
}
```

## 마이그레이션 가이드

기존 `defaultTriggers.ts`와 `defaultEffects.ts`는 하위 호환성을 위해 유지됩니다.
점진적으로 JSON 설정으로 마이그레이션할 수 있습니다.

1. JSON 설정 파일에 기존 이스터에그 추가
2. `MainApp.tsx`에서 JSON 로더 사용
3. 기존 TypeScript 파일 제거 (선택사항)

