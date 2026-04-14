import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { createProjectSchema, createBreadcrumbSchema } from '@/main/shared/lib/schema';
import { useProjectsQuery, useProjectQuery } from '../../entities/project/api/useProjectsQuery';
import { SectionTitle } from '@design-system/components/SectionTitle';
import { TextLink } from '@design-system/components/TextLink';
import { useTOCFromDOM } from '@/main/features/project-gallery/hooks';
import type { TOCItem } from '@/main/features/project-gallery/hooks/types';
import { MarkdownRenderer } from '@/main/shared/ui/markdown/MarkdownRenderer';
import { TechStackList } from '@/main/shared/ui/tech-stack/TechStackList';
import type { ProjectTechnicalCard } from '../../entities/project/model/project.types';
import { TechnicalCardItem } from '@/main/shared/ui/technical-card/TechnicalCardItem';
import { ProjectDetailHeader } from '@design-system/components/ProjectDetailHeader';
import { TableOfContents } from '@design-system/components/TableOfContents';
import { ProjectNavigation } from '@design-system/components/ProjectNavigation';
import { ProjectThumbnailCarousel } from '@design-system/components/Carousel';
import { Skeleton } from '@design-system/components/Skeleton';
import { EmptyCard } from '@design-system';
import styles from './ProjectDetailPage.module.css';

