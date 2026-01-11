/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러 - CSS 변수 사용
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          focus: 'var(--color-primary-focus)',
          text: 'var(--color-primary-text)',
          dark: 'var(--color-primary-dark)',
        },
        // 히어로 섹션 컬러 - CSS 변수 사용
        hero: {
          bg: 'var(--color-hero-bg)',
          title: 'var(--color-hero-title)',
          subtext: 'var(--color-hero-subtext)',
          ctaText: 'var(--color-hero-cta-text)',
          badge: 'var(--color-hero-badge)',
        },
        // 기타 브랜드 컬러 - CSS 변수 사용
        featured: {
          badge: 'var(--color-featured-badge)',
          bg: 'var(--color-featured-bg)',
          header: 'var(--color-featured-header)',
          text: 'var(--color-featured-text)',
          link: 'var(--color-featured-link)',
          divider: 'var(--color-featured-divider)',
        },
        github: 'var(--color-github)',
        // 시맨틱 색상 - CSS 변수 사용 (다크모드 자동 전환)
        background: {
          DEFAULT: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          muted: 'var(--color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border-default)',
          hover: 'var(--color-border-hover)',
          accent: 'var(--color-border-accent)',
          light: 'var(--color-border-light)',
        },
        // 상태 색상 - CSS 변수 사용 (다크모드 자동 전환)
        status: {
          info: 'var(--color-status-info)',
          success: 'var(--color-status-success)',
          warning: 'var(--color-status-warning)',
          error: 'var(--color-status-error)',
        },
        // 유틸리티 컬러 - CSS 변수 사용
        shadow: {
          light: 'var(--color-shadow-light)',
          medium: 'var(--color-shadow-medium)',
          heavy: 'var(--color-shadow-heavy)',
        },
        glass: {
          light: 'var(--color-glass-light)',
          medium: 'var(--color-glass-medium)',
        },
        // 그라데이션 색상 - CSS 변수 사용
        gradient: {
          lightStart: 'var(--color-gradient-light-start)',
          lightMid1: 'var(--color-gradient-light-mid1)',
          lightMid2: 'var(--color-gradient-light-mid2)',
          lightMid3: 'var(--color-gradient-light-mid3)',
          darkStart: 'var(--color-gradient-dark-start)',
          darkMid1: 'var(--color-gradient-dark-mid1)',
          darkMid2: 'var(--color-gradient-dark-mid2)',
          darkMid3: 'var(--color-gradient-dark-mid3)',
          darkMid4: 'var(--color-gradient-dark-mid4)',
        },
        // Neutral Colors
        white: 'var(--color-white)',
        black: 'var(--color-black)',
      },
      // 그림자 확장 - CSS 변수 사용
      boxShadow: {
        'light': '0 1px 2px 0 var(--color-shadow-light)',
        'medium': '0 4px 6px -1px var(--color-shadow-medium), 0 2px 4px -2px var(--color-shadow-medium)',
        'heavy': '0 10px 15px -3px var(--color-shadow-heavy), 0 4px 6px -4px var(--color-shadow-heavy)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-in-out',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
