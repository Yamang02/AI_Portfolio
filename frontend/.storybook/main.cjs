const path = require('node:path');

/** @type {import('@storybook/react-vite').StorybookConfig} */
module.exports = {
  stories: [
    '../src/design-system/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../src/design-system/**/*.mdx',
  ],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-docs',
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

  staticDirs: ['../public'],

  async viteFinal(viteConfig) {
    return {
      ...viteConfig,
      resolve: {
        ...viteConfig.resolve,
        alias: {
          ...(viteConfig.resolve && viteConfig.resolve.alias ? viteConfig.resolve.alias : {}),
          '@': path.resolve(__dirname, '../src'),
          '@shared': path.resolve(__dirname, '../src/shared'),
          '@design-system': path.resolve(__dirname, '../src/design-system'),
        },
      },
      optimizeDeps: {
        ...(viteConfig.optimizeDeps || {}),
        include: Array.from(
          new Set([...(viteConfig.optimizeDeps?.include || []), 'react', 'react-dom']),
        ),
      },
      server: {
        ...(viteConfig.server || {}),
        fs: {
          ...(viteConfig.server?.fs || {}),
          allow: Array.from(new Set([...(viteConfig.server?.fs?.allow || []), '..'])),
        },
      },
    };
  },
};

