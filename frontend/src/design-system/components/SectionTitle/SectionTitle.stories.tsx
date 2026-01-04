import type { Meta, StoryObj } from '@storybook/react';
import { SectionTitle } from './SectionTitle';

const meta: Meta<typeof SectionTitle> = {
  title: 'Design System/SectionTitle',
  component: SectionTitle,
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof SectionTitle>;

export const H1: Story = {
  args: {
    level: 'h1',
    children: 'Main Heading',
  },
};

export const H2: Story = {
  args: {
    level: 'h2',
    children: 'Section Heading',
  },
};

export const H3: Story = {
  args: {
    level: 'h3',
    children: 'Subsection Heading',
  },
};

export const H4: Story = {
  args: {
    level: 'h4',
    children: 'Minor Heading',
  },
};
