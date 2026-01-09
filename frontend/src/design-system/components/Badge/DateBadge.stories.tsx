import type { Meta, StoryObj } from '@storybook/react';
import { DateBadge } from './DateBadge';

const meta: Meta<typeof DateBadge> = {
  title: 'Design System/Components/Badge/DateBadge',
  component: DateBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateBadge>;

export const Default: Story = {
  args: {
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    size: 'md',
  },
};

export const Ongoing: Story = {
  args: {
    startDate: '2025-01-01',
    endDate: null,
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <DateBadge startDate="2025-01-01" endDate="2025-03-31" size="sm" />
      <DateBadge startDate="2025-01-01" endDate="2025-03-31" size="md" />
      <DateBadge startDate="2025-01-01" endDate="2025-03-31" size="lg" />
    </div>
  ),
};

export const SingleMonth: Story = {
  args: {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    size: 'md',
  },
};