const ProjectDetailPage: React.FC = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const id = idParam?.trim();
  const navigate = useNavigate();
  const markdownContainerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: projects = [], isLoading: isProjectsLoading } = useProjectsQuery({ type: 'project' });
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
  } = useProjectQuery(id ?? '');

  const isLoading = isProjectLoading || isProjectsLoading;

  const projectOverviewContent = project
    ? (project.projectOverviewArticle?.content || project.description || '')
    : '';
  const technicalCards = useMemo(() => {
    if (!project?.technicalCards) {
      return [];
    }
    return [...project.technicalCards].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
  }, [project]);

  // TOC ?�성 (?�체 ?�이지 ?�더 ?�함)
  // contentRef�?직접 ?�용 (containerSelector ?�이)
  const domTocItems = useTOCFromDOM(
    contentRef as React.RefObject<HTMLElement>,
    { 
      containerSelector: undefined, // ?�체 컨테?�너?�서 ?�딩 찾기
      headingLevels: [1, 2, 3, 4, 5, 6] 
    }
  );

  // 기본 ?�션 ?�더�??�동?�로 추�? (Readme???�딩???�어??TOC ?�시)
  const tocItems = useMemo(() => {
    if (!project) return [];

    const baseSections: TOCItem[] = [
      { id: 'overview', text: '개요', level: 2 },
    ];

    // 스크린샷 ?�션???�으�?추�?
    if (project.screenshots && project.screenshots.length > 0) {
      baseSections.push({ id: 'screenshots', text: '스크린샷', level: 2 });
    }

    if (projectOverviewContent) {
      baseSections.push({ id: 'overview-article', text: '프로젝트 개요', level: 2 });
    }

    if (technicalCards.length > 0) {
      baseSections.push({ id: 'technical-cards', text: '기술 카드', level: 2 });
    }

    // 기술 스택 ?�션???�으�?추�?
    if (project.technologies && project.technologies.length > 0) {
      baseSections.push({ id: 'tech-stack', text: '기술 스택', level: 2 });
    }

    // DOM?�서 추출???�딩?�을 상세 설명 ?�션???�위 ??��?�로 추�?
    if (domTocItems.length > 0 && projectOverviewContent) {
      const overviewSectionIndex = baseSections.findIndex(s => s.id === 'overview-article');
      if (overviewSectionIndex !== -1) {
        baseSections[overviewSectionIndex] = {
          ...baseSections[overviewSectionIndex],
          subItems: domTocItems
        };
      }
    } else if (domTocItems.length > 0) {
      // DOM ?�딩???��?�?readme ?�션???�는 경우, 직접 추�?
      baseSections.push(...domTocItems);
    }

    return baseSections;
  }, [domTocItems, project, projectOverviewContent, technicalCards.length]);

  // ������ ���� �� ������� ��ũ��
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // ResizeObserver�??�한 ?�적 ?�이 추적
  // ������ ���� �� ������� ��ũ��
  useEffect(() => {
    if (!contentRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Resize updates are handled implicitly by layout.
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const hasError = !isLoading && (!project || isProjectError);

  const projectUpdatedAtForSchema = useMemo(() => {
    if (!project?.updatedAt) return undefined;
    const u = project.updatedAt;
    if (typeof u === 'string') return u;
    return new Date(u).toISOString();
  }, [project]);

  const projectDetailMain = (() => {
    if (isLoading) {
      return (
        <>
          <div style={{ marginBottom: 'var(--spacing-8)' }}>
            <Skeleton variant="text" height="48px" width="70%" style={{ marginBottom: '16px' }} />
            <Skeleton variant="text" height="24px" width="100%" style={{ marginBottom: '8px' }} />
            <Skeleton variant="text" height="24px" width="90%" />
          </div>
          <section className={styles.section}>
            <Skeleton variant="text" height="32px" width="60px" style={{ marginBottom: '16px' }} />
            <Skeleton variant="text" height="20px" width="100%" style={{ marginBottom: '8px' }} />
            <Skeleton variant="text" height="20px" width="100%" style={{ marginBottom: '8px' }} />
            <Skeleton variant="text" height="20px" width="85%" />
          </section>
        </>
      );
    }
    if (hasError) {
      return (
        <>
          <div style={{ marginBottom: 'var(--spacing-8)' }}>
            <SectionTitle level="h1">
              작업물을 찾을 수 없습니다
            </SectionTitle>
          </div>
          <section className={styles.section}>
            <EmptyCard message="요청한 작업물이 존재하지 않습니다." />
            <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center' }}>
              <TextLink href="/projects" className={styles.backLink}>
                작업물 목록으로 돌아가기              </TextLink>
            </div>
          </section>
        </>
      );
    }
    if (!project) {
      return null;
    }
    return (
      <>
        {/* ?�로?�트 ?�더 (고정 ?�거) */}
        <ProjectDetailHeader project={project} />

        {/* TOC ?�션 (개요 ?�에 고정) */}
        {tocItems.length > 0 && (
          <section id="toc" className={styles.section}>
            <SectionTitle level="h2" id="toc" className={styles.sectionTitle}>목차</SectionTitle>
            <TableOfContents items={tocItems} />
          </section>
        )}

        {/* 개요 ?�션 */}
        <section id="overview" className={styles.section}>
          <SectionTitle level="h2" id="overview" className={styles.sectionTitle}>개요</SectionTitle>
          <p className={styles.description}>{project.description}</p>
        </section>

        {/* 스크린샷 ?�션 (?�으�? */}
        {project.screenshots && project.screenshots.length > 0 && (
          <section id="screenshots" className={styles.section}>
            <SectionTitle level="h2" id="screenshots" className={styles.sectionTitle}>스크린샷</SectionTitle>
            <div className={styles.screenshots}>
              {project.screenshots.map((screenshot: string | { imageUrl: string }, index: number) => {
                const imageUrl = typeof screenshot === 'string'
                  ? screenshot
                  : screenshot.imageUrl;
                return (
                  <img
                    key={`${project.id}-screenshot-${imageUrl}`}
                    src={imageUrl}
                    alt={`${project.title} 스크린샷 ${index + 1}`}
                    className={styles.screenshot}
                  />
                );
              })}
            </div>
          </section>
        )}

        {projectOverviewContent && (
          <section id="overview-article" className={styles.section}>
            <SectionTitle level="h2" id="overview-article" className={styles.sectionTitle}>프로젝트 개요</SectionTitle>
            <article ref={markdownContainerRef} className={styles.markdownArticle}>
              <MarkdownRenderer
                content={projectOverviewContent}
                className={styles.markdown}
              />
            </article>
          </section>
        )}

        {technicalCards.length > 0 && (
          <section id="technical-cards" className={styles.section}>
            <SectionTitle level="h2" id="technical-cards" className={styles.sectionTitle}>기술 카드</SectionTitle>
            <div className={styles.technicalCards}>
              {technicalCards.map((card: ProjectTechnicalCard, index) => (
                <TechnicalCardItem
                  key={card.id || `${card.title}-${index}`}
                  card={{
                    id: card.id,
                    title: card.title,
                    category: card.category,
                    problemStatement: card.problemStatement,
                    analysis: card.analysis,
                    solution: card.solution,
                    isPinned: card.isPinned,
                    sortOrder: card.sortOrder,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* 기술 스택 ?�션 */}
        {project.technologies && project.technologies.length > 0 && (
          <section id="tech-stack" className={styles.section}>
            <SectionTitle level="h2" id="tech-stack" className={styles.sectionTitle}>기술 스택</SectionTitle>
            <TechStackList
              technologies={project.technologies}
              maxVisible={20}
              variant="default"
              size="md"
            />
          </section>
        )}

        {/* ?�른 ?�로?�트 캐러?� */}
        <ProjectThumbnailCarousel
          projects={projects.map(p => ({
            id: p.id,
            title: p.title,
            imageUrl: p.imageUrl,
          }))}
          currentProjectId={project.id}
          title="다른 작업물"
        />

        {/* ?�로?�트 ?�비게이??*/}
        <ProjectNavigation
          projects={projects.map(p => ({
            id: p.id,
            title: p.title,
          }))}
          currentProjectId={project.id}
        />
      </>
    );
  })();

  return (
    <div className={styles.container}>
      {id && (
        <SeoHead
          title={project?.title}
          description={project?.description}
          canonicalPath={id ? `/projects/${id}` : undefined}
          jsonLd={
            project
              ? [
                  createProjectSchema({
                    id: project.id,
                    title: project.title,
                    description: project.description ?? '',
                    updatedAt: projectUpdatedAtForSchema,
                  }),
                  createBreadcrumbSchema(
                    [
                      { name: '작업물', path: '/projects' },
                      { name: project.title, path: `/projects/${id}` },
                    ]
                  ),
                ]
              : undefined
          }
        />
      )}
        <div ref={contentRef} className={styles.content}>
        {projectDetailMain}
        </div>
      </div>
  );
};

export default ProjectDetailPage;
