import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Design System/Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
    },
    totalPages: {
      control: { type: 'number', min: 1 },
    },
    maxVisiblePages: {
      control: { type: 'number', min: 3, max: 10 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

const noop = () => undefined;

export const Default: Story = {
  args: { currentPage: 1, totalPages: 5, onPageChange: noop },
};

export const SinglePage: Story = {
  args: { currentPage: 1, totalPages: 1, onPageChange: noop },
};

export const FewPages: Story = {
  args: { currentPage: 2, totalPages: 3, onPageChange: noop },
};

export const MediumPages: Story = {
  args: { currentPage: 5, totalPages: 10, onPageChange: noop },
};

export const ManyPages: Story = {
  args: { currentPage: 10, totalPages: 20, onPageChange: noop },
};

export const ManyPagesAtStart: Story = {
  args: { currentPage: 1, totalPages: 50, onPageChange: noop, maxVisiblePages: 5 },
};

export const ManyPagesAtMiddle: Story = {
  args: { currentPage: 25, totalPages: 50, onPageChange: noop, maxVisiblePages: 5 },
};

export const ManyPagesAtEnd: Story = {
  args: { currentPage: 50, totalPages: 50, onPageChange: noop, maxVisiblePages: 5 },
};

export const VeryManyPages: Story = {
  args: { currentPage: 50, totalPages: 100, onPageChange: noop },
};

export const CustomMaxVisiblePages: Story = {
  args: { currentPage: 15, totalPages: 30, onPageChange: noop, maxVisiblePages: 7 },
};

export const LargeMaxVisiblePages: Story = {
  args: { currentPage: 25, totalPages: 50, onPageChange: noop, maxVisiblePages: 10 },
};

// 페이지 변화 시나리오
export const PageGrowthScenario: Story = {
  args: { currentPage: 3, totalPages: 8, onPageChange: noop, maxVisiblePages: 5 },
};
