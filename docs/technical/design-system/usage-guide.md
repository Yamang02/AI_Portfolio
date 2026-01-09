# 디자인 시스템 사용 가이드

**작성일**: 2025-01-XX  
**최종 업데이트**: 2025-01-XX

> ⚠️ **중요**: 이 문서는 디자인 시스템 사용에 대한 상세 가이드입니다.  
> 빠른 참조는 `frontend/developmentGuide.md`의 DO/DON'T 패턴과 체크리스트를 참조하세요.

---

## 목차

1. [디자인 시스템 개요](#디자인-시스템-개요)
2. [컬러 시스템 사용](#컬러-시스템-사용)
3. [디자인 시스템 컴포넌트 사용](#디자인-시스템-컴포넌트-사용)
4. [디자인 토큰 사용](#디자인-토큰-사용)
5. [새 컴포넌트 등록](#새-컴포넌트-등록)
6. [로컬 컴포넌트 생성](#로컬-컴포넌트-생성)

---

## 디자인 시스템 개요

프로젝트는 **디자인 시스템**을 도입하여 일관된 UI/UX를 제공합니다. 모든 컴포넌트 개발 시 디자인 시스템을 우선적으로 활용해야 합니다.

### 디자인 시스템 구조

```
frontend/src/design-system/
├── tokens/          # 디자인 토큰 (컬러, 타이포그래피, 스페이싱 등)
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── borderRadius.ts
│   ├── shadow.ts
│   └── breakpoints.ts
├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── Button/
│   ├── Badge/
│   ├── Card/
│   ├── SectionTitle/
│   ├── TextLink/
│   └── ...
├── styles/          # 전역 스타일
│   ├── globals.css  # CSS 변수 정의 (단일 소스)
│   └── reset.css
└── providers/       # 테마 프로바이더
```

---

## 컬러 시스템 사용

프로젝트는 업계 표준 컬러 시스템 구조를 따릅니다.

### 컬러 시스템 원칙

- **CSS 변수 기반**: 모든 컬러 값은 `globals.css`의 CSS 변수(`--color-*`)가 단일 소스
- **Semantic Tokens 사용 권장**: `brandSemantic`, `lightModeSemantic`, `darkModeSemantic` 등
- **하드코딩 금지**: 하드코딩된 컬러 값 사용은 절대 금지

### 컬러 사용 방법

#### ✅ 올바른 방법: CSS 변수 사용

```typescript
// 인라인 스타일
style={{ 
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-bg-primary)',
  borderColor: 'var(--color-border-default)',
}}

// CSS 모듈
.myComponent {
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
}
```

#### ❌ 잘못된 방법: 하드코딩된 컬러 값 사용

```typescript
// ❌ 하드코딩된 컬러 값 사용 금지
style={{ color: '#111827' }}
style={{ backgroundColor: '#ffffff' }}
style={{ borderColor: '#e5e7eb' }}
```

### 사용 가능한 컬러 변수

주요 컬러 변수는 다음과 같습니다:

- **Background**: `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-tertiary`
- **Text**: `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- **Border**: `--color-border-default`, `--color-border-hover`, `--color-border-accent`
- **Brand**: `--color-primary`, `--color-primary-hover`, `--color-primary-active`
- **Link**: `--color-link-default`, `--color-link-hover`, `--color-link-visited`
- **Status**: `--color-status-info`, `--color-status-success`, `--color-status-warning`, `--color-status-error`

자세한 컬러 팔레트: `docs/technical/design-system/color-palette.md`

---

## 디자인 시스템 컴포넌트 사용

**⚠️ 중요**: 새 컴포넌트를 생성할 때는 반드시 디자인 시스템을 확인하고 활용해야 합니다.

### 1. 기존 디자인 시스템 컴포넌트 활용

디자인 시스템에 이미 존재하는 컴포넌트는 재사용합니다.

#### Import 방법

```typescript
// ✅ 올바른 방법: 디자인 시스템 컴포넌트 import
import { Button, Badge, Card, SectionTitle, TextLink } from '@/design-system';
```

#### 사용 예시

```typescript
// Button 사용
<Button variant="primary" size="md">클릭</Button>
<Button variant="secondary" size="sm">취소</Button>
<Button variant="icon" ariaLabel="메뉴">☰</Button>

// Badge 사용
<Badge variant="default" size="sm">태그</Badge>
<Badge variant="primary" size="md">중요</Badge>
<Badge variant="outline" size="sm" onClick={handleClick}>필터</Badge>

// Card 사용
<Card>
  <SectionTitle level="h3">제목</SectionTitle>
  <p>내용</p>
</Card>

// SectionTitle 사용
<SectionTitle level="h1">메인 제목</SectionTitle>
<SectionTitle level="h2">섹션 제목</SectionTitle>

// TextLink 사용
<TextLink href="/path">링크 텍스트</TextLink>
<TextLink href="https://example.com" external>외부 링크</TextLink>
```

#### 사용 가능한 디자인 시스템 컴포넌트

- **Button**: 버튼 (primary, secondary, icon, brand variants)
- **Badge**: 배지/태그 (default, primary, accent, success, outline variants)
- **Card**: 카드 컨테이너
- **SectionTitle**: 섹션 제목 (h1, h2, h3, h4)
- **TextLink**: 텍스트 링크
- **Divider**: 구분선
- **Tooltip**: 툴팁
- **Skeleton**, **SkeletonCard**: 로딩 스켈레톤
- **Input**: 입력 필드
- **Modal**: 모달
- **Spinner**: 로딩 스피너

전체 목록은 `frontend/src/design-system/components/` 또는 Storybook에서 확인할 수 있습니다.

---

## 디자인 토큰 사용

디자인 토큰은 `frontend/src/design-system/tokens/`에서 관리됩니다.

### 디자인 토큰 Import

```typescript
import { 
  spacing, 
  borderRadius, 
  shadow, 
  fontSize,
  fontWeight,
  lineHeight
} from '@/design-system/tokens';
```

### 사용 방법

#### TypeScript 토큰 사용

```typescript
const style = {
  padding: spacing[4],           // '1rem'
  margin: spacing[6],            // '1.5rem'
  borderRadius: borderRadius.lg, // '0.5rem'
  boxShadow: shadow.md,         // '0 4px 6px -1px rgba(0, 0, 0, 0.1)...'
  fontSize: fontSize.base,       // '1rem'
  fontWeight: fontWeight.semibold, // 600
  lineHeight: lineHeight.relaxed, // 1.75
};
```

#### CSS 변수로 직접 사용

```typescript
const style = {
  padding: 'var(--spacing-4)',
  margin: 'var(--spacing-6)',
  borderRadius: 'var(--border-radius-lg)',
  boxShadow: 'var(--shadow-md)',
  fontSize: 'var(--font-size-base)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 'var(--line-height-relaxed)',
};
```

### 사용 가능한 토큰

- **spacing**: `spacing[0]` ~ `spacing[24]` (0 ~ 6rem)
- **borderRadius**: `borderRadius.none`, `sm`, `md`, `lg`, `xl`, `full`
- **shadow**: `shadow.none`, `sm`, `md`, `lg`
- **fontSize**: `fontSize.display`, `h1`, `h2`, `h3`, `h4`, `base`, `lg`, `sm`, `xs`
- **fontWeight**: `fontWeight.regular`, `medium`, `semibold`, `bold`
- **lineHeight**: `lineHeight.tight`, `normal`, `relaxed`

---

## 새 컴포넌트 등록

디자인 시스템에 없는 재사용 가능한 컴포넌트는 디자인 시스템에 등록합니다.

### 등록 절차

#### 1. 컴포넌트 파일 생성

```typescript
// frontend/src/design-system/components/NewComponent/NewComponent.tsx
import React from 'react';
import styles from './NewComponent.module.css';

export interface NewComponentProps {
  // props 정의
  children: React.ReactNode;
  variant?: 'default' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

export const NewComponent: React.FC<NewComponentProps> = ({ 
  children,
  variant = 'default',
  size = 'md',
}) => {
  // CSS 변수 사용 (컬러, 스페이싱 등)
  return (
    <div 
      className={styles.component}
      style={{
        color: 'var(--color-text-primary)',
        backgroundColor: 'var(--color-bg-primary)',
        padding: 'var(--spacing-4)',
        borderRadius: 'var(--border-radius-lg)',
      }}
    >
      {children}
    </div>
  );
};
```

#### 2. CSS 모듈 작성

```css
/* frontend/src/design-system/components/NewComponent/NewComponent.module.css */
.component {
  /* CSS 변수 사용 */
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  box-shadow: var(--shadow-md);
}

.component:hover {
  background-color: var(--color-bg-secondary);
  border-color: var(--color-border-hover);
}
```

#### 3. 컴포넌트 Export

```typescript
// frontend/src/design-system/components/NewComponent/index.ts
export { NewComponent } from './NewComponent';
export type { NewComponentProps } from './NewComponent';
```

```typescript
// frontend/src/design-system/components/index.ts에 추가
export * from './NewComponent';
```

#### 4. Storybook 스토리 작성 (선택사항)

```typescript
// frontend/src/design-system/components/NewComponent/NewComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { NewComponent } from './NewComponent';

const meta: Meta<typeof NewComponent> = {
  title: 'Design System/NewComponent',
  component: NewComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NewComponent>;

export const Default: Story = {
  args: {
    children: 'New Component',
    variant: 'default',
    size: 'md',
  },
};

export const Primary: Story = {
  args: {
    children: 'New Component',
    variant: 'primary',
    size: 'md',
  },
};
```

### 등록 체크리스트

- [ ] CSS 변수 사용 (컬러, 스페이싱 등)
- [ ] 디자인 토큰 활용
- [ ] TypeScript 타입 정의
- [ ] `index.ts`에 export 추가
- [ ] Storybook 스토리 작성 (선택사항)

---

## 로컬 컴포넌트 생성

도메인 특화 컴포넌트는 해당 레이어에 생성하되, 디자인 시스템을 활용합니다.

### 예시: ProjectCard 컴포넌트

```typescript
// entities/project/ui/ProjectCard.tsx
import { Card, Badge, Button, SectionTitle } from '@/design-system';

export interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    url: string;
  };
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card>
      {/* 디자인 시스템 컴포넌트 활용 */}
      <SectionTitle level="h3">{project.title}</SectionTitle>
      
      <p style={{ 
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--spacing-4)',
      }}>
        {project.description}
      </p>
      
      {/* Badge로 태그 표시 */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-2)', 
        flexWrap: 'wrap',
        marginBottom: 'var(--spacing-4)',
      }}>
        {project.tags.map(tag => (
          <Badge key={tag} variant="default" size="sm">
            {tag}
          </Badge>
        ))}
      </div>
      
      <Button variant="primary" href={project.url}>
        View Project
      </Button>
    </Card>
  );
};
```

### 로컬 컴포넌트 생성 체크리스트

- [ ] 디자인 시스템 컴포넌트 우선 활용
- [ ] CSS 변수 사용 (컬러, 스페이싱 등)
- [ ] 디자인 토큰 활용
- [ ] 도메인 특화 로직만 포함

---

## 관련 문서

- **컬러 시스템**: `docs/technical/design-system/color-palette.md`
- **Phase 3 구현 가이드**: `docs/technical/design-system/phase-3-implementation-guide.md`
- **Phase 3 사용 예시**: `docs/technical/design-system/phase-3-usage-examples.md`
- **프론트엔드 아키텍처**: `docs/technical/architecture/frontend-architecture.md`
- **개발 가이드**: `frontend/developmentGuide.md`

---

**작성자**: AI Agent (Claude)  
**최종 업데이트**: 2025-01-XX
