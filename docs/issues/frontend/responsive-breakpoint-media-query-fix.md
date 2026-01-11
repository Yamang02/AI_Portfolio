# [ISSUE] 반응형 미디어 쿼리에서 CSS 변수 사용 문제 해결

## 배경 (Why)

프로젝트의 디자인 시스템에서 breakpoint를 CSS 변수(`--breakpoint-mobile`, `--breakpoint-tablet` 등)로 정의하고, 이를 미디어 쿼리에서 `var(--breakpoint-*)`로 사용하려고 시도했습니다. 그러나 **CSS 미디어 쿼리는 CSS 변수를 지원하지 않아** 반응형 레이아웃이 동작하지 않았습니다.

## 문제 정의 (What)

### 현상

- **데스크톱 (1024px 이상)**: 3열 그리드 정상 표시 ✅
- **태블릿 (768px-1023px)**: 2열로 바뀌지 않고 3열 유지 ❌
- **모바일 (767px 이하)**: 1열로 바뀌지 않고 3열 유지 ❌

### 원인

```css
/* ❌ 작동하지 않음 - CSS 변수는 미디어 쿼리에서 평가되지 않음 */
@media (min-width: var(--breakpoint-tablet)) and (max-width: var(--breakpoint-tablet-max)) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: var(--breakpoint-mobile)) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

**핵심 문제**: CSS 변수는 런타임에 평가되지만, 미디어 쿼리는 빌드/파싱 시점에 평가되어야 하므로 호환되지 않습니다.

### 영향 범위

프로젝트 전체의 반응형 미디어 쿼리가 영향을 받습니다:

| 파일 | 영향 받는 라인 | 설명 |
|------|--------------|------|
| `ArticleListPage.module.css` | 74, 81, 183, 195 | 아티클 목록 그리드 및 레이아웃 |
| `ProjectsListPage.module.css` | 165, 172, 179, 210 | 프로젝트 목록 그리드 및 레이아웃 |
| `HeroSection.module.css` | 135, 148, 170 | 히어로 섹션 반응형 |
| `CTASection.module.css` | 164 | CTA 섹션 반응형 |
| 기타 30+ 파일 | - | 프로젝트 전체 컴포넌트 |

## 목표 (Goal)

- [x] 이슈 문서 생성 및 문제 분석
- [ ] breakpoints 가이드 문서 수정
- [ ] 프로젝트 전체 CSS 파일에서 미디어 쿼리 수정
- [ ] 변경사항 테스트 및 검증

## 해결 방향

### 선택한 접근 방식: 직접 픽셀 값 사용

CSS 변수는 컴포넌트 내 스타일 속성에서만 사용하고, **미디어 쿼리에서는 직접 픽셀 값을 사용**합니다.

```css
/* ✅ 올바른 방법 */
/* Tablet (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### 대안 고려 및 선택 이유

#### 방법 1: 직접 픽셀 값 사용 (✅ 선택됨)

```css
/* ✅ 미디어 쿼리에서 직접 픽셀 값 사용 */
@media (min-width: 768px) and (max-width: 1023px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
```

**장점:**
- ✅ 추가 의존성 없음 (빌드 설정 변경 불필요)
- ✅ 명확하고 직관적 (`@media (max-width: 767px)`)
- ✅ 모든 브라우저에서 100% 호환
- ✅ 검색/치환으로 쉽게 수정 가능

**단점:**
- ⚠️ breakpoint 값 변경 시 여러 파일 수정 필요
  - **현실**: breakpoint는 업계 표준 값으로 거의 변경되지 않음

---

#### 방법 2-A: PostCSS Custom Media 플러그인

```css
/* 정의 */
@custom-media --mobile (max-width: 767px);
@custom-media --tablet (min-width: 768px) and (max-width: 1023px);

/* 사용 */
@media (--mobile) {
  .grid { grid-template-columns: 1fr; }
}
```

**장점:**
- ✅ CSS 표준 문법 사용
- ✅ 빌드 타임에 변환 (런타임 오버헤드 없음)
- ✅ 중앙에서 breakpoint 관리

**단점:**
- ❌ `postcss-custom-media` 플러그인 설치 필요
- ❌ `vite.config.ts`에 PostCSS 설정 추가 필요
- ❌ 빌드 복잡도 증가

**구현 예시:**
```bash
npm install postcss-custom-media
```

```typescript
// vite.config.ts
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcssCustomMedia({
          importFrom: './src/design-system/styles/globals.css'
        })
      ]
    }
  }
});
```

---

#### 방법 2-B: CSS-in-JS (styled-components, emotion)

```typescript
import styled from 'styled-components';
import { breakpoints } from '@/design-system/tokens';

