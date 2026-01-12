# 성능 최적화 가이드

## 현재 성능 이슈

Lighthouse 진단 결과:
- **JavaScript 실행 시간**: 1.8초
- **기본 스레드 작업**: 5.8초
- **사용하지 않는 JavaScript**: 4,756 KiB
- **JavaScript 줄이기**: 2,536 KiB
- **네트워크 페이로드**: 9,777 KiB

## 완료된 최적화

### ✅ 1. 이미지 최적화
- Vite imagetools 플러그인 설치 및 설정
- 이미지에 WebP 포맷 및 크기 최적화 적용
- `loading="lazy"` 속성 추가

### ✅ 2. 코드 스플리팅
- 라우트 레벨 코드 스플리팅 적용 (React.lazy)
- 큰 라이브러리 별도 청크 분리

## 추가 최적화 필요 항목

### 🔴 1. 사용하지 않는 JavaScript 제거 (4,756 KiB)

**문제**: Admin 페이지 코드가 메인 번들에 포함될 수 있음

**해결 방법**:
- ✅ AdminApp은 이미 lazy loading 적용됨
- Admin 전용 라이브러리 확인 필요:
  - `antd`: Admin에서만 사용 → 이미 별도 청크로 분리됨
  - `@uiw/react-md-editor`: Admin에서만 사용 → 이미 별도 청크로 분리됨

**확인 사항**:
```bash
# 번들 분석
npm run build
# dist 폴더에서 청크 크기 확인
```

### 🔴 2. JavaScript 실행 시간 최적화 (1.8초)

**원인 분석**:
- 초기 렌더링 시 많은 컴포넌트 마운트
- 무거운 라이브러리 초기화
- 동기적 작업

**해결 방법**:

#### 2.1 컴포넌트 지연 로딩
```typescript
// 무거운 컴포넌트는 필요할 때만 로드
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

#### 2.2 라이브러리 지연 초기화
```typescript
// mermaid는 마크다운 렌더링 시에만 초기화
useEffect(() => {
  if (needsMermaid) {
    import('mermaid').then(m => m.default.initialize());
  }
}, [needsMermaid]);
```

#### 2.3 Web Worker 활용
```typescript
// 무거운 계산 작업을 Web Worker로 이동
const worker = new Worker(new URL('./heavy-calculation.worker.ts', import.meta.url));
```

### 🔴 3. 기본 스레드 작업 최적화 (5.8초)

**원인**:
- 긴 작업이 메인 스레드를 블로킹
- 동기적 렌더링

**해결 방법**:

#### 3.1 작업 분할 (Scheduler API)
```typescript
import { unstable_scheduleCallback } from 'scheduler';

// 긴 작업을 작은 단위로 분할
const processInChunks = (items: any[]) => {
  let index = 0;
  const processChunk = () => {
    const chunk = items.slice(index, index + 10);
    chunk.forEach(processItem);
    index += 10;
    if (index < items.length) {
      unstable_scheduleCallback(processChunk);
    }
  };
  processChunk();
};
```

#### 3.2 React 18 Concurrent Features 활용
```typescript
import { startTransition } from 'react';

// 우선순위가 낮은 업데이트는 지연
startTransition(() => {
  setNonUrgentState(newValue);
});
```

#### 3.3 가상화 (Virtual Scrolling)
```typescript
// 긴 리스트는 가상화 적용
import { useVirtualizer } from '@tanstack/react-virtual';
```

### 🟠 4. CSS 최적화

**현재 상태**:
- CSS 축소: 3 KiB 절감 가능
- 사용하지 않는 CSS: 12 KiB 절감 가능

**해결 방법**:

#### 4.1 Tailwind CSS Purge 설정 확인
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  // 사용하지 않는 CSS 자동 제거
};
```

#### 4.2 CSS 모듈 최적화
- 사용하지 않는 CSS 클래스 제거
- 중복 스타일 통합

### 🟠 5. 번들 크기 최적화

**현재 청크 분리**:
- ✅ react-vendor
- ✅ react-query
- ✅ react-router
- ✅ markdown-editor
- ✅ antd
- ✅ framer-motion
- ✅ mermaid
- ✅ highlight
- ✅ vendor

**추가 최적화**:

#### 5.1 Tree Shaking 확인
```typescript
// 전체 라이브러리 import 대신 필요한 것만
// ❌ 나쁜 예
import * as antd from 'antd';

// ✅ 좋은 예
import { Button, Table } from 'antd';
```

#### 5.2 동적 Import 활용
```typescript
// 조건부로만 필요한 라이브러리
const loadHeavyLibrary = async () => {
  const lib = await import('heavy-library');
  return lib;
};
```

## 우선순위별 작업 계획

### Phase 1: 즉시 적용 가능 (높은 효과)
1. ✅ 이미지 최적화 (완료)
2. ✅ 코드 스플리팅 (완료)
3. [ ] Tree Shaking 확인 및 수정
4. [ ] 사용하지 않는 import 제거

### Phase 2: 중기 개선 (중간 효과)
1. [ ] 컴포넌트 지연 로딩 추가
2. [ ] 라이브러리 지연 초기화
3. [ ] CSS 최적화

### Phase 3: 장기 개선 (낮은 효과, 높은 복잡도)
1. [ ] Web Worker 활용
2. [ ] React 18 Concurrent Features
3. [ ] 가상화 적용

## 측정 및 모니터링

### 빌드 분석
```bash
# 번들 크기 분석
npm run build
# dist 폴더 확인

# 또는 번들 분석 도구 사용
npm install -D rollup-plugin-visualizer
```

### 런타임 성능 모니터링
```typescript
// Performance API 사용
const measurePerformance = () => {
  performance.mark('start');
  // 작업 수행
  performance.mark('end');
  performance.measure('task', 'start', 'end');
  const measure = performance.getEntriesByName('task')[0];
  console.log(`작업 시간: ${measure.duration}ms`);
};
```

## 예상 효과

- **이미지 최적화**: 네트워크 페이로드 2-3MB 감소
- **코드 스플리팅**: 초기 번들 크기 30-40% 감소
- **Tree Shaking**: 사용하지 않는 코드 10-20% 감소
- **전체 예상**: Lighthouse Performance 점수 +15-25점 향상
