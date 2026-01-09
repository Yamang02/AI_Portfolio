import type { Preview } from '@storybook/react';
import React from 'react';

// 디자인 시스템 스타일 import
import '../src/design-system/styles/globals.css';
import '../src/design-system/styles/reset.css';

// Tailwind CSS import (전역 스타일)
import '../src/index.css';

const preview: Preview = {
  // 글로벌 파라미터 설정
  parameters: {
    // Actions (이벤트 핸들러 자동 감지)
    actions: {
      argTypesRegex: '^on[A-Z].*',
    },

    // Controls (인터랙티브 컨트롤)
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true, // 컨트롤 패널 기본 확장
      sort: 'requiredFirst', // 필수 props 먼저 표시
    },

    // Viewport (반응형 테스트)
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
          type: 'mobile',
        },
        mobileLandscape: {
          name: 'Mobile Landscape',
          styles: {
            width: '667px',
            height: '375px',
          },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
          type: 'tablet',
        },
        tabletLandscape: {
          name: 'Tablet Landscape',
          styles: {
            width: '1024px',
            height: '768px',
          },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
          type: 'desktop',
        },
        desktopLarge: {
          name: 'Desktop Large',
          styles: {
            width: '1920px',
            height: '1080px',
          },
          type: 'desktop',
        },
      },
      defaultViewport: 'desktop',
    },

    // Backgrounds (배경색 테스트)
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'design-system-bg',
          value: 'var(--color-bg-primary)',
        },
      ],
    },

    // Docs 설정
    docs: {
      toc: true, // 목차 자동 생성
      source: {
        type: 'code', // 소스 코드 표시
        state: 'open', // 기본적으로 소스 코드 열림
      },
    },

    // Layout 설정
    layout: 'padded', // 기본 레이아웃: padded (여백 있음)
    // 다른 옵션: 'centered', 'fullscreen'
  },

  // 글로벌 데코레이터 (모든 스토리에 적용)
  decorators: [
    (Story) => (
      <div
        style={{
          padding: '1rem',
          minHeight: '100vh',
          // 디자인 시스템 배경색 사용
          backgroundColor: 'var(--color-bg-primary, #ffffff)',
        }}
      >
        <Story />
      </div>
    ),
  ],

  // 글로벌 argTypes (모든 스토리에 적용되는 기본 타입)
  argTypes: {
    // className은 자동으로 숨김
    className: {
      table: {
        disable: true,
      },
    },
  },
};

export default preview;