const Grid = styled.div`
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: ${breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;
```

**장점:**
- ✅ TypeScript 변수를 직접 사용 가능
- ✅ 동적 스타일링 지원
- ✅ 타입 안전성

**단점:**
- ❌ **대규모 리팩토링 필요** (모든 CSS Module → styled-components 전환)
- ❌ 런타임 오버헤드 (스타일 주입)
- ❌ 번들 크기 증가
- ❌ 기존 CSS Module 구조 전면 변경

**영향 범위:**
- 수정 대상: 35+ CSS Module 파일
- 예상 작업량: 2-3일 (전체 컴포넌트 리팩토링)

---

#### 방법 2-C: SCSS/LESS 전환

```scss
// _breakpoints.scss
$mobile: 767px;
$tablet: 768px;
$desktop: 1024px;

@mixin mobile {
  @media (max-width: $mobile) { @content; }
}

// 사용
.grid {
  @include mobile {
    grid-template-columns: 1fr;
  }
}
```

**장점:**
- ✅ 변수와 mixins 지원
- ✅ 빌드 타임 처리 (런타임 오버헤드 없음)
- ✅ 중앙 관리 가능

**단점:**
- ❌ SCSS 컴파일러 추가 (`sass` 패키지 설치)
- ❌ 기존 CSS Module을 SCSS로 전환 필요
- ❌ Vite 설정 변경 필요
- ❌ 빌드 파이프라인 재구성

---

### 최종 결정: 방법 1 (직접 픽셀 값) 선택

**결정 이유:**

1. **실용성**: 추가 의존성이나 빌드 설정 변경 없이 즉시 해결 가능
2. **안정성**: Breakpoint 값은 업계 표준 (768px, 1024px)으로 거의 변경되지 않음
3. **명확성**: `@media (max-width: 767px)`가 더 직관적이고 이해하기 쉬움
4. **유지보수**: 검색/치환으로 쉽게 수정 가능
5. **프로젝트 구조**: 현재 CSS Module 구조를 유지하며 최소한의 변경

**방법 2의 문제점:**
- **PostCSS**: 빌드 설정 변경 필요 (작은 이득 대비 큰 복잡도 증가)
- **CSS-in-JS**: 전체 프로젝트 리팩토링 필요 (2-3일 작업량)
- **SCSS**: 빌드 파이프라인 재구성 필요

**향후 계획:**
- 현재: 방법 1로 문제 해결
- 향후: 프로젝트가 성장하고 breakpoint 변경이 빈번해지면, CSS-in-JS 전환을 별도 에픽으로 검토
- 그 전까지는 현재 방식이 충분히 효율적

### Breakpoint 표준 값

```typescript
// frontend/src/design-system/tokens/breakpoints.ts
export const breakpoints = {
  mobile: '767px',      // 모바일: 0px ~ 767px
  tablet: '768px',      // 태블릿 시작: 768px
  tabletMax: '1023px',  // 태블릿 끝: 1023px
  desktop: '1024px',    // 데스크톱: 1024px 이상
} as const;
```

이 값들은 변경되지 않을 것으로 예상되므로, 미디어 쿼리에서 직접 사용해도 안전합니다.

### CSS 변수 사용 정책

```css
/* ✅ CSS 변수 사용 가능: 속성 값 */
.element {
  padding: var(--spacing-4);
  color: var(--color-primary);
  border-radius: var(--border-radius-lg);
  max-width: var(--breakpoint-desktop); /* width 값으로는 사용 가능 */
}

/* ❌ CSS 변수 사용 불가: 미디어 쿼리 */
@media (max-width: var(--breakpoint-mobile)) { /* 작동하지 않음 */ }

/* ✅ 미디어 쿼리: 직접 픽셀 값 사용 */
@media (max-width: 767px) { /* 올바름 */ }
```

