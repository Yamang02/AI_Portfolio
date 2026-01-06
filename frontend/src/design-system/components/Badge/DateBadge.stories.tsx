import type { Meta, StoryObj } from '@storybook/react';
import { DateBadge } from './DateBadge';

const meta: Meta<typeof DateBadge> = {
  title: 'Design System/Badge/DateBadge',
  component: DateBadge,
  tags: ['autodocs'],
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

export const Small: Story = {
  args: {
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    size: 'lg',
  },
};

export const SingleMonth: Story = {
  args: {
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    size: 'md',
  },
};
