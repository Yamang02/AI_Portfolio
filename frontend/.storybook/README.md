# Storybook 설정 가이드

이 디렉토리는 Storybook 8.x 설정 파일을 포함합니다.

## 파일 구조

- `main.cjs`: Storybook 메인 설정 파일 (권장: ESM 프로젝트에서 가장 안정적)
  - 스토리 파일 경로
  - Addons 설정
  - Vite 통합 설정
  - TypeScript 설정

- `preview.tsx`: 스토리 프리뷰 설정
  - 글로벌 파라미터 (viewport, backgrounds 등)
  - 데코레이터 (모든 스토리에 적용되는 래퍼)
  - 글로벌 스타일 import

- `manager.ts`: Storybook UI 설정 (선택사항)
  - 테마 설정
  - 사이드바/툴바 설정

## 주요 기능

### 1. 반응형 테스트
Viewport addon을 통해 다양한 화면 크기에서 컴포넌트를 테스트할 수 있습니다:
- Mobile (375px)
- Tablet (768px)
- Desktop (1280px, 1920px)

### 2. 디자인 시스템 통합
- CSS 변수 자동 로드
- Tailwind CSS 지원
- PostCSS 처리

### 3. TypeScript 지원
- 경로 alias 자동 인식
- 타입 안전성 보장
- 자동 문서 생성

### 4. MDX 지원
`.stories.mdx` 파일을 사용하여 문서와 스토리를 함께 작성할 수 있습니다.

## 스토리 작성 가이드

### 기본 스토리 파일 구조

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'], // 자동 문서 생성
  parameters: {
    layout: 'padded', // 또는 'centered', 'fullscreen'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};
```

### 반응형 스토리 작성

```tsx
export const Responsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  render: (args) => <Button {...args} />,
};
```

### 문서와 함께 작성 (MDX)

```mdx
import { Meta, Canvas, Story } from '@storybook/blocks';
import { Button } from './Button';

<Meta title="Design System/Button" component={Button} />

# Button 컴포넌트

버튼 컴포넌트는 사용자 액션을 트리거하는 데 사용됩니다.

## 사용 방법

<Canvas>
  <Story name="Primary">
    <Button variant="primary">Click me</Button>
  </Story>
</Canvas>
```

## 실행 방법

```bash
# 개발 모드
npm run storybook

# 빌드
npm run build-storybook
```

## 문제 해결

### CSS가 적용되지 않는 경우
- `preview.tsx`에서 CSS 파일 import 확인
- Tailwind CSS 설정 확인 (`tailwind.config.js`)

### 경로 alias가 작동하지 않는 경우
- `main.ts`의 `viteFinal`에서 alias 설정 확인
- `tsconfig.json`의 paths 설정 확인

### MDX 파일 오류
- `@storybook/addon-essentials`에 MDX 지원 포함됨
- 파일 확장자가 `.mdx`인지 확인