## 체크리스트

### 1. 문서 작업
- [x] 이슈 문서 생성
- [ ] breakpoints 가이드 문서 수정 (`docs/technical/guides/frontend/breakpoints-guide.md`)
  - [ ] CSS 변수를 미디어 쿼리에서 사용할 수 없다는 설명 추가
  - [ ] 올바른 사용 예시로 변경
  - [ ] 잘못된 사용 예시 추가 (안티패턴)

### 2. 코드 수정
- [ ] 주요 페이지 CSS 파일 수정
  - [ ] `ArticleListPage.module.css`
  - [ ] `ProjectsListPage.module.css`
- [ ] 위젯 CSS 파일 수정
  - [ ] `HeroSection.module.css`
  - [ ] `CTASection.module.css`
  - [ ] `FeaturedProjectsSection.module.css`
  - [ ] `AboutSection.module.css`
  - [ ] `AboutSection2.module.css`
  - [ ] `Header.module.css`
  - [ ] `Footer.module.css`
- [ ] 디자인 시스템 컴포넌트 CSS 파일 수정
  - [ ] `Modal.module.css`
  - [ ] `ProjectNavigation.module.css`
  - [ ] `ProjectDetailHeader.module.css`
  - [ ] `SectionTitle.module.css`
  - [ ] `Pagination.module.css`
  - [ ] `ProjectThumbnailCarousel.module.css`
  - [ ] `ArticleNavigation.module.css`
- [ ] 상세 페이지 CSS 파일 수정
  - [ ] `ArticleDetailPage.module.css`
  - [ ] `ProjectDetailPage.module.css`
  - [ ] `ProfilePage.module.css`
  - [ ] `ChatPage.module.css`
- [ ] ProfilePage 하위 컴포넌트 CSS 파일 수정
  - [ ] `IntroductionSection.module.css`
  - [ ] `ExperienceSection.module.css`
  - [ ] `EducationSection.module.css`
  - [ ] `ContactSection.module.css`
  - [ ] `CareerTimeline.module.css`
  - [ ] `CareerCard.module.css`
  - [ ] `CertificationSection.module.css`
  - [ ] `CareerTimelineSection.module.css`
- [ ] 기타 컴포넌트 CSS 파일 수정
  - [ ] `ProjectSearchModal.module.css`
  - [ ] `ProjectHistoryTimeline.module.css`
  - [ ] `ProjectNavigation.module.css` (ProjectDetailPage)
  - [ ] `ProjectDetailHeader.module.css` (ProjectDetailPage)
  - [ ] `ArticleNavigation.module.css` (article-view feature)

### 3. 테스트 및 검증
- [ ] 로컬 개발 환경에서 테스트
  - [ ] 데스크톱 (1024px 이상): 3열 그리드 확인
  - [ ] 태블릿 (768px-1023px): 2열 그리드 확인
  - [ ] 모바일 (767px 이하): 1열 그리드 확인
- [ ] 각 페이지별 반응형 동작 확인
  - [ ] 홈페이지 (`/`)
  - [ ] 프로필 페이지 (`/profile`)
  - [ ] 프로젝트 목록 (`/projects`)
  - [ ] 프로젝트 상세 (`/projects/:id`)
  - [ ] 아티클 목록 (`/articles`)
  - [ ] 아티클 상세 (`/articles/:id`)
  - [ ] 채팅 페이지 (`/chat`)
- [ ] 브라우저 호환성 확인
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

## 관련 파일

### 토큰 및 가이드
- `frontend/src/design-system/tokens/breakpoints.ts` (breakpoint 값 정의)
- `frontend/src/design-system/styles/globals.css` (CSS 변수 정의)
- `docs/technical/guides/frontend/breakpoints-guide.md` (가이드 문서)

