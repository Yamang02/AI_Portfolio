import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionTitle, Divider, Pagination, EmptyCard, SkeletonCard } from '@/design-system';
import { useArticleListQuery } from '../entities/article';
import { useProjectsQuery } from '../entities/project/api/useProjectsQuery';
import { ArticleTable, ArticleFilterBar, ArticleControlPanel } from '../features/article-view/ui';
import { ArticleCard } from '@/design-system';
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
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('publishedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const pageSize = 12;

  // 프로젝트 목록 조회 (필터용)
  const { data: projects = [] } = useProjectsQuery({ type: 'project' });

  // 프로젝트 목록을 필터용 형식으로 변환
  // 프로젝트 필터링은 businessId 기반으로 변경 (백엔드에서 businessId를 PK로 변환)
  const filterProjects = useMemo(() => {
    return projects.map((p, index) => ({
      // 임시로 인덱스를 ID로 사용 (실제로는 백엔드에서 businessId를 PK로 변환)
      // 추후 백엔드 API에서 프로젝트 목록에 PK를 포함하도록 수정 필요
      id: index + 1, // 임시 ID (고유성 보장)
      businessId: p.id as string,
      title: p.title,
    }));
  }, [projects]);

  // 전체 아티클 조회 (카운트 계산용 - 필터 없이)
  const { data: allArticlesData } = useArticleListQuery({ 
    page: 0, 
    size: 1000, // 충분히 큰 값으로 전체 조회 (추후 백엔드에 통계 API 추가 시 개선)
    // 필터 없이 전체 조회
  });

  // 아티클 목록 조회 (필터링된 결과)
  const { data, isLoading, error } = useArticleListQuery({ 
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

  // 시리즈 목록 (현재는 빈 배열, 추후 API 추가 시 사용)
  const series: Array<{ id: string; title: string }> = [];

  // 카테고리별 개수 계산 (전체 아티클 기준 - 필터와 무관하게 고정값)
  const articleCounts = useMemo(() => {
    if (!allArticlesData?.content) return {};
    
    const categoryCounts: Record<string, number> = {};
    const projectCounts: Record<number, number> = {};
    const seriesCounts: Record<string, number> = {};
    
    // 전체 아티클을 기준으로 카운트 계산
    allArticlesData.content.forEach((article) => {
      if (article.category) {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
      }
      // projectId와 seriesId는 ArticleListItem에 추가 필요
    });
    
    return {
      categories: categoryCounts,
      projects: projectCounts,
      series: seriesCounts,
    };
  }, [allArticlesData?.content]);

  // 필터링된 아티클 (서버에서 이미 필터링됨)
  const filteredArticles = data?.content || [];

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
    setPage(1); // 검색 시 첫 페이지로
  };

  const handleSeriesSelect = (seriesId: string | undefined) => {
    setSelectedSeriesId(seriesId);
    setPage(1);
  };

  const totalPages = Math.ceil((data?.totalElements || 0) / pageSize);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <section className={styles.header}>
          <div className={styles.container}>
            <SectionTitle level="h1">Articles</SectionTitle>
          </div>
          <Divider variant="horizontal" />
        </section>

        <section className={styles.content}>
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

  if (error) {
    return (
      <div className={styles.page}>
        <section className={styles.header}>
          <div className={styles.container}>
            <SectionTitle level="h1">Articles</SectionTitle>
          </div>
          <Divider variant="horizontal" />
        </section>

        <section className={styles.content}>
          <div className={styles.container}>
            <div className={styles.error}>
              <p>아티클을 불러오는데 실패했습니다.</p>
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
              <SectionTitle level="h1">Articles</SectionTitle>
              <p className={styles.count}>
                총 {data?.totalElements || 0}개의 아티클
              </p>
            </div>
          </div>
        </div>
        <Divider variant="horizontal" />
      </section>

      {/* 메인 컨텐츠 */}
      <section className={styles.content}>
        <div className={styles.container}>
          <div className={styles.layout}>
            {/* 좌측: 아티클 목록 */}
            <div className={styles.mainContent}>
              {/* 컨트롤 패널 */}
              <ArticleControlPanel
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
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

              {filteredArticles.length > 0 ? (
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
                <EmptyCard message="표시할 아티클이 없습니다." />
              )}

              {/* 페이지네이션 */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
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
                projects={filterProjects}
                series={series}
                articleCounts={articleCounts}
              />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
