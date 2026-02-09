import React from 'react';
import { Badge, Button } from '@/design-system';
import { FEATURED_PROJECTS, FEATURED_CONFIG } from '../model/featuredProjects.config';
import styles from './FeaturedProjectsSection.module.css';

/**
 * FeaturedProjectsSection - 각 프로젝트를 전폭 섹션으로 독립 노출
 */
export const FeaturedProjectsSection: React.FC = () => {
  // 설정 파일에서 최대 표시 개수만큼만 가져오기
  const projectsToDisplay = FEATURED_PROJECTS.slice(0, FEATURED_CONFIG.maxDisplay);

  return (
    <section id="featured-projects" className={styles.featuredProjects}>
      {projectsToDisplay.map((project, index) => (
        <article 
          key={project.id} 
          className={styles.projectSection}
          data-project-index={index}
        >
          <div className={styles.projectContent}>
            <div className={styles.projectCard}>
              <div className={styles.imageArea}>
                {project.imageUrl ? (
                  <img 
                    src={project.imageUrl.includes('?') 
                      ? `${project.imageUrl}&w=520&webp` 
                      : `${project.imageUrl}?w=520&webp`} 
                    alt={project.title}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span role="img" aria-label="placeholder">
                      🖼
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <div className={styles.techStack}>
                  {project.tags.map((tag, index) => (
                    <Badge
                      key={`${project.id}-${tag}-${index}`}
                      variant="outline"
                      size="sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.description}>
              <p>{project.subtitle}</p>
            </div>
            <Button
              variant="secondary"
              size="md"
              href={project.link}
              className={styles.detailButton}
            >
              작업물 상세보기
            </Button>
          </div>
        </article>
      ))}
    </section>
  );
};
