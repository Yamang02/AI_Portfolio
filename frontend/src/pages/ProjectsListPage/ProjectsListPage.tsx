import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionTitle, Divider, ProjectCard, SkeletonCard } from '@/design-system';
import { Footer } from '@widgets/layout/Footer';
import { useProjectsQuery } from '@/entities/project/api/useProjectQuery';
import type { Project } from '@/entities/project/model/project.types';
import type { ProjectCardProject } from '@/design-system/components/Card/ProjectCard';
import { FEATURED_PROJECTS, FEATURED_CONFIG } from '@/pages/HomePage/config/featuredProjects.config';
import styles from './ProjectsListPage.module.css';

// 프로젝트 타입별 섹션 구성
type ProjectCategory = 'BUILD' | 'LAB' | 'MAINTENANCE';

interface ProjectSection {
  type: ProjectCategory;
  title: string;
  projects: Project[];
}

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // API에서 프로젝트 목록 가져오기
  const { data: projects = [], isLoading, isError } = useProjectsQuery({
    type: 'project',
  });

  // Featured Projects: 설정 파일에서 가져온 ID와 실제 프로젝트 매칭
  const featuredProjects = useMemo(() => {
    const featuredIds = FEATURED_PROJECTS.slice(0, FEATURED_CONFIG.maxDisplay).map(p => p.id);
    return projects.filter(p => featuredIds.includes(p.id));
  }, [projects]);

  // 나머지 프로젝트 (Featured 제외)
  const otherProjects = useMemo(() => {
    const featuredIds = FEATURED_PROJECTS.slice(0, FEATURED_CONFIG.maxDisplay).map(p => p.id);
    return projects.filter(p => !featuredIds.includes(p.id));
  }, [projects]);

  // 프로젝트 타입별로 그룹화
  const projectsByType = useMemo(() => {
    const grouped: Record<ProjectCategory, Project[]> = {
      BUILD: [],
      LAB: [],
      MAINTENANCE: [],
    };

    otherProjects.forEach(project => {
      if (project.type && grouped[project.type as ProjectCategory]) {
        grouped[project.type as ProjectCategory].push(project);
      }
    });

    return [
      { type: 'BUILD' as ProjectCategory, title: 'BUILD', projects: grouped.BUILD },
      { type: 'LAB' as ProjectCategory, title: 'LAB', projects: grouped.LAB },
      { type: 'MAINTENANCE' as ProjectCategory, title: 'MAINTENANCE', projects: grouped.MAINTENANCE },
    ].filter(section => section.projects.length > 0);
  }, [otherProjects]);

  // Project 타입을 ProjectCardProject 타입으로 변환
  const convertToProjectCard = (project: Project): ProjectCardProject => ({
    id: project.id,
    title: project.title,
    description: project.description,
    imageUrl: project.imageUrl,
    isTeam: project.isTeam,
    technologies: project.technologies,
    startDate: project.startDate,
    endDate: project.endDate || undefined,
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
  });

  // 카드 클릭 핸들러
  const handleCardClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.page}>
        <section className={styles.header}>
          <div className={styles.container}>
            <SectionTitle level="h1">Projects</SectionTitle>
            <p className={styles.description}>
              AI를 적극 활용한 프로젝트 모음입니다.
            </p>
          </div>
          <Divider variant="horizontal" />
        </section>

        <section className={styles.projects}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className={styles.page}>
        <section className={styles.header}>
          <div className={styles.container}>
            <SectionTitle level="h1">Projects</SectionTitle>
            <p className={styles.description}>
              AI를 적극 활용한 프로젝트 모음입니다.
            </p>
          </div>
          <Divider variant="horizontal" />
        </section>

        <section className={styles.projects}>
          <div className={styles.container}>
            <div className={styles.error}>
              <p>프로젝트를 불러오는 중 오류가 발생했습니다.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <section className={styles.header}>
        <div className={styles.container}>
          <SectionTitle level="h1">Projects</SectionTitle>
          <p className={styles.description}>
            AI를 적극 활용한 프로젝트 모음입니다.
          </p>
          <p className={styles.count}>총 {projects.length}개의 프로젝트</p>
        </div>
        <Divider variant="horizontal" />
      </section>

      {/* Featured Projects 섹션 */}
      {featuredProjects.length > 0 && (
        <section className={styles.featuredSection}>
          <div className={styles.container}>
            <SectionTitle level="h2">Featured Projects</SectionTitle>
            <div className={styles.grid}>
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={convertToProjectCard(project)}
                  onClick={() => handleCardClick(project.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 프로젝트 타입별 섹션 */}
      {projectsByType.map((section) => (
        <section key={section.type} className={styles.typeSection}>
          <div className={styles.container}>
            <SectionTitle level="h2">{section.title}</SectionTitle>
            <div className={styles.grid}>
              {section.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={convertToProjectCard(project)}
                  onClick={() => handleCardClick(project.id)}
                />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* 프로젝트가 없는 경우 */}
      {projects.length === 0 && (
        <section className={styles.projects}>
          <div className={styles.container}>
            <div className={styles.empty}>
              <p>표시할 프로젝트가 없습니다.</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer isVisible={true} />
    </div>
  );
};
