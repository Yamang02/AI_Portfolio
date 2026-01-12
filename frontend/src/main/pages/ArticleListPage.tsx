import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionTitle, EmptyCard, SkeletonCard, Button } from '@/design-system';
import { Pagination } from '@/design-system/components/Pagination/Pagination';
import { useArticleListQuery } from '../entities/article/api/useArticleQuery';
import { useArticleStatisticsQuery } from '../entities/article';
import { ArticleTable, ArticleFilterBar, ArticleControlPanel, FeaturedArticleCarousel } from '../features/article-view/ui';
// ArticleCard는 크리티컬 체인 최적화를 위해 직접 import
import { ArticleCard } from '@/design-system/components/Card/ArticleCard';
import { useContentHeightRecalc, useImageLoadTracking } from '@/shared/hooks';
import styles from './ArticleListPage.module.css';

type ViewMode = 'table' | 'gallery';
type SortOrder = 'asc' | 'desc';
type SortBy = 'publishedAt' | 'viewCount';

/**
 * 아티클 목록 페이지
 * 디자인 시스템 기반으로 재구성
 */
export function ArticleListPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState(''); // 입력 중인 검색어
  const [searchQuery, setSearchQuery] = useState(''); // 실제 검색에 사용되는 검색어
  const [sortBy, setSortBy] = useState<SortBy>('publishedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const pageSize = 12;

  // 아티클 통계 조회
  const { data: statistics } = useArticleStatisticsQuery();

  // 프로젝트 필터용 데이터 변환
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

  // 추천 아티클 조회
  const { data: featuredArticlesData, isLoading: isLoadingFeatured, error: errorFeatured } = useArticleListQuery({
    page: 0,
    size: 10, // 추천 아티클은 최대 10개
    isFeatured: true,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // 아티클 목록 조회 (필터링된 결과)
  const { data, isLoading, error, refetch } = useArticleListQuery({ 
    page: page - 1, 
    size: pageSize,
    category: selectedCategory,
    // projectId는 백엔드에서 businessId를 PK로 변환해야 하므로 일단 undefined로 전달
    // 추후 백엔드 API 수정 필요
    projectId: undefined, // selectedProjectBusinessId를 PK로 변환하는 로직 필요
    seriesId: selectedSeriesId,
    searchKeyword: searchQuery || undefined,
    sortBy: sortBy,
    sortOrder: sortOrder,
  });

  // 시리즈 목록 및 카운트 계산 (통계 API에서 가져온 데이터 사용)
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

    // 프로젝트 카운트 매핑 (filterProjects의 ID로 변환)
    const projectCounts: Record<number, number> = {};
    statistics.projects.forEach((p) => {
      const id = filterProjects.projectMap.get(p.projectBusinessId);
      if (id) {
        projectCounts[id] = p.count;
      }
    });

    // 시리즈 카운트 매핑
    const seriesCounts: Record<string, number> = {};
    statistics.series.forEach((s) => {
      seriesCounts[s.seriesId] = s.count;
    });

    // 시리즈 목록 (제목으로 정렬)
    const seriesList = statistics.series
      .map((s) => ({
        id: s.seriesId,
        title: s.seriesTitle,
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

    return {
      series: seriesList,
      articleCounts: {
        categories: statistics.categories || {},
        projects: projectCounts,
        series: seriesCounts,
      },
    };
  }, [statistics, filterProjects.projectMap]);

  // 필터링된 아티클 (서버에서 이미 필터링됨)
  const filteredArticles = data?.content || [];

  // 이미지 로딩 추적
  const { allImagesLoaded } = useImageLoadTracking(containerRef);

  // API 로딩 및 이미지 로딩 완료 후 페이지 높이 재계산
  useContentHeightRecalc(isLoading, [filteredArticles, allImagesLoaded], {
    scrollThreshold: 100,
    recalcDelay: 200,
    useResizeObserver: true,
  });

  const handleArticleClick = (article: { businessId: string }) => {
    navigate(`/articles/${article.businessId}`);
  };

  const handleCategorySelect = (category: string | undefined) => {
    setSelectedCategory(category);
    setPage(1); // 필터 변경 시 첫 페이지로
  };

  const handleProjectSelect = (projectId: number | undefined) => {
    setSelectedProjectId(projectId);
    setPage(1);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput); // 입력된 검색어를 실제 검색어로 설정
    setPage(1); // 검색 시 첫 페이지로
  };

  const handleSeriesSelect = (seriesId: string | undefined) => {
    setSelectedSeriesId(seriesId);
    setPage(1);
  };

  const totalPages = Math.ceil((data?.totalElements || 0) / pageSize);

  // 에러 상태에서도 레이아웃 유지
  const hasError = !!error;

  return (
    <div ref={containerRef} className={styles.page}>
      {/* 헤더 */}
      <section className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div>
              <SectionTitle level="h1">Articles</SectionTitle>
              <p className={styles.count}>
                총 {data?.totalElements || 0}개의 아티클
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <section className={styles.content}>
        <div className={styles.container}>
          {/* 추천 아티클 섹션 - 전체 너비 */}
          {(!isLoadingFeatured && featuredArticlesData?.content && featuredArticlesData.content.length > 0) && (
            <section className={styles.featuredSection}>
              <div className={styles.featuredHeaderWrapper}>
                <div className={styles.featuredHeader}>
                  <SectionTitle level="h2">Featured Articles</SectionTitle>
                </div>
              </div>
              <FeaturedArticleCarousel
                articles={featuredArticlesData.content}
                onArticleClick={handleArticleClick}
              />
            </section>
          )}

          {/* 아티클 목록과 사이드바 - 같은 행 */}
          <div className={styles.layout}>
            {/* 좌측: 아티클 목록 */}
            <div className={styles.mainContent}>
              {/* 아티클 목록 섹션 */}
              <section className={styles.articleListSection}>
                <div className={styles.sectionHeader}>
                  <SectionTitle level="h2">Article List</SectionTitle>
                  <div className={styles.divider}></div>
                  <p className={styles.sectionDescription}>
                    발행된 모든 아티클을 확인할 수 있습니다.
                  </p>
                </div>

                {/* 컨트롤 패널 */}
                <ArticleControlPanel
                  searchQuery={searchInput}
                  onSearchChange={setSearchInput}
                  onSearch={handleSearch}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={(by: SortBy, order: SortOrder) => {
                    setSortBy(by);
                    setSortOrder(order);
                    setPage(1); // 정렬 변경 시 첫 페이지로
                  }}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />

                {isLoading ? (
                  // 로딩 상태: 스켈레톤 카드 여러 개 표시 (스피너 포함)
                  <div className={styles.grid}>
                    {[...Array(6)].map((_, i) => (
                      <SkeletonCard key={i} isLoading={true} />
                    ))}
                  </div>
                ) : hasError ? (
                  // 에러 상태: 빈 스켈레톤 카드 표시 (스피너 없음) + 재시도 버튼
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
                          ariaLabel="재시도"
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
                          재시도
                        </span>
                      </div>
                    </div>
                  </div>
                ) : filteredArticles.length > 0 ? (
                  <>
                    {viewMode === 'table' ? (
                      <ArticleTable
                        articles={filteredArticles}
                        onArticleClick={handleArticleClick}
                      />
                    ) : (
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
                    )}
                  </>
                ) : (
                  // 빈 상태: 빈 카드를 그리드에 표시 + 재시도 버튼
                  <div className={styles.grid}>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <EmptyCard message="표시할 아티클이 없습니다." />
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
                          ariaLabel="재시도"
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
                )}
              </section>
            </div>

            {/* 우측: 필터 바 */}
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

          {/* 페이지네이션 - 별도 행으로 중앙 배치 */}
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
