import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeoHead } from '@/shared/ui/seo/SeoHead';
import { pageMetaDefaults } from '@/shared/config/seo.config';
import { SectionTitle, EmptyCard, SkeletonCard, Button } from '@/design-system';
import { PageHeader } from '@/main/widgets/page-header';
import { Pagination } from '@/design-system/components/Pagination/Pagination';
import { useArticleListQuery } from '../entities/article/api/useArticleQuery';
import { useArticleStatisticsQuery } from '../entities/article';
import { ArticleTable, ArticleFilterBar, ArticleControlPanel, FeaturedArticleCarousel } from '../features/article-view/ui';
// ArticleCard???¬ë¦¬?°ì»¬ ì²´ì¸ ìµœì ?”ë? ?„í•´ ì§ì ‘ import
import { ArticleCard } from '@/design-system/components/Card/ArticleCard';
import { useContentHeightRecalc } from '@/main/shared/hooks/useContentHeightRecalc';
import { useImageLoadTracking } from '@/main/shared/hooks/useImageLoadTracking';
import { compareStrings } from '@/main/shared/utils/sortUtils';
import styles from './ArticleListPage.module.css';

type ViewMode = 'table' | 'gallery';
type SortOrder = 'asc' | 'desc';
type SortBy = 'publishedAt' | 'viewCount';

/**
 * ?„í‹°??ëª©ë¡ ?˜ì´ì§€
 * ?”ì???œìŠ¤??ê¸°ë°˜?¼ë¡œ ?¬êµ¬?? */
