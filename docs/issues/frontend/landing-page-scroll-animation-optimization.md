# [ISSUE] 랜딩페이지 스크롤 애니메이션 성능 최적화

## 배경 (Why)

현재 랜딩페이지의 스크롤 애니메이션이 JavaScript 기반으로 구현되어 있어 성능 이슈가 있었습니다:
- **FeaturedProjectsSection**: 스크롤 이벤트 직접 사용으로 메인 스레드 블로킹 위험
- **AboutSection1/2, CTASection**: Intersection Observer 사용 중이지만 추가 성능 향상 가능
- **성능 개선 기회**: CSS Scroll-Driven Animations 적용 시 CPU 사용량 50% → 2% (Tokopedia 사례)

## 문제 정의 (What)

### 이전 상태

| 섹션 | 애니메이션 방식 | 성능 이슈 |
|------|----------------|----------|
| HeroSection | CSS Keyframes | ✅ 최적화됨 |
| AboutSection1/2 | Intersection Observer + CSS Transition | ⚠️ JS 오버헤드 |
| FeaturedProjectsSection | 스크롤 이벤트 직접 사용 | 🔴 성능 이슈 |
| CTASection | Intersection Observer + CSS Transition | ⚠️ JS 오버헤드 |

### 해결 후 상태

| 섹션 | 애니메이션 방식 | 상태 |
|------|----------------|------|
| HeroSection | CSS Keyframes | ✅ 변경 없음 |
| AboutSection1/2 | **Pure CSS Scroll-Driven** | ✅ 완료 |
| FeaturedProjectsSection | **Pure CSS Scroll-Driven** | ✅ 완료 |
| CTASection | **Pure CSS Scroll-Driven** | ✅ 완료 |

## 목표 (Goal)

- [x] FeaturedProjectsSection을 CSS Scroll-Driven Animations로 리팩토링
- [x] AboutSection1/2를 CSS Scroll-Driven Animations로 리팩토링
- [x] CTASection을 CSS Scroll-Driven Animations로 리팩토링
- [x] Safari 폴백 구현 (정적 표시)
- [x] JavaScript 로직 완전 제거
- [ ] 성능 테스트 통과 (60fps 유지)
- [x] 접근성 유지 (`prefers-reduced-motion` 지원)

## 해결 방향

### 선택한 접근 방식: Pure CSS-Only

```
┌─────────────────────────────────────────────────────────────┐
│  Chrome/Edge/Firefox (85%+ 사용자)                           │
│  → CSS Scroll-Driven Animations 동작                        │
├─────────────────────────────────────────────────────────────┤
│  Safari (15% 미만 사용자)                                    │
│  → 콘텐츠 정상 표시, 애니메이션 없이 정적 상태               │
│  → @supports not (animation-timeline: scroll()) 폴백        │
└─────────────────────────────────────────────────────────────┘
```

### 장점

| 항목 | CSS-Only (현재) | 이전 (CSS + JS 혼합) |
|------|----------------|---------------------|
| 코드 복잡도 | ⭐ 낮음 | 🔴 높음 |
| 성능 | ⭐ GPU 가속 100% | 🔴 JS 오버헤드 |
| 번들 크기 | ⭐ 최소 | 🔴 JS 코드 포함 |
| 유지보수 | ⭐ CSS만 수정 | 🔴 CSS + JS 모두 수정 |
| Safari 사용자 경험 | ✅ 콘텐츠 정상 표시 | ⚠️ 동일 |

### 구조 변경

```
Before (복잡):
┌─────────────────────────────────────┐
│ React Component                      │
│ ├─ useState(supportsScrollTimeline) │
│ ├─ useScrollAnimation() 훅          │
│ ├─ useEffect(브라우저 감지)          │
│ └─ 조건부 스타일 렌더링              │
└─────────────────────────────────────┘

After (단순):
┌─────────────────────────────────────┐
│ React Component                      │
│ └─ 순수 JSX만 렌더링 (상태 없음)     │
├─────────────────────────────────────┤
│ CSS Module                           │
│ ├─ 기본값: Safari 폴백 (정적 표시)   │
│ ├─ @supports (animation-timeline)    │
│ │   └─ 스크롤 애니메이션             │
│ └─ @media (prefers-reduced-motion)   │
│     └─ 접근성 폴백                   │
└─────────────────────────────────────┘
```

## 체크리스트

- [x] 원인 확인
- [x] 해결 방향 결정
- [x] FeaturedProjectsSection 리팩토링 (Pure CSS)
- [x] AboutSection1 리팩토링 (Pure CSS)
- [x] AboutSection2 리팩토링 (Pure CSS)
- [x] CTASection 리팩토링 (Pure CSS)
- [x] Safari 폴백 구현 (정적 표시)
- [x] JavaScript 로직 완전 제거
- [ ] 성능 테스트
- [x] 접근성 테스트 (prefers-reduced-motion)
- [x] 문서 반영

