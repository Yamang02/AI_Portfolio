import type { Meta, StoryObj } from '@storybook/react';
import { SocialIcon } from './SocialIcon';

const meta: Meta<typeof SocialIcon> = {
  title: 'Design System/Components/Icon/SocialIcon',
  component: SocialIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SocialIcon>;

export const Default: Story = {
  args: {
    type: 'github',
    size: 'md',
  },
};

export const GitHub: Story = {
  args: {
    type: 'github',
    size: 'md',
  },
};

export const ExternalLink: Story = {
  args: {
    type: 'external-link',
    size: 'md',
  },
};

export const LinkedIn: Story = {
  args: {
    type: 'linkedin',
    size: 'md',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <SocialIcon type="github" size="sm" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Small</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <SocialIcon type="github" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Medium</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <SocialIcon type="github" size="lg" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Large</span>
      </div>
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <SocialIcon type="github" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>GitHub</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <SocialIcon type="external-link" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>External Link</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <SocialIcon type="linkedin" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>LinkedIn</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
        <SocialIcon type="email" size="md" />
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Email</span>
      </div>
    </div>
  ),
};