### 영향 받는 CSS 파일 (35개)
1. `frontend/src/main/pages/ArticleListPage.module.css`
2. `frontend/src/main/pages/ProjectsListPage/ProjectsListPage.module.css`
3. `frontend/src/main/widgets/hero-section/ui/HeroSection.module.css`
4. `frontend/src/main/widgets/cta-section/ui/CTASection.module.css`
5. `frontend/src/main/widgets/featured-projects-section/ui/FeaturedProjectsSection.module.css`
6. `frontend/src/main/widgets/about-section/ui/AboutSection.module.css`
7. `frontend/src/main/widgets/about-section/ui/AboutSection2.module.css`
8. `frontend/src/main/widgets/header/ui/Header.module.css`
9. `frontend/src/main/widgets/footer/ui/Footer.module.css`
10. `frontend/src/design-system/components/Modal/Modal.module.css`
11. `frontend/src/design-system/components/ProjectNavigation/ProjectNavigation.module.css`
12. `frontend/src/design-system/components/ProjectDetailHeader/ProjectDetailHeader.module.css`
13. `frontend/src/design-system/components/SectionTitle/SectionTitle.module.css`
14. `frontend/src/design-system/components/Pagination/Pagination.module.css`
15. `frontend/src/design-system/components/Carousel/ProjectThumbnailCarousel.module.css`
16. `frontend/src/design-system/components/ArticleNavigation/ArticleNavigation.module.css`
17. `frontend/src/main/pages/ArticleDetailPage.module.css`
18. `frontend/src/main/pages/ProjectDetailPage/ProjectDetailPage.module.css`
19. `frontend/src/main/pages/ProfilePage/ProfilePage.module.css`
20. `frontend/src/main/pages/ChatPage/ChatPage.module.css`
21. `frontend/src/main/pages/ProfilePage/components/IntroductionSection.module.css`
22. `frontend/src/main/pages/ProfilePage/components/ExperienceSection.module.css`
23. `frontend/src/main/pages/ProfilePage/components/EducationSection.module.css`
24. `frontend/src/main/pages/ProfilePage/components/ContactSection.module.css`
25. `frontend/src/main/pages/ProfilePage/components/CareerTimeline.module.css`
26. `frontend/src/main/pages/ProfilePage/components/CareerCard.module.css`
27. `frontend/src/main/pages/ProfilePage/components/CertificationSection.module.css`
28. `frontend/src/main/pages/ProfilePage/components/CareerTimelineSection.module.css`
29. `frontend/src/main/pages/ProjectsListPage/components/ProjectSearchModal.module.css`
30. `frontend/src/main/pages/ProjectsListPage/components/ProjectHistoryTimeline.module.css`
31. `frontend/src/main/pages/ProjectDetailPage/components/ProjectNavigation.module.css`
32. `frontend/src/main/pages/ProjectDetailPage/components/ProjectDetailHeader.module.css`
33. `frontend/src/main/features/article-view/ui/ArticleNavigation.module.css`

## 참고 자료

- [MDN - CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [MDN - Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)
- [Can I Use - CSS Variables in Media Queries](https://caniuse.com/?search=css%20variables%20media%20queries) (지원하지 않음)
- [Stack Overflow - CSS Variables in Media Queries](https://stackoverflow.com/questions/40722882/css-native-variables-not-working-in-media-queries)

## 백로그 항목 (향후 검토)

### CSS-in-JS 전환 검토

현재는 방법 1 (직접 픽셀 값)로 해결하지만, 향후 다음 조건이 만족되면 CSS-in-JS 전환을 별도 에픽으로 검토할 수 있습니다:

**검토 조건:**
- Breakpoint 값이 자주 변경되는 경우 (현재는 안정적)
- 프로젝트가 대규모로 성장하여 디자인 토큰 관리가 복잡해지는 경우
- 동적 테마 전환 등 런타임 스타일링이 필요한 경우

**예상 작업:**
- styled-components 또는 emotion 도입
- 35+ CSS Module 파일을 CSS-in-JS로 전환
- 빌드 설정 및 성능 최적화
- 예상 작업 기간: 2-3일

**현재 상태:** 백로그 (우선순위: 낮음)

---

## 변경 이력

| 날짜 | 작성자 | 변경 내용 |
|------|--------|----------|
| 2026-01-11 | AI Agent (Claude) | 이슈 문서 생성 |
| 2026-01-11 | AI Agent (Claude) | 방법 2 (PostCSS, CSS-in-JS, SCSS) 상세 분석 추가 |
| 2026-01-11 | AI Agent (Claude) | 최종 결정 사유 및 향후 계획 추가 |
