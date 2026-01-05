import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Design System/Components/Card',
  component: Card,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    children: 'Card content goes here',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    children: 'Elevated card with more shadow',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    children: 'Outlined card with border only',
  },
};

export const NoPadding: Story = {
  args: {
    variant: 'default',
    padding: 'none',
    children: 'Card with no padding',
  },
};

export const SmallPadding: Story = {
  args: {
    variant: 'default',
    padding: 'sm',
    children: 'Card with small padding',
  },
};

export const LargePadding: Story = {
  args: {
    variant: 'default',
    padding: 'lg',
    children: 'Card with large padding',
  },
};

export const Clickable: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    onClick: () => alert('Card clicked!'),
    children: 'Clickable card (hover to see effect)',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card variant="default" padding="md">
        Default Card
      </Card>
      <Card variant="elevated" padding="md">
        Elevated Card
      </Card>
      <Card variant="outlined" padding="md">
        Outlined Card
      </Card>
    </div>
  ),
};

export const AllPaddingSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card variant="default" padding="none">
        No Padding
      </Card>
      <Card variant="default" padding="sm">
        Small Padding
      </Card>
      <Card variant="default" padding="md">
        Medium Padding
      </Card>
      <Card variant="default" padding="lg">
        Large Padding
      </Card>
    </div>
  ),
};

export const WithContent: Story = {
  render: () => (
    <Card variant="elevated" padding="lg" style={{ maxWidth: '400px' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>
        Card Title
      </h3>
      <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
        This is a card with some content. It demonstrates how the Card component
        can be used to wrap various types of content.
      </p>
      <button
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#7FA874',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
        }}
      >
        Action Button
      </button>
    </Card>
  ),
};
