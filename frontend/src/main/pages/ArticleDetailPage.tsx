import React, { useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArticleQuery, useArticleListQuery } from '../entities/article';
import { SectionTitle } from '@design-system/components/SectionTitle';
import { TextLink } from '@design-system/components/TextLink';
import { useTOCFromDOM } from '@/main/features/project-gallery/hooks';
import type { TOCItem } from '@/main/features/project-gallery/hooks/types';
import { MarkdownRenderer } from '@/shared/ui/markdown/MarkdownRenderer';
import { TechStackList } from '@/shared/ui/tech-stack/TechStackList';
import { TableOfContents } from '@design-system/components/TableOfContents';
import { ArticleNavigation } from '@design-system/components/ArticleNavigation';
import { ArticleCard, ProjectCard } from '@design-system';
import type { ProjectCardProject } from '@design-system';
import { Badge } from '@design-system/components/Badge/Badge';
import { ARTICLE_CATEGORIES } from '@/admin/entities/article';
import styles from './ArticleDetailPage.module.css';

/**
 * 아티클 상세 페이지
 * 프로젝트 상세페이지 구조를 참고하여 재구성
 */
export function ArticleDetailPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const markdownContainerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 아티클 상세 조회
  const { data: article, isLoading, error } = useArticleQuery(businessId!);

  // 아티클 목록 조회 (네비게이션용)
  const { data: articlesData } = useArticleListQuery({
    page: 0,
    size: 1000, // 모든 아티클 가져오기 (네비게이션용)
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // TOC 생성 (마크다운에서 헤딩 추출)
  // markdownContainerRef를 사용하여 마크다운 내부의 헤딩만 추출
  const domTocItems = useTOCFromDOM(
    markdownContainerRef as React.RefObject<HTMLElement>,
    { 
      containerSelector: undefined, // markdownContainerRef 내부에서 헤딩 찾기
      headingLevels: [2, 3, 4, 5, 6] 
    }
  );

  // 기본 섹션 헤더를 수동으로 추가
  const tocItems = useMemo(() => {
    if (!article) return [];

    const baseSections: TOCItem[] = [];

    // 본문 섹션이 있으면 추가
    if (article.content) {
      baseSections.push({ id: 'content', text: '본문', level: 2 });
    }

    // 관련 프로젝트 섹션이 있으면 추가
    if (article.project) {
      baseSections.push({ id: 'related-project', text: '관련 프로젝트', level: 2 });
    }

    // 기술 스택 섹션이 있으면 추가
    if (article.techStack && article.techStack.length > 0) {
      baseSections.push({ id: 'tech-stack', text: '기술 스택', level: 2 });
    }

    // DOM에서 추출한 헤딩들을 본문 섹션의 하위 항목으로 추가
    if (domTocItems.length > 0 && article.content) {
      const contentSectionIndex = baseSections.findIndex(s => s.id === 'content');
      if (contentSectionIndex !== -1) {
        baseSections[contentSectionIndex] = {
          ...baseSections[contentSectionIndex],
          children: domTocItems
        };
      }
    } else if (domTocItems.length > 0) {
      // DOM 헤딩이 있지만 content 섹션이 없는 경우, 직접 추가
      baseSections.push(...domTocItems);
    }

    return baseSections;
  }, [domTocItems, article]);

  // ProjectCard에 필요한 형식으로 변환
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

  // 같은 시리즈의 다른 아티클 찾기
  const seriesArticles = useMemo(() => {
    if (!article?.seriesId || !articlesData?.content) return [];
    return articlesData.content
      .filter(a => a.seriesId === article.seriesId && a.businessId !== article.businessId)
      .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
  }, [article?.seriesId, articlesData?.content]);

  // 네비게이션용 아티클 목록
  const navigationArticles = useMemo(() => {
    if (!articlesData?.content) return [];
    return articlesData.content.map(a => ({
      businessId: a.businessId,
      title: a.title,
    }));
  }, [articlesData?.content]);

  // 페이지 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [businessId]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !article) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.error}>
            <h2>아티클을 찾을 수 없습니다</h2>
            <p>요청한 아티클이 존재하지 않습니다.</p>
            <TextLink href="/articles" className={styles.backLink}>
              아티클 목록으로 돌아가기
            </TextLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div ref={contentRef} className={styles.content}>
        {/* 아티클 헤더 */}
        <header className={styles.header}>
          {/* 카테고리 배지 */}
          <div className={styles.headerTop}>
            {article.category && (
              <Badge variant="primary" size="sm" className={styles.categoryBadge}>
                {ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category}
              </Badge>
            )}
          </div>

          <SectionTitle level="h1" className={styles.title}>
            {article.title}
          </SectionTitle>

          {/* 시리즈 정보 */}
          {article.seriesTitle && article.seriesOrder !== undefined && (
            <div className={styles.seriesInfo}>
              {article.seriesTitle}#{article.seriesOrder}
            </div>
          )}

          {/* 발행일과 조회수 (title 아래, 구분선 위) */}
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

          {/* 구분선 */}
          <div className={styles.divider}></div>

          {/* 메타 정보 */}
          <div className={styles.meta}>
            {/* 태그 */}
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

        {/* TOC 섹션 */}
        {tocItems.length > 0 && (
          <section id="toc" className={styles.section}>
            <TableOfContents items={tocItems} />
          </section>
        )}

        {/* 본문 섹션 */}
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

        {/* 관련 프로젝트 섹션 */}
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

        {/* 기술 스택 섹션 */}
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

        {/* 시리즈 아티클 섹션 */}
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

        {/* 아티클 네비게이션 */}
        <ArticleNavigation
          articles={navigationArticles}
          currentArticleBusinessId={article.businessId}
        />
      </div>
    </div>
  );
}
