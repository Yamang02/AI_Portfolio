import React from 'react';
import { SkeletonCard, EmptyCard, ProjectCard } from '@/design-system';
import type { ProjectCardProject } from '@/design-system/components/Card/ProjectCard';
import { RetryButton } from './RetryButton';
import styles from '../ProjectsListPage.module.css';

interface ProjectSectionContentProps {
  isLoading: boolean;
  isError: boolean;
  projects: ProjectCardProject[];
  emptyMessage: string;
  onRefetch: () => void;
  onCardClick: (projectId: string) => void;
  getProjectId: (project: ProjectCardProject) => string;
  sectionType?: 'featured' | 'type';
}

export const ProjectSectionContent: React.FC<ProjectSectionContentProps> = ({
  isLoading,
  isError,
  projects,
  emptyMessage,
  onRefetch,
  onCardClick,
  getProjectId,
  sectionType = 'featured',
}) => {
  if (isLoading) {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} isLoading={true} />
        ))}
      </>
    );
  }

  if (isError) {
    return (
      <div className={styles.relativeContainer}>
        <SkeletonCard isLoading={false} />
        <div className={styles.retryOverlay}>
          <RetryButton onRetry={onRefetch} />
          <span className={styles.retryText}>재시도</span>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={styles.relativeContainer}>
        <EmptyCard message={emptyMessage} />
        <div className={styles.retryOverlayTopRight}>
          <RetryButton onRetry={onRefetch} />
        </div>
      </div>
    );
  }

  return (
    <>
      {projects.map((project) => {
        const projectId = getProjectId(project);
        // 섹션 타입에 따라 ID 생성
        const sectionId = sectionType === 'type' 
          ? `type-project-section-${projectId}`
          : `project-section-${projectId}`;
        return (
          <div key={projectId} id={sectionId}>
            <ProjectCard project={project} onClick={() => onCardClick(projectId)} />
          </div>
        );
      })}
    </>
  );
};
