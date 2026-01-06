import type { Meta, StoryObj } from '@storybook/react';
import { ProjectThumbnailCarousel } from './ProjectThumbnailCarousel';

const meta: Meta<typeof ProjectThumbnailCarousel> = {
  title: 'Design System/Components/Carousel/ProjectThumbnailCarousel',
  component: ProjectThumbnailCarousel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProjectThumbnailCarousel>;

const mockProjects = [
  {
    id: 'project-1',
    title: 'Genpresso',
    imageUrl: 'https://via.placeholder.com/200',
  },
  {
    id: 'project-2',
    title: 'AI Chatbot',
    imageUrl: 'https://via.placeholder.com/200',
  },
  {
    id: 'project-3',
    title: '노루 ERP',
    imageUrl: 'https://via.placeholder.com/200',
  },
  {
    id: 'project-4',
    title: '포트폴리오 웹사이트',
    imageUrl: 'https://via.placeholder.com/200',
  },
  {
    id: 'project-5',
    title: 'E-commerce Platform',
    imageUrl: 'https://via.placeholder.com/200',
  },
  {
    id: 'project-6',
    title: 'Task Management App',
    imageUrl: 'https://via.placeholder.com/200',
  },
];

export const Default: Story = {
  args: {
    projects: mockProjects,
    title: '다른 프로젝트',
    maxItems: 10,
    thumbnailSize: 'md',
  },
};

export const Small: Story = {
  args: {
    projects: mockProjects,
    title: '다른 프로젝트',
    maxItems: 10,
    thumbnailSize: 'sm',
  },
};

export const Large: Story = {
  args: {
    projects: mockProjects,
    title: '다른 프로젝트',
    maxItems: 10,
    thumbnailSize: 'lg',
  },
};

export const WithCurrentProject: Story = {
  args: {
    projects: mockProjects,
    currentProjectId: 'project-1',
    title: '다른 프로젝트',
    maxItems: 10,
    thumbnailSize: 'md',
  },
};

export const LimitedItems: Story = {
  args: {
    projects: mockProjects,
    title: '추천 프로젝트',
    maxItems: 3,
    thumbnailSize: 'md',
  },
};

export const CustomTitle: Story = {
  args: {
    projects: mockProjects,
    title: '관련 프로젝트',
    maxItems: 10,
    thumbnailSize: 'md',
  },
};
