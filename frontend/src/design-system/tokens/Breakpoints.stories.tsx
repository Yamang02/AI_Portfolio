import type { Meta, StoryObj } from '@storybook/react';
import { breakpoints } from './breakpoints';

const meta: Meta = {
  title: 'Design System/Foundation/Breakpoints',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '디자인 시스템의 반응형 breakpoint 토큰입니다. CSS 변수로 사용할 수 있습니다.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BreakpointValues: Story = {
  render: () => {
    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 600 }}>
          Breakpoint Tokens
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
            }}
          >
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: 600 }}>
              Mobile
            </h3>
            <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
              <code style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                max-width: {breakpoints.mobile}
              </code>
            </p>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              모바일 기기 (0px ~ 767px)
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              CSS 변수: <code>var(--breakpoint-mobile)</code>
            </p>
          </div>

          <div
            style={{
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
            }}
          >
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: 600 }}>
              Tablet
            </h3>
            <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
              <code style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                max-width: {breakpoints.tablet}
              </code>
            </p>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              태블릿 기기 (768px ~ 1023px)
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              CSS 변수: <code>var(--breakpoint-tablet)</code>
            </p>
          </div>

          <div
            style={{
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
            }}
          >
            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: 600 }}>
              Desktop
            </h3>
            <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>
              <code style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                min-width: {breakpoints.desktop}
              </code>
            </p>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
              데스크톱 기기 (1024px 이상)
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
              CSS 변수: <code>var(--breakpoint-desktop)</code>
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: 600 }}>
            사용 방법
          </h3>
          <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>CSS에서 사용:</strong>
            </p>
            <pre
              style={{
                padding: '1rem',
                backgroundColor: '#1f2937',
                color: '#f9fafb',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.75rem',
              }}
            >
              {`/* 모바일 이하 */
@media (max-width: var(--breakpoint-mobile)) {
  /* 모바일 스타일 */
}

/* 태블릿 이상 */
@media (min-width: var(--breakpoint-desktop)) {
  /* 데스크톱 스타일 */
}`}
            </pre>
            <p style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
              <strong>TypeScript에서 사용:</strong>
            </p>
            <pre
              style={{
                padding: '1rem',
                backgroundColor: '#1f2937',
                color: '#f9fafb',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.75rem',
              }}
            >
              {`import { breakpoints } from '@/design-system/tokens';

const isMobile = window.innerWidth <= parseInt(breakpoints.mobile);`}
            </pre>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const ResponsiveExample: Story = {
  render: () => {
    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 600 }}>
          반응형 예제
        </h2>
        <div
          style={{
            padding: '1.5rem',
            border: '2px solid #5F9070',
            borderRadius: '8px',
            backgroundColor: '#E8F5ED',
          }}
        >
          <p style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, color: '#1E2F26' }}>
            현재 뷰포트 크기에 따라 스타일이 변경됩니다
          </p>
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#ffffff',
              borderRadius: '4px',
              fontSize: '0.875rem',
              lineHeight: '1.6',
            }}
          >
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>모바일 (≤767px):</strong> 세로 레이아웃, 작은 폰트
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>태블릿 (768px~1023px):</strong> 중간 레이아웃
            </p>
            <p>
              <strong>데스크톱 (≥1024px):</strong> 가로 레이아웃, 큰 폰트
            </p>
          </div>
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#6b7280',
            }}
          >
            💡 스토리북 하단의 Viewport 도구를 사용하여 다양한 화면 크기를 테스트할 수
            있습니다.
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
