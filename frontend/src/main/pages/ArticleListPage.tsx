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
// ArticleCard???�리?�컬 체인 최적?��? ?�해 직접 import
import { ArticleCard } from '@/design-system/components/Card/ArticleCard';
import { useContentHeightRecalc } from '@/main/shared/hooks/useContentHeightRecalc';
import { useImageLoadTracking } from '@/main/shared/hooks/useImageLoadTracking';
import { compareStrings } from '@/main/shared/utils/sortUtils';
import styles from './ArticleListPage.module.css';

type ViewMode = 'table' | 'gallery';
type SortOrder = 'asc' | 'desc';
type SortBy = 'publishedAt' | 'viewCount';

/**
 * ?�티??목록 ?�이지
 * ?�자???�스??기반?�로 ?�구?? */
export function ArticleListPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState(''); // ?�력 중인 검?�어
  const [searchQuery, setSearchQuery] = useState(''); // ?�제 검?�에 ?�용?�는 검?�어
  const [sortBy, setSortBy] = useState<SortBy>('publishedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const pageSize = 12;

  // ?�티???�계 조회
  const { data: statistics } = useArticleStatisticsQuery();

  // ������Ʈ ���Ϳ� ������ ��ȯ
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

  // 추천 ?�티??조회
  const { data: featuredArticlesData, isLoading: isLoadingFeatured } = useArticleListQuery({
    page: 0,
    size: 10, // ��õ ��ƼŬ�� �ִ� 10��
    isFeatured: true,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // ?�티??목록 조회 (?�터링된 결과)
  const { data, isLoading, error, refetch } = useArticleListQuery({ 
    page: page - 1, 
    size: pageSize,
    category: selectedCategory,
    // projectId??백엔?�에??businessId�?PK�?변?�해???��?�??�단 undefined�??�달
    // 추후 백엔??API ?�정 ?�요
    projectId: undefined, // selectedProjectBusinessId�?PK�?변?�하??로직 ?�요
    seriesId: selectedSeriesId,
    searchKeyword: searchQuery || undefined,
    sortBy: sortBy,
    sortOrder: sortOrder,
  });

  // ?�리�?목록 �?카운??계산 (?�계 API?�서 가?�온 ?�이???�용)
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

    // ?�로?�트 카운??매핑 (filterProjects??ID�?변??
    const projectCounts: Record<number, number> = {};
    statistics.projects.forEach((p) => {
      const id = filterProjects.projectMap.get(p.projectBusinessId);
      if (id) {
        projectCounts[id] = p.count;
      }
    });

    // ?�리�?카운??매핑
    const seriesCounts: Record<string, number> = {};
    statistics.series.forEach((s) => {
      seriesCounts[s.seriesId] = s.count;
    });

    // ?�리�?목록 (?�목?�로 ?�렬)
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

  // ?�터링된 ?�티??(?�버?�서 ?��? ?�터링됨)
  const filteredArticles = data?.content || [];

  // ?�이지 ?�이 ?�계????  // dependencies�??�정?�하�??�해 배열 길이?� �?번째 ??��??ID�??�용
  const articlesKey = useMemo(() => {
    if (!filteredArticles.length) return 'empty';
    return `${filteredArticles.length}-${filteredArticles[0]?.businessId || ''}`;
  }, [filteredArticles]);

  const { recalculateHeight, scheduleRecalc } = useContentHeightRecalc(isLoading, [articlesKey], {
    scrollThreshold: 100,
    useResizeObserver: true,
  });

  // ?��?지 로딩 추적 (�??��?지 로드 ???�이 ?�계??
  // scheduleRecalc�??�용?�여 rAF 배치 처리
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
    setSearchQuery(searchInput); // ?�력??검?�어�??�제 검?�어�??�정
    setPage(1);
  };

  const handleSeriesSelect = (seriesId: string | undefined) => {
    setSelectedSeriesId(seriesId);
    setPage(1);
  };

  const totalPages = Math.ceil((data?.totalElements || 0) / pageSize);

  // ?�러 ?�태?�서???�이?�웃 ?��?
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
                ariaLabel="다시 시도"
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
                다시 시도
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
          <EmptyCard message="표시할 글이 없습니다." />
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
              ariaLabel="다시 시도"
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
        title="글"
        description={<p>총 {data?.totalElements || 0}개의 글</p>}
      />

      {/* 메인 컨텐�?*/}
      <section className={styles.content}>
        <div className={styles.container}>
          {/* 추천 ?�티???�션 - ?�체 ?�비 */}
          {(!isLoadingFeatured && featuredArticlesData?.content && featuredArticlesData.content.length > 0) && (
            <section className={styles.featuredSection}>
              <div className={styles.featuredHeaderWrapper}>
                <div className={styles.featuredHeader}>
                  <SectionTitle level="h2">추천 글</SectionTitle>
                </div>
              </div>
              <FeaturedArticleCarousel
                articles={featuredArticlesData.content}
                onArticleClick={handleArticleClick}
              />
            </section>
          )}

          {/* ?�티??목록�??�이?�바 - 같�? ??*/}
          <div className={styles.layout}>
            {/* 좌측: ?�티??목록 */}
            <div className={styles.mainContent}>
              {/* ?�티??목록 ?�션 */}
              <section className={styles.articleListSection}>
                <div className={styles.sectionHeader}>
                  <SectionTitle level="h2">글 목록</SectionTitle>
                  <div className={styles.divider}></div>
                  <p className={styles.sectionDescription}>
                    발행된 모든 글을 확인할 수 있습니다.
                  </p>
                </div>

                {/* 컨트�??�널 */}
                <ArticleControlPanel
                  searchQuery={searchInput}
                  onSearchChange={setSearchInput}
                  onSearch={handleSearch}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={(by: SortBy, order: SortOrder) => {
                    setSortBy(by);
                    setSortOrder(order);
                    setPage(1); // ���� ���� �� ù ��������
                  }}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />

                {articleListBody}
              </section>
            </div>

            {/* ?�측: ?�터 �?*/}
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

          {/* ?�이지?�이??- 별도 ?�으�?중앙 배치 */}
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
