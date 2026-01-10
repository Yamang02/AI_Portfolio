import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    // 실제 사용 중인 컴포넌트 스토리만 포함
    '../src/design-system/components/Button/Button.stories.tsx',
    '../src/design-system/components/SectionTitle/SectionTitle.stories.tsx',
    '../src/design-system/components/Card/Card.stories.tsx',
    '../src/design-system/components/Card/ProjectCard.stories.tsx',
    '../src/design-system/components/Badge/Badge.stories.tsx',
    '../src/design-system/components/Badge/TeamBadge.stories.tsx',
    '../src/design-system/components/Badge/ProjectTypeBadge.stories.tsx',
    '../src/design-system/components/Badge/DateBadge.stories.tsx',
    '../src/design-system/components/Badge/RoleBadge.stories.tsx',
    '../src/design-system/components/Tooltip/Tooltip.stories.tsx',
    '../src/design-system/components/ChatBubble/ChatBubble.stories.tsx',
    '../src/design-system/components/Divider/Divider.stories.tsx',
    '../src/design-system/components/ProjectDetailHeader/ProjectDetailHeader.stories.tsx',
    '../src/design-system/components/TableOfContents/TableOfContents.stories.tsx',
    '../src/design-system/components/ProjectNavigation/ProjectNavigation.stories.tsx',
    '../src/design-system/components/Pagination/Pagination.stories.tsx',
    '../src/design-system/components/Carousel/ProjectThumbnailCarousel.stories.tsx',
    '../src/design-system/components/Icon/SocialIcon.stories.tsx',
    '../src/design-system/components/Icon/ProjectIcon.stories.tsx',
    '../src/design-system/components/TextLink/TextLink.stories.tsx',
    '../src/design-system/components/Skeleton/Skeleton.stories.tsx',
    // 토큰 스토리 (디자인 시스템 문서화용)
    '../src/design-system/tokens/AllColors.stories.tsx',
    '../src/design-system/tokens/Tokens.stories.tsx',
    // Breakpoints는 실제 코드에서 사용되지 않으므로 제외
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
