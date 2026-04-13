import React, { useState, useRef, useEffect } from 'react';
import { Card } from './Card';
import { ClickableCard } from './ClickableCard';
import { Badge } from '../Badge/Badge';
import { TeamBadge } from '../Badge/TeamBadge';
import { SocialIcon } from '../Icon/SocialIcon';
import { ProjectIcon, ProjectIconType } from '../Icon/ProjectIcon';
import { formatDateRange } from '@/main/shared/utils/safeStringUtils';
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

  // ?�로?�트�?줄바�?처리
  const formatTitle = (title: string) => {
    if (!title) return '';
    
    // 괄호 ?�의 ?�용??추출?�는 ?�규??
    const titlePattern = /^(.+?)\s*\(([^)]+)\)(.*)$/;
    const match = titlePattern.exec(title);
    
    if (match) {
      const [, mainTitle, subTitle, rest] = match;
      return (
        <>
          {mainTitle.trim()}
          <span className={styles.titleSubtext}> ({subTitle.trim()})</span>
          {rest?.trim()}
        </>
      );
    }
    
    return title;
  };

  // ?��?지 URL???�효?��? ?�인
  const hasValidImage =
    project.imageUrl &&
    project.imageUrl !== '#' &&
    project.imageUrl !== '' &&
    !imageError;

  // ?�목 글???�기 ?�동 조정 (??줄로 ?�한)
  useEffect(() => {
    const adjustFontSize = () => {
      if (!titleRef.current) return;

      const titleElement = titleRef.current;
      const container = titleElement.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth - 32; // padding ?�쪽 고려
      const minFontSize = 0.75; // 12px (???�게 조정 가??
      const maxFontSize = 1.5; // 24px

      // ?�시 ?��??�로 ?�제 ?�비 측정
      const originalStyles = {
        fontSize: titleElement.style.fontSize,
        whiteSpace: titleElement.style.whiteSpace,
        visibility: titleElement.style.visibility,
        position: titleElement.style.position,
        display: titleElement.style.display,
      };

      // 측정???�한 ?�시 ?��???
      titleElement.style.fontSize = `${maxFontSize}rem`;
      titleElement.style.whiteSpace = 'nowrap';
      titleElement.style.visibility = 'hidden';
      titleElement.style.position = 'absolute';
      titleElement.style.display = 'block';
      titleElement.style.width = 'auto';

      const textWidth = titleElement.scrollWidth;

      // ?�래 ?��???복원
      Object.entries(originalStyles).forEach(([key, value]) => {
        (titleElement.style as any)[key] = value || '';
      });

      let currentFontSize = maxFontSize;

      // ?�스?��? 컨테?�너보다 ?�면 ?�기 조정
      if (textWidth > containerWidth) {
        // ?�유 공간??고려?�여 조금 ???�게 조정
        const ratio = (containerWidth / textWidth) * 0.95; // 5% ?�유 공간
        currentFontSize = ratio * maxFontSize;
        currentFontSize = Math.max(minFontSize, Math.min(maxFontSize, currentFontSize));
      }

      setFontSize(currentFontSize);
    };

    // 초기 조정 (?�간??지?�을 ?�어 DOM???�전???�더링된 ???�행)
    const timeoutId = setTimeout(adjustFontSize, 10);

    // 리사?�즈 ?�벤??리스??
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

  // ?�로?�트 ?�?�에 ?�른 ?�이�??�??결정
  const getProjectIconType = (): ProjectIconType => {
    // 기술 ?�택 기반?�로 ?�이�??�??추론
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

  const CardComponent = onClick ? ClickableCard : Card;

  return (
    <CardComponent
      variant="default"
      padding="none"
      {...(onClick ? { onClick } : {})}
      className={`${styles.projectCard} ${styles.noCardHover} ${className || ''}`}
    >
      {/* ?�단 ?��?지/?�이�??�역 */}
      <div className={styles.imageContainer}>
        {/* ?�/개인 배�? (?�쪽 ?�단) */}
        <div className={styles.badges}>
          <TeamBadge isTeam={project.isTeam} size="sm" />
        </div>

        {/* Featured �?배�? (?�측 ?�단) */}
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

        {/* ?��?지 ?�는 ?�이�?*/}
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

        {/* 기술 ?�택 */}
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

        {/* ?�단 ?�보 */}
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
                title="Live Service"
                onClick={(e) => e.stopPropagation()}
              >
                <SocialIcon type="external-link" size="sm" />
              </a>
            )}
          </div>
        </div>
      </div>
    </CardComponent>
  );
};
