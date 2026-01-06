import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@design-system/components/Button';
import { Tooltip } from '@design-system/components/Tooltip';
import styles from './ProjectNavigation.module.css';

interface ProjectNavigationProps {
  projects: Array<{ id: string; title: string }>;
  currentProjectId: string;
}

export const ProjectNavigation: React.FC<ProjectNavigationProps> = ({
  projects,
  currentProjectId,
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
      navigate(`/projects/${prevProject.id}`);
    }
  };

  const handleNextClick = () => {
    if (nextProject) {
      navigate(`/projects/${nextProject.id}`);
    }
  };

  const handleListClick = () => {
    navigate('/projects');
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.buttonGroup}>
        {/* 이전 프로젝트 */}
        <Tooltip content="Previous Project">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrevClick}
            disabled={!prevProject}
            ariaLabel="Previous Project"
            className={styles.navButton}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Button>
        </Tooltip>

        {/* 프로젝트 목록 */}
        <Tooltip content="Project List">
          <Button
            variant="secondary"
            size="md"
            onClick={handleListClick}
            ariaLabel="Project List"
            className={styles.navButton}
          >
            <svg
              width="20"
              height="20"
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
            variant="secondary"
            size="md"
            onClick={handleNextClick}
            disabled={!nextProject}
            ariaLabel="Next Project"
            className={styles.navButton}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </Tooltip>
      </div>
    </nav>
  );
};