## 변경된 파일

### React 컴포넌트 (JavaScript 제거)
- `frontend/src/pages/HomePage/AboutSection1.tsx`
- `frontend/src/pages/HomePage/AboutSection2.tsx`
- `frontend/src/pages/HomePage/CTASection.tsx`
- `frontend/src/pages/HomePage/FeaturedProjectsSection.tsx`

### CSS 모듈 (Pure CSS Scroll-Driven Animations)
- `frontend/src/pages/HomePage/AboutSection.module.css`
- `frontend/src/pages/HomePage/FeaturedProjectsSection.module.css`
- `frontend/src/pages/HomePage/CTASection.module.css`

## 발견된 문제 및 해결

### 문제 원인 분석

#### 1. 잘못된 타임라인 사용
- **문제**: `animation-timeline: scroll()`을 사용하여 문서 전체 스크롤에 애니메이션이 묶여 있었음
- **증상**: 페이지 상단에서 이미 애니메이션이 시작·끝나 버려서 실제 섹션이 뷰포트에 들어올 때는 타임라인이 끝난 상태
- **결과**: 초기값(투명)으로 돌아가 카드/CTA가 보이지 않는 증상 발생

#### 2. animation-range 키워드 오용
- **문제**: `animation-range: cover 0% cover 50%`처럼 `cover`/`contain` 키워드는 **view timeline 전용**인데, `scroll()` 타임라인과 함께 사용됨
- **증상**: 진행률이 0으로 고정되거나, 섹션 진입 시점과 애니메이션 진행 시점이 어긋남
- **결과**: 콘텐츠가 계속 숨겨지는 문제 발생

#### 3. animation-fill-mode 누락
- **문제**: keyframe 초기 상태를 `opacity: 0`/`translate`로 두고 `animation-fill-mode`를 지정하지 않음
- **증상**: 애니메이션이 끝난 후 초기 상태로 돌아감
- **결과**: 섹션이 뷰포트에 있을 때도 콘텐츠가 보이지 않음

#### 4. 폴백 구현 부족
- **문제**: 카드 스택에서 `.card0`만 기본 보이도록 설정되어 있음 (`.card1`/`.card2`는 `opacity: 0`)
- **증상**: 브라우저가 `scroll-timeline`을 지원하지 않거나 `prefers-reduced-motion`인 경우 추가 카드가 표시되지 않음
- **결과**: Safari/구버전 브라우저에서 콘텐츠 손실

#### 5. 카드 겹침 및 순차 표시 문제
- **문제**: 모든 카드가 `position: absolute`로 겹쳐져 있고, `animation-range`가 동일하게 설정되어 한 번에 하나만 활성화되는 로직이 없음
- **증상**: 스크롤 진행에 맞춰 카드를 교체하는 로직이 없어 계속 겹쳐짐
- **결과**: 카드 3장을 순차로 보여주지 못함

### 해결 방안

#### 1. View Timeline으로 변경
```css
/* Before: 문서 전체 스크롤에 묶임 */
animation-timeline: scroll();
animation-range: cover 0% cover 50%;

/* After: 요소의 뷰포트 진입/이탈에 맞춤 */
animation-timeline: view(block);
animation-range: cover 0% cover 80%;
```

#### 2. animation-fill-mode 추가
```css
animation-fill-mode: both; /* 애니메이션 전후 상태 유지 */
```

#### 3. 폴백 개선
```css
/* Safari/구버전 브라우저 폴백 */
@supports not (animation-timeline: view()) {
  .card0, .card1, .card2 {
    opacity: 1 !important;
    transform: translate(-50%, -50%) scale(1) !important;
  }
}
```

#### 4. will-change 제거
- GPU 부담을 줄이기 위해 `will-change`를 제거하고 `transform`/`opacity`만 사용

#### 5. 뷰 타임라인 기반 단계 전환 구조
```css
/* 섹션에 뷰 타임라인 이름 지정 */
.featuredProjects {
  view-timeline-name: --featured;
  view-timeline-axis: block;
}

/* 각 카드를 구간별로 분할 */
.card0 {
  animation-timeline: --featured;
  animation-range: cover 0% cover 33%;  /* 첫 번째 구간 */
}

.card1 {
  animation-timeline: --featured;
  animation-range: cover 33% cover 66%;  /* 두 번째 구간 */
}

.card2 {
  animation-timeline: --featured;
  animation-range: cover 66% cover 100%; /* 세 번째 구간 */
}
```

