import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';
import { SkeletonCard } from './SkeletonCard';

const meta: Meta<typeof Skeleton> = {
  title: 'Design System/Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: {
    width: 200,
    height: 20,
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    width: '100%',
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 40,
    height: 40,
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: 200,
    height: 100,
  },
};

export const Card: Story = {
  render: () => <SkeletonCard />,
};

export const CardWithoutImage: Story = {
  render: () => <SkeletonCard showImage={false} />,
};

export const CardWithCustomLines: Story = {
  render: () => <SkeletonCard lines={5} />,
};

export const TextSkeleton: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      <Skeleton variant="text" height={24} width="60%" style={{ marginBottom: '1rem' }} />
      <Skeleton variant="text" height={16} width="100%" style={{ marginBottom: '0.5rem' }} />
      <Skeleton variant="text" height={16} width="90%" style={{ marginBottom: '0.5rem' }} />
      <Skeleton variant="text" height={16} width="75%" />
    </div>
  ),
};

export const AvatarSkeleton: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Skeleton variant="circular" width={48} height={48} />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" height={20} width="40%" style={{ marginBottom: '0.5rem' }} />
        <Skeleton variant="text" height={16} width="60%" />
      </div>
    </div>
  ),
};

export const CardGrid: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '1.5rem' 
    }}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  ),
};

export const CustomSkeleton: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      <Skeleton variant="rectangular" height={200} style={{ marginBottom: '1rem', borderRadius: '8px' }} />
      <Skeleton variant="text" height={24} width="70%" style={{ marginBottom: '0.5rem' }} />
      <Skeleton variant="text" height={16} width="100%" style={{ marginBottom: '0.5rem' }} />
      <Skeleton variant="text" height={16} width="80%" />
    </div>
  ),
};
