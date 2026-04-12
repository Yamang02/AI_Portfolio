import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { createArticleSchema, createBreadcrumbSchema } from '@/main/shared/lib/schema';
import { useArticleQuery, useArticleListQuery, useArticleNavigationQuery } from '../entities/article';
import { SectionTitle } from '@design-system/components/SectionTitle';
import { useTOCFromDOM } from '@/main/features/project-gallery/hooks';
import type { TOCItem } from '@/main/features/project-gallery/hooks/types';
import { MarkdownRenderer } from '@/main/shared/ui/markdown/MarkdownRenderer';
import { TechStackList } from '@/main/shared/ui/tech-stack/TechStackList';
import { TableOfContents } from '@design-system/components/TableOfContents';
import { ArticleNavigation } from '@design-system/components/ArticleNavigation';
// ArticleCard???¬ë¦¬?°ì»¬ ì²´ì¸ ìµœì ?”ë? ?„í•´ ì§ì ‘ import
import { ArticleCard } from '@design-system/components/Card/ArticleCard';
import { ProjectCard } from '@design-system';
import type { ProjectCardProject } from '@design-system';
import { Badge } from '@design-system/components/Badge/Badge';
import { ARTICLE_CATEGORIES } from '@/shared/article';
import { Skeleton } from '@design-system/components/Skeleton';
import { BackgroundRefetchIndicator } from '@/shared/ui';
import { ArticleErrorView } from './ArticleDetailPage/ui/ArticleErrorView';
import styles from './ArticleDetailPage.module.css';

const createBaseTocSections = (article: any): TOCItem[] => {
  if (!article) return [];

  const sections: TOCItem[] = [];
  if (article.content) sections.push({ id: 'content', text: 'ë³¸ë¬¸', level: 2 });
  if (article.project) sections.push({ id: 'related-project', text: '°ü·Ã ÇÁ·ÎÁ§Æ®', level: 2 });
  if (article.techStack?.length > 0) sections.push({ id: 'tech-stack', text: 'ê¸°ìˆ  ?¤íƒ', level: 2 });

  return sections;
};

const mergeDomTocIntoBaseSections = (baseSections: TOCItem[], domTocItems: TOCItem[]): TOCItem[] => {
  if (domTocItems.length === 0) return baseSections;

  return baseSections.map((section) =>
    section.id === 'content' ? { ...section, subItems: domTocItems } : section
  );
};

const buildTocItems = (article: any, domTocItems: TOCItem[]): TOCItem[] => {
  const baseSections = createBaseTocSections(article);
  if (baseSections.length === 0) return [];

  const mergedSections = mergeDomTocIntoBaseSections(baseSections, domTocItems);
  const hasContentSection = mergedSections.some((section) => section.id === 'content');

  if (hasContentSection || domTocItems.length === 0) return mergedSections;
  return [...mergedSections, ...domTocItems];
};

const getSeriesArticles = (article: any, content?: any[]) => {
  if (!article?.seriesId || !content) return [];
  return content
    .filter((a) => a.seriesId === article.seriesId && a.businessId !== article.businessId)
    .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
};

/**
 * ?„í‹°???ì„¸ ?˜ì´ì§€
 * ?„ë¡œ?íŠ¸ ?ì„¸?˜ì´ì§€ êµ¬ì¡°ë¥?ì°¸ê³ ?˜ì—¬ ?¬êµ¬?? */
