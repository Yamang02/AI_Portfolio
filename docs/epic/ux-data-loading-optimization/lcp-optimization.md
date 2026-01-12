# LCP (Largest Contentful Paint) 최적화 가이드

## 현재 상태

**LCP 요소**: `h2._sectionTitle_1w98r_1._h2_1w98r_15._sequentialItem_1s6gg_64`
- **위치**: HeroSection의 "Software Engineer" 제목
- **첫 바이트까지의 시간**: 330ms ✅ (양호)
- **요소 렌더링 지연**: 2,360ms ❌ (문제)

## 문제 원인

1. **폰트 로딩 지연**: Pretendard, Inter 폰트가 CSS @import로 로드되어 렌더링 차단
2. **폰트 FOIT (Flash of Invisible Text)**: 폰트가 로드될 때까지 텍스트가 보이지 않음
3. **Critical CSS 부재**: HeroSection 스타일이 나중에 로드됨

## 적용된 최적화

### ✅ 1. 폰트 Preconnect
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
```
- DNS 조회 및 TCP 연결을 미리 설정하여 폰트 로딩 속도 향상

### ✅ 2. 폰트 Preload
```html
<link 
  rel="preload" 
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" 
  as="style" 
  onload="this.onload=null;this.rel='stylesheet'"
/>
```
- LCP 요소에 사용되는 폰트를 우선적으로 로드
- 비동기 로딩으로 렌더링 차단 방지

### ✅ 3. Critical CSS 인라인
```html
<style>
  /* HeroSection Critical CSS */
  .hero .sequentialItem h2 {
    /* LCP 요소 스타일 */
  }
</style>
```
- LCP 요소의 스타일을 HTML에 인라인하여 즉시 적용
- 외부 CSS 파일 로딩을 기다리지 않음

### ✅ 4. 폰트 로딩 중복 제거
- `index.css`에서 `@import` 제거 (HTML에서 이미 preload)
- 중복 로딩 방지

## 예상 효과

- **폰트 로딩 시간**: 1-1.5초 단축
- **렌더링 지연**: 2.36초 → 0.5-1초로 감소
- **LCP 점수**: +10-15점 향상

## 추가 최적화 가능 항목

### 1. 폰트 서브셋 사용
```html
<!-- 필요한 글자만 포함한 폰트 서브셋 -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500&text=Software+Engineer&display=swap" />
```
- LCP 요소에 사용되는 텍스트만 포함한 폰트 로드
- 폰트 파일 크기 대폭 감소

### 2. 시스템 폰트 우선 사용
```css
/* 시스템 폰트를 먼저 사용하고, 웹 폰트는 fallback */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```
- 웹 폰트 로딩 전에도 텍스트 표시
- FOIT 방지

### 3. 폰트 Display 전략
```css
/* 이미 적용됨 */
font-display: swap;
```
- 폰트 로딩 중에도 fallback 폰트로 텍스트 표시
- FOIT 방지

## 측정 방법

### Chrome DevTools
1. Performance 탭 열기
2. "LCP" 마커 확인
3. 렌더링 지연 시간 측정

### Lighthouse
1. Lighthouse 실행
2. "Largest Contentful Paint" 메트릭 확인
3. 목표: 2.5초 이하

### Web Vitals
```typescript
import { onLCP } from 'web-vitals';

onLCP((metric) => {
  console.log('LCP:', metric.value);
  console.log('LCP Element:', metric.element);
});
```

## 모니터링

### 실시간 모니터링
- Google Analytics 4의 Web Vitals 리포트
- Search Console의 Core Web Vitals 리포트

### 알림 설정
- LCP가 2.5초를 초과할 때 알림
- 정기적인 성능 감사
