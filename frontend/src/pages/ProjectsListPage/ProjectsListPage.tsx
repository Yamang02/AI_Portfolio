import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionTitle, Divider, ProjectCard, SkeletonCard, EmptyCard, Button } from '@/design-system';
import { useProjectsQuery } from '@/entities/project/api/useProjectQuery';
import type { Project } from '@/entities/project/model/project.types';
import type { ProjectCardProject } from '@/design-system/components/Card/ProjectCard';
import { FEATURED_PROJECTS } from '@/pages/HomePage/config/featuredProjects.config';
import { ProjectSearchModal } from './components/ProjectSearchModal';
import { ProjectHistoryTimeline } from './components/ProjectHistoryTimeline';
import styles from './ProjectsListPage.module.css';

// 프로젝트 타입별 섹션 구성
type ProjectCategory = 'BUILD' | 'LAB' | 'MAINTENANCE';

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [highlightedProjectId, setHighlightedProjectId] = useState<string | undefined>();
  
  // API에서 프로젝트 목록 가져오기
  const { data: projects = [], isLoading, isError } = useProjectsQuery({
    type: 'project',
  });

  // 주요 프로젝트: is_featured가 true인 프로젝트만 필터링
  const featuredProjects = useMemo(() => {
    const featured = projects.filter(p => {
      // isFeatured가 명시적으로 true인 경우만 필터링
      // undefined, null, false는 모두 제외
      return p.isFeatured === true;
    });
    
    // 디버깅: prj-003 확인
    if (process.env.NODE_ENV === 'development') {
      const prj003 = projects.find(p => p.id === 'prj-003');
      if (prj003) {
        console.log('prj-003 found:', {
          id: prj003.id,
          title: prj003.title,
          isFeatured: prj003.isFeatured,
          isFeaturedType: typeof prj003.isFeatured,
          isInFeatured: featured.some(f => f.id === 'prj-003')
        });
      } else {
        console.log('prj-003 not found in projects list');
      }
      console.log('All projects:', projects.map(p => ({ id: p.id, isFeatured: p.isFeatured })));
      console.log('Featured projects:', featured.map(p => ({ id: p.id, title: p.title })));
    }
    
    return featured;
  }, [projects]);

  // 나머지 프로젝트 (주요 프로젝트 제외)
  const otherProjects = useMemo(() => {
    return projects.filter(p => p.isFeatured !== true);
  }, [projects]);

  // 프로젝트 타입별로 그룹화 (모든 섹션 표시, 순서: MAINTENANCE → BUILD → LAB)
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
      { type: 'MAINTENANCE' as ProjectCategory, title: 'MAINTENANCE', description: '유지보수 단계까지 경험한 모든 프로젝트를 포함합니다. 회사 경력 프로젝트도 포함됩니다.', projects: grouped.MAINTENANCE },
      { type: 'BUILD' as ProjectCategory, title: 'BUILD', description: '서비스 형태로 구축 경험이 있는 프로젝트입니다.', projects: grouped.BUILD },
      { type: 'LAB' as ProjectCategory, title: 'LAB', description: '관심사에 따른 실험적인 프로젝트입니다.', projects: grouped.LAB },
    ];
  }, [otherProjects]);

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
  const findProjectSection = (projectId: string): string | null => {
    // 주요 프로젝트 섹션 확인
    if (featuredProjects.some(p => p.id === projectId)) {
      return 'featured-section';
    }
    
    // 타입별 섹션 확인
    for (const section of projectsByType) {
      if (section.projects.some(p => p.id === projectId)) {
        return `project-section-${projectId}`;
      }
    }
    
    return null;
  };

  // 타임라인에서 프로젝트 클릭 핸들러
  const handleTimelineProjectClick = (projectId: string) => {
    setHighlightedProjectId(projectId);
    
    // 해당 프로젝트가 있는 섹션으로 스크롤
    const sectionId = findProjectSection(projectId);
    if (sectionId) {
      const sectionElement = document.getElementById(sectionId);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    // 2초 후 하이라이트 제거
    setTimeout(() => {
      setHighlightedProjectId(undefined);
    }, 2000);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.page}>
          <section className={styles.header}>
            <div className={styles.container}>
              <SectionTitle level="h1">Projects</SectionTitle>
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
          <div className={styles.headerContent}>
            <div>
              <SectionTitle level="h1">Projects</SectionTitle>
              <p className={styles.count}>총 {projects.length}개의 프로젝트</p>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsSearchModalOpen(true)}
              ariaLabel="프로젝트 검색"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: '8px', verticalAlign: 'middle' }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              프로젝트 검색
            </Button>
          </div>
        </div>
      </section>

      {/* 주요 프로젝트 섹션 */}
      <section id="featured-section" className={styles.featuredSection}>
        <div className={styles.featuredHeaderWrapper}>
          <div className={styles.container}>
            <div className={styles.featuredHeader}>
              <SectionTitle level="h2">Featured Projects</SectionTitle>
            </div>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.grid}>
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project) => (
                <div key={project.id} id={`project-section-${project.id}`}>
                  <ProjectCard
                    project={convertToProjectCard(project)}
                    onClick={() => handleCardClick(project.id)}
                  />
                </div>
              ))
            ) : (
              // 주요 프로젝트가 없을 때 빈 카드 표시
              <EmptyCard message="등록된 주요 프로젝트가 없습니다" />
            )}
          </div>
        </div>
      </section>

      {/* 프로젝트 히스토리 타임라인 섹션 */}
      {projects.length > 0 && (
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
        <section key={section.type} className={styles.typeSection}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <SectionTitle level="h2">{section.title}</SectionTitle>
              <div className={styles.divider}></div>
              <p className={styles.sectionDescription}>{section.description}</p>
            </div>
            <div className={styles.grid}>
              {section.projects.length > 0 ? (
                section.projects.map((project) => (
                  <div key={project.id} id={`project-section-${project.id}`}>
                    <ProjectCard
                      project={convertToProjectCard(project)}
                      onClick={() => handleCardClick(project.id)}
                    />
                  </div>
                ))
              ) : (
                // 프로젝트가 없을 때 빈 카드 표시
                <EmptyCard message="등록된 프로젝트가 없습니다" />
              )}
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

      {/* 프로젝트 검색 모달 */}
      <ProjectSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        projects={projects}
      />
      </div>
  );
};
