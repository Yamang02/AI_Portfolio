# 스토리북 구성 가이드

## 디렉토리 구조

```
frontend/
├── .storybook/                    # 스토리북 설정
│   ├── main.ts                    # 스토리북 메인 설정
│   └── preview.ts                 # 프리뷰 설정 (글로벌 스타일)
│
└── src/
    └── design-system/
        ├── components/
        │   └── Button/
        │       ├── Button.tsx
        │       ├── Button.stories.tsx    # 컴포넌트와 같은 폴더
        │       └── index.ts
        └── tokens/
            ├── colors.ts
            └── colors.stories.tsx
```

## Title 네이밍 규칙

모든 스토리는 다음 규칙을 따릅니다:

```
Design System/
├── Foundation/                    # 토큰
│   ├── Colors
│   ├── Typography
│   └── Breakpoints
│
└── Components/                     # 컴포넌트
    ├── Button
    ├── Badge
    │   ├── Badge
    │   ├── DateBadge
    │   └── RoleBadge
    └── Card
```

**규칙**:
- 토큰: `Design System/Foundation/{TokenName}`
- 컴포넌트: `Design System/Components/{ComponentName}`
- 하위 컴포넌트: `Design System/Components/{Parent}/{Child}`

## 스토리 작성 패턴

### 기본 컴포넌트 스토리

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
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

// 기본 스토리 (필수)
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
};

// Variant 스토리
export const Primary: Story = { ... };
export const Secondary: Story = { ... };

// Size 스토리 (통합)
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};
```

## 설정 파일

### main.ts

```typescript
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    // 실제 사용 중인 컴포넌트 스토리만 포함
    '../src/design-system/components/Button/Button.stories.tsx',
    // ... 기타 스토리들
    '../src/design-system/tokens/AllColors.stories.tsx',
    '../src/design-system/tokens/Tokens.stories.tsx',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          '@design-system': path.resolve(__dirname, '../src/design-system'),
        },
      },
    });
  },
};

export default config;
```

### preview.ts

```typescript
import type { Preview } from '@storybook/react';
import '../src/design-system/styles/reset.css';
import '../src/design-system/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0F1A14' },
      ],
    },
  },
};

export default preview;
```

## 체크리스트

새 컴포넌트 스토리 작성 시:

- [ ] Title이 `Design System/Components/{Name}` 형식인가?
- [ ] 컴포넌트와 같은 폴더에 위치하는가?
- [ ] `Default` 스토리가 있는가?
- [ ] `autodocs` 태그가 있는가?
- [ ] `argTypes`가 적절히 정의되어 있는가?
- [ ] Variant/Size/State별 스토리가 분리되어 있는가?

## 참고 자료

- [Storybook 공식 문서](https://storybook.js.org/docs)
- [Storybook Best Practices](https://storybook.js.org/docs/react/writing-stories/introduction)
