# Phase 3 체크리스트: Design System Minimalization

**작성일**: 2025-01-04
**작성자**: AI Agent (Claude)

---

## 📋 작업 체크리스트

### Task 3.1: 디자인 토큰 구현

#### 3.1.1 Color Tokens

- [ ] `frontend/src/design-system/tokens/colors.ts` 파일 생성
  - [ ] Brand colors 정의 (primary, primaryHover, primaryActive)
  - [ ] Light mode colors 정의 (background, text, border, link, status)
  - [ ] Dark mode colors 정의 (background, text, border, link, status)
  - [ ] TypeScript 타입 export (BrandColor, LightModeColor, DarkModeColor)

- [ ] `frontend/src/design-system/styles/globals.css` CSS Variables 정의
  - [ ] Light mode CSS variables
  - [ ] Dark mode CSS variables (`@media (prefers-color-scheme: dark)`)
  - [ ] 모든 토큰이 CSS variables로 매핑됨

#### 3.1.2 Typography Tokens

- [ ] `frontend/src/design-system/tokens/typography.ts` 파일 생성
  - [ ] Font family 정의 (sans, mono) - 시스템 폰트 스택
  - [ ] Font size 정의 (display, h1-h4, base, lg, sm, xs)
  - [ ] Font size mobile 정의 (모바일 반응형)
  - [ ] Font weight 정의 (regular, medium, semibold, bold)
  - [ ] Line height 정의 (tight, normal, relaxed)
  - [ ] Letter spacing 정의 (tight, normal, wide)
  - [ ] TypeScript 타입 export

#### 3.1.3 Spacing Tokens

- [ ] `frontend/src/design-system/tokens/spacing.ts` 파일 생성
  - [ ] Base spacing scale 정의 (0, 1-24) - 8px 기반
  - [ ] Semantic spacing 정의
    - [ ] Component gap (xs, sm, md, lg, xl)
    - [ ] Section padding (mobile, tablet, desktop)
    - [ ] Container max width (sm, md, lg, xl)
    - [ ] Container padding (mobile, tablet, desktop)
  - [ ] TypeScript 타입 export (Spacing)

#### 3.1.4 기타 Tokens

- [ ] `frontend/src/design-system/tokens/borderRadius.ts` 파일 생성
  - [ ] Border radius 정의 (none, sm, md, lg, xl, full)
  - [ ] TypeScript 타입 export (BorderRadius)

- [ ] `frontend/src/design-system/tokens/shadow.ts` 파일 생성
  - [ ] Shadow 정의 (none, sm, md, lg)
  - [ ] TypeScript 타입 export (Shadow)

- [ ] `frontend/src/design-system/tokens/index.ts` Tokens export 파일 생성
  - [ ] 모든 토큰 re-export

---

### Task 3.2: 기본 컴포넌트 구현

#### 3.2.1 Button Component

- [ ] `frontend/src/design-system/components/Button/` 디렉토리 생성

- [ ] `Button.tsx` 컴포넌트 구현
  - [ ] Props 인터페이스 정의 (ButtonProps)
    - [ ] variant: 'primary' | 'secondary'
    - [ ] size: 'sm' | 'md' | 'lg'
    - [ ] disabled, children, onClick, href, target, ariaLabel, className
  - [ ] Primary variant 구현
  - [ ] Secondary variant 구현
  - [ ] Size variants 구현 (sm, md, lg)
  - [ ] Disabled state 구현
  - [ ] Link 기능 구현 (href props)
  - [ ] 접근성 속성 추가 (aria-label, rel)

- [ ] `Button.module.css` 스타일 구현
  - [ ] Base 스타일
  - [ ] Primary variant 스타일 (base, hover, active)
  - [ ] Secondary variant 스타일 (base, hover, active)
  - [ ] Size variants 스타일 (sm, md, lg)
  - [ ] Disabled state 스타일
  - [ ] Focus state 스타일 (outline)

- [ ] `Button.stories.tsx` Storybook 스토리 작성
  - [ ] Primary story
  - [ ] Secondary story
  - [ ] Small story
  - [ ] Large story
  - [ ] Disabled story
  - [ ] AsLink story

- [ ] `index.ts` export 파일 생성

#### 3.2.2 TextLink Component

- [ ] `frontend/src/design-system/components/TextLink/` 디렉토리 생성

