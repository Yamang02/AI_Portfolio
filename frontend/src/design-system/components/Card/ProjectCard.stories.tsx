import type { Meta, StoryObj } from '@storybook/react';
import { ProjectCard } from './ProjectCard';

const meta: Meta<typeof ProjectCard> = {
  title: 'Design System/Components/Card/ProjectCard',
  component: ProjectCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

const sampleProject = {
  id: 'sample-project',
  title: 'Sample Project',
  description: 'This is a sample project description that demonstrates how the ProjectCard component displays project information.',
  imageUrl: undefined,
  isTeam: true,
  technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
  startDate: '2024-01',
  endDate: '2024-06',
  githubUrl: 'https://github.com/example',
  liveUrl: 'https://example.com',
};

export const Default: Story = {
  args: {
    project: sampleProject,
  },
};

export const IndividualProject: Story = {
  args: {
    project: {
      ...sampleProject,
      isTeam: false,
      title: 'Personal Project',
    },
  },
};

export const WithImage: Story = {
  args: {
    project: {
      ...sampleProject,
      imageUrl: 'https://via.placeholder.com/400x200',
    },
  },
};

export const OngoingProject: Story = {
  args: {
    project: {
      ...sampleProject,
      endDate: undefined,
      title: 'Ongoing Project',
    },
  },
};

export const NoLinks: Story = {
  args: {
    project: {
      ...sampleProject,
      githubUrl: undefined,
      liveUrl: undefined,
      title: 'Project Without Links',
    },
  },
};

export const LongTitle: Story = {
  args: {
    project: {
      ...sampleProject,
      title: 'Very Long Project Title (With Parentheses) That Might Wrap',
    },
  },
};

export const ManyTechnologies: Story = {
  args: {
    project: {
      ...sampleProject,
      technologies: [
        'React',
        'TypeScript',
        'Node.js',
        'PostgreSQL',
        'Docker',
        'Kubernetes',
        'AWS',
        'GraphQL',
        'Redis',
        'MongoDB',
      ],
    },
  },
};

export const Clickable: Story = {
  args: {
    project: sampleProject,
    onClick: () => alert('Project card clicked!'),
  },
};


export const TeamVsIndividual: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <ProjectCard
        project={{
          ...sampleProject,
          isTeam: true,
          title: 'Team Project',
        }}
      />
      <ProjectCard
        project={{
          ...sampleProject,
          isTeam: false,
          title: 'Individual Project',
        }}
      />
    </div>
  ),
};
