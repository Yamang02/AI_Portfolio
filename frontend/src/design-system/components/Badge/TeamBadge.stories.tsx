import type { Meta, StoryObj } from '@storybook/react';
import { TeamBadge } from './TeamBadge';

const meta: Meta<typeof TeamBadge> = {
  title: 'Design System/Components/Badge/TeamBadge',
  component: TeamBadge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TeamBadge>;

export const Team: Story = {
  args: {
    isTeam: true,
    size: 'md',
  },
};

export const Individual: Story = {
  args: {
    isTeam: false,
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    isTeam: true,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    isTeam: true,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    isTeam: true,
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <TeamBadge isTeam={true} size="sm" />
        <TeamBadge isTeam={false} size="sm" />
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <TeamBadge isTeam={true} size="md" />
        <TeamBadge isTeam={false} size="md" />
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <TeamBadge isTeam={true} size="lg" />
        <TeamBadge isTeam={false} size="lg" />
      </div>
    </div>
  ),
};

export const Comparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <TeamBadge isTeam={true} size="md" />
      <TeamBadge isTeam={false} size="md" />
    </div>
  ),
};
