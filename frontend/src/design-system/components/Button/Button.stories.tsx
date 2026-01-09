import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Badge } from '../Badge/Badge';

const meta: Meta<typeof Button> = {
  title: 'Design System/Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'View Projects',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Contact',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const AsLink: Story = {
  args: {
    href: '/projects',
    children: 'Go to Projects',
  },
};

export const ComparisonWithBadge: Story = {
  render: () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
            Button (액션 요소 - 둥근 사각형, 굵은 폰트)
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
            Badge (정보 표시용 - Pill shape, 가벼운 폰트)
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge variant="default">Default Badge</Badge>
            <Badge variant="primary">Primary Badge</Badge>
            <Badge variant="accent">Accent Badge</Badge>
            <Badge variant="outline">Outline Badge</Badge>
            <Badge variant="primary" size="sm">Small</Badge>
            <Badge variant="primary" size="md">Medium</Badge>
            <Badge variant="primary" size="lg">Large</Badge>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>
            Side by Side Comparison
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>Button</span>
              <Button variant="primary">Primary</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>Badge</span>
              <Badge variant="primary">Primary</Badge>
            </div>
          </div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>
            주요 차이점
          </h4>
          <ul style={{ fontSize: '0.875rem', lineHeight: '1.6', margin: 0, paddingLeft: '1.25rem' }}>
            <li><strong>모양:</strong> Button은 둥근 사각형 (6px), Badge는 Pill shape (완전히 둥근)</li>
            <li><strong>폰트:</strong> Button은 600 (굵음), Badge는 400 (가벼움)</li>
            <li><strong>크기:</strong> Button은 더 큰 padding, Badge는 더 작은 padding</li>
            <li><strong>Hover:</strong> Button은 명확한 shadow와 translateY, Badge는 미묘한 opacity와 scale</li>
            <li><strong>용도:</strong> Button은 액션 수행, Badge는 정보 표시/태그</li>
          </ul>
        </div>
      </div>
    );
  },
};