import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
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

// 기본 사용 예시 (상태 관리 포함)
const PaginationWithState = ({ totalPages, maxVisiblePages }: { totalPages: number; maxVisiblePages?: number }) => {
  const [currentPage, setCurrentPage] = useState(1);
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      maxVisiblePages={maxVisiblePages}
    />
  );
};

export const Default: Story = {
  render: () => <PaginationWithState totalPages={5} />,
};

export const SinglePage: Story = {
  render: () => <PaginationWithState totalPages={1} />,
};

export const FewPages: Story = {
  render: () => <PaginationWithState totalPages={3} />,
};

export const MediumPages: Story = {
  render: () => <PaginationWithState totalPages={10} />,
};

export const ManyPages: Story = {
  render: () => <PaginationWithState totalPages={20} />,
};

export const ManyPagesAtStart: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    return (
      <Pagination
        currentPage={currentPage}
        totalPages={50}
        onPageChange={setCurrentPage}
        maxVisiblePages={5}
      />
    );
  },
};

export const ManyPagesAtMiddle: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(25);
    return (
      <Pagination
        currentPage={currentPage}
        totalPages={50}
        onPageChange={setCurrentPage}
        maxVisiblePages={5}
      />
    );
  },
};

export const ManyPagesAtEnd: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(50);
    return (
      <Pagination
        currentPage={currentPage}
        totalPages={50}
        onPageChange={setCurrentPage}
        maxVisiblePages={5}
      />
    );
  },
};

export const VeryManyPages: Story = {
  render: () => <PaginationWithState totalPages={100} />,
};

export const CustomMaxVisiblePages: Story = {
  render: () => <PaginationWithState totalPages={30} maxVisiblePages={7} />,
};

export const LargeMaxVisiblePages: Story = {
  render: () => <PaginationWithState totalPages={50} maxVisiblePages={10} />,
};

// 페이지 변화 시나리오
export const PageGrowthScenario: Story = {
  render: () => {
    const [totalPages, setTotalPages] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={() => setTotalPages(Math.max(1, totalPages - 1))}>-</button>
          <span>총 페이지: {totalPages}</span>
          <button onClick={() => setTotalPages(totalPages + 1)}>+</button>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          maxVisiblePages={5}
        />
      </div>
    );
  },
};
