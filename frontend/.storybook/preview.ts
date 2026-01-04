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
          value: '#F7F9F4',
        },
        {
          name: 'dark',
          value: '#0F1A14',
        },
      ],
    },
  },
};

export default preview;
