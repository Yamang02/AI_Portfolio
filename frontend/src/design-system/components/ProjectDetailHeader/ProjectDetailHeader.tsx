import React from 'react';
import { SectionTitle } from '@design-system/components/SectionTitle';
import { TeamBadge, ProjectTypeBadge, DateBadge, RoleBadge } from '@design-system/components/Badge';
import { Button } from '@design-system/components/Button';
import { SocialIcon } from '@design-system/components/Icon';
import type { Project } from '@entities/project/model/project.types';
import styles from './ProjectDetailHeader.module.css';

export interface ProjectDetailHeaderProps {
  project: Project;
}

export const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  project,
}) => {
  return (
    <header className={styles.header}>
      {/* 프로젝트 제목 */}
      <SectionTitle level="h1" className={styles.title}>
        {project.title}
      </SectionTitle>

      {/* 섬네일 섹션 */}
      {project.imageUrl && (
        <div className={styles.thumbnailSection}>
          <img
            src={project.imageUrl}
            alt={project.title}
            className={styles.thumbnail}
          />
        </div>
      )}

      {/* 메타 정보 영역 */}
      <div className={styles.meta}>
        {/* 배지들 */}
        <div className={styles.badges}>
          <TeamBadge isTeam={project.isTeam} size="md" />
          {/* 팀 프로젝트일 때만 역할 배지 표시 */}
          {project.isTeam && project.role && (
            <RoleBadge role={project.role} size="md" />
          )}
          {project.type && (
            <ProjectTypeBadge type={project.type} size="md" />
          )}
          {project.startDate && (
            <DateBadge
              startDate={project.startDate}
              endDate={project.endDate}
              size="md"
            />
          )}
        </div>

        {/* 링크들 (별도 행) - 항상 표시, 링크가 없으면 비활성화 */}
        <div className={styles.links}>
          {/* GitHub */}
          <Button
            variant="brand"
            brandType="github"
            size="sm"
            href={project.githubUrl && project.githubUrl !== '#' ? project.githubUrl : undefined}
            target={project.githubUrl && project.githubUrl !== '#' ? '_blank' : undefined}
            disabled={!project.githubUrl || project.githubUrl === '#'}
            ariaLabel={project.githubUrl && project.githubUrl !== '#' ? 'GitHub 저장소로 이동' : 'GitHub 저장소 없음'}
            className={styles.linkButton}
          >
            <SocialIcon type="github" size="sm" />
            <span>GitHub</span>
          </Button>

          {/* Live Service */}
          <Button
            variant="brand"
            brandType="live"
            size="sm"
            href={project.liveUrl && project.liveUrl !== '#' ? project.liveUrl : undefined}
            target={project.liveUrl && project.liveUrl !== '#' ? '_blank' : undefined}
            disabled={!project.liveUrl || project.liveUrl === '#'}
            ariaLabel={project.liveUrl && project.liveUrl !== '#' ? '운영 중인 서비스로 이동' : '운영 중인 서비스 없음'}
            className={styles.linkButton}
          >
            <SocialIcon type="external-link" size="sm" />
            <span>Live Service</span>
          </Button>

          {/* Notion */}
          <Button
            variant="brand"
            brandType="notion"
            size="sm"
            href={project.externalUrl && project.externalUrl !== '#' ? project.externalUrl : undefined}
            target={project.externalUrl && project.externalUrl !== '#' ? '_blank' : undefined}
            disabled={!project.externalUrl || project.externalUrl === '#'}
            ariaLabel={project.externalUrl && project.externalUrl !== '#' ? 'Notion 문서로 이동' : 'Notion 문서 없음'}
            className={styles.linkButton}
          >
            <SocialIcon type="external-link" size="sm" />
            <span>Notion</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
