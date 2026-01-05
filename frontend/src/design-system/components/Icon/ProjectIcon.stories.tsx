import type { Meta, StoryObj } from '@storybook/react';
import { ProjectIcon } from './ProjectIcon';

const meta: Meta<typeof ProjectIcon> = {
  title: 'Design System/Components/Icon/ProjectIcon',
  component: ProjectIcon,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProjectIcon>;

export const Web: Story = {
  args: {
    type: 'web',
    size: 'md',
  },
};

export const Backend: Story = {
  args: {
    type: 'backend',
    size: 'md',
  },
};

export const Mobile: Story = {
  args: {
    type: 'mobile',
    size: 'md',
  },
};

export const Desktop: Story = {
  args: {
    type: 'desktop',
    size: 'md',
  },
};

export const Database: Story = {
  args: {
    type: 'database',
    size: 'md',
  },
};

export const Cloud: Story = {
  args: {
    type: 'cloud',
    size: 'md',
  },
};

export const AI: Story = {
  args: {
    type: 'ai',
    size: 'md',
  },
};

export const Default: Story = {
  args: {
    type: 'default',
    size: 'md',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="web" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Web</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="backend" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Backend</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="mobile" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Mobile</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="desktop" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Desktop</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="database" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Database</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="cloud" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Cloud</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="ai" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>AI</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="default" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Default</span>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="web" size="sm" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Small</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="web" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Medium</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <ProjectIcon type="web" size="lg" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Large</span>
      </div>
    </div>
  ),
};
