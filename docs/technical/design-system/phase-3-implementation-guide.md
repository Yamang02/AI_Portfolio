# Phase 3 구현 가이드

**작성일**: 2025-01-04  
**참고**: [Phase 3 설계 문서](../../epic/portfolio-renewal-refactor/phase-3-design.md)

---

## 목차

1. [Task 3.1: 디자인 토큰 구현](#task-31-디자인-토큰-구현)
2. [Task 3.2: 기본 컴포넌트 구현](#task-32-기본-컴포넌트-구현)
3. [Task 3.3: Storybook 설정 및 문서화](#task-33-storybook-설정-및-문서화)
4. [Task 3.4: Badge, Skeleton, Tooltip 컴포넌트 구현](#task-34-badge-skeleton-tooltip-컴포넌트-구현)

---

## Task 3.1: 디자인 토큰 구현

### 1.1 Color Tokens 구현

#### 파일 생성: `frontend/src/design-system/tokens/colors.ts`

```typescript
export const brandColors = {
  // Primary: Dark Olive (#89986D) - Green/Olive Tones
  primary: '#89986D',
  primaryHover: '#9CAB84',
  primaryActive: '#6F7D56',

  // Accent: Muted Olive (#9CAB84)
  accent: '#9CAB84',
  accentHover: '#89986D',
  accentActive: '#B4C4A0',

  // Success: Light Sage (#C5D89D)
  success: '#C5D89D',
  successHover: '#B4C88A',

  // Highlight: Cream Beige (#F6F0D7)
  highlight: '#F6F0D7',
  highlightHover: '#EDE7C8',

  // Dark Mode - Primary: Deep Teal (#5A7863)
  primaryDark: '#5A7863',
  primaryDarkHover: '#6B8F75',
  primaryDarkActive: '#4A6352',
} as const;

export const lightModeColors = {
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#F6F0D7',
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
  },
  border: {
    default: '#e5e7eb',
    hover: '#d1d5db',
    accent: '#9CAB84',
  },
  link: {
    default: '#9CAB84',
    hover: '#89986D',
    visited: '#6F7D56',
  },
  status: {
    info: '#9CAB84',
    success: '#C5D89D',
    warning: '#f59e0b',
    error: '#ef4444',
  },
} as const;

export const darkModeColors = {
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#3B4953',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    tertiary: '#64748b',
  },
  border: {
    default: '#334155',
    hover: '#475569',
    accent: '#5A7863',
  },
  link: {
    default: '#90AB8B',
    hover: '#5A7863',
    visited: '#4A6352',
  },
  status: {
    info: '#90AB8B',
    success: '#C5D89D',
    warning: '#fbbf24',
    error: '#f87171',
  },
} as const;
```

#### 파일 생성: `frontend/src/design-system/styles/globals.css`

```css
/* Light Mode */
:root {
  /* Background */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #F6F0D7;

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;

  /* Border */
  --color-border-default: #e5e7eb;
  --color-border-hover: #d1d5db;
  --color-border-accent: #9CAB84;

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
  --color-link-default: #9CAB84;
  --color-link-hover: #89986D;
  --color-link-visited: #6F7D56;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    /* Background */
    --color-bg-primary: #0f172a;
    --color-bg-secondary: #1e293b;
    --color-bg-tertiary: #3B4953;

    /* Text */
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #94a3b8;
    --color-text-tertiary: #64748b;

    /* Border */
    --color-border-default: #334155;
    --color-border-hover: #475569;
    --color-border-accent: #5A7863;

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
    --color-link-default: #90AB8B;
    --color-link-hover: #5A7863;
    --color-link-visited: #4A6352;
  }
}
```

### 1.2 Typography Tokens 구현

#### 파일 생성: `frontend/src/design-system/tokens/typography.ts`

```typescript
export const fontFamily = {
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

export const fontSize = {
  display: '3.75rem', // 60px
  h1: '2.25rem', // 36px
  h2: '1.875rem', // 30px
  h3: '1.5rem', // 24px
  h4: '1.25rem', // 20px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  sm: '0.875rem', // 14px
  xs: '0.75rem', // 12px
} as const;

export const fontSizeMobile = {
  display: '2.5rem', // 40px
  h1: '1.875rem', // 30px
  h2: '1.5rem', // 24px
  h3: '1.25rem', // 20px
  h4: '1.125rem', // 18px
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const letterSpacing = {
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
} as const;
```

### 1.3 Spacing Tokens 구현

#### 파일 생성: `frontend/src/design-system/tokens/spacing.ts`

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

export const semanticSpacing = {
  componentGap: {
    xs: spacing[2], // 8px
    sm: spacing[3], // 12px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
    xl: spacing[8], // 32px
  },
  sectionPadding: {
    mobile: spacing[6], // 24px
    tablet: spacing[10], // 40px
    desktop: spacing[12], // 48px
  },
  containerMaxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  containerPadding: {
    mobile: spacing[4], // 16px
    tablet: spacing[6], // 24px
    desktop: spacing[8], // 32px
  },
} as const;
```

### 1.4 Border Radius Tokens 구현

#### 파일 생성: `frontend/src/design-system/tokens/borderRadius.ts`

```typescript
export const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  full: '9999px',
} as const;
```

### 1.5 Shadow Tokens 구현

#### 파일 생성: `frontend/src/design-system/tokens/shadow.ts`

```typescript
export const shadow = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
} as const;
```

### 1.6 Tokens Export 파일 생성

#### 파일 생성: `frontend/src/design-system/tokens/index.ts`

```typescript
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './borderRadius';
export * from './shadow';
```

---

## Task 3.2: 기본 컴포넌트 구현

### 2.1 Button 컴포넌트

#### 파일 생성: `frontend/src/design-system/components/Button/Button.tsx`

```tsx
import React from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: '_blank' | '_self';
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
  href,
  target = '_self',
  ariaLabel,
}) => {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={classNames}
        aria-label={ariaLabel || children?.toString()}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classNames}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel || children?.toString()}
    >
      {children}
    </button>
  );
};
```

#### 파일 생성: `frontend/src/design-system/components/Button/Button.module.css`

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
  text-decoration: none;
}

/* Primary Variant */
.primary {
  background-color: var(--color-primary);
  color: #ffffff;
}

.primary:hover:not(.disabled) {
  background-color: var(--color-primary-hover);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.primary:active:not(.disabled) {
  background-color: var(--color-primary-active);
}

/* Secondary Variant */
.secondary {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
}

.secondary:hover:not(.disabled) {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-hover);
}

.secondary:active:not(.disabled) {
  background-color: var(--color-bg-tertiary);
}

/* Sizes */
.sm {
  padding: 8px 16px;
  font-size: 0.875rem;
}

.md {
  padding: 12px 24px;
  font-size: 1rem;
}

.lg {
  padding: 16px 32px;
  font-size: 1.125rem;
}

/* Disabled */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 2.2 TextLink 컴포넌트

#### 파일 생성: `frontend/src/design-system/components/TextLink/TextLink.tsx`

```tsx
import React from 'react';
import styles from './TextLink.module.css';

export interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  underline?: boolean;
  ariaLabel?: string;
}

export const TextLink: React.FC<TextLinkProps> = ({
  href,
  children,
  external = false,
  underline = false,
  ariaLabel,
}) => {
  const classNames = [
    styles.link,
    underline && styles.underline,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href={href}
      target={external ? '_blank' : '_self'}
      rel={external ? 'noopener noreferrer' : undefined}
      className={classNames}
      aria-label={ariaLabel || children?.toString()}
    >
      {children}
      {external && <span className={styles.srOnly}> (새 탭에서 열기)</span>}
    </a>
  );
};
```

#### 파일 생성: `frontend/src/design-system/components/TextLink/TextLink.module.css`

```css
.link {
  color: var(--color-link-default);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}

.link:hover {
  color: var(--color-link-hover);
  text-decoration: underline;
}

.link:visited {
  color: var(--color-link-visited);
}

.link:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

.underline {
  text-decoration: underline;
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 2.3 SectionTitle 컴포넌트

#### 파일 생성: `frontend/src/design-system/components/SectionTitle/SectionTitle.tsx`

```tsx
import React from 'react';
import { fontSize, fontWeight, lineHeight, spacing } from '../../tokens';

type SectionTitleLevel = 'h1' | 'h2' | 'h3' | 'h4';

export interface SectionTitleProps {
  level: SectionTitleLevel;
  children: React.ReactNode;
  className?: string;
}

const sectionTitleStyles: Record<SectionTitleLevel, React.CSSProperties> = {
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
};

export const SectionTitle: React.FC<SectionTitleProps> = ({
  level,
  children,
  className,
}) => {
  const Tag = level;
  return (
    <Tag className={className} style={sectionTitleStyles[level]}>
      {children}
    </Tag>
  );
};
```

### 2.4 Divider 컴포넌트

#### 파일 생성: `frontend/src/design-system/components/Divider/Divider.tsx`

```tsx
import React from 'react';
import styles from './Divider.module.css';
import { spacing } from '../../tokens';

export interface DividerProps {
  variant?: 'horizontal' | 'vertical';
  spacing?: keyof typeof spacing;
}

export const Divider: React.FC<DividerProps> = ({
  variant = 'horizontal',
  spacing: spacingProp = 6,
}) => {
  const spacingValue = spacing[spacingProp];
  const style: React.CSSProperties =
    variant === 'horizontal'
      ? { margin: `${spacingValue} 0` }
      : { margin: `0 ${spacingValue}` };

  return (
    <div
      className={`${styles.divider} ${styles[variant]}`}
      style={style}
      role="separator"
    />
  );
};
```

#### 파일 생성: `frontend/src/design-system/components/Divider/Divider.module.css`

```css
.divider {
  background-color: var(--color-border-default);
}

.horizontal {
  width: 100%;
  height: 1px;
}

.vertical {
  width: 1px;
  height: 100%;
}
```

---

## Task 3.3: Storybook 설정 및 문서화

### 3.1 Storybook 설치

```bash
cd frontend
npx storybook@latest init --yes
```

### 3.2 Button Story 예시

#### 파일 생성: `frontend/src/design-system/components/Button/Button.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button disabled>Disabled Primary</Button>
      <Button variant="secondary" disabled>
        Disabled Secondary
      </Button>
    </div>
  ),
};
```

### 3.3 Tokens 문서 작성

#### 파일 생성: `frontend/src/design-system/tokens/Tokens.stories.mdx`

```mdx
import { Meta } from '@storybook/blocks';