- [ ] `TextLink.tsx` 컴포넌트 구현
  - [ ] Props 인터페이스 정의 (TextLinkProps)
    - [ ] href, children, external, underline, ariaLabel, className
  - [ ] 기본 링크 구현
  - [ ] 외부 링크 지원 (external props)
  - [ ] 밑줄 옵션 구현 (underline props)
  - [ ] 접근성 속성 추가 (aria-label, rel, sr-only)

- [ ] `TextLink.module.css` 스타일 구현
  - [ ] Base 스타일
  - [ ] Hover state 스타일
  - [ ] Visited state 스타일
  - [ ] Focus state 스타일 (outline)
  - [ ] Underline variant 스타일
  - [ ] Screen reader only 스타일 (srOnly)

- [ ] `TextLink.stories.tsx` Storybook 스토리 작성
  - [ ] Default story
  - [ ] External link story
  - [ ] With underline story

- [ ] `index.ts` export 파일 생성

#### 3.2.3 SectionTitle Component

- [ ] `frontend/src/design-system/components/SectionTitle/` 디렉토리 생성

- [ ] `SectionTitle.tsx` 컴포넌트 구현
  - [ ] Props 인터페이스 정의 (SectionTitleProps)
    - [ ] level: 'h1' | 'h2' | 'h3' | 'h4'
    - [ ] children, className
  - [ ] H1 레벨 구현
  - [ ] H2 레벨 구현
  - [ ] H3 레벨 구현
  - [ ] H4 레벨 구현

- [ ] `SectionTitle.module.css` 스타일 구현
  - [ ] Base 스타일
  - [ ] H1 스타일 (font-size, font-weight, margin-bottom)
  - [ ] H2 스타일
  - [ ] H3 스타일
  - [ ] H4 스타일
  - [ ] 모바일 반응형 스타일 (`@media (max-width: 767px)`)

- [ ] `SectionTitle.stories.tsx` Storybook 스토리 작성
  - [ ] H1 story
  - [ ] H2 story
  - [ ] H3 story
  - [ ] H4 story

- [ ] `index.ts` export 파일 생성

#### 3.2.4 Divider Component

- [ ] `frontend/src/design-system/components/Divider/` 디렉토리 생성

- [ ] `Divider.tsx` 컴포넌트 구현
  - [ ] Props 인터페이스 정의 (DividerProps)
    - [ ] variant: 'horizontal' | 'vertical'
    - [ ] spacing, className
  - [ ] Horizontal variant 구현
  - [ ] Vertical variant 구현
  - [ ] Spacing customization 구현

- [ ] `Divider.module.css` 스타일 구현
  - [ ] Base 스타일
  - [ ] Horizontal variant 스타일
  - [ ] Vertical variant 스타일

- [ ] `Divider.stories.tsx` Storybook 스토리 작성
  - [ ] Horizontal story
  - [ ] Vertical story
  - [ ] Custom spacing story

- [ ] `index.ts` export 파일 생성

#### 3.2.5 Components Export

- [ ] `frontend/src/design-system/components/index.ts` 파일 생성
  - [ ] Button export
  - [ ] TextLink export
  - [ ] SectionTitle export
  - [ ] Divider export

---

### Task 3.3: Storybook 설정 및 문서화

#### 3.3.1 Storybook 설치 및 초기화

- [ ] Storybook 패키지 설치
  ```bash
  npm install --save-dev @storybook/react @storybook/react-vite storybook
  ```

- [ ] Storybook 초기화
  ```bash
  npx storybook init
  ```

- [ ] `.storybook/` 설정 디렉토리 확인
  - [ ] `main.ts` 설정 확인
  - [ ] `preview.ts` 설정 확인
  - [ ] `globals.css` import 추가

#### 3.3.2 Tokens 문서화

- [ ] `frontend/src/design-system/tokens/Tokens.stories.mdx` 파일 생성
  - [ ] Color tokens 문서화
    - [ ] Brand colors
    - [ ] Light mode colors
    - [ ] Dark mode colors
  - [ ] Typography tokens 문서화
    - [ ] Font family
    - [ ] Font size
    - [ ] Font weight
    - [ ] Line height
    - [ ] Letter spacing
  - [ ] Spacing tokens 문서화
    - [ ] Base scale (8px 기반)
    - [ ] Semantic spacing
  - [ ] Border radius tokens 문서화
  - [ ] Shadow tokens 문서화

#### 3.3.3 Storybook 실행 및 확인

- [ ] Storybook 로컬 실행
  ```bash
  npm run storybook
  ```

