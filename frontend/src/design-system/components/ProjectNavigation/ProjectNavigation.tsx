import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@design-system/components/Button';
import { Tooltip } from '@design-system/components/Tooltip';
import styles from './ProjectNavigation.module.css';

export interface ProjectNavigationProps {
  projects: Array<{ id: string; title: string }>;
  currentProjectId: string;
  onNavigate?: (projectId: string) => void;
}

export const ProjectNavigation: React.FC<ProjectNavigationProps> = ({
  projects,
  currentProjectId,
  onNavigate,
}) => {
  const navigate = useNavigate();

  // 현재 프로젝트의 인덱스와 이전/다음 프로젝트 찾기
  const { prevProject, nextProject } = useMemo(() => {
    const currentIndex = projects.findIndex(p => p.id === currentProjectId);
    
    if (currentIndex === -1) {
      return { prevProject: null, nextProject: null };
    }

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : projects.length - 1;
    const nextIndex = currentIndex < projects.length - 1 ? currentIndex + 1 : 0;

    return {
      prevProject: projects[prevIndex] || null,
      nextProject: projects[nextIndex] || null,
    };
  }, [projects, currentProjectId]);

  const handlePrevClick = () => {
    if (prevProject) {
      if (onNavigate) {
        onNavigate(prevProject.id);
      } else {
        navigate(`/projects/${prevProject.id}`);
      }
    }
  };

  const handleNextClick = () => {
    if (nextProject) {
      if (onNavigate) {
        onNavigate(nextProject.id);
      } else {
        navigate(`/projects/${nextProject.id}`);
      }
    }
  };

  const handleListClick = () => {
    if (onNavigate) {
      onNavigate('/projects');
    } else {
      navigate('/projects');
    }
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.buttonGroup}>
        {/* 이전 프로젝트 */}
        <Tooltip content="Previous Project">
          <Button
            variant="icon"
            size="sm"
            onClick={handlePrevClick}
            disabled={!prevProject}
            ariaLabel="Previous Project"
          >
            &lt;
          </Button>
        </Tooltip>

        {/* 프로젝트 목록 */}
        <Tooltip content="Project List">
          <Button
            variant="icon"
            size="sm"
            onClick={handleListClick}
            ariaLabel="Project List"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </Button>
        </Tooltip>

        {/* 다음 프로젝트 */}
        <Tooltip content="Next Project">
          <Button
            variant="icon"
            size="sm"
            onClick={handleNextClick}
            disabled={!nextProject}
            ariaLabel="Next Project"
          >
            &gt;
          </Button>
        </Tooltip>
      </div>
    </nav>
  );
};
