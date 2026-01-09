import type { Meta, StoryObj } from '@storybook/react';
import { RoleBadge } from './RoleBadge';

const meta: Meta<typeof RoleBadge> = {
  title: 'Design System/Components/Badge/RoleBadge',
  component: RoleBadge,
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
type Story = StoryObj<typeof RoleBadge>;

export const Default: Story = {
  args: {
    role: '프론트엔드 개발자',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <RoleBadge role="프론트엔드 개발자" size="sm" />
      <RoleBadge role="프론트엔드 개발자" size="md" />
      <RoleBadge role="프론트엔드 개발자" size="lg" />
    </div>
  ),
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
