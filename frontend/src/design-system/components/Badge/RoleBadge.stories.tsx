import type { Meta, StoryObj } from '@storybook/react';
import { RoleBadge } from './RoleBadge';

const meta: Meta<typeof RoleBadge> = {
  title: 'Design System/Badge/RoleBadge',
  component: RoleBadge,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoleBadge>;

export const Default: Story = {
  args: {
    role: '프론트엔드 개발자',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    role: '프론트엔드 개발자',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    role: '프론트엔드 개발자',
    size: 'lg',
  },
};

export const VariousRoles: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <RoleBadge role="프론트엔드 개발자" size="md" />
      <RoleBadge role="백엔드 개발자" size="md" />
      <RoleBadge role="풀스택 개발자" size="md" />
      <RoleBadge role="디자이너" size="md" />
      <RoleBadge role="PM" size="md" />
    </div>
  ),
};
