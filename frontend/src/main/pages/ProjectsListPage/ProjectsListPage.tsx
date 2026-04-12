import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { pageMetaDefaults } from '@/shared/config/seo.config';
import { SectionTitle } from '@/design-system';
import { PageHeader } from '@/main/widgets/page-header';
import { useProjectsQuery } from '@/main/entities/project/api/useProjectsQuery';
import type { Project } from '@/main/entities/project/model/project.types';
import type { ProjectCardProject } from '@/design-system/components/Card/ProjectCard';
import { FEATURED_PROJECTS } from '@/main/pages/ProjectsListPage/model/featuredProjects.config';
import { useContentHeightRecalc } from '@/main/shared/hooks/useContentHeightRecalc';

import { ProjectHistoryTimeline } from './components/ProjectHistoryTimeline';
import { ProjectSectionContent } from './components/ProjectSectionContent';
import styles from './ProjectsListPage.module.css';

const SCROLL_DELAY_MS = 300;
const HIGHLIGHT_DURATION_MS = 2000;

type ProjectCategory = 'BUILD' | 'LAB' | 'MAINTENANCE';

export const ProjectsListPage: React.FC = () => {
  const meta = pageMetaDefaults.projects;
  const navigate = useNavigate();
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | undefined>();

  const { data: projects = [], isLoading, isError, refetch } = useProjectsQuery({
    type: 'project',
  });

  useContentHeightRecalc(isLoading, [projects], {
    scrollThreshold: 100,
    useResizeObserver: true,
  });

  const featuredProjects = useMemo(() => projects.filter((p) => p.isFeatured === true), [projects]);

  const projectsByType = useMemo(() => {
    const grouped: Record<ProjectCategory, Project[]> = {
      BUILD: [],
      LAB: [],
      MAINTENANCE: [],
    };

    projects.forEach((project) => {
      if (project.type && grouped[project.type as ProjectCategory]) {
        grouped[project.type as ProjectCategory].push(project);
      }
    });

    return [
      {
        type: 'MAINTENANCE' as ProjectCategory,
        title: 'Maintenance',
        description: 'Operational maintenance and long-term improvement projects.',
        projects: grouped.MAINTENANCE,
      },
      {
        type: 'BUILD' as ProjectCategory,
        title: 'Build',
        description: 'Products and services delivered end-to-end.',
        projects: grouped.BUILD,
      },
      {
        type: 'LAB' as ProjectCategory,
        title: 'Lab',
        description: 'Experimental and research-oriented projects.',
        projects: grouped.LAB,
      },
    ];
  }, [projects]);

  const getFeaturedConfig = (projectId: string) => FEATURED_PROJECTS.find((fp) => fp.id === projectId);

  const convertToProjectCard = (project: Project): ProjectCardProject => {
    const featuredConfig = getFeaturedConfig(project.id);

    return {
      id: project.id,
      title: project.title,
      description: featuredConfig?.subtitle || project.description,
      imageUrl: featuredConfig?.imageUrl || project.imageUrl,
      isTeam: project.isTeam,
      isFeatured: project.isFeatured,
      technologies: featuredConfig?.tags || project.technologies,
      startDate: project.startDate,
      endDate: project.endDate || undefined,
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
    };
  };

  const findProjectSection = (projectId: string): { sectionId: string; projectCardId: string } | undefined => {
    if (featuredProjects.some((p) => p.id === projectId)) {
      return { sectionId: 'featured-section', projectCardId: `project-card-featured-${projectId}` };
    }

    const section = projectsByType.find((s) => s.projects.some((p) => p.id === projectId));
    if (!section) return undefined;

    return {
      sectionId: `type-section-${section.type}`,
      projectCardId: `project-card-type-${projectId}`,
    };
  };

  const handleCardClick = (project: { id: string }) => {
    navigate(`/projects/${project.id}`);
  };

  const handleTimelineProjectClick = (projectId: string) => {
    setHighlightedProjectId(projectId);

    const sectionInfo = findProjectSection(projectId);
    if (sectionInfo) {
      const sectionElement = document.getElementById(sectionInfo.sectionId);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => {
          const projectCardElement = document.getElementById(sectionInfo.projectCardId);
          if (projectCardElement) {
            projectCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, SCROLL_DELAY_MS);
      }
    }

    setTimeout(() => {
      setHighlightedProjectId(undefined);
    }, HIGHLIGHT_DURATION_MS);
  };

  return (
    <div className={styles.page}>
      <SeoHead title={meta.title} description={meta.description} canonicalPath={meta.canonicalPath} />

      <PageHeader
        title="프로젝트"
        description={<p>총 {projects.length}개의 프로젝트</p>}
      />

      <section id="featured-section" className={styles.featuredSection}>
        <div className={styles.featuredHeaderWrapper}>
          <div className={styles.container}>
            <div className={styles.featuredHeader}>
              <SectionTitle level="h2">주요 프로젝트</SectionTitle>
            </div>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.grid}>
            <ProjectSectionContent
              isLoading={isLoading}
              isError={isError}
              projects={featuredProjects.map(convertToProjectCard)}
              emptyMessage="등록된 주요 프로젝트가 없습니다"
              onRefetch={refetch}
              onCardClick={handleCardClick}
              getProjectId={(project) => project.id}
              sectionType="featured"
            />
          </div>
        </div>
      </section>

      {!isLoading && projects.length > 0 && (
        <section className={styles.historySection}>
          <div className={styles.container}>
            <ProjectHistoryTimeline
              projects={projects}
              onProjectClick={handleTimelineProjectClick}
              highlightedProjectId={highlightedProjectId}
            />
          </div>
        </section>
      )}

      {projectsByType.map((section) => (
        <section key={section.type} id={`type-section-${section.type}`} className={styles.typeSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <SectionTitle level="h2">{section.title}</SectionTitle>
              <div className={styles.divider} />
              <p className={styles.sectionDescription}>{section.description}</p>
            </div>
            <div className={styles.grid}>
              <ProjectSectionContent
                isLoading={isLoading}
                isError={isError}
                projects={section.projects.map(convertToProjectCard)}
                emptyMessage="등록된 프로젝트가 없습니다"
                onRefetch={refetch}
                onCardClick={handleCardClick}
                getProjectId={(project) => project.id}
                sectionType="type"
              />
            </div>
          </div>
        </section>
      ))}

      {projects.length === 0 && (
        <section className={styles.projects}>
          <div className={styles.container}>
            <div className={styles.empty}>
              <p>표시할 프로젝트가 없습니다.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
