import type { Meta, StoryObj } from '@storybook/react';
import { TextLink } from './TextLink';

const meta: Meta<typeof TextLink> = {
  title: 'Design System/TextLink',
  component: TextLink,
  tags: ['autodocs'],
  argTypes: {
    external: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextLink>;

export const Default: Story = {
  args: {
    href: '/projects',
    children: 'View Projects',
  },
};

export const External: Story = {
  args: {
    href: 'https://example.com',
    external: true,
    children: 'External Link',
  },
};