export function ArticleDetailPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const markdownContainerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ?„í‹°???ì„¸ ì¡°íšŒ
  const { 
    data: article, 
    isLoading, 
    isError,
    isFetching,  // ë°±ê·¸?¼ìš´??ë¦¬í˜ì¹??íƒœ
    error 
  } = useArticleQuery(businessId!);

  // ?„í‹°???¤ë¹„ê²Œì´??ì¡°íšŒ (?´ì „/?¤ìŒ ?„í‹°?´ë§Œ)
  const { data: navigationData } = useArticleNavigationQuery(businessId!);

  // ?œë¦¬ì¦??„í‹°??ì¡°íšŒ (ê°™ì? ?œë¦¬ì¦ˆì˜ ?¤ë¥¸ ?„í‹°?´ë“¤)
  const { data: articlesData } = useArticleListQuery({
    page: 0,
    size: 50, // ?œë¦¬ì¦??„í‹°?´ìš© (?œë¦¬ì¦ˆëŠ” ë³´í†µ ë§ì? ?Šìœ¼ë¯€ë¡?50?¼ë¡œ ì¶©ë¶„)
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // TOC ?ì„± (ë§ˆí¬?¤ìš´?ì„œ ?¤ë”© ì¶”ì¶œ)
  // markdownContainerRefë¥??¬ìš©?˜ì—¬ ë§ˆí¬?¤ìš´ ?´ë????¤ë”©ë§?ì¶”ì¶œ
  const domTocItems = useTOCFromDOM(
    markdownContainerRef as React.RefObject<HTMLElement>,
    { 
      containerSelector: undefined, // markdownContainerRef ?´ë??ì„œ ?¤ë”© ì°¾ê¸°
      headingLevels: [1, 2, 3, 4, 5, 6] 
    }
  );

  // ê¸°ë³¸ ?¹ì…˜ ?¤ë”ë¥??˜ë™?¼ë¡œ ì¶”ê?
  const tocItems = useMemo(() => buildTocItems(article, domTocItems), [article, domTocItems]);

  // ProjectCard¿¡ ÇÊ¿äÇÑ Çü½ÄÀ¸·Î º¯È¯
  const projectCardData = useMemo((): ProjectCardProject | null => {
    if (!article?.project) return null;
    return {
      id: article.project.id,
      title: article.project.title,
      description: article.project.description,
      imageUrl: article.project.imageUrl,
      isTeam: article.project.isTeam,
      isFeatured: article.project.isFeatured,
      technologies: article.project.technologies,
      startDate: article.project.startDate || '',
      endDate: article.project.endDate,
      githubUrl: article.project.githubUrl,
      liveUrl: article.project.liveUrl,
    };
  }, [article?.project]);

  // ê°™ì? ?œë¦¬ì¦ˆì˜ ?¤ë¥¸ ?„í‹°??ì°¾ê¸°
  const seriesArticles = useMemo(
    () => getSeriesArticles(article, articlesData?.content),
    [article, articlesData?.content]
  );


    useEffect(() => {
    window.scrollTo(0, 0);
  }, [businessId]);

  // ResizeObserverë¥??µí•œ ?™ì  ?’ì´ ì¶”ì 
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

  // ?ëŸ¬ ?íƒœ ì²´í¬: ë°±ê·¸?¼ìš´??ë¦¬í˜ì¹?ì¤‘ì´ ?„ë‹ ?Œë§Œ ?ëŸ¬ë¡?ì²˜ë¦¬
  const hasError = (isError || (!isLoading && !article)) && !isFetching;
  const errorTitle = isError && error?.message?.includes('404')
    ? 'ê¸€??ì°¾ì„ ???†ìŠµ?ˆë‹¤'
    : '?¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤';

  const articleDetailMain = (() => {
    if (isLoading) {
      return (
        <>
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <Skeleton variant="rectangular" height="24px" width="80px" />
            </div>
            <div className={styles.title}>
              <Skeleton variant="text" height="48px" width="100%" />
            </div>
            <div className={styles.metaRow}>
              <Skeleton variant="text" height="16px" width="120px" />
              <Skeleton variant="text" height="16px" width="80px" />
            </div>
            <div className={styles.divider}></div>
            <div className={styles.meta}>
              <Skeleton variant="text" height="24px" width="200px" />
            </div>
          </header>
          <section className={styles.section}>
            <Skeleton variant="text" height="24px" width="60%" style={{ marginBottom: '16px' }} />
            <Skeleton variant="text" height="16px" width="100%" style={{ marginBottom: '8px' }} />
            <Skeleton variant="text" height="16px" width="100%" style={{ marginBottom: '8px' }} />
            <Skeleton variant="text" height="16px" width="90%" style={{ marginBottom: '8px' }} />
            <Skeleton variant="text" height="16px" width="100%" style={{ marginBottom: '8px' }} />
            <Skeleton variant="text" height="16px" width="85%" />
          </section>
        </>
      );
    }
    if (hasError) {
      return (
        <>
          <header className={styles.header}>
            <SectionTitle level="h1" className={styles.title}>
              {errorTitle}
            </SectionTitle>
            <div className={styles.divider}></div>
          </header>
          <section className={styles.section}>
            <ArticleErrorView error={error} />
          </section>
        </>
      );
    }
    if (!article) {
      return null;
    }
    return (
      <>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            {article.category && (
              <Badge variant="primary" size="sm" className={styles.categoryBadge}>
                {ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category}
              </Badge>
            )}
          </div>

          <SectionTitle level="h2" className={styles.title}>
            {article.title}
          </SectionTitle>

          {article.seriesTitle && article.seriesOrder !== undefined && (
            <div className={styles.seriesInfo}>
              {article.seriesTitle}#{article.seriesOrder}
            </div>
          )}

          <div className={styles.metaRow}>
            {article.publishedAt && (
              <span className={styles.metaItem}>
                {new Date(article.publishedAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            <span className={styles.metaItem}>ì¡°íšŒ {article.viewCount}</span>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.meta}>
            {article.tags && article.tags.length > 0 && (
              <div className={styles.tags}>
                {article.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {tocItems.length > 0 && (
          <section id="toc" className={styles.section}>
            <TableOfContents items={tocItems} />
          </section>
        )}

        {article.content && (
          <section id="content" className={styles.section}>
            <article ref={markdownContainerRef} className={styles.markdownArticle}>
              <MarkdownRenderer
                content={article.content}
                className={styles.markdown}
              />
            </article>
          </section>
        )}

        {projectCardData && (
          <section id="related-project" className={styles.section}>
            <SectionTitle level="h2" id="related-project" className={styles.sectionTitle}>°ü·Ã ÇÁ·ÎÁ§Æ®</SectionTitle>
            <div className={styles.relatedProjectWrapper}>
              <ProjectCard
                project={projectCardData}
                onClick={() => navigate(`/projects/${projectCardData.id}`)}
              />
            </div>
          </section>
        )}

        {article.techStack && article.techStack.length > 0 && (
          <section id="tech-stack" className={styles.section}>
            <SectionTitle level="h2" id="tech-stack" className={styles.sectionTitle}>ê´€??ê¸°ìˆ </SectionTitle>
            <div className={styles.techStackWrapper}>
              <TechStackList
                technologies={article.techStack}
                maxVisible={20}
                variant="default"
                size="md"
              />
            </div>
          </section>
        )}

        {seriesArticles.length > 0 && article.seriesTitle && (
          <section id="series" className={styles.section}>
            <div className={styles.seriesArticles}>
              {seriesArticles.map((seriesArticle) => (
                <ArticleCard
                  key={seriesArticle.businessId}
                  article={{
                    businessId: seriesArticle.businessId,
                    title: seriesArticle.title,
                    summary: seriesArticle.summary,
                    category: seriesArticle.category,
                    tags: seriesArticle.tags,
                    techStack: seriesArticle.techStack,
                    publishedAt: seriesArticle.publishedAt,
                    viewCount: seriesArticle.viewCount,
                  }}
                  onClick={() => navigate(`/articles/${seriesArticle.businessId}`)}
                />
              ))}
            </div>
          </section>
        )}

        <ArticleNavigation
          articles={[
            ...(navigationData?.prevArticle ? [navigationData.prevArticle] : []),
            { businessId: article.businessId, title: article.title },
            ...(navigationData?.nextArticle ? [navigationData.nextArticle] : []),
          ]}
          currentArticleBusinessId={article.businessId}
        />
      </>
    );
  })();

  return (
    <div className={styles.container}>
      {businessId && (
        <SeoHead
          title={article?.title}
          description={article?.summary ?? article?.content?.slice(0, 160)}
          ogType="article"
          canonicalPath={`/articles/${businessId}`}
          article={
            article?.publishedAt
              ? {
                  publishedTime: article.publishedAt,
                  modifiedTime: article.updatedAt ?? article.publishedAt,
                  author: 'YamangSolution',
                  tags: article.tags,
                }
              : undefined
          }
          jsonLd={
            article
              ? [
                  createArticleSchema({
                    businessId: article.businessId,
                    title: article.title,
                    summary: article.summary,
                    publishedAt: article.publishedAt,
                    updatedAt: article.updatedAt,
                  }),
                  createBreadcrumbSchema([
                    { name: 'ê¸€', path: '/articles' },
                    { name: article.title, path: `/articles/${businessId}` },
                  ]),
                ]
              : undefined
          }
        />
      )}
      {/* ë°±ê·¸?¼ìš´??ë¦¬í˜ì¹??¸ë””ì¼€?´í„° */}
      {isFetching && !isLoading && article && (
        <BackgroundRefetchIndicator />
      )}
      <div ref={contentRef} className={styles.content}>
        {articleDetailMain}
      </div>
    </div>
  );
}
