import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { pageMetaDefaults } from '@/shared/config/seo.config';
import { SectionTitle } from '@/design-system';
import { PageHeader } from '@/main/widgets/page-header';
import { useProjectsQuery } from '@/main/entities/project/api/useProjectsQuery';
import type { Project } from '@/main/entities/project/model/project.types';
import type { ProjectCardProject } from '@/design-system/components/Card/ProjectCard';
import { FEATURED_PROJECTS } from '@/main/widgets/featured-projects-section/model/featuredProjects.config';
import { ProjectHistoryTimeline } from './components/ProjectHistoryTimeline';
import { ProjectSectionContent } from './components/ProjectSectionContent';
import { useContentHeightRecalc } from '@/shared/hooks';
import styles from './ProjectsListPage.module.css';

// 상수 정의
const SCROLL_DELAY_MS = 300;
const HIGHLIGHT_DURATION_MS = 2000;

// 프로젝트 타입별 섹션 구성
type ProjectCategory = 'BUILD' | 'LAB' | 'MAINTENANCE';

export const ProjectsListPage: React.FC = () => {
  const meta = pageMetaDefaults.projects;
  const navigate = useNavigate();
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | undefined>();

  // API에서 프로젝트 목록 가져오기
  const { data: projects = [], isLoading, isError, refetch } = useProjectsQuery({
    type: 'project',
  });

  // 페이지 높이 재계산
  useContentHeightRecalc(isLoading, [projects], {
    scrollThreshold: 100,
    useResizeObserver: true,
  });

  // 주요 프로젝트: is_featured가 true인 프로젝트만 필터링
  const featuredProjects = useMemo(() => {
    return projects.filter(p => p.isFeatured === true);
  }, [projects]);

  // 프로젝트 타입별로 그룹화 (모든 섹션 표시, 순서: MAINTENANCE → BUILD → LAB)
  // Featured 프로젝트도 원래 타입 섹션에 포함되도록 전체 프로젝트를 사용
  const projectsByType = useMemo(() => {
    const grouped: Record<ProjectCategory, Project[]> = {
      BUILD: [],
      LAB: [],
      MAINTENANCE: [],
    };

    projects.forEach(project => {
      if (project.type && grouped[project.type as ProjectCategory]) {
        grouped[project.type as ProjectCategory].push(project);
      }
    });

    return [
      { type: 'MAINTENANCE' as ProjectCategory, title: '유지보수', description: '유지보수 단계까지 경험한 모든 작업물을 포함합니다. 회사 경력 작업물도 포함됩니다.', projects: grouped.MAINTENANCE },
      { type: 'BUILD' as ProjectCategory, title: '구축', description: '서비스 형태로 구축 경험이 있는 작업물입니다.', projects: grouped.BUILD },
      { type: 'LAB' as ProjectCategory, title: '실험', description: '관심사에 따른 실험적인 작업물입니다.', projects: grouped.LAB },
    ];
  }, [projects]);

  // 설정 파일에서 프로젝트 오버라이드 정보 가져오기
  const getFeaturedConfig = (projectId: string) => {
    return FEATURED_PROJECTS.find(fp => fp.id === projectId);
  };

  // Project 타입을 ProjectCard 타입으로 변환 (설정 파일 오버라이드 적용)
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

  // 카드 클릭 핸들러
  const handleCardClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // 프로젝트가 어느 섹션에 있는지 찾기
  // 프로젝트 히스토리에서 클릭 시 프로젝트 타입 섹션을 우선적으로 반환
  const findProjectSection = (projectId: string): { sectionId: string; projectCardId: string } | null => {
    // 타입별 섹션을 우선적으로 확인
    for (const section of projectsByType) {
      if (section.projects.some(p => p.id === projectId)) {
        return {
          sectionId: `type-section-${section.type}`,
          projectCardId: `type-project-section-${projectId}`
        };
      }
    }
    
    // 타입별 섹션에 없으면 주요 프로젝트 섹션 확인
    if (featuredProjects.some(p => p.id === projectId)) {
      return {
        sectionId: 'featured-section',
        projectCardId: `project-section-${projectId}`
      };
    }
    
    return null;
  };

  // 타임라인에서 프로젝트 클릭 핸들러
  const handleTimelineProjectClick = (projectId: string) => {
    setHighlightedProjectId(projectId);
    
    // 해당 프로젝트가 있는 섹션으로 스크롤
    const sectionInfo = findProjectSection(projectId);
    if (sectionInfo) {
      // 먼저 섹션으로 스크롤
      const sectionElement = document.getElementById(sectionInfo.sectionId);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 섹션 내부의 프로젝트 카드로 추가 스크롤 (약간의 지연 후)
        setTimeout(() => {
          const projectCardElement = document.getElementById(sectionInfo.projectCardId);
          if (projectCardElement) {
            projectCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, SCROLL_DELAY_MS);
      }
    }
    
    // 하이라이트 제거
    setTimeout(() => {
      setHighlightedProjectId(undefined);
    }, HIGHLIGHT_DURATION_MS);
  };

  return (
    <div className={styles.page}>
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonicalPath={meta.canonicalPath}
      />
      <PageHeader
        title="작업물"
        description={<p>총 {projects.length}개의 작업물</p>}
      />

      {/* 주요 프로젝트 섹션 */}
      <section id="featured-section" className={styles.featuredSection}>
        <div className={styles.featuredHeaderWrapper}>
          <div className={styles.container}>
            <div className={styles.featuredHeader}>
              <SectionTitle level="h2">주요 작업물</SectionTitle>
            </div>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.grid}>
            <ProjectSectionContent
              isLoading={isLoading}
              isError={isError}
              projects={featuredProjects.map(convertToProjectCard)}
              emptyMessage="등록된 주요 작업물이 없습니다"
              onRefetch={refetch}
              onCardClick={handleCardClick}
              getProjectId={(project) => project.id}
              sectionType="featured"
            />
          </div>
        </div>
      </section>

      {/* 프로젝트 히스토리 타임라인 섹션 */}
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

      {/* 프로젝트 타입별 섹션 */}
      {projectsByType.map((section) => (
        <section key={section.type} id={`type-section-${section.type}`} className={styles.typeSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <SectionTitle level="h2">{section.title}</SectionTitle>
              <div className={styles.divider}></div>
              <p className={styles.sectionDescription}>{section.description}</p>
            </div>
            <div className={styles.grid}>
              <ProjectSectionContent
                isLoading={isLoading}
                isError={isError}
                projects={section.projects.map(convertToProjectCard)}
                emptyMessage="등록된 작업물이 없습니다"
                onRefetch={refetch}
                onCardClick={handleCardClick}
                getProjectId={(project) => project.id}
                sectionType="type"
              />
            </div>
          </div>
        </section>
      ))}

      {/* 프로젝트가 없는 경우 */}
      {projects.length === 0 && (
        <section className={styles.projects}>
          <div className={styles.container}>
            <div className={styles.empty}>
              <p>표시할 작업물이 없습니다.</p>
            </div>
          </div>
        </section>
      )}

      </div>
  );
};
