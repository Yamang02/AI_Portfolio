import React, { useMemo, useRef, useEffect } from 'react';
import { safeSplit, safeIncludes } from '@/shared/utils/safeStringUtils';
import type { Project } from '@/entities/project/model/project.types';
import styles from './ProjectHistoryTimeline.module.css';

interface ProjectHistoryTimelineProps {
  projects: Project[];
  onProjectClick?: (projectId: string) => void;
  highlightedProjectId?: string;
}

export const ProjectHistoryTimeline: React.FC<ProjectHistoryTimelineProps> = ({
  projects,
  onProjectClick,
  highlightedProjectId,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // 날짜를 Date 객체로 변환하는 헬퍼 함수
  const parseDate = (dateStr: string | any): Date => {
    if (!dateStr) {
      return new Date();
    }
    
    if (Array.isArray(dateStr)) {
      if (dateStr.length >= 2 && typeof dateStr[0] === 'number' && typeof dateStr[1] === 'number') {
        const year = dateStr[0];
        const month = dateStr[1];
        return new Date(year, month - 1, 1);
      }
      return new Date();
    }
    
    if (typeof dateStr === 'string') {
      if (safeIncludes(dateStr, '-')) {
        const parts = safeSplit(dateStr, '-');
        if (parts.length >= 2) {
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        }
      }
      return new Date(dateStr);
    }
    
    return new Date();
  };

  // 연도 추출
  const getYear = (dateStr: string): number => {
    const date = parseDate(dateStr);
    return date.getFullYear();
  };

  // 프로젝트 데이터 준비
  const timelineData = useMemo(() => {
    if (projects.length === 0) return null;

    // 프로젝트 정렬 (시작일 기준 오름차순)
    const sortedProjects = [...projects].sort((a, b) => {
      const dateA = parseDate(a.startDate).getTime();
      const dateB = parseDate(b.startDate).getTime();
      return dateA - dateB;
    });

    // 프로젝트 개수에 따라 균등하게 배치
    // 각 프로젝트 바의 기본 너비와 간격 설정
    const barBaseWidth = 120; // 기본 바 너비
    const barGap = 40; // 바 사이 간격
    const minBarWidth = 80; // 최소 바 너비
    
    // 타임라인 전체 너비 계산 (2스크롤 안에 들어가도록)
    const targetWidth = 2560;
    const availableWidth = targetWidth - 80; // 양쪽 여백
    const totalBarWidth = sortedProjects.length * barBaseWidth;
    const totalGapWidth = (sortedProjects.length - 1) * barGap;
    
    // 너비가 부족하면 조정
    let actualBarWidth = barBaseWidth;
    let actualGap = barGap;
    
    if (totalBarWidth + totalGapWidth > availableWidth) {
      // 사용 가능한 너비에 맞춰 조정
      const totalNeeded = sortedProjects.length * minBarWidth + (sortedProjects.length - 1) * barGap;
      if (totalNeeded <= availableWidth) {
        actualBarWidth = Math.floor((availableWidth - (sortedProjects.length - 1) * barGap) / sortedProjects.length);
      } else {
        actualBarWidth = minBarWidth;
        actualGap = Math.floor((availableWidth - sortedProjects.length * minBarWidth) / Math.max(sortedProjects.length - 1, 1));
      }
    }
    
    const timelineWidth = sortedProjects.length * actualBarWidth + (sortedProjects.length - 1) * actualGap + 80;

    // 프로젝트 위치 계산 함수
    const getProjectPosition = (index: number) => {
      return 40 + index * (actualBarWidth + actualGap);
    };

    // 연도별 그룹화 (연도 라벨 표시용)
    const yearLabels: Array<{ year: number; position: number }> = [];
    let lastYear: number | null = null;
    
    sortedProjects.forEach((project, index) => {
      const year = getYear(project.startDate);
      if (lastYear === null || year !== lastYear) {
        yearLabels.push({
          year,
          position: getProjectPosition(index),
        });
        lastYear = year;
      }
    });

    return {
      sortedProjects,
      timelineWidth,
      barWidth: actualBarWidth,
      barGap: actualGap,
      getProjectPosition,
      yearLabels,
    };
  }, [projects]);

  // 날짜를 YYYY.MM 형식으로 포맷
  const formatDate = (dateStr: string): string => {
    const date = parseDate(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}.${month}`;
  };

  // 프로젝트 상태에 따른 바 높이 계산
  const getBarHeight = (project: Project): number => {
    const status = project.status || 'completed';
    
    if (status === 'in_progress') {
      return 24; // 진행중: 중간 높이
    } else if (status === 'completed') {
      return 32; // 완료: 충분한 높이
    } else if (status === 'maintenance') {
      return 28; // 유지보수: 중간 높이
    } else {
      return 28; // 기타 상태: 중간 높이
    }
  };

  // 프로젝트 바 렌더링
  const renderProjectBar = (project: Project, index: number, allProjects: Project[]) => {
    if (!timelineData) return null;

    const { getProjectPosition, barWidth } = timelineData;
    const positionX = getProjectPosition(index);
    const barHeight = getBarHeight(project);
    const isHighlighted = highlightedProjectId === project.id;
    const isOngoing = !project.endDate;
    const sectionId = `project-section-${project.id}`;

    // 다음 프로젝트와 연결선 그리기
    const nextProject = index < allProjects.length - 1 ? allProjects[index + 1] : null;
    let connectionLine = null;
    if (nextProject) {
      const nextPositionX = getProjectPosition(index + 1);
      const connectionStartX = positionX + barWidth;
      const connectionEndX = nextPositionX;
      const connectionWidth = connectionEndX - connectionStartX;
      
      if (connectionWidth > 0) {
        connectionLine = (
          <div
            className={styles.connectionLine}
            style={{
              left: `${connectionStartX}px`,
              width: `${connectionWidth}px`,
            }}
          />
        );
      }
    }

    const handleBarClick = () => {
      if (onProjectClick) {
        onProjectClick(project.id);
      }
      
      // 해당 프로젝트가 있는 섹션으로 스크롤
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    return (
      <React.Fragment key={project.id}>
        <div
          className={styles.projectBar}
          style={{
            left: `${positionX}px`,
            width: `${barWidth}px`,
            height: `${barHeight}px`,
          }}
          onClick={handleBarClick}
          data-project-id={project.id}
        >
          <div
            className={`${styles.barContent} ${isHighlighted ? styles.highlighted : ''} ${isOngoing ? styles.ongoing : ''}`}
            title={`${project.title} ${isOngoing ? '(진행 중)' : ''} - ${formatDate(project.startDate)}${project.endDate ? ` ~ ${formatDate(project.endDate)}` : ' ~ 진행중'}`}
          >
            <span className={styles.projectTitle}>{project.title}</span>
          </div>
        </div>
        {connectionLine}
      </React.Fragment>
    );
  };

  // 스크롤을 오른쪽 끝으로 이동 (최근 프로젝트가 보이도록)
  useEffect(() => {
    if (timelineRef.current && timelineData) {
      // 타임라인이 렌더링된 후 스크롤을 오른쪽 끝으로 이동
      const scrollToRight = () => {
        if (timelineRef.current) {
          timelineRef.current.scrollLeft = timelineRef.current.scrollWidth;
        }
      };
      
      // 즉시 실행
      scrollToRight();
      
      // 약간의 지연 후에도 실행 (렌더링 완료 보장)
      const timeoutId = setTimeout(scrollToRight, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [timelineData]);

  if (!timelineData || projects.length === 0) {
    return null;
  }

  const { timelineWidth, sortedProjects, yearLabels } = timelineData;

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineWrapper} ref={timelineRef}>
        <div
          className={styles.timeline}
          style={{ width: `${timelineWidth}px` }}
        >
          {/* 연도 라벨 */}
          <div className={styles.yearLabels}>
            {yearLabels.map((label, index) => (
              <div
                key={label.year}
                className={styles.yearLabel}
                style={{ left: `${label.position}px` }}
              >
                <span className={styles.yearLabelText}>{label.year}</span>
              </div>
            ))}
          </div>

          {/* 타임라인 라인 */}
          <div className={styles.timelineLine} />

          {/* 프로젝트 바들 */}
          <div className={styles.projectsContainer}>
            {sortedProjects.map((project, index) => renderProjectBar(project, index, sortedProjects))}
          </div>
        </div>
      </div>
    </div>
  );
};
