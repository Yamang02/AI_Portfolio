import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectIcon } from '../Icon';
import styles from './ProjectThumbnailCarousel.module.css';

export interface ProjectThumbnail {
  id: string;
  title: string;
  imageUrl?: string;
}

export interface ProjectThumbnailCarouselProps {
  /** 프로젝트 썸네일 목록 */
  projects: ProjectThumbnail[];
  /** 현재 프로젝트 ID (필터링용) */
  currentProjectId?: string;
  /** 섹션 제목 */
  title?: string;
  /** 최대 표시 개수 */
  maxItems?: number;
  /** 클릭 핸들러 (제공하지 않으면 기본 라우팅 사용) */
  onProjectClick?: (projectId: string) => void;
  /** 썸네일 크기 */
  thumbnailSize?: 'sm' | 'md' | 'lg';
  /** className */
  className?: string;
}

export const ProjectThumbnailCarousel: React.FC<ProjectThumbnailCarouselProps> = ({
  projects,
  currentProjectId,
  title = '다른 프로젝트',
  maxItems = 10,
  onProjectClick,
  thumbnailSize = 'md',
  className,
}) => {
  const navigate = useNavigate();

  // 현재 프로젝트 제외하고, 이미지가 있는 프로젝트만 필터링
  const filteredProjects = projects
    .filter(p => {
      if (currentProjectId && p.id === currentProjectId) return false;
      return p.imageUrl && p.imageUrl !== '#' && p.imageUrl !== '';
    })
    .slice(0, maxItems);

  if (filteredProjects.length === 0) {
    return null;
  }

  const handleProjectClick = (projectId: string) => {
    if (onProjectClick) {
      onProjectClick(projectId);
    } else {
      navigate(`/projects/${projectId}`);
    }
  };

  const sizeClass = styles[`thumbnail-${thumbnailSize}`];

  return (
    <section className={`${styles.carouselSection} ${className || ''}`}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.carouselContainer}>
        <div className={styles.carousel}>
          {filteredProjects.map((project) => {
            const hasValidImage = project.imageUrl && project.imageUrl !== '#' && project.imageUrl !== '';
            
            return (
              <div
                key={project.id}
                className={`${styles.thumbnail} ${sizeClass}`}
                onClick={() => handleProjectClick(project.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProjectClick(project.id);
                  }
                }}
              >
                {hasValidImage ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className={styles.thumbnailImage}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className={styles.thumbnailFallback}
                  style={{ display: hasValidImage ? 'none' : 'flex' }}
                >
                  <ProjectIcon type="default" size="lg" />
                </div>
                <div className={styles.thumbnailOverlay}>
                  <span className={styles.thumbnailTitle}>{project.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