<Meta title="Design System/Tokens" />

# Design Tokens

## Color Tokens

### Brand Colors
...

### Semantic Colors
...
```

---

## Task 3.4: Badge, Skeleton, Tooltip 컴포넌트 구현

### 4.1 Badge 컴포넌트

#### 파일 생성: `frontend/src/design-system/components/Badge/Badge.tsx`

```tsx
import React from 'react';
import styles from './Badge.module.css';

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

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  onClick,
  selected = false,
  showCount = false,
  count = 0,
}) => {
  const classNames = [
    styles.badge,
    styles[variant],
    styles[size],
    selected && styles.selected,
    onClick && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={classNames}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
      {showCount && count > 0 && (
        <span className={styles.count}>{count}</span>
      )}
    </div>
  );
};
```

#### 파일 생성: `frontend/src/design-system/components/Badge/Badge.module.css`

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 9999px;
  font-weight: 500;
}

/* Variants */
.default {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.primary {
  background-color: var(--color-primary);
  color: #ffffff;
}

.accent {
  background-color: var(--color-accent);
  color: #ffffff;
}

.success {
  background-color: var(--color-success);
  color: var(--color-text-primary);
}

.outline {
  background-color: transparent;
  border: 1px solid var(--color-border-default);
  color: var(--color-text-primary);
}

/* Sizes */
.sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.md {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.lg {
  padding: 8px 16px;
  font-size: 1rem;
}

/* Interactive */
.clickable {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.clickable:hover {
  opacity: 0.8;
}

.selected {
  opacity: 1;
  border-color: var(--color-primary);
}

.count {
  margin-left: 0.25rem;
  padding: 0 0.25rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 9999px;
  font-size: 0.75em;
}
```

### 4.2 Skeleton 컴포넌트

#### 파일 생성: `frontend/src/design-system/components/Skeleton/Skeleton.tsx`

```tsx
import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className,
  variant = 'text',
}) => {
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || '1rem',
  };

  const classNames = [
    styles.skeleton,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classNames} style={style} aria-busy="true" />;
};
```