#### 6. 레이아웃 변경 (absolute → relative)
- **Before**: `position: absolute`로 모든 카드가 겹쳐짐
- **After**: `position: relative`로 각 카드가 자기 자리를 가짐
- **폴백**: `display: grid; gap`으로 카드 나열

### 적용된 변경 사항

| 파일 | 변경 내용 |
|------|----------|
| `FeaturedProjectsSection.module.css` | `view-timeline-name` 기반 단계 전환, `position: relative` 레이아웃, 구간별 `animation-range` 분할 (0-33%, 33-66%, 66-100%), 폴백에서 `grid` 레이아웃 |
| `CTASection.module.css` | `scroll()` → `view(block)`, `animation-fill-mode: both` 추가, 폴백 추가 |
| `AboutSection.module.css` | `scroll()` → `view(block)`, `animation-fill-mode: both` 추가, 폴백 추가 |

### 검증 방법

1. **DevTools > Animations 패널**에서 확인:
   - 해당 섹션이 뷰포트에 들어올 때 timeline 진행률이 움직이는지 확인
   - 애니메이션이 끝난 뒤에도 `animation-fill-mode`로 보이는지 확인

2. **브라우저 호환성 테스트**:
   - Chrome/Edge/Firefox: 애니메이션 정상 동작
   - Safari: 콘텐츠 정상 표시 (애니메이션 없음)

3. **접근성 테스트**:
   - `prefers-reduced-motion: reduce` 설정 시 모든 콘텐츠 정상 표시

## 최근 개선 사항 (2024)

### AboutSection1 로고 스타일 개선

**변경 내용:**
- 로고에 둥근 모서리(`border-radius: 16px`) 적용
- 글래스모피즘 효과 추가:
  - `backdrop-filter: blur(8px)` - 흐림 효과
  - 반투명 배경 (`rgba(255, 255, 255, 0.1)`)
  - 부드러운 테두리와 그림자 효과
  - 패딩 추가로 로고와 테두리 간격 확보

**적용 파일:**
- `frontend/src/pages/HomePage/AboutSection.module.css`

**효과:**
- 로고들이 더 세련되고 현대적인 느낌
- 배경과 자연스럽게 블렌딩되는 효과

### FeaturedProjectsSection 슬라이드 애니메이션 개선

**변경 내용:**
1. **초기 구현**: 세 프로젝트 카드에 페이드인 애니메이션 추가
2. **애니메이션 속도 조정**: 더 천천히 페이드인되도록 `animation-range`와 키프레임 조정
3. **방향별 슬라이드**: 왼쪽 → 가운데 → 오른쪽에서 각각 슬라이드인되도록 구현
4. **최종 구현**: 세 카드 모두 왼쪽에서 등장하여 오른쪽으로 사라지는 통일된 애니메이션

**최종 애니메이션 동작:**
- **0-50%**: 왼쪽에서 빠르게 중앙으로 슬라이드인
- **50-70%**: 중앙에 유지
- **70-100%**: 오른쪽으로 슬라이드 아웃

**적용 파일:**
- `frontend/src/pages/HomePage/FeaturedProjectsSection.tsx` - `data-project-index` 속성 추가
- `frontend/src/pages/HomePage/FeaturedProjectsSection.module.css` - 통일된 슬라이드 애니메이션

**애니메이션 구조:**
```css
@keyframes slideInFromLeftAndOutToRight {
  0% {
    opacity: 0;
    transform: translateX(-100px);  /* 왼쪽에서 시작 */
  }
  50% {
    opacity: 1;
    transform: translateX(0);      /* 중앙 도착 */
  }
  70% {
    opacity: 1;
    transform: translateX(0);      /* 중앙 유지 */
  }
  100% {
    opacity: 0;
    transform: translateX(150px);   /* 오른쪽으로 사라짐 */
  }
}
```

**효과:**
- 일관된 사용자 경험 제공
- 스크롤 진행에 따라 자연스러운 전환 효과
- CSS Scroll-Driven Animations로 성능 최적화 유지

## 후속 작업

- [ ] 성능 모니터링 (실제 사용자 데이터 수집)
- [ ] Safari에서 애니메이션 지원 시 업데이트 (Apple 로드맵 확인)
- [ ] 다른 페이지에도 동일 패턴 적용 검토

## 참고 자료

- [CSS Scroll-driven Animations MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
- [Browser Support](https://caniuse.com/css-scroll-driven-animations)
- [Tokopedia Scroll-Driven Animations 사례](https://web.dev/articles/scroll-driven-animations)
- [View Timeline vs Scroll Timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations/using_scroll-driven_animations#using_view_timelines)
