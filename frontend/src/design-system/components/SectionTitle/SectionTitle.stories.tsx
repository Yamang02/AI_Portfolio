import type { Meta, StoryObj } from '@storybook/react';
import { SectionTitle } from './SectionTitle';

const meta: Meta<typeof SectionTitle> = {
  title: 'Design System/Components/SectionTitle',
  component: SectionTitle,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    level: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SectionTitle>;

export const H1: Story = {
  args: {
    level: 'h1',
    children: 'Main Heading',
  },
};

export const H2: Story = {
  args: {
    level: 'h2',
    children: 'Section Heading',
  },
};

export const H3: Story = {
  args: {
    level: 'h3',
    children: 'Subsection Heading',
  },
};

export const H4: Story = {
  args: {
    level: 'h4',
    children: 'Minor Heading',
  },
};

export const Responsive: Story = {
  render: () => {
    return (
      <div style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 600, color: '#6b7280' }}>
          반응형 타이틀 크기 (뷰포트 크기에 따라 자동 조정)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <SectionTitle level="h1">Main Heading (H1)</SectionTitle>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              데스크톱: 36px → 모바일: 30px
            </p>
          </div>
          <div>
            <SectionTitle level="h2">Section Heading (H2)</SectionTitle>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              데스크톱: 30px → 모바일: 24px
            </p>
          </div>
          <div>
            <SectionTitle level="h3">Subsection Heading (H3)</SectionTitle>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              데스크톱: 24px → 모바일: 20px
            </p>
          </div>
          <div>
            <SectionTitle level="h4">Minor Heading (H4)</SectionTitle>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              데스크톱: 20px → 모바일: 18px
            </p>
          </div>
        </div>
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            fontSize: '0.875rem',
          }}
        >
          💡 스토리북 하단의 Viewport 도구를 사용하여 모바일/태블릿/데스크톱 크기로 전환하여
          폰트 크기 변화를 확인하세요.
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