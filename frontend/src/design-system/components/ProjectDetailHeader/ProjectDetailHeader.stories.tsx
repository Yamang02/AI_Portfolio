import type { Meta, StoryObj } from '@storybook/react';
import { ProjectDetailHeader } from './ProjectDetailHeader';
import type { Project } from '@/main/entities/project/model/project.types';

const meta: Meta<typeof ProjectDetailHeader> = {
  title: 'Design System/Components/ProjectDetailHeader',
  component: ProjectDetailHeader,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProjectDetailHeader>;

const mockProject: Project = {
  id: '1',
  title: 'Sample Project',
  description: 'This is a sample project description',
  readme: '# Sample Project\n\nThis is a sample project.',
  imageUrl: 'https://via.placeholder.com/800x400',
  source: 'github',
  type: 'BUILD',
  isTeam: true,
  role: '프론트엔드 개발자',
  startDate: '2025-01-01',
  endDate: '2025-03-31',
  githubUrl: 'https://github.com/example',
  liveUrl: 'https://example.com',
  externalUrl: 'https://notion.so/example',
  technologies: ['React', 'TypeScript', 'CSS'],
};

export const Default: Story = {
  args: {
    project: mockProject,
  },
};

export const IndividualProject: Story = {
  args: {
    project: {
      ...mockProject,
      isTeam: false,
      role: undefined,
    },
  },
};

export const WithoutLinks: Story = {
  args: {
    project: {
      ...mockProject,
      githubUrl: '#',
      liveUrl: '#',
      externalUrl: '#',
    },
  },
};

export const OngoingProject: Story = {
  args: {
    project: {
      ...mockProject,
      endDate: null,
    },
  },
};
