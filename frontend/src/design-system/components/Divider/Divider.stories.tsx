import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Design System/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  args: {
    variant: 'horizontal',
  },
};

export const Vertical: Story = {
  args: {
    variant: 'vertical',
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: '100px', alignItems: 'center' }}>
        <span>Left</span>
        <Story />
        <span>Right</span>
      </div>
    ),
  ],
};

export const CustomSpacing: Story = {
  args: {
    variant: 'horizontal',
    spacing: 8,
  },
};
