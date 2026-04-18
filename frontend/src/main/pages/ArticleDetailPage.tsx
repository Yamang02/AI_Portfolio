import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { seoConfig } from '@/shared/config/seo.config';
import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { createArticleSchema, createBreadcrumbSchema } from '@/main/shared/lib/schema';
import { useArticleQuery, useArticleListQuery, useArticleNavigationQuery } from '../entities/article';
import type { ArticleRelatedTechnicalCard } from '../entities/article/model/article.types';
import { TechnicalCardItem } from '@/main/shared/ui/technical-card/TechnicalCardItem';
import { SectionTitle } from '@design-system/components/SectionTitle';
import { useTOCFromDOM } from '@/main/features/project-gallery/hooks';
import type { TOCItem } from '@/main/features/project-gallery/hooks/types';
import { MarkdownRenderer } from '@/main/shared/ui/markdown/MarkdownRenderer';
import { TechStackList } from '@/main/shared/ui/tech-stack/TechStackList';
import { TableOfContents } from '@design-system/components/TableOfContents';
import { ArticleNavigation } from '@design-system/components/ArticleNavigation';
// ArticleCard???�리?�컬 체인 최적?��? ?�해 직접 import
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
  if (article.content) sections.push({ id: 'content', text: '본문', level: 2 });
  if (article.project) sections.push({ id: 'related-project', text: '관련 프로젝트', level: 2 });
  if (article.techStack?.length > 0) sections.push({ id: 'tech-stack', text: '기술 스택', level: 2 });

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
 * ?�티???�세 ?�이지
 * ?�로?�트 ?�세?�이지 구조�?참고?�여 ?�구?? */
export function ArticleDetailPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const markdownContainerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // ?�티???�세 조회
  const { 
    data: article, 
    isLoading, 
    isError,
    isFetching,  // 백그?�운??리페�??�태
    error 
  } = useArticleQuery(businessId!);

  // ?�티???�비게이??조회 (?�전/?�음 ?�티?�만)
  const { data: navigationData } = useArticleNavigationQuery(businessId!);

  // ?�리�??�티??조회 (같�? ?�리즈의 ?�른 ?�티?�들)
  const { data: articlesData } = useArticleListQuery({
    page: 0,
    size: 50, // ?�리�??�티?�용 (?�리즈는 보통 많�? ?�으므�?50?�로 충분)
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // TOC ?�성 (마크?�운?�서 ?�딩 추출)
  // markdownContainerRef�??�용?�여 마크?�운 ?��????�딩�?추출
  const domTocItems = useTOCFromDOM(
    markdownContainerRef as React.RefObject<HTMLElement>,
    { 
      containerSelector: undefined, // markdownContainerRef ?��??�서 ?�딩 찾기
      headingLevels: [1, 2, 3, 4, 5, 6] 
    }
  );

  // 기본 ?�션 ?�더�??�동?�로 추�?
  const tocItems = useMemo(() => buildTocItems(article, domTocItems), [article, domTocItems]);

  // ProjectCard�� �ʿ��� �������� ��ȯ
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

  // 같�? ?�리즈의 ?�른 ?�티??찾기
  const seriesArticles = useMemo(
    () => getSeriesArticles(article, articlesData?.content),
    [article, articlesData?.content]
  );


    useEffect(() => {
    window.scrollTo(0, 0);
  }, [businessId]);

  // ResizeObserver�??�한 ?�적 ?�이 추적
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

  // ?�러 ?�태 체크: 백그?�운??리페�?중이 ?�닐 ?�만 ?�러�?처리
  const hasError = (isError || (!isLoading && !article)) && !isFetching;
  const errorTitle = isError && error?.message?.includes('404')
    ? '글을 찾을 수 없습니다'
    : '오류가 발생했습니다';

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
            <span className={styles.metaItem}>조회 {article.viewCount}</span>
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

        {article.technicalCards && article.technicalCards.length > 0 && (
          <section id="related-technical-cards" className={styles.section}>
            <div className={styles.technicalCards}>
              {article.technicalCards.map((card: ArticleRelatedTechnicalCard) => (
                <TechnicalCardItem key={card.id} card={card} />
              ))}
            </div>
          </section>
        )}

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
            <SectionTitle level="h2" id="related-project" className={styles.sectionTitle}>관련 프로젝트</SectionTitle>
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
            <SectionTitle level="h2" id="tech-stack" className={styles.sectionTitle}>관련 기술</SectionTitle>
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
                  author: seoConfig.author,
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
                    { name: '글', path: '/articles' },
                    { name: article.title, path: `/articles/${businessId}` },
                  ]),
                ]
              : undefined
          }
        />
      )}
      {/* 백그?�운??리페�??�디케?�터 */}
      {isFetching && !isLoading && article && (
        <BackgroundRefetchIndicator />
      )}
      <div ref={contentRef} className={styles.content}>
        {articleDetailMain}
      </div>
    </div>
  );
}
