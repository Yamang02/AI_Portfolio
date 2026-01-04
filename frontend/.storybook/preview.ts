import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
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
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f172a',
        },
      ],
    },
    docs: {
      theme: themes.light,
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light';
      
      // 다크 모드를 시뮬레이션하기 위해 html 요소에 클래스 추가
      if (typeof document !== 'undefined') {
        const html = document.documentElement;
        if (theme === 'dark') {
          html.classList.add('dark-mode');
          html.style.colorScheme = 'dark';
        } else {
          html.classList.remove('dark-mode');
          html.style.colorScheme = 'light';
        }
      }

      return Story();
    },
  ],
};

export default preview;