#### 파일 생성: `frontend/src/design-system/components/Skeleton/Skeleton.module.css`

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 0%,
    var(--color-bg-tertiary) 50%,
    var(--color-bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.text {
  border-radius: 4px;
}

.circular {
  border-radius: 50%;
}

.rectangular {
  border-radius: 0;
}
```

### 4.3 SkeletonCard 컴포넌트

#### 파일 생성: `frontend/src/design-system/components/Skeleton/SkeletonCard.tsx`

```tsx
import React from 'react';
import { Skeleton } from './Skeleton';
import styles from './SkeletonCard.module.css';

export interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = true,
  lines = 3,
}) => {
  const classNames = [styles.card, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} aria-busy="true" aria-label="Loading">
      {showImage && (
        <Skeleton variant="rectangular" width="100%" height={200} />
      )}
      <div className={styles.content}>
        {showTitle && (
          <Skeleton variant="text" height={24} width="60%" style={{ marginBottom: '1rem' }} />
        )}
        {showDescription && (
          <>
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton
                key={index}
                variant="text"
                height={16}
                width={index === lines - 1 ? '75%' : '100%'}
                style={{ marginBottom: index < lines - 1 ? '0.5rem' : 0 }}
              />
            ))}
          </>
        )}
        {showActions && (
          <div className={styles.actions}>
            <Skeleton variant="rectangular" width={80} height={32} />
            <Skeleton variant="rectangular" width={80} height={32} />
          </div>
        )}
      </div>
    </div>
  );
};
```

#### 파일 생성: `frontend/src/design-system/components/Skeleton/SkeletonCard.module.css`

```css
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  overflow: hidden;
}

.content {
  padding: 1.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
```

### 4.4 Tooltip 컴포넌트

#### 파일 생성: `frontend/src/design-system/components/Tooltip/Tooltip.tsx`

```tsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './Tooltip.module.css';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  showOnMount?: boolean;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  delay = 300,
  showOnMount = false,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(showOnMount);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (showOnMount) {
      setIsVisible(true);
    }
  }, [showOnMount]);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    setPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
      return () => {
        window.removeEventListener('scroll', calculatePosition);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isVisible, placement]);

  return (
    <div
      ref={triggerRef}
      className={styles.wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${styles[placement]} ${className || ''}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          role="tooltip"
        >
          {content}
          <div className={`${styles.arrow} ${styles[placement]}`} />
        </div>
      )}
    </div>
  );
};
```

#### 파일 생성: `frontend/src/design-system/components/Tooltip/Tooltip.module.css`

```css
.wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  z-index: 1000;
  padding: 0.5rem 0.75rem;
  background-color: var(--color-text-primary);
  color: var(--color-bg-primary);
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
  pointer-events: none;
}

.arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.arrow.top {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid var(--color-text-primary);
}

.arrow.bottom {
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid var(--color-text-primary);
}

.arrow.left {
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 4px solid var(--color-text-primary);
}

.arrow.right {
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-right: 4px solid var(--color-text-primary);
}
```

---

## 완료 체크리스트

### Task 3.1: 디자인 토큰 구현
- [ ] Color tokens 파일 생성 (`colors.ts`)
- [ ] Typography tokens 파일 생성 (`typography.ts`)
- [ ] Spacing tokens 파일 생성 (`spacing.ts`)
- [ ] Border radius tokens 파일 생성 (`borderRadius.ts`)
- [ ] Shadow tokens 파일 생성 (`shadow.ts`)
- [ ] CSS Variables 파일 생성 (`globals.css`)
- [ ] 모든 토큰이 TypeScript로 타입 안전하게 정의됨

### Task 3.2: 기본 컴포넌트 구현
- [ ] Button 컴포넌트 구현 완료
- [ ] TextLink 컴포넌트 구현 완료
- [ ] SectionTitle 컴포넌트 구현 완료
- [ ] Divider 컴포넌트 구현 완료

### Task 3.3: Storybook 설정 및 문서화
- [ ] Storybook 설치 및 초기화 완료
- [ ] 각 컴포넌트 스토리 작성
- [ ] Tokens 문서 작성

### Task 3.4: Badge, Skeleton, Tooltip 컴포넌트 구현
- [ ] Badge 컴포넌트 구현 완료
- [ ] Skeleton 컴포넌트 구현 완료
- [ ] SkeletonCard 컴포넌트 구현 완료
- [ ] Tooltip 컴포넌트 구현 완료
- [ ] 모든 컴포넌트 Storybook 스토리 작성 완료

---

**다음 단계**: [Phase 3 사용 예시](./phase-3-usage-examples.md) 문서 참조
