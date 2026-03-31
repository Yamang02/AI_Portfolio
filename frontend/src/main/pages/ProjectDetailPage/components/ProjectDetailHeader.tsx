import React from 'react';
import { SectionTitle } from '@design-system/components/SectionTitle';
import { TeamBadge, ProjectTypeBadge, DateBadge, RoleBadge } from '@design-system/components/Badge';
import { Button } from '@design-system/components/Button';
import { SocialIcon } from '@design-system/components/Icon';
import type { Project } from '@/main/entities/project/model/project.types';
import styles from './ProjectDetailHeader.module.css';

interface ProjectDetailHeaderProps {
  project: Project;
}

const getExternalLink = (url?: string) =>
  url && url !== '#' ? url : undefined;

export const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  project,
}) => {
  const githubHref = getExternalLink(project.githubUrl);
  const liveHref = getExternalLink(project.liveUrl);
  const notionHref = getExternalLink(project.externalUrl);

  const links = [
    {
      key: 'github',
      label: 'GitHub',
      href: githubHref,
      ariaLabel: githubHref ? 'GitHub 저장소로 이동' : 'GitHub 저장소 없음',
      iconType: 'github' as const,
      variant: 'github' as const,
    },
    {
      key: 'live',
      label: 'Live Service',
      href: liveHref,
      ariaLabel: liveHref ? '운영 중인 서비스로 이동' : '운영 중인 서비스 없음',
      iconType: 'external-link' as const,
      variant: 'live' as const,
    },
    {
      key: 'notion',
      label: 'Notion',
      href: notionHref,
      ariaLabel: notionHref ? 'Notion 문서로 이동' : 'Notion 문서 없음',
      iconType: 'external-link' as const,
      variant: 'notion' as const,
    },
  ];

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
          {links.map((link) => (
            <Button
              key={link.key}
              variant={link.variant}
              size="sm"
              href={link.href}
              target={link.href ? '_blank' : undefined}
              disabled={!link.href}
              ariaLabel={link.ariaLabel}
              className={styles.linkButton}
            >
              <SocialIcon type={link.iconType} size="sm" />
              <span>{link.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
};
