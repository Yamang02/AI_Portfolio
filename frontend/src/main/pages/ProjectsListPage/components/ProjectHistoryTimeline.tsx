import React, { useMemo, useRef, useEffect } from 'react';

import type { Project } from '@/main/entities/project/model/project.types';
import styles from './ProjectHistoryTimeline.module.css';

interface ProjectHistoryTimelineProps {
  projects: Project[];
  onProjectClick?: (projectId: string) => void;
  highlightedProjectId?: string;
}

interface TimelineData {
  sortedProjects: Project[];
  timelineWidth: number;
  barWidth: number;
  getProjectPosition: (index: number) => number;
  yearLabels: Array<{ year: number; position: number }>;
}

const parseDate = (dateValue: string | number[] | null | undefined): Date => {
  if (!dateValue) return new Date();

  if (Array.isArray(dateValue)) {
    const [year, month] = dateValue;
    if (typeof year === 'number' && typeof month === 'number') {
      return new Date(year, month - 1, 1);
    }
    return new Date();
  }

  if (typeof dateValue === 'string' && dateValue.includes('-')) {
    const [year, month] = dateValue.split('-');
    const y = Number.parseInt(year, 10);
    const m = Number.parseInt(month, 10);
    if (Number.isFinite(y) && Number.isFinite(m)) {
      return new Date(y, m - 1, 1);
    }
  }

  return new Date(dateValue as string);
};

const formatDate = (dateValue: string): string => {
  const date = parseDate(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}.${month}`;
};

const getBarHeight = (project: Project): number => {
  const status = project.status || 'completed';
  if (status === 'in_progress') return 24;
  if (status === 'completed') return 32;
  if (status === 'maintenance') return 28;
  return 28;
};

const buildTimelineData = (projects: Project[]): TimelineData | null => {
  if (projects.length === 0) return null;

  const sortedProjects = [...projects].sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime());

  const barBaseWidth = 120;
  const barGap = 40;
  const minBarWidth = 80;
  const targetWidth = 2560;
  const availableWidth = targetWidth - 80;

  const totalBarWidth = sortedProjects.length * barBaseWidth;
  const totalGapWidth = (sortedProjects.length - 1) * barGap;

  let actualBarWidth = barBaseWidth;
  let actualGap = barGap;

  if (totalBarWidth + totalGapWidth > availableWidth) {
    const totalNeeded = sortedProjects.length * minBarWidth + (sortedProjects.length - 1) * barGap;
    if (totalNeeded <= availableWidth) {
      actualBarWidth = Math.floor((availableWidth - (sortedProjects.length - 1) * barGap) / sortedProjects.length);
    } else {
      actualBarWidth = minBarWidth;
      actualGap = Math.floor((availableWidth - sortedProjects.length * minBarWidth) / Math.max(sortedProjects.length - 1, 1));
    }
  }

  const timelineWidth = sortedProjects.length * actualBarWidth + (sortedProjects.length - 1) * actualGap + 80;
  const getProjectPosition = (index: number) => 40 + index * (actualBarWidth + actualGap);

  const yearLabels: Array<{ year: number; position: number }> = [];
  let lastYear: number | null = null;

  sortedProjects.forEach((project, index) => {
    const year = parseDate(project.startDate).getFullYear();
    if (lastYear === null || year !== lastYear) {
      yearLabels.push({ year, position: getProjectPosition(index) });
      lastYear = year;
    }
  });

  return {
    sortedProjects,
    timelineWidth,
    barWidth: actualBarWidth,
    getProjectPosition,
    yearLabels,
  };
};

export const ProjectHistoryTimeline: React.FC<ProjectHistoryTimelineProps> = ({
  projects,
  onProjectClick,
  highlightedProjectId,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const timelineData = useMemo(() => buildTimelineData(projects), [projects]);

  useEffect(() => {
    if (!timelineRef.current || !timelineData) return;

    const scrollToRight = () => {
      if (timelineRef.current) {
        timelineRef.current.scrollLeft = timelineRef.current.scrollWidth;
      }
    };

    scrollToRight();
    const timeoutId = setTimeout(scrollToRight, 100);
    return () => clearTimeout(timeoutId);
  }, [timelineData]);

  if (!timelineData || projects.length === 0) {
    return null;
  }

  const { timelineWidth, sortedProjects, yearLabels, barWidth, getProjectPosition } = timelineData;

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineWrapper} ref={timelineRef}>
        <div className={`${styles.timeline} ${styles.timelineDynamic}`} style={{ width: `${timelineWidth}px` }}>
          <div className={styles.yearLabels}>
            {yearLabels.map((label) => (
              <div
                key={label.year}
                className={`${styles.yearLabel} ${styles.yearLabelDynamic}`}
                style={{ left: `${label.position}px` }}
              >
                <span className={styles.yearLabelText}>{label.year}</span>
              </div>
            ))}
          </div>

          <div className={styles.timelineLine} />

          <div className={styles.projectsContainer}>
            {sortedProjects.map((project, index) => {
              const positionX = getProjectPosition(index);
              const barHeight = getBarHeight(project);
              const isHighlighted = highlightedProjectId === project.id;
              const isOngoing = !project.endDate;

              const nextProject = index < sortedProjects.length - 1 ? sortedProjects[index + 1] : null;
              let connectionLine: React.ReactNode = null;
              if (nextProject) {
                const nextPositionX = getProjectPosition(index + 1);
                const connectionStartX = positionX + barWidth;
                const connectionWidth = nextPositionX - connectionStartX;
                if (connectionWidth > 0) {
                  connectionLine = (
                    <div
                      className={`${styles.connectionLine} ${styles.connectionLineDynamic}`}
                      style={{ left: `${connectionStartX}px`, width: `${connectionWidth}px` }}
                    />
                  );
                }
              }

              const titleSuffix = isOngoing
                ? ` (ongoing) - ${formatDate(project.startDate)} ~ ongoing`
                : ` - ${formatDate(project.startDate)}${project.endDate ? ` ~ ${formatDate(project.endDate)}` : ''}`;

              return (
                <React.Fragment key={project.id}>
                  <button
                    type="button"
                    className={`${styles.projectBar} ${styles.projectBarDynamic}`}
                    style={{
                      left: `${positionX}px`,
                      width: `${barWidth}px`,
                      height: `${barHeight}px`,
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                    }}
                    onClick={() => onProjectClick?.(project.id)}
                    data-project-id={project.id}
                  >
                    <div
                      className={`${styles.barContent} ${isHighlighted ? styles.highlighted : ''} ${isOngoing ? styles.ongoing : ''}`}
                      title={`${project.title}${titleSuffix}`}
                    >
                      <span className={styles.projectTitle}>{project.title}</span>
                    </div>
                  </button>
                  {connectionLine}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
