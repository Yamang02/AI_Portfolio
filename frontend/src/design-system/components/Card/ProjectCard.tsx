import React, { useState, useRef, useEffect } from 'react';
import { Card } from './Card';
import { Badge } from '../Badge/Badge';
import { TeamBadge } from '../Badge/TeamBadge';
import { SocialIcon } from '../Icon/SocialIcon';
import { ProjectIcon, ProjectIconType } from '../Icon/ProjectIcon';
import { formatDateRange, safeSplit } from '@/shared/utils/safeStringUtils';
import styles from './ProjectCard.module.css';

export interface ProjectCardProject {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  isTeam: boolean;
  isFeatured?: boolean;
  technologies: string[];
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface ProjectCardProps {
  project: ProjectCardProject;
  onClick?: () => void;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  className,
}) => {
  const [imageError, setImageError] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState<number | undefined>(undefined);

  // 프로젝트명 줄바꿈 처리
  const formatTitle = (title: string) => {
    if (!title) return '';
    
    // 괄호 안의 내용을 추출하는 정규식
    const match = title.match(/^(.+?)\s*\(([^)]+)\)(.*)$/);
    
    if (match) {
      const [, mainTitle, subTitle, rest] = match;
      return (
        <>
          {mainTitle.trim()}
          <span className={styles.titleSubtext}> ({subTitle.trim()})</span>
          {rest && rest.trim()}
        </>
      );
    }
    
    return title;
  };

  // 이미지 URL이 유효한지 확인
  const hasValidImage =
    project.imageUrl &&
    project.imageUrl !== '#' &&
    project.imageUrl !== '' &&
    !imageError;

  // 제목 글자 크기 자동 조정 (한 줄로 제한)
  useEffect(() => {
    const adjustFontSize = () => {
      if (!titleRef.current) return;

      const titleElement = titleRef.current;
      const container = titleElement.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth - 32; // padding 양쪽 고려
      const minFontSize = 0.75; // 12px (더 작게 조정 가능)
      const maxFontSize = 1.5; // 24px

      // 임시 스타일로 실제 너비 측정
      const originalStyles = {
        fontSize: titleElement.style.fontSize,
        whiteSpace: titleElement.style.whiteSpace,
        visibility: titleElement.style.visibility,
        position: titleElement.style.position,
        display: titleElement.style.display,
      };

      // 측정을 위한 임시 스타일
      titleElement.style.fontSize = `${maxFontSize}rem`;
      titleElement.style.whiteSpace = 'nowrap';
      titleElement.style.visibility = 'hidden';
      titleElement.style.position = 'absolute';
      titleElement.style.display = 'block';
      titleElement.style.width = 'auto';

      const textWidth = titleElement.scrollWidth;

      // 원래 스타일 복원
      Object.entries(originalStyles).forEach(([key, value]) => {
        (titleElement.style as any)[key] = value || '';
      });

      let currentFontSize = maxFontSize;

      // 텍스트가 컨테이너보다 크면 크기 조정
      if (textWidth > containerWidth) {
        // 여유 공간을 고려하여 조금 더 작게 조정
        const ratio = (containerWidth / textWidth) * 0.95; // 5% 여유 공간
        currentFontSize = ratio * maxFontSize;
        currentFontSize = Math.max(minFontSize, Math.min(maxFontSize, currentFontSize));
      }

      setFontSize(currentFontSize);
    };

    // 초기 조정 (약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행)
    const timeoutId = setTimeout(adjustFontSize, 10);

    // 리사이즈 이벤트 리스너
    const resizeObserver = new ResizeObserver(() => {
      adjustFontSize();
    });

    if (titleRef.current?.parentElement) {
      resizeObserver.observe(titleRef.current.parentElement);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [project.title]);

  // 프로젝트 타입에 따른 아이콘 타입 결정
  const getProjectIconType = (): ProjectIconType => {
    // 기술 스택 기반으로 아이콘 타입 추론
    const techs = project.technologies.map((t) => t.toLowerCase());
    if (techs.some((t) => ['react', 'vue', 'angular', 'next'].includes(t))) {
      return 'web';
    }
    if (techs.some((t) => ['spring', 'node', 'express', 'django'].includes(t))) {
      return 'backend';
    }
    if (techs.some((t) => ['android', 'ios', 'react-native', 'flutter'].includes(t))) {
      return 'mobile';
    }
    if (techs.some((t) => ['electron', 'tauri'].includes(t))) {
      return 'desktop';
    }
    if (techs.some((t) => ['postgresql', 'mysql', 'mongodb', 'redis'].includes(t))) {
      return 'database';
    }
    if (techs.some((t) => ['aws', 'azure', 'gcp', 'docker', 'kubernetes'].includes(t))) {
      return 'cloud';
    }
    if (techs.some((t) => ['tensorflow', 'pytorch', 'ml', 'ai'].includes(t))) {
      return 'ai';
    }
    return 'default';
  };

  return (
    <Card
      variant="default"
      padding="none"
      onClick={onClick}
      className={`${styles.projectCard} ${styles.noCardHover} ${className || ''}`}
    >
      {/* 상단 이미지/아이콘 영역 */}
      <div className={styles.imageContainer}>
        {/* 팀/개인 배지 (왼쪽 상단) */}
        <div className={styles.badges}>
          <TeamBadge isTeam={project.isTeam} size="sm" />
        </div>

        {/* Featured 별 배지 (우측 상단) */}
        {project.isFeatured && (
          <div className={styles.featuredBadge} title="주요 프로젝트">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        )}

        {/* 이미지 또는 아이콘 */}
        {hasValidImage ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className={styles.image}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.iconContainer}>
            <ProjectIcon type={getProjectIconType()} size="lg" />
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className={styles.content}>
        <h3
          ref={titleRef}
          className={styles.title}
          title={project.title}
          style={fontSize ? { fontSize: `${fontSize}rem` } : undefined}
        >
          {formatTitle(project.title)}
        </h3>
        <div className={styles.divider}></div>
        <p className={styles.description}>{project.description}</p>

        {/* 기술 스택 */}
        {project.technologies && project.technologies.length > 0 && (
          <div className={styles.techStack}>
            {project.technologies.slice(0, 4).map((tech, index) => (
              <Badge
                key={`${tech}-${index}`}
                variant="default"
                size="sm"
                className={styles.techBadge}
              >
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 4 && (
              <Badge
                variant="default"
                size="sm"
                className={styles.techBadge}
              >
                +{project.technologies.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* 하단 정보 */}
        <div className={styles.footer}>
          <span className={styles.date}>
            {formatDateRange(project.startDate, project.endDate)}
          </span>
          <div className={styles.links}>
            {project.githubUrl && project.githubUrl !== '#' && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.link} ${styles.githubLink}`}
                title="GitHub 저장소"
                onClick={(e) => e.stopPropagation()}
              >
                <SocialIcon type="github" size="sm" />
              </a>
            )}
            {project.liveUrl && project.liveUrl !== '#' && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.link} ${styles.liveLink}`}
                title="Live 서비스"
                onClick={(e) => e.stopPropagation()}
              >
                <SocialIcon type="external-link" size="sm" />
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
