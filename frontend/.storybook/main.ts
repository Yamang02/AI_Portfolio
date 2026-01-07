import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          '@shared': path.resolve(__dirname, '../src/shared'),
          '@entities': path.resolve(__dirname, '../src/entities'),
          '@features': path.resolve(__dirname, '../src/features'),
          '@widgets': path.resolve(__dirname, '../src/widgets'),
          '@pages': path.resolve(__dirname, '../src/pages'),
          '@processes': path.resolve(__dirname, '../src/processes'),
          '@app': path.resolve(__dirname, '../src/app'),
          '@design-system': path.resolve(__dirname, '../src/design-system'),
        },
      },
    });
  },
};

export default config;
