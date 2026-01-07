import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from '../Button';

const meta: Meta<typeof Tooltip> = {
  title: 'Design System/Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    children: <Button>Hover me</Button>,
    content: 'This is a tooltip',
  },
};

export const Top: Story = {
  args: {
    children: <Button>Top Tooltip</Button>,
    content: 'Tooltip on top',
    placement: 'top',
  },
};

export const Bottom: Story = {
  args: {
    children: <Button>Bottom Tooltip</Button>,
    content: 'Tooltip on bottom',
    placement: 'bottom',
  },
};

export const Left: Story = {
  args: {
    children: <Button>Left Tooltip</Button>,
    content: 'Tooltip on left',
    placement: 'left',
  },
};

export const Right: Story = {
  args: {
    children: <Button>Right Tooltip</Button>,
    content: 'Tooltip on right',
    placement: 'right',
  },
};

export const WithDelay: Story = {
  args: {
    children: <Button>Delayed Tooltip</Button>,
    content: 'This tooltip appears after 500ms',
    delay: 500,
  },
};

export const ShowOnMount: Story = {
  args: {
    children: <Button>Auto Show</Button>,
    content: 'This tooltip shows on mount',
    showOnMount: true,
  },
};

export const LongContent: Story = {
  args: {
    children: <Button>Long Content</Button>,
    content: 'This is a longer tooltip content that might wrap to multiple lines',
  },
};

export const WithText: Story = {
  render: () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>
        Hover over{' '}
        <Tooltip content="This is a helpful tooltip">
          <span style={{ color: 'var(--color-link-default)', cursor: 'help', textDecoration: 'underline' }}>
            this text
          </span>
        </Tooltip>
        {' '}to see the tooltip.
      </p>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ padding: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
      <Tooltip content="Delete item" placement="top">
        <button style={{ 
          padding: '0.5rem', 
          border: '1px solid var(--color-border-default)', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          🗑️
        </button>
      </Tooltip>
      <Tooltip content="Edit item" placement="top">
        <button style={{ 
          padding: '0.5rem', 
          border: '1px solid var(--color-border-default)', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          ✏️
        </button>
      </Tooltip>
      <Tooltip content="Share item" placement="top">
        <button style={{ 
          padding: '0.5rem', 
          border: '1px solid var(--color-border-default)', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          📤
        </button>
      </Tooltip>
    </div>
  ),
};

export const AllPlacements: Story = {
  render: () => (
    <div style={{ 
      padding: '4rem', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '2rem',
      placeItems: 'center'
    }}>
      <Tooltip content="Top tooltip" placement="top">
        <Button>Top</Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" placement="bottom">
        <Button>Bottom</Button>
      </Tooltip>
      <Tooltip content="Left tooltip" placement="left">
        <Button>Left</Button>
      </Tooltip>
      <Tooltip content="Right tooltip" placement="right">
        <Button>Right</Button>
      </Tooltip>
      <Tooltip content="Top with delay" placement="top" delay={500}>
        <Button>Delayed</Button>
      </Tooltip>
      <Tooltip content="Auto show" placement="top" showOnMount>
        <Button>Auto</Button>
      </Tooltip>
    </div>
  ),
};