- [ ] 모든 컴포넌트 스토리 확인
  - [ ] Button 스토리 확인
  - [ ] TextLink 스토리 확인
  - [ ] SectionTitle 스토리 확인
  - [ ] Divider 스토리 확인

- [ ] Tokens 문서 확인
  - [ ] Color tokens 문서 확인
  - [ ] Typography tokens 문서 확인
  - [ ] Spacing tokens 문서 확인

---

### Task 3.4: CSS Reset 및 Global Styles

#### 3.4.1 CSS Reset

- [ ] `frontend/src/design-system/styles/reset.css` 파일 생성
  - [ ] Box-sizing reset
  - [ ] Margin/Padding reset
  - [ ] Font smoothing
  - [ ] Line height normalization
  - [ ] 기타 브라우저 기본 스타일 제거

#### 3.4.2 Global Styles

- [ ] `frontend/src/design-system/styles/globals.css` 업데이트
  - [ ] CSS Variables import
  - [ ] Body 기본 스타일
    - [ ] Font family: system font stack
    - [ ] Background color: `var(--color-bg-primary)`
    - [ ] Text color: `var(--color-text-primary)`
    - [ ] Line height: `var(--line-height-normal)`

- [ ] 앱 엔트리 포인트에 global styles import
  - [ ] `frontend/src/main.tsx` (또는 `_app.tsx`)에 import 추가
    ```typescript
    import './design-system/styles/reset.css';
    import './design-system/styles/globals.css';
    ```

---

### Task 3.5: Design System Export

- [ ] `frontend/src/design-system/index.ts` 루트 export 파일 생성
  - [ ] Tokens export
  - [ ] Components export

---

## ✅ 검증 체크리스트

### 디자인 토큰

- [ ] 모든 color tokens가 정의되고 CSS variables로 매핑됨
- [ ] Light mode/Dark mode 토큰이 모두 정의됨
- [ ] Typography tokens가 시스템 폰트 기반으로 정의됨
- [ ] Spacing tokens가 8px 기반으로 일관되게 정의됨
- [ ] 모든 토큰이 TypeScript 타입 안전하게 정의됨

### 컴포넌트

- [ ] Button 컴포넌트가 모든 variants/sizes/states 지원
- [ ] TextLink 컴포넌트가 외부 링크 및 접근성 지원
- [ ] SectionTitle 컴포넌트가 모든 heading levels 지원
- [ ] Divider 컴포넌트가 horizontal/vertical variants 지원
- [ ] 모든 컴포넌트가 CSS Modules 사용
- [ ] 모든 컴포넌트가 TypeScript로 타입 안전하게 구현됨

### 접근성

- [ ] 모든 인터랙티브 요소에 aria-label 지원
- [ ] 외부 링크에 rel="noopener noreferrer" 추가
- [ ] 외부 링크에 screen reader 텍스트 추가 ("새 탭에서 열기")
- [ ] 키보드 focus 스타일 정의 (outline)
- [ ] 명도 대비 4.5:1 이상 (WCAG 2.1 AA)

### Storybook

- [ ] Storybook이 정상적으로 실행됨
- [ ] 모든 컴포넌트 스토리가 작동함
- [ ] Tokens 문서가 완성됨
- [ ] 각 컴포넌트의 사용 예시가 명확함

### Global Constraints 준수

- [ ] 디자인 최소화 (불필요한 장식 없음)
- [ ] 시스템 폰트만 사용 (외부 폰트 로딩 없음)
- [ ] 애니메이션 없음
- [ ] 페이지 UI 생성하지 않음 (Phase 5에서 작업)

---

## 📊 완료 기준

### 필수 산출물

- [ ] `frontend/src/design-system/tokens/` - 모든 토큰 파일 생성
- [ ] `frontend/src/design-system/components/` - 모든 컴포넌트 파일 생성
- [ ] `frontend/src/design-system/styles/` - CSS 파일 생성
- [ ] Storybook 설정 완료 및 문서화 완료

### 품질 기준

- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 경고 없음
- [ ] Storybook 빌드 성공
- [ ] 모든 컴포넌트 접근성 준수 (WCAG 2.1 AA)
- [ ] Global Constraints 위반 없음

---

## 🔗 다음 단계

Phase 3 완료 후:
1. `phase-3-completion.md` 작성 (완료 보고서)
2. [Phase 4 설계 문서](./phase-4-design.md)로 이동 (Wireframe)

---

**작성자**: AI Agent (Claude)
**최종 업데이트**: 2025-01-04
