import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Design System/Components/Badge',
  component: Badge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Badge',
    variant: 'primary',
  },
};

export const Accent: Story = {
  args: {
    children: 'Accent Badge',
    variant: 'accent',
  },
};

export const Success: Story = {
  args: {
    children: 'Success Badge',
    variant: 'success',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Badge',
    variant: 'outline',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Badge',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Badge',
    size: 'lg',
  },
};

export const WithCount: Story = {
  args: {
    children: 'Badge',
    showCount: true,
    count: 5,
  },
};

export const Clickable: Story = {
  args: {
    children: 'Clickable Badge',
    onClick: () => alert('Clicked!'),
  },
};

export const Selected: Story = {
  args: {
    children: 'Selected Badge',
    selected: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<string | null>(null);
    return (
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['React', 'TypeScript', 'Node.js', 'PostgreSQL'].map((tech) => (
          <Badge
            key={tech}
            onClick={() => setSelected(selected === tech ? null : tech)}
            selected={selected === tech}
          >
            {tech}
          </Badge>
        ))}
      </div>
    );
  },
};

export const WithCounts: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Badge variant="default" showCount count={3}>Notifications</Badge>
      <Badge variant="primary" showCount count={12}>Messages</Badge>
      <Badge variant="accent" showCount count={99}>Updates</Badge>
      <Badge variant="success" showCount count={5}>Success</Badge>
    </div>
  ),
};

export const TechStackExample: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant="primary" size="sm">React</Badge>
      <Badge variant="default" size="sm">TypeScript</Badge>
      <Badge variant="accent" size="sm">Node.js</Badge>
      <Badge variant="outline" size="sm">PostgreSQL</Badge>
      <Badge variant="success" size="sm">Docker</Badge>
    </div>
  ),
};
