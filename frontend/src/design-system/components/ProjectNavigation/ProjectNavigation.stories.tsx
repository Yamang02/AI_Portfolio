import type { Meta, StoryObj } from '@storybook/react';
import { ProjectNavigation } from './ProjectNavigation';

const meta: Meta<typeof ProjectNavigation> = {
  title: 'Design System/Components/ProjectNavigation',
  component: ProjectNavigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ProjectNavigation>;

const mockProjects = [
  { id: '1', title: 'Project 1' },
  { id: '2', title: 'Project 2' },
  { id: '3', title: 'Project 3' },
  { id: '4', title: 'Project 4' },
];

export const Default: Story = {
  args: {
    projects: mockProjects,
    currentProjectId: '2',
  },
};

export const FirstProject: Story = {
  args: {
    projects: mockProjects,
    currentProjectId: '1',
  },
};

export const LastProject: Story = {
  args: {
    projects: mockProjects,
    currentProjectId: '4',
  },
};

export const SingleProject: Story = {
  args: {
    projects: [{ id: '1', title: 'Only Project' }],
    currentProjectId: '1',
  },
};

export const WithCustomNavigate: Story = {
  args: {
    projects: mockProjects,
    currentProjectId: '2',
    onNavigate: (projectId: string) => {
      console.log('Navigate to:', projectId);
    },
  },
};