export function ArticleListPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState(''); // ?…ë ¥ ì¤‘ì¸ ê²€?‰ì–´
  const [searchQuery, setSearchQuery] = useState(''); // ?¤ì œ ê²€?‰ì— ?¬ìš©?˜ëŠ” ê²€?‰ì–´
  const [sortBy, setSortBy] = useState<SortBy>('publishedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const pageSize = 12;

  // ?„í‹°???µê³„ ì¡°íšŒ
  const { data: statistics } = useArticleStatisticsQuery();

  // ÇÁ·ÎÁ§Æ® ÇÊÅÍ¿ë µ¥ÀÌÅÍ º¯È¯
  const filterProjects = useMemo(() => {
    if (!statistics?.projects) {
      return { projects: [], projectMap: new Map<string, number>() };
    }

    const projectMap = new Map<string, number>();
    const projects = statistics.projects.map((p, index) => {
      const id = index + 1;
      projectMap.set(p.projectBusinessId, id);
      return {
        id,
        businessId: p.projectBusinessId,
        title: p.projectTitle,
      };
    });

    return { projects, projectMap };
  }, [statistics?.projects]);

  // ì¶”ì²œ ?„í‹°??ì¡°íšŒ
  const { data: featuredArticlesData, isLoading: isLoadingFeatured } = useArticleListQuery({
    page: 0,
    size: 10, // ÃßÃµ ¾ÆÆ¼Å¬Àº ÃÖ´ë 10°³
    isFeatured: true,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // ?„í‹°??ëª©ë¡ ì¡°íšŒ (?„í„°ë§ëœ ê²°ê³¼)
  const { data, isLoading, error, refetch } = useArticleListQuery({ 
    page: page - 1, 
    size: pageSize,
    category: selectedCategory,
    // projectId??ë°±ì—”?œì—??businessIdë¥?PKë¡?ë³€?˜í•´???˜ë?ë¡??¼ë‹¨ undefinedë¡??„ë‹¬
    // ì¶”í›„ ë°±ì—”??API ?˜ì • ?„ìš”
    projectId: undefined, // selectedProjectBusinessIdë¥?PKë¡?ë³€?˜í•˜??ë¡œì§ ?„ìš”
    seriesId: selectedSeriesId,
    searchKeyword: searchQuery || undefined,
    sortBy: sortBy,
    sortOrder: sortOrder,
  });

  // ?œë¦¬ì¦?ëª©ë¡ ë°?ì¹´ìš´??ê³„ì‚° (?µê³„ API?ì„œ ê°€?¸ì˜¨ ?°ì´???¬ìš©)
  const { series, articleCounts } = useMemo(() => {
    if (!statistics) {
      return {
        series: [],
        articleCounts: {
          categories: {},
          projects: {},
          series: {},
        },
      };
    }

    // ?„ë¡œ?íŠ¸ ì¹´ìš´??ë§¤í•‘ (filterProjects??IDë¡?ë³€??
    const projectCounts: Record<number, number> = {};
    statistics.projects.forEach((p) => {
      const id = filterProjects.projectMap.get(p.projectBusinessId);
      if (id) {
        projectCounts[id] = p.count;
      }
    });

    // ?œë¦¬ì¦?ì¹´ìš´??ë§¤í•‘
    const seriesCounts: Record<string, number> = {};
    statistics.series.forEach((s) => {
      seriesCounts[s.seriesId] = s.count;
    });

    // ?œë¦¬ì¦?ëª©ë¡ (?œëª©?¼ë¡œ ?•ë ¬)
    const seriesList = statistics.series
      .map((s) => ({
        id: s.seriesId,
        title: s.seriesTitle ?? '',
      }))
      .sort((a, b) => compareStrings(a.title, b.title));

    return {
      series: seriesList,
      articleCounts: {
        categories: statistics.categories || {},
        projects: projectCounts,
        series: seriesCounts,
      },
    };
  }, [statistics, filterProjects.projectMap]);

  // ?„í„°ë§ëœ ?„í‹°??(?œë²„?ì„œ ?´ë? ?„í„°ë§ë¨)
  const filteredArticles = data?.content || [];

  // ?˜ì´ì§€ ?’ì´ ?¬ê³„????  // dependenciesë¥??ˆì •?”í•˜ê¸??„í•´ ë°°ì—´ ê¸¸ì´?€ ì²?ë²ˆì§¸ ??ª©??IDë¥??¬ìš©
  const articlesKey = useMemo(() => {
    if (!filteredArticles.length) return 'empty';
    return `${filteredArticles.length}-${filteredArticles[0]?.businessId || ''}`;
  }, [filteredArticles]);

  const { recalculateHeight, scheduleRecalc } = useContentHeightRecalc(isLoading, [articlesKey], {
    scrollThreshold: 100,
    useResizeObserver: true,
  });

  // ?´ë?ì§€ ë¡œë”© ì¶”ì  (ê°??´ë?ì§€ ë¡œë“œ ???’ì´ ?¬ê³„??
  // scheduleRecalcë¥??¬ìš©?˜ì—¬ rAF ë°°ì¹˜ ì²˜ë¦¬
  useImageLoadTracking(containerRef, scheduleRecalc || recalculateHeight);

  const handleArticleClick = (article: { businessId: string }) => {
    navigate(`/articles/${article.businessId}`);
  };

  const handleCategorySelect = (category: string | undefined) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleProjectSelect = (projectId: number | undefined) => {
    setSelectedProjectId(projectId);
    setPage(1);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput); // ?…ë ¥??ê²€?‰ì–´ë¥??¤ì œ ê²€?‰ì–´ë¡??¤ì •
    setPage(1);
  };

  const handleSeriesSelect = (seriesId: string | undefined) => {
    setSelectedSeriesId(seriesId);
    setPage(1);
  };

  const totalPages = Math.ceil((data?.totalElements || 0) / pageSize);

  // ?ëŸ¬ ?íƒœ?ì„œ???ˆì´?„ì›ƒ ? ì?
  const hasError = !!error;

  const articleListBody = (() => {
    if (isLoading) {
      return (
        <div className={styles.grid}>
          {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5', 'skeleton-6'].map((key) => (
            <SkeletonCard key={key} isLoading={true} />
          ))}
        </div>
      );
    }
    if (hasError) {
      return (
        <div className={styles.grid}>
          <div style={{ position: 'relative', width: '100%' }}>
            <SkeletonCard isLoading={false} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              zIndex: 20
            }}>
              <Button
                variant="icon"
                size="md"
                onClick={() => refetch()}
                ariaLabel="´Ù½Ã ½Ãµµ"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                  <path d="M21 3v5h-5"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M3 21v-5h5"></path>
                </svg>
              </Button>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                ´Ù½Ã ½Ãµµ
              </span>
            </div>
          </div>
        </div>
      );
    }
    if (filteredArticles.length > 0) {
      if (viewMode === 'table') {
        return (
          <ArticleTable
            articles={filteredArticles}
            onArticleClick={handleArticleClick}
          />
        );
      }
      return (
        <div className={styles.grid}>
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.businessId}
              article={{
                businessId: article.businessId,
                title: article.title,
                summary: article.summary,
                category: article.category,
                seriesId: article.seriesId,
                tags: article.tags,
                techStack: article.techStack,
                publishedAt: article.publishedAt,
                viewCount: article.viewCount,
                isFeatured: article.isFeatured,
              }}
              onClick={() => handleArticleClick(article)}
            />
          ))}
        </div>
      );
    }
    return (
      <div className={styles.grid}>
        <div style={{ position: 'relative', width: '100%' }}>
          <EmptyCard message="?œì‹œ??ê¸€???†ìŠµ?ˆë‹¤." />
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 20
          }}>
            <Button
              variant="icon"
              size="md"
              onClick={() => refetch()}
              ariaLabel="´Ù½Ã ½Ãµµ"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    );
  })();

  const meta = pageMetaDefaults.articles;
  return (
    <div ref={containerRef} className={styles.page}>
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonicalPath={meta.canonicalPath}
      />
      <PageHeader
        title="ê¸€"
        description={<p>ì´?{data?.totalElements || 0}ê°œì˜ ê¸€</p>}
      />

      {/* ë©”ì¸ ì»¨í…ì¸?*/}
      <section className={styles.content}>
        <div className={styles.container}>
          {/* ì¶”ì²œ ?„í‹°???¹ì…˜ - ?„ì²´ ?ˆë¹„ */}
          {(!isLoadingFeatured && featuredArticlesData?.content && featuredArticlesData.content.length > 0) && (
            <section className={styles.featuredSection}>
              <div className={styles.featuredHeaderWrapper}>
                <div className={styles.featuredHeader}>
                  <SectionTitle level="h2">ì¶”ì²œ ê¸€</SectionTitle>
                </div>
              </div>
              <FeaturedArticleCarousel
                articles={featuredArticlesData.content}
                onArticleClick={handleArticleClick}
              />
            </section>
          )}

          {/* ?„í‹°??ëª©ë¡ê³??¬ì´?œë°” - ê°™ì? ??*/}
          <div className={styles.layout}>
            {/* ì¢Œì¸¡: ?„í‹°??ëª©ë¡ */}
            <div className={styles.mainContent}>
              {/* ?„í‹°??ëª©ë¡ ?¹ì…˜ */}
              <section className={styles.articleListSection}>
                <div className={styles.sectionHeader}>
                  <SectionTitle level="h2">ê¸€ ëª©ë¡</SectionTitle>
                  <div className={styles.divider}></div>
                  <p className={styles.sectionDescription}>
                    ë°œí–‰??ëª¨ë“  ê¸€???•ì¸?????ˆìŠµ?ˆë‹¤.
                  </p>
                </div>

                {/* ì»¨íŠ¸ë¡??¨ë„ */}
                <ArticleControlPanel
                  searchQuery={searchInput}
                  onSearchChange={setSearchInput}
                  onSearch={handleSearch}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={(by: SortBy, order: SortOrder) => {
                    setSortBy(by);
                    setSortOrder(order);
                    setPage(1); // Á¤·Ä º¯°æ ½Ã Ã¹ ÆäÀÌÁö·Î
                  }}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />

                {articleListBody}
              </section>
            </div>

            {/* ?°ì¸¡: ?„í„° ë°?*/}
            <aside className={styles.sidebar}>
              <ArticleFilterBar
                selectedCategory={selectedCategory}
                selectedProjectId={selectedProjectId}
                selectedSeriesId={selectedSeriesId}
                onCategorySelect={handleCategorySelect}
                onProjectSelect={handleProjectSelect}
                onSeriesSelect={handleSeriesSelect}
                projects={filterProjects.projects}
                series={series}
                articleCounts={articleCounts}
              />
            </aside>
          </div>

          {/* ?˜ì´ì§€?¤ì´??- ë³„ë„ ?‰ìœ¼ë¡?ì¤‘ì•™ ë°°ì¹˜ */}
          {filteredArticles.length > 0 && (
            <div className={styles.paginationWrapper}>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
