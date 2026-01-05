import type { Meta, StoryObj } from '@storybook/react';
import { ProjectTypeBadge } from './ProjectTypeBadge';

const meta: Meta<typeof ProjectTypeBadge> = {
  title: 'Design System/Components/Badge/ProjectTypeBadge',
  component: ProjectTypeBadge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProjectTypeBadge>;

export const Build: Story = {
  args: {
    type: 'BUILD',
    size: 'md',
  },
};

export const Lab: Story = {
  args: {
    type: 'LAB',
    size: 'md',
  },
};

export const Maintenance: Story = {
  args: {
    type: 'MAINTENANCE',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    type: 'BUILD',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    type: 'BUILD',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    type: 'BUILD',
    size: 'lg',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <ProjectTypeBadge type="BUILD" size="md" />
      <ProjectTypeBadge type="LAB" size="md" />
      <ProjectTypeBadge type="MAINTENANCE" size="md" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <ProjectTypeBadge type="BUILD" size="sm" />
        <ProjectTypeBadge type="LAB" size="sm" />
        <ProjectTypeBadge type="MAINTENANCE" size="sm" />
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <ProjectTypeBadge type="BUILD" size="md" />
        <ProjectTypeBadge type="LAB" size="md" />
        <ProjectTypeBadge type="MAINTENANCE" size="md" />
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <ProjectTypeBadge type="BUILD" size="lg" />
        <ProjectTypeBadge type="LAB" size="lg" />
        <ProjectTypeBadge type="MAINTENANCE" size="lg" />
      </div>
    </div>
  ),
};
