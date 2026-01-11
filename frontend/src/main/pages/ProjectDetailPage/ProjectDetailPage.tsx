import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectsQuery } from '../../entities/project/api/useProjectsQuery';
import { SectionTitle } from '@design-system/components/SectionTitle';
import { TextLink } from '@design-system/components/TextLink';
import { useTOCFromDOM } from '@/main/features/project-gallery/hooks';
import type { TOCItem } from '@/main/features/project-gallery/hooks/types';
import { MarkdownRenderer } from '@/shared/ui/markdown/MarkdownRenderer';
import { TechStackList } from '@/shared/ui/tech-stack/TechStackList';
import { SimpleArticleCard } from '@design-system/components/Card/SimpleArticleCard';
import { Pagination } from '@design-system/components/Pagination';
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

  // 기존 main 방식: 프로젝트 목록을 가져와서 ID로 찾기
  const { data: projects = [], isLoading } = useProjectsQuery();
  
  // 프로젝트 찾기
  const project = useMemo(() => {
    if (!id) return null;
    return projects.find((p: Project) => p.id === id) || null;
  }, [id, projects]);

  const readmeContent = project ? (project.readme || project.description || '') : '';

  // development-timeline 타입 Article (프로젝트 데이터에서 가져옴)
  const developmentTimelineArticles = useMemo(() => {
    if (!project?.developmentTimelineArticles) return [];
    // 이미 백엔드에서 최신순으로 정렬되어 있음
    return project.developmentTimelineArticles;
  }, [project]);

  // 관련 아티클 페이지네이션 (5개씩 표시)
  const ARTICLES_PER_PAGE = 5;
  const [currentArticlePage, setCurrentArticlePage] = useState(1);
  
  // 현재 페이지에 표시할 아티클 계산
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentArticlePage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    return developmentTimelineArticles.slice(startIndex, endIndex);
  }, [developmentTimelineArticles, currentArticlePage]);
  
  // 전체 페이지 수 계산
  const totalArticlePages = useMemo(() => {
    return Math.ceil(developmentTimelineArticles.length / ARTICLES_PER_PAGE);
  }, [developmentTimelineArticles.length]);
  
  // 프로젝트 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentArticlePage(1);
  }, [id]);
  
  // 페이지 변경 시 상단으로 스크롤
  useEffect(() => {
    if (currentArticlePage > 1) {
      const sectionElement = document.getElementById('development-timeline');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentArticlePage]);

  // TOC 생성 (전체 페이지 헤더 포함)
  // contentRef를 직접 사용 (containerSelector 없이)
  const domTocItems = useTOCFromDOM(
    contentRef as React.RefObject<HTMLElement>,
    { 
      containerSelector: undefined, // 전체 컨테이너에서 헤딩 찾기
      headingLevels: [2, 3, 4, 5, 6] 
    }
  );

  // 기본 섹션 헤더를 수동으로 추가 (Readme에 헤딩이 없어도 TOC 표시)
  const tocItems = useMemo(() => {
    if (!project) return [];

    const baseSections: TOCItem[] = [
      { id: 'overview', text: '개요', level: 2 },
    ];

    // 스크린샷 섹션이 있으면 추가
    if (project.screenshots && project.screenshots.length > 0) {
      baseSections.push({ id: 'screenshots', text: '스크린샷', level: 2 });
    }

    // Readme 섹션이 있으면 추가
    if (readmeContent) {
      baseSections.push({ id: 'readme', text: '상세 설명', level: 2 });
    }

    // development-timeline Article 섹션이 있으면 추가 (기술 스택 전에)
    if (developmentTimelineArticles.length > 0) {
      baseSections.push({ id: 'development-timeline', text: '관련 아티클', level: 2 });
    }

    // 기술 스택 섹션이 있으면 추가
    if (project.technologies && project.technologies.length > 0) {
      baseSections.push({ id: 'tech-stack', text: '기술 스택', level: 2 });
    }

    // DOM에서 추출한 헤딩들을 상세 설명 섹션의 하위 항목으로 추가
    if (domTocItems.length > 0 && readmeContent) {
      // 상세 설명 섹션을 찾아서 하위 항목으로 추가
      const readmeSectionIndex = baseSections.findIndex(s => s.id === 'readme');
      if (readmeSectionIndex !== -1) {
        baseSections[readmeSectionIndex] = {
          ...baseSections[readmeSectionIndex],
          children: domTocItems
        };
      }
    } else if (domTocItems.length > 0) {
      // DOM 헤딩이 있지만 readme 섹션이 없는 경우, 직접 추가
      baseSections.push(...domTocItems);
    }

    return baseSections;
  }, [domTocItems, project, readmeContent, developmentTimelineArticles]);

  // 페이지 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 에러 상태 체크
  const hasError = !isLoading && !project;


  return (
    <div className={styles.container}>
        <div ref={contentRef} className={styles.content}>
        {/* 로딩 상태: 구조를 유지하면서 Skeleton 표시 */}
        {isLoading ? (
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
        ) : hasError ? (
          // 에러 상태: 구조를 유지하면서 메시지 표시
          <>
            <div style={{ marginBottom: 'var(--spacing-8)' }}>
              <SectionTitle level="h1">
                프로젝트를 찾을 수 없습니다
              </SectionTitle>
            </div>
            <section className={styles.section}>
              <EmptyCard message="요청한 프로젝트가 존재하지 않습니다." />
              <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center' }}>
                <TextLink href="/projects" className={styles.backLink}>
                  프로젝트 목록으로 돌아가기
                </TextLink>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* 프로젝트 헤더 (고정 제거) */}
            <ProjectDetailHeader project={project} />

        {/* TOC 섹션 (개요 전에 고정) */}
        {tocItems.length > 0 && (
          <section id="toc" className={styles.section}>
            <SectionTitle level="h2" id="toc" className={styles.sectionTitle}>목차</SectionTitle>
            <TableOfContents items={tocItems} />
          </section>
        )}

        {/* 개요 섹션 */}
        <section id="overview" className={styles.section}>
          <SectionTitle level="h2" id="overview" className={styles.sectionTitle}>개요</SectionTitle>
          <p className={styles.description}>{project.description}</p>
        </section>

        {/* 스크린샷 섹션 (있으면) */}
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
                    key={index}
                    src={imageUrl}
                    alt={`${project.title} 스크린샷 ${index + 1}`}
                    className={styles.screenshot}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Readme 섹션 */}
        {readmeContent && (
          <section id="readme" className={styles.section}>
            <SectionTitle level="h2" id="readme" className={styles.sectionTitle}>상세 설명</SectionTitle>
            <article ref={markdownContainerRef} className={styles.markdownArticle}>
              <MarkdownRenderer
                content={readmeContent}
                className={styles.markdown}
              />
            </article>
          </section>
        )}

        {/* development-timeline Article 섹션 (기술 스택 전에) */}
        {developmentTimelineArticles.length > 0 && (
          <section id="development-timeline" className={styles.section}>
            <SectionTitle level="h2" id="development-timeline" className={styles.sectionTitle}>관련 아티클</SectionTitle>
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

        {/* 기술 스택 섹션 */}
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

        {/* 다른 프로젝트 캐러셀 */}
        <ProjectThumbnailCarousel
          projects={projects.map(p => ({
            id: p.id,
            title: p.title,
            imageUrl: p.imageUrl,
          }))}
          currentProjectId={project.id}
          title="다른 프로젝트"
        />

        {/* 프로젝트 네비게이션 */}
        <ProjectNavigation
          projects={projects.map(p => ({
            id: p.id,
            title: p.title,
          }))}
          currentProjectId={project.id}
        />
          </>
        )}
        </div>
      </div>
  );
};

export default ProjectDetailPage;
