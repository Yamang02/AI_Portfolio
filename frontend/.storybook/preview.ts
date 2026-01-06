import type { Preview } from '@storybook/react';
import '../src/design-system/styles/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',  /* globals.css의 --color-bg-primary */
        },
        {
          name: 'dark',
          value: '#111827',  /* globals.css의 다크 모드 --color-bg-primary */
        },
      ],
    },
  },
};

export default preview;
