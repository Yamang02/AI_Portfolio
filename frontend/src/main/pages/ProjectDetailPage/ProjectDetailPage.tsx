import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { createProjectSchema, createBreadcrumbSchema } from '@/main/shared/lib/schema';
import { useProjectsQuery } from '../../entities/project/api/useProjectsQuery';
import { SectionTitle } from '@design-system/components/SectionTitle';
import { TextLink } from '@design-system/components/TextLink';
import { useTOCFromDOM } from '@/main/features/project-gallery/hooks';
import type { TOCItem } from '@/main/features/project-gallery/hooks/types';
import { MarkdownRenderer } from '@/main/shared/ui/markdown/MarkdownRenderer';
import { TechStackList } from '@/main/shared/ui/tech-stack/TechStackList';
import { SimpleArticleCard } from '@design-system/components/Card/SimpleArticleCard';
import { Pagination } from '@design-system/components/Pagination/Pagination';
import type { Project } from '../../entities/project/model/project.types';
import { ProjectDetailHeader } from '@design-system/components/ProjectDetailHeader';
import { TableOfContents } from '@design-system/components/TableOfContents';
import { ProjectNavigation } from '@design-system/components/ProjectNavigation';
import { ProjectThumbnailCarousel } from '@design-system/components/Carousel';
import { Skeleton } from '@design-system/components/Skeleton';
import { EmptyCard } from '@design-system';
import styles from './ProjectDetailPage.module.css';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const markdownContainerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ê¸°ì¡´ main ë°©ì‹: ?„ë¡œ?íŠ¸ ëª©ë¡??ê°€?¸ì???IDë¡?ì°¾ê¸°
  const { data: projects = [], isLoading } = useProjectsQuery();
  
  // ?„ë¡œ?íŠ¸ ì°¾ê¸°
  const project = useMemo(() => {
    if (!id) return null;
    return projects.find((p: Project) => p.id === id) || null;
  }, [id, projects]);

  const readmeContent = project ? (project.readme || project.description || '') : '';

  // development-timeline ?€??Article (?„ë¡œ?íŠ¸ ?°ì´?°ì—??ê°€?¸ì˜´)
  const developmentTimelineArticles = useMemo(() => {
    if (!project?.developmentTimelineArticles) return [];
    // ?´ë? ë°±ì—”?œì—??ìµœì‹ ?œìœ¼ë¡??•ë ¬?˜ì–´ ?ˆìŒ
    return project.developmentTimelineArticles;
  }, [project]);

  // ê´€???„í‹°???˜ì´ì§€?¤ì´??(5ê°œì”© ?œì‹œ)
  const ARTICLES_PER_PAGE = 5;
  const [currentArticlePage, setCurrentArticlePage] = useState(1);
  
  // ?„ì¬ ?˜ì´ì§€???œì‹œ???„í‹°??ê³„ì‚°
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentArticlePage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    return developmentTimelineArticles.slice(startIndex, endIndex);
  }, [developmentTimelineArticles, currentArticlePage]);
  
  // ?„ì²´ ?˜ì´ì§€ ??ê³„ì‚°
  const totalArticlePages = useMemo(() => {
    return Math.ceil(developmentTimelineArticles.length / ARTICLES_PER_PAGE);
  }, [developmentTimelineArticles.length]);
  
  // ÆäÀÌÁö º¯°æ ½Ã »ó´ÜÀ¸·Î ½ºÅ©·Ñ
  useEffect(() => {
    setCurrentArticlePage(1);
  }, [id]);
  
  // ÆäÀÌÁö º¯°æ ½Ã »ó´ÜÀ¸·Î ½ºÅ©·Ñ
  useEffect(() => {
    if (currentArticlePage > 1) {
      const sectionElement = document.getElementById('development-timeline');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentArticlePage]);

  // TOC ?ì„± (?„ì²´ ?˜ì´ì§€ ?¤ë” ?¬í•¨)
  // contentRefë¥?ì§ì ‘ ?¬ìš© (containerSelector ?†ì´)
  const domTocItems = useTOCFromDOM(
    contentRef as React.RefObject<HTMLElement>,
    { 
      containerSelector: undefined, // ?„ì²´ ì»¨í…Œ?´ë„ˆ?ì„œ ?¤ë”© ì°¾ê¸°
      headingLevels: [1, 2, 3, 4, 5, 6] 
    }
  );

  // ê¸°ë³¸ ?¹ì…˜ ?¤ë”ë¥??˜ë™?¼ë¡œ ì¶”ê? (Readme???¤ë”©???†ì–´??TOC ?œì‹œ)
  const tocItems = useMemo(() => {
    if (!project) return [];

    const baseSections: TOCItem[] = [
      { id: 'overview', text: 'ê°œìš”', level: 2 },
    ];

    // ?¤í¬ë¦°ìƒ· ?¹ì…˜???ˆìœ¼ë©?ì¶”ê?
    if (project.screenshots && project.screenshots.length > 0) {
      baseSections.push({ id: 'screenshots', text: '?¤í¬ë¦°ìƒ·', level: 2 });
    }

    // Readme ?¹ì…˜???ˆìœ¼ë©?ì¶”ê?
    if (readmeContent) {
      baseSections.push({ id: 'readme', text: '?ì„¸ ?¤ëª…', level: 2 });
    }

    // development-timeline Article ?¹ì…˜???ˆìœ¼ë©?ì¶”ê? (ê¸°ìˆ  ?¤íƒ ?„ì—)
    if (developmentTimelineArticles.length > 0) {
      baseSections.push({ id: 'development-timeline', text: 'ê´€??ê¸€', level: 2 });
    }

    // ê¸°ìˆ  ?¤íƒ ?¹ì…˜???ˆìœ¼ë©?ì¶”ê?
    if (project.technologies && project.technologies.length > 0) {
      baseSections.push({ id: 'tech-stack', text: 'ê¸°ìˆ  ?¤íƒ', level: 2 });
    }

    // DOM?ì„œ ì¶”ì¶œ???¤ë”©?¤ì„ ?ì„¸ ?¤ëª… ?¹ì…˜???˜ìœ„ ??ª©?¼ë¡œ ì¶”ê?
    if (domTocItems.length > 0 && readmeContent) {
      // ?ì„¸ ?¤ëª… ?¹ì…˜??ì°¾ì•„???˜ìœ„ ??ª©?¼ë¡œ ì¶”ê?
      const readmeSectionIndex = baseSections.findIndex(s => s.id === 'readme');
      if (readmeSectionIndex !== -1) {
        baseSections[readmeSectionIndex] = {
          ...baseSections[readmeSectionIndex],
          subItems: domTocItems
        };
      }
    } else if (domTocItems.length > 0) {
      // DOM ?¤ë”©???ˆì?ë§?readme ?¹ì…˜???†ëŠ” ê²½ìš°, ì§ì ‘ ì¶”ê?
      baseSections.push(...domTocItems);
    }

    return baseSections;
  }, [domTocItems, project, readmeContent, developmentTimelineArticles]);

  // ÆäÀÌÁö º¯°æ ½Ã »ó´ÜÀ¸·Î ½ºÅ©·Ñ
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // ResizeObserverë¥??µí•œ ?™ì  ?’ì´ ì¶”ì 
  // ÆäÀÌÁö º¯°æ ½Ã »ó´ÜÀ¸·Î ½ºÅ©·Ñ
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

  // ?ëŸ¬ ?íƒœ ì²´í¬
  const hasError = !isLoading && !project;

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
              ?‘ì—…ë¬¼ì„ ì°¾ì„ ???†ìŠµ?ˆë‹¤
            </SectionTitle>
          </div>
          <section className={styles.section}>
            <EmptyCard message="?”ì²­???‘ì—…ë¬¼ì´ ì¡´ì¬?˜ì? ?ŠìŠµ?ˆë‹¤." />
            <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center' }}>
              <TextLink href="/projects" className={styles.backLink}>
                ?‘ì—…ë¬?ëª©ë¡?¼ë¡œ ?Œì•„ê°€ê¸?              </TextLink>
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
        {/* ?„ë¡œ?íŠ¸ ?¤ë” (ê³ ì • ?œê±°) */}
        <ProjectDetailHeader project={project} />

        {/* TOC ?¹ì…˜ (ê°œìš” ?„ì— ê³ ì •) */}
        {tocItems.length > 0 && (
          <section id="toc" className={styles.section}>
            <SectionTitle level="h2" id="toc" className={styles.sectionTitle}>ëª©ì°¨</SectionTitle>
            <TableOfContents items={tocItems} />
          </section>
        )}

        {/* ê°œìš” ?¹ì…˜ */}
        <section id="overview" className={styles.section}>
          <SectionTitle level="h2" id="overview" className={styles.sectionTitle}>ê°œìš”</SectionTitle>
          <p className={styles.description}>{project.description}</p>
        </section>

        {/* ?¤í¬ë¦°ìƒ· ?¹ì…˜ (?ˆìœ¼ë©? */}
        {project.screenshots && project.screenshots.length > 0 && (
          <section id="screenshots" className={styles.section}>
            <SectionTitle level="h2" id="screenshots" className={styles.sectionTitle}>?¤í¬ë¦°ìƒ·</SectionTitle>
            <div className={styles.screenshots}>
              {project.screenshots.map((screenshot: string | { imageUrl: string }, index: number) => {
                const imageUrl = typeof screenshot === 'string'
                  ? screenshot
                  : screenshot.imageUrl;
                return (
                  <img
                    key={`${project.id}-screenshot-${imageUrl}`}
                    src={imageUrl}
                    alt={`${project.title} ?¤í¬ë¦°ìƒ· ${index + 1}`}
                    className={styles.screenshot}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Readme ?¹ì…˜ */}
        {readmeContent && (
          <section id="readme" className={styles.section}>
            <SectionTitle level="h2" id="readme" className={styles.sectionTitle}>?ì„¸ ?¤ëª…</SectionTitle>
            <article ref={markdownContainerRef} className={styles.markdownArticle}>
              <MarkdownRenderer
                content={readmeContent}
                className={styles.markdown}
              />
            </article>
          </section>
        )}

        {/* development-timeline Article ?¹ì…˜ (ê¸°ìˆ  ?¤íƒ ?„ì—) */}
        {developmentTimelineArticles.length > 0 && (
          <section id="development-timeline" className={styles.section}>
            <SectionTitle level="h2" id="development-timeline" className={styles.sectionTitle}>ê´€??ê¸€</SectionTitle>
            <div className={styles.articlesList}>
              {paginatedArticles.map((article) => (
                <SimpleArticleCard
                  key={article.businessId}
                  article={{
                    businessId: article.businessId,
                    title: article.title,
                    summary: article.summary,
                    publishedAt: article.publishedAt,
                  }}
                  onClick={() => navigate(`/articles/${article.businessId}`)}
                />
              ))}
            </div>
            {totalArticlePages > 1 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  currentPage={currentArticlePage}
                  totalPages={totalArticlePages}
                  onPageChange={setCurrentArticlePage}
                  maxVisiblePages={5}
                />
              </div>
            )}
          </section>
        )}

        {/* ê¸°ìˆ  ?¤íƒ ?¹ì…˜ */}
        {project.technologies && project.technologies.length > 0 && (
          <section id="tech-stack" className={styles.section}>
            <SectionTitle level="h2" id="tech-stack" className={styles.sectionTitle}>ê¸°ìˆ  ?¤íƒ</SectionTitle>
            <TechStackList
              technologies={project.technologies}
              maxVisible={20}
              variant="default"
              size="md"
            />
          </section>
        )}

        {/* ?¤ë¥¸ ?„ë¡œ?íŠ¸ ìºëŸ¬?€ */}
        <ProjectThumbnailCarousel
          projects={projects.map(p => ({
            id: p.id,
            title: p.title,
            imageUrl: p.imageUrl,
          }))}
          currentProjectId={project.id}
          title="´Ù¸¥ ÀÛ¾÷¹°"
        />

        {/* ?„ë¡œ?íŠ¸ ?¤ë¹„ê²Œì´??*/}
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
                      { name: 'ÀÛ¾÷¹°', path: '/projects' },
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
