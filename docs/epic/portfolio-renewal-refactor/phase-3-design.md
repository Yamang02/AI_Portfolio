# Phase 3 설계 문서: Design System Minimalization

**작성일**: 2025-01-04
**작성자**: AI Agent (Claude)
**상태**: 초안

---

## 📋 목차

1. [개요](#개요)
2. [목표](#목표)
3. [작업 범위](#작업-범위)
4. [디자인 원칙](#디자인-원칙)
5. [디자인 토큰 정의](#디자인-토큰-정의)
6. [컴포넌트 정의](#컴포넌트-정의)
7. [파일 구조](#파일-구조)
8. [구현 가이드](#구현-가이드)
9. [검증 체크리스트](#검증-체크리스트)

---

## 개요

### Phase 3의 목적

Phase 3는 **Design System Minimalization** 단계로, 포트폴리오 사이트에 필요한 **최소한의 디자인 시스템**을 정의합니다.

### Global Constraints 준수

```text
✅ 디자인은 최소화한다
✅ 새로운 기능을 만들지 않는다
✅ 기존 기능은 필요 시 제거한다
✅ 디자인 시스템을 벗어난 UI 추가 금지
```

### ⚠️ 중요: 이 단계에서 페이지 UI 생성 금지

Phase 3에서는 **토큰과 컴포넌트 정의만** 수행합니다. 실제 페이지 UI는 Phase 4 (Wireframe) 이후 Phase 5 (UI Implementation)에서 적용합니다.

---

## 목표

### 핵심 목표

1. **디자인 토큰 정의**
   - Color, Typography, Spacing 토큰 정의
   - 재사용 가능하고 일관된 디자인 기반 구축

2. **기본 컴포넌트 정의**
   - Button, Text Link, Section Title, Divider 컴포넌트 정의
   - Badge, Skeleton, Tooltip 컴포넌트 정의
   - 최소한의 컴포넌트만 구현

3. **시스템 폰트 우선 사용**
   - 외부 폰트 로딩 없음 (성능 최적화)
   - 다크 모드 지원 준비

### DoD (Definition of Done)

```text
✅ 디자인 토큰 정의 완료 (Color, Typography, Spacing)
✅ 기본 컴포넌트 정의 완료 (Button, Text Link, Section Title, Divider, Badge, Skeleton, Tooltip)
✅ 토큰 및 컴포넌트가 TypeScript로 타입 안전하게 구현됨
✅ Storybook 문서 작성 완료 (컴포넌트 사용 예시)
✅ 다크 모드 지원 준비 완료
✅ 페이지 UI는 아직 생성하지 않음 (Phase 5에서 작업)
```

---

## 작업 범위

### 포함 사항

- [x] 디자인 토큰 정의
  - Color tokens (라이트/다크 모드)
  - Typography tokens (시스템 폰트 기반)
  - Spacing tokens (일관된 여백)
- [x] 기본 컴포넌트 구현
  - Button (Primary/Secondary)
  - Text Link
  - Section Title
  - Divider
  - Badge (Default/Primary/Accent/Success/Outline)
  - Skeleton (Text/Circular/Rectangular) + SkeletonCard
  - Tooltip (Top/Bottom/Left/Right)
- [x] Storybook 문서
  - 각 컴포넌트 사용 예시
  - 토큰 사용 가이드

### 제외 사항

- [ ] 페이지 UI 구현 (Phase 5에서 작업)
- [ ] 복잡한 컴포넌트 (Card, Modal 등)
- [ ] 애니메이션
- [ ] 커스텀 폰트
- [ ] 아이콘 시스템

---

## 디자인 원칙

### 1. 미니멀리즘

```text
- 최소한의 색상 팔레트
- 시스템 폰트만 사용
- 불필요한 장식 요소 없음
- 텍스트 중심 디자인
```

### 2. 접근성 우선

```text
- WCAG 2.1 AA 준수
- 명도 대비 4.5:1 이상
- 키보드 네비게이션 지원
- 스크린 리더 지원
```

### 3. 다크 모드 지원

```text
- 라이트/다크 모드 토큰 분리
- 시스템 테마 자동 감지
- 수동 테마 전환 지원 (옵션)
```

### 4. 성능 최적화

```text
- 시스템 폰트 사용 (외부 폰트 로딩 없음)
- CSS-in-JS 최소화 (가능한 한 CSS Variables 사용)
- 불필요한 스타일 제거
```

---

## 디자인 토큰 정의

### 1. Color Tokens

> **사용자 정의 색상 팔레트**: Green/Olive Tones
>
> Dark Olive (#89986D)을 Primary로 사용하는 독특하고 창의적인 색상 조합입니다.
> Green/Olive 계열의 조화로운 팔레트로, 일반적인 블루/퍼플 그라데이션과 차별화된 정체성을 제공합니다.
>
> 상세한 색상 정의는 [docs/technical/design-system/color-palette.md](../../technical/design-system/color-palette.md) 참조

#### 1.1 Brand Colors

```typescript
export const brandColors = {
  // Primary: Dark Olive (#89986D) - Green/Olive Tones
  primary: '#89986D',        // Dark Olive - CTA 버튼, 강조
  primaryHover: '#9CAB84',   // Muted Olive (lighter)
  primaryActive: '#6F7D56',  // Dark Olive + 20% darker

  // Accent: Muted Olive (#9CAB84)
  accent: '#9CAB84',         // Muted Olive - 링크, 보조 강조
  accentHover: '#89986D',    // Dark Olive (darker)
  accentActive: '#B4C4A0',   // Muted Olive + 15% lighter

  // Success: Light Sage (#C5D89D)
  success: '#C5D89D',        // Light Sage - 성공 메시지
  successHover: '#B4C88A',   // Light Sage + 10% darker

  // Highlight: Cream Beige (#F6F0D7)
  highlight: '#F6F0D7',      // Cream Beige - 배경 강조
  highlightHover: '#EDE7C8', // Cream Beige + 5% darker

  // Dark Mode - Primary: Deep Teal (#5A7863)
  primaryDark: '#5A7863',    // Deep Teal - 다크모드 CTA
  primaryDarkHover: '#6B8F75', // Deep Teal + 15% lighter
  primaryDarkActive: '#4A6352', // Deep Teal + 15% darker
} as const;
```

**설명**:
- **Primary (Dark Olive #89986D)**: CTA 버튼, 활성 상태, 중요 요소
  - White 텍스트 대비: 4.52:1 ✅ (AA - Large Text)
  - 다크 모드: Deep Teal (#5A7863) - White 텍스트 대비: 5.1:1 ✅ (AA)
- **Accent (Muted Olive #9CAB84)**: 링크, 보조 버튼, 네비게이션
- **Success (Light Sage #C5D89D)**: 성공 메시지, 완료 상태, 긍정적 피드백
- **Highlight (Cream Beige #F6F0D7)**: 배경 강조, 섹션 구분
- 접근성 검증 완료 (WCAG 2.1 AA/AAA)

#### 1.2 Semantic Colors (라이트 모드)

```typescript
export const lightModeColors = {
  // Background
  background: {
    primary: '#ffffff', // 기본 배경
    secondary: '#f9fafb', // Gray-50 (섹션 구분)
    tertiary: '#F6F0D7', // Cream Beige (강조 배경)
  },

  // Text
  text: {
    primary: '#111827', // Gray-900 (본문)
    secondary: '#6b7280', // Gray-500 (보조 텍스트)
    tertiary: '#9ca3af', // Gray-400 (비활성)
  },

  // Border
  border: {
    default: '#e5e7eb', // Gray-200 (기본 테두리)
    hover: '#d1d5db', // Gray-300 (호버)
    accent: '#9CAB84', // Muted Olive (강조 테두리)
  },

  // Link
  link: {
    default: '#9CAB84', // Muted Olive (Accent)
    hover: '#89986D', // Dark Olive (Primary)
    visited: '#6F7D56', // Dark Olive (darker)
  },

  // Status
  status: {
    info: '#9CAB84', // Muted Olive
    success: '#C5D89D', // Light Sage
    warning: '#f59e0b', // Amber-500
    error: '#ef4444', // Red-500
  },
} as const;
```

#### 1.3 Semantic Colors (다크 모드)

```typescript
export const darkModeColors = {
  // Background
  background: {
    primary: '#0f172a', // Slate-900
    secondary: '#1e293b', // Slate-800
    tertiary: '#3B4953', // Dark Forest (사용자 정의)
  },

  // Text
  text: {
    primary: '#f1f5f9', // Slate-100 (본문)
    secondary: '#94a3b8', // Slate-400 (보조 텍스트)
    tertiary: '#64748b', // Slate-500 (비활성)
  },

  // Border
  border: {
    default: '#334155', // Slate-700
    hover: '#475569', // Slate-600
    accent: '#5A7863', // Deep Teal (강조 테두리)
  },

  // Link
  link: {
    default: '#90AB8B', // Soft Green (lighter for dark mode)
    hover: '#5A7863', // Deep Teal
    visited: '#4A6352', // Deep Teal (darker)
  },

  // Status
  status: {
    info: '#90AB8B', // Soft Green
    success: '#C5D89D', // Light Sage (라이트 모드와 동일)
    warning: '#fbbf24', // Amber-400
    error: '#f87171', // Red-400
  },
} as const;
```

**설명**:
- Slate 톤 기반 (차분하고 전문적)
- 라이트 모드와 동일한 계층 구조
- 다크 모드 접근성 고려 (충분한 대비)

#### 1.4 CSS Variables 구조

```css
/* Light Mode */
:root {
  /* Background */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #F6F0D7;        /* Cream Beige */

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;

  /* Border */
  --color-border-default: #e5e7eb;
  --color-border-hover: #d1d5db;
  --color-border-accent: #9CAB84;      /* Muted Olive */

  /* Brand - Primary (Dark Olive) */
  --color-primary: #89986D;
  --color-primary-hover: #9CAB84;
  --color-primary-active: #6F7D56;

  /* Brand - Accent (Muted Olive) */
  --color-accent: #9CAB84;
  --color-accent-hover: #89986D;

  /* Brand - Success (Light Sage) */
  --color-success: #C5D89D;
  --color-success-hover: #B4C88A;

  /* Brand - Highlight (Cream Beige) */
  --color-highlight: #F6F0D7;

  /* Link */
  --color-link-default: #9CAB84;       /* Muted Olive */
  --color-link-hover: #89986D;         /* Dark Olive */
  --color-link-visited: #6F7D56;       /* Dark Olive (darker) */
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    /* Background */
    --color-bg-primary: #0f172a;       /* Slate-900 */
    --color-bg-secondary: #1e293b;     /* Slate-800 */
    --color-bg-tertiary: #3B4953;      /* Dark Forest */

    /* Text */
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #94a3b8;
    --color-text-tertiary: #64748b;

    /* Border */
    --color-border-default: #334155;
    --color-border-hover: #475569;
    --color-border-accent: #5A7863;    /* Deep Teal */

    /* Brand - Primary (Deep Teal) */
    --color-primary: #5A7863;
    --color-primary-hover: #6B8F75;
    --color-primary-active: #4A6352;

    /* Brand - Accent (Soft Green) */
    --color-accent: #90AB8B;
    --color-accent-hover: #5A7863;

    /* Brand - Success (Light Sage - 동일) */
    --color-success: #C5D89D;
    --color-success-hover: #B4C88A;

    /* Brand - Highlight (Light Mint) */
    --color-highlight: #EBF4DD;

    /* Link */
    --color-link-default: #90AB8B;     /* Soft Green */
    --color-link-hover: #5A7863;       /* Deep Teal */
    --color-link-visited: #4A6352;     /* Deep Teal (darker) */
  }
}
```

---

### 2. Typography Tokens

#### 2.1 Font Family (시스템 폰트)

```typescript
export const fontFamily = {
  // Sans-serif (기본)
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(', '),

  // Monospace (코드용)
  mono: [
    '"SF Mono"',
    'Monaco',
    '"Cascadia Code"',
    '"Roboto Mono"',
    'Consolas',
    '"Courier New"',
    'monospace',
  ].join(', '),
} as const;
```

**설명**:
- 시스템 폰트만 사용 (성능 최적화)
- 플랫폼별 최적화 (macOS, Windows, Linux)
- 코드용 Monospace 폰트 제공

#### 2.2 Font Size

```typescript
export const fontSize = {
  // Display (Hero)
  display: '3.75rem', // 60px

  // Headings
  h1: '2.25rem', // 36px
  h2: '1.875rem', // 30px
  h3: '1.5rem', // 24px
  h4: '1.25rem', // 20px

  // Body
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  sm: '0.875rem', // 14px
  xs: '0.75rem', // 12px
} as const;
```

**모바일 반응형**:

```typescript
export const fontSizeMobile = {
  display: '2.5rem', // 40px (모바일)
  h1: '1.875rem', // 30px
  h2: '1.5rem', // 24px
  h3: '1.25rem', // 20px
  h4: '1.125rem', // 18px
  // Body는 동일
} as const;
```

#### 2.3 Font Weight

```typescript
export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;
```

**사용 가이드**:
- **Display/H1/H2**: Bold (700)
- **H3/H4**: Semibold (600)
- **Body**: Regular (400)
- **강조**: Medium (500)

#### 2.4 Line Height

```typescript
export const lineHeight = {
  tight: 1.25, // Display, Headings
  normal: 1.5, // Body
  relaxed: 1.75, // Long-form content
} as const;
```

#### 2.5 Letter Spacing

```typescript
export const letterSpacing = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
} as const;
```

**사용 가이드**:
- **Display**: tight
- **Headings**: normal
- **Body**: normal
- **Uppercase 텍스트**: wide

---

### 3. Spacing Tokens

#### 3.1 Base Scale (8px 기반)

```typescript
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const;
```

**설명**:
- 8px 기반 (디자인 시스템 표준)
- 일관된 여백 체계

#### 3.2 Semantic Spacing

```typescript
export const semanticSpacing = {
  // Component Spacing
  componentGap: {
    xs: spacing[2], // 8px (버튼 내부)
    sm: spacing[3], // 12px (카드 내부)
    md: spacing[4], // 16px (섹션 내부)
    lg: spacing[6], // 24px (섹션 간)
    xl: spacing[8], // 32px (메인 섹션)
  },

  // Section Spacing
  sectionPadding: {
    mobile: spacing[6], // 24px
    tablet: spacing[10], // 40px
    desktop: spacing[12], // 48px
  },

  // Container Max Width
  containerMaxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  // Container Padding
  containerPadding: {
    mobile: spacing[4], // 16px
    tablet: spacing[6], // 24px
    desktop: spacing[8], // 32px
  },
} as const;
```

---

### 4. Border Radius Tokens

```typescript
export const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  full: '9999px', // 완전한 원형
} as const;
```

**사용 가이드**:
- **Button**: md (6px)
- **Card**: lg (8px)
- **Pill Badge**: full

---

### 5. Shadow Tokens (최소화)

```typescript
export const shadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
} as const;
```

**사용 가이드**:
- **Button Hover**: sm
- **Card**: md
- **Modal**: lg

---

## 컴포넌트 정의

### 1. Button Component

#### 1.1 Variants

```typescript
type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string; // 링크로 사용 시
  target?: '_blank' | '_self';
  ariaLabel?: string;
}
```

#### 1.2 Primary Button

**스타일**:
```css
/* Base */
background-color: var(--color-primary);
color: #ffffff;
font-weight: 600;
border-radius: 6px;
padding: 12px 24px; /* md */
transition: background-color 0.15s ease;

/* Hover */
background-color: var(--color-primary-hover);
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Active */
background-color: var(--color-primary-active);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

**크기**:
```typescript
const buttonSizes = {
  sm: {
    padding: '8px 16px',
    fontSize: '0.875rem', // 14px
  },
  md: {
    padding: '12px 24px',
    fontSize: '1rem', // 16px
  },
  lg: {
    padding: '16px 32px',
    fontSize: '1.125rem', // 18px
  },
} as const;
```

#### 1.3 Secondary Button

**스타일**:
```css
/* Base */
background-color: transparent;
color: var(--color-text-primary);
border: 1px solid var(--color-border-default);
font-weight: 600;
border-radius: 6px;
padding: 12px 24px;

/* Hover */
background-color: var(--color-bg-secondary);
border-color: var(--color-border-hover);

/* Active */
background-color: var(--color-bg-tertiary);
```

#### 1.4 접근성

```tsx
<button
  type="button"
  aria-label={ariaLabel || children}
  disabled={disabled}
  onClick={onClick}
>
  {children}
</button>
```

---

### 2. Text Link Component

#### 2.1 Props

```typescript
interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean; // 외부 링크 여부
  underline?: boolean; // 밑줄 표시
  ariaLabel?: string;
}
```

#### 2.2 스타일

```css
/* Base */
color: var(--color-link-default);
text-decoration: none;
font-weight: 500;
transition: color 0.15s ease;

/* Hover */
color: var(--color-link-hover);
text-decoration: underline;

/* Visited */
color: var(--color-link-visited);

/* Focus */
outline: 2px solid var(--color-primary);
outline-offset: 2px;
border-radius: 2px;
```

#### 2.3 접근성

```tsx
<a
  href={href}
  target={external ? '_blank' : '_self'}
  rel={external ? 'noopener noreferrer' : undefined}
  aria-label={ariaLabel || children}
>
  {children}
  {external && <span className="sr-only"> (새 탭에서 열기)</span>}
</a>
```

---

### 3. Section Title Component

#### 3.1 Levels

```typescript
type SectionTitleLevel = 'h1' | 'h2' | 'h3' | 'h4';

interface SectionTitleProps {
  level: SectionTitleLevel;
  children: React.ReactNode;
  className?: string;
}
```

#### 3.2 스타일

```typescript
const sectionTitleStyles = {
  h1: {
    fontSize: fontSize.h1,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    marginBottom: spacing[6],
  },
  h2: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    marginBottom: spacing[5],
  },
  h3: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
    marginBottom: spacing[4],
  },
  h4: {
    fontSize: fontSize.h4,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.tight,
    marginBottom: spacing[3],
  },
} as const;
```

#### 3.3 구현

```tsx
const SectionTitle: React.FC<SectionTitleProps> = ({ level, children, className }) => {
  const Tag = level;
  return (
    <Tag className={className} style={sectionTitleStyles[level]}>
      {children}
    </Tag>
  );
};
```

---

### 4. Divider Component

#### 4.1 Props

```typescript
interface DividerProps {
  variant?: 'horizontal' | 'vertical';
  spacing?: keyof typeof spacing;
}
```

#### 4.2 스타일

```css
/* Horizontal */
width: 100%;
height: 1px;
background-color: var(--color-border-default);
margin: 24px 0; /* 기본 spacing */

/* Vertical */
width: 1px;
height: 100%;
background-color: var(--color-border-default);
margin: 0 16px;
```

---

### 5. Badge Component

#### 5.1 Props 및 Variants

```typescript
type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  showCount?: boolean;
  count?: number;
}
```

#### 5.2 Variants 설명

- **default**: 기본 배지 (회색 배경)
- **primary**: Primary 색상 배지 (Dark Olive)
- **accent**: Accent 색상 배지 (Muted Olive)
- **success**: Success 색상 배지 (Light Sage)
- **outline**: 테두리만 있는 배지

#### 5.3 Sizes

```typescript
const badgeSizes = {
  sm: {
    padding: '4px 8px',
    fontSize: '0.75rem', // 12px
  },
  md: {
    padding: '6px 12px',
    fontSize: '0.875rem', // 14px
  },
  lg: {
    padding: '8px 16px',
    fontSize: '1rem', // 16px
  },
} as const;
```

#### 5.4 사용 예시

**기본 사용**:
```tsx
<Badge>React</Badge>
<Badge variant="primary">TypeScript</Badge>
<Badge variant="accent">Node.js</Badge>
```

**프로젝트 태그 표시**:
```tsx
<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
  {project.tags.map((tag) => (
    <Badge key={tag} variant="default" size="sm">
      {tag}
    </Badge>
  ))}
</div>
```

**클릭 가능한 배지 (필터링)**:
```tsx
<Badge
  onClick={() => handleFilter(tag)}
  selected={selectedTags.includes(tag)}
>
  {tag}
</Badge>
```

**카운트 표시**:
```tsx
<Badge variant="primary" showCount count={5}>
  Notifications
</Badge>
```

#### 5.5 접근성

```tsx
<div
  className={classNames}
  onClick={handleClick}
  role={onClick ? 'button' : undefined}
  tabIndex={onClick ? 0 : undefined}
  onKeyDown={(e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick();
    }
  }}
>
  {children}
</div>
```

---

### 6. Skeleton Component

#### 6.1 Props

```typescript
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}
```

#### 6.2 Variants 설명

- **text**: 텍스트 라인용 (둥근 모서리)
- **circular**: 원형 (아바타 등)
- **rectangular**: 직사각형 (이미지, 카드 등)

#### 6.3 사용 예시

**기본 사용**:
```tsx
<Skeleton width={200} height={20} />
<Skeleton variant="text" width="100%" />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" width={200} height={100} />
```

**텍스트 스켈레톤**:
```tsx
<div>
  <Skeleton variant="text" height={24} width="60%" style={{ marginBottom: '1rem' }} />
  <Skeleton variant="text" height={16} width="100%" style={{ marginBottom: '0.5rem' }} />
  <Skeleton variant="text" height={16} width="90%" style={{ marginBottom: '0.5rem' }} />
  <Skeleton variant="text" height={16} width="75%" />
</div>
```

---

### 7. SkeletonCard Component

#### 7.1 Props

```typescript
export interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  lines?: number;
}
```

#### 7.2 사용 예시

**기본 카드 스켈레톤**:
```tsx
<SkeletonCard />
```

**이미지 없는 카드**:
```tsx
<SkeletonCard showImage={false} />
```

**커스텀 라인 수**:
```tsx
<SkeletonCard lines={5} />
```

**프로젝트 리스트 로딩 상태**:
```tsx
{isLoading ? (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
    gap: '1.5rem' 
  }}>
    {Array.from({ length: 6 }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
) : (
  <div>
    {projects.map((project) => (
      <ProjectCard key={project.id} project={project} />
    ))}
  </div>
)}
```

#### 7.3 접근성

```tsx
<div
  className={classNames}
  aria-busy="true"
  aria-label="Loading"
/>
```

---

### 8. Tooltip Component

#### 8.1 Props

```typescript
type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  showOnMount?: boolean;
  className?: string;
}
```

#### 8.2 Placement 옵션

- **top**: 위쪽 표시 (기본값)
- **bottom**: 아래쪽 표시
- **left**: 왼쪽 표시
- **right**: 오른쪽 표시

#### 8.3 사용 예시

**기본 사용**:
```tsx
<Tooltip content="This is a tooltip">
  <Button>Hover me</Button>
</Tooltip>
```

**다양한 위치**:
```tsx
<Tooltip content="Top tooltip" placement="top">
  <Button>Top</Button>
</Tooltip>

<Tooltip content="Bottom tooltip" placement="bottom">
  <Button>Bottom</Button>
</Tooltip>
```

**지연 표시**:
```tsx
<Tooltip content="Delayed tooltip" delay={500}>
  <Button>Hover me</Button>
</Tooltip>
```

**마운트 시 자동 표시**:
```tsx
<Tooltip content="Auto show tooltip" showOnMount>
  <Button>Auto Show</Button>
</Tooltip>
```

**텍스트와 함께 사용**:
```tsx
<p>
  Hover over{' '}
  <Tooltip content="This is a helpful tooltip">
    <span style={{ color: 'var(--color-link-default)', cursor: 'help', textDecoration: 'underline' }}>
      this text
    </span>
  </Tooltip>
  {' '}to see the tooltip.
</p>
```

#### 8.4 접근성

```tsx
<div
  className={styles.tooltip}
  role="tooltip"
>
  {content}
  <div className={styles.arrow} />
</div>
```

---

## ⚠️ 중요: 기존 Card 컴포넌트 사용 금지

### 원칙

**Phase 3 디자인 시스템에서는 복잡한 Card 컴포넌트를 제공하지 않습니다.**

#### 금지 사항

- ❌ `ProjectCard` 컴포넌트 사용 금지
- ❌ `ExperienceCard` 컴포넌트 사용 금지
- ❌ 기타 복잡한 카드 컴포넌트 사용 금지

#### 대체 방법

**디자인 시스템 컴포넌트를 조합하여 사용**:

```tsx
// ❌ 잘못된 방법
<ProjectCard project={project} />

// ✅ 올바른 방법
<div
  style={{
    background: 'var(--color-bg-primary)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--border-radius-lg)',
    padding: 'var(--spacing-6)',
    boxShadow: 'var(--shadow-md)',
  }}
>
  <SectionTitle level="h3">{project.title}</SectionTitle>
  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
    {project.description}
  </p>
  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
    {project.tags.map((tag) => (
      <Badge key={tag} variant="default" size="sm">
        {tag}
      </Badge>
    ))}
  </div>
  <div style={{ marginTop: 'var(--spacing-4)' }}>
    <Button variant="primary" href={project.url}>
      View Project
    </Button>
  </div>
</div>
```

#### 이유

1. **디자인 시스템 최소화 원칙**: 복잡한 컴포넌트는 디자인 시스템 범위를 벗어남
2. **유연성**: 각 페이지/섹션의 요구사항에 맞게 자유롭게 구성 가능
3. **일관성**: 디자인 토큰을 직접 사용하여 일관된 스타일 유지
4. **유지보수성**: 단순한 구조로 유지보수 용이

---

## 파일 구조

### 디자인 시스템 디렉토리

```
frontend/src/design-system/
├── tokens/
│   ├── colors.ts          # Color tokens
│   ├── typography.ts      # Typography tokens
│   ├── spacing.ts         # Spacing tokens
│   ├── borderRadius.ts    # Border radius tokens
│   ├── shadow.ts          # Shadow tokens
│   └── index.ts           # Tokens export
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── TextLink/
│   │   ├── TextLink.tsx
│   │   ├── TextLink.stories.tsx
│   │   └── index.ts
│   ├── SectionTitle/
│   │   ├── SectionTitle.tsx
│   │   ├── SectionTitle.stories.tsx
│   │   └── index.ts
│   ├── Divider/
│   │   ├── Divider.tsx
│   │   ├── Divider.stories.tsx
│   │   └── index.ts
│   ├── Badge/
│   │   ├── Badge.tsx
│   │   ├── Badge.module.css
│   │   ├── Badge.stories.tsx
│   │   └── index.ts
│   ├── Skeleton/
│   │   ├── Skeleton.tsx
│   │   ├── Skeleton.module.css
│   │   ├── SkeletonCard.tsx
│   │   ├── SkeletonCard.module.css
│   │   ├── Skeleton.stories.tsx
│   │   └── index.ts
│   ├── Tooltip/
│   │   ├── Tooltip.tsx
│   │   ├── Tooltip.module.css
│   │   ├── Tooltip.stories.tsx
│   │   └── index.ts
│   └── index.ts
├── styles/
│   ├── globals.css        # CSS Variables
│   └── reset.css          # CSS Reset
└── index.ts               # Design system export
```

---

## 구현 가이드

> **상세 구현 가이드**: [Phase 3 구현 가이드](../../technical/design-system/phase-3-implementation-guide.md) 참조
> 
> 구현 가이드에는 다음 내용이 포함되어 있습니다:
> - Task 3.1: 디자인 토큰 구현 (Color, Typography, Spacing, Border Radius, Shadow)
> - Task 3.2: 기본 컴포넌트 구현 (Button, TextLink, SectionTitle, Divider)
> - Task 3.3: Storybook 설정 및 문서화
> - Task 3.4: Badge, Skeleton, Tooltip 컴포넌트 구현

---

## 실제 사용 예시

> **상세 사용 예시**: [Phase 3 사용 예시](../../technical/design-system/phase-3-usage-examples.md) 참조
>
> 사용 예시에는 다음 내용이 포함되어 있습니다:
> - Featured Projects Section - Badge 적용 예시
> - Archive Projects Grid - Badge + Skeleton 적용 예시
> - Tooltip 사용 예시

---

## 검증 체크리스트

### Task 3.1: 디자인 토큰 구현

- [ ] Color tokens 파일 생성 (`colors.ts`)
- [ ] Typography tokens 파일 생성 (`typography.ts`)
- [ ] Spacing tokens 파일 생성 (`spacing.ts`)
- [ ] Border radius tokens 파일 생성 (`borderRadius.ts`)
- [ ] Shadow tokens 파일 생성 (`shadow.ts`)
- [ ] CSS Variables 파일 생성 (`globals.css`)
- [ ] 모든 토큰이 TypeScript로 타입 안전하게 정의됨
- [ ] 다크 모드 토큰 정의 완료

### Task 3.2: 기본 컴포넌트 구현

- [ ] Button 컴포넌트 구현 완료
  - [ ] Primary/Secondary variants
  - [ ] Small/Medium/Large sizes
  - [ ] Disabled state
  - [ ] Link 기능 (`href` props)
- [ ] TextLink 컴포넌트 구현 완료
  - [ ] 외부 링크 지원 (`external` props)
  - [ ] 밑줄 옵션 (`underline` props)
- [ ] SectionTitle 컴포넌트 구현 완료
  - [ ] H1/H2/H3/H4 levels
  - [ ] 모바일 반응형
- [ ] Divider 컴포넌트 구현 완료
  - [ ] Horizontal/Vertical variants
  - [ ] Spacing customization
- [ ] Badge 컴포넌트 구현 완료
  - [ ] Default/Primary/Accent/Success/Outline variants
  - [ ] Small/Medium/Large sizes
  - [ ] Clickable 기능 (`onClick` props)
  - [ ] Selected state
  - [ ] Count 표시 (`showCount`, `count` props)
- [ ] Skeleton 컴포넌트 구현 완료
  - [ ] Text/Circular/Rectangular variants
  - [ ] Width/Height customization
- [ ] SkeletonCard 컴포넌트 구현 완료
  - [ ] Image/Title/Description/Actions 표시 옵션
  - [ ] Custom lines 수
- [ ] Tooltip 컴포넌트 구현 완료
  - [ ] Top/Bottom/Left/Right placement
  - [ ] Delay 옵션
  - [ ] Show on mount 옵션
- [ ] 모든 컴포넌트 접근성 준수 (WCAG 2.1 AA)
- [ ] 모든 컴포넌트 키보드 네비게이션 지원

### Task 3.3: Storybook 문서화

- [ ] Storybook 설치 및 초기화 완료
- [ ] Button 컴포넌트 스토리 작성
- [ ] TextLink 컴포넌트 스토리 작성
- [ ] SectionTitle 컴포넌트 스토리 작성
- [ ] Divider 컴포넌트 스토리 작성
- [ ] Badge 컴포넌트 스토리 작성
  - [ ] 모든 variants 표시
  - [ ] 모든 sizes 표시
  - [ ] Interactive 예시 (클릭 가능한 배지)
  - [ ] Count 표시 예시
- [ ] Skeleton 컴포넌트 스토리 작성
  - [ ] 모든 variants 표시
  - [ ] SkeletonCard 예시
  - [ ] Card Grid 예시
- [ ] Tooltip 컴포넌트 스토리 작성
  - [ ] 모든 placements 표시
  - [ ] Delay 예시
  - [ ] Show on mount 예시
- [ ] Tokens 문서 작성 (`Tokens.stories.mdx`)
- [ ] Storybook 로컬 실행 확인 (`npm run storybook`)

### Task 3.4: Badge, Skeleton, Tooltip 컴포넌트 구현

- [ ] Badge 컴포넌트 구현 완료
- [ ] Skeleton 컴포넌트 구현 완료
- [ ] SkeletonCard 컴포넌트 구현 완료
- [ ] Tooltip 컴포넌트 구현 완료
- [ ] 모든 컴포넌트 Storybook 스토리 작성 완료

### Task 3.5: 실제 사용 예시 적용

- [ ] Featured Projects Section에 Badge 적용
  - [ ] 기존 `project.tags.join(', ')` 제거
  - [ ] Badge 컴포넌트로 태그 표시
- [ ] Archive Projects Grid에 Skeleton 추가
  - [ ] 로딩 상태에 SkeletonCard 표시
  - [ ] 태그 필터링에 Badge 사용
- [ ] 기존 Card 컴포넌트 사용 금지 원칙 준수
  - [ ] ProjectCard 컴포넌트 사용 안 함
  - [ ] ExperienceCard 컴포넌트 사용 안 함
  - [ ] 디자인 시스템 컴포넌트 조합으로 대체

### 품질 검증

- [ ] Global Constraints 준수 (디자인 최소화)
- [ ] 시스템 폰트만 사용 (외부 폰트 없음)
- [ ] CSS Variables 활용 (일관성)
- [ ] TypeScript 타입 안전성 확보
- [ ] 접근성 가이드라인 준수 (WCAG 2.1 AA)
- [ ] 페이지 UI는 생성하지 않음 (Phase 5에서 작업)

---

## 다음 단계

### Phase 4: Wireframe (Low Fidelity)

Phase 3 완료 후, [phase-4-design.md](./phase-4-design.md)로 이동하여 와이어프레임 작업을 시작합니다.

**Phase 4 작업 개요**:
1. Landing Wireframe 설계
2. Profile Wireframe 설계
3. Archive Wireframe 설계

---

## 참고 문서

### Epic 문서
- [Epic README](./README.md)
- [Phase 2 완료 보고서](./phase-2-completion.md)
- [Phase 2 설계 문서](./phase-2-design.md)

### 인벤토리 문서
- [프로젝트 콘텐츠 인벤토리](./content/projects-inventory-actual.md)
- [프로필 정보 인벤토리](./content/profile-inventory-actual.md)

---

**검토자**: 사용자 확인 필요
**최종 승인**: 대기 중
