import React, { useState } from 'react';
import { Card } from './Card';
import { TeamBadge } from '../Badge/TeamBadge';
import { ProjectTypeBadge, ProjectType } from '../Badge/ProjectTypeBadge';
import { SocialIcon } from '../Icon/SocialIcon';
import { ProjectIcon, ProjectIconType } from '../Icon/ProjectIcon';
import { TechStackList } from '@shared/ui/tech-stack';
import { formatDateRange, safeSplit } from '@shared/utils/safeStringUtils';
import styles from './ProjectCard.module.css';

export interface ProjectCardProject {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  isTeam: boolean;
  type?: ProjectType;
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

  // 프로젝트명 줄바꿈 처리
  const formatTitle = (title: string) => {
    const parts = safeSplit(title, /[()]/);
    if (parts.length > 1) {
      return (
        <>
          {parts[0]}
          {parts[1] && (
            <span className={styles.titleSubtext}>({parts[1]})</span>
          )}
          {parts[2] && parts[2]}
        </>
      );
    }
    return title || '';
  };

  // 이미지 URL이 유효한지 확인
  const hasValidImage =
    project.imageUrl &&
    project.imageUrl !== '#' &&
    project.imageUrl !== '' &&
    !imageError;

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
      className={`${styles.projectCard} ${className || ''}`}
    >
      {/* 상단 이미지/아이콘 영역 */}
      <div className={styles.imageContainer}>
        {/* 배지들 */}
        <div className={styles.badges}>
          <TeamBadge isTeam={project.isTeam} size="sm" />
          {project.type && (
            <ProjectTypeBadge type={project.type} size="sm" />
          )}
        </div>

        {/* 이미지 또는 아이콘 */}
        {hasValidImage ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            className={styles.image}
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
        <h3 className={styles.title} title={project.title}>
          {formatTitle(project.title)}
        </h3>
        <div className={styles.divider}></div>
        <p className={styles.description}>{project.description}</p>

        {/* 기술 스택 */}
        <TechStackList
          technologies={project.technologies}
          maxVisible={3}
          variant="default"
          size="sm"
          className={styles.techStack}
        />

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
                className={styles.link}
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
                className={styles.link}
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
