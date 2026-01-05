import React, { useState, useEffect } from 'react';
import { TechStackList } from '@/main/components/common/TechStack';
import { FEATURED_PROJECTS, FEATURED_CONFIG } from './config/featuredProjects.config';
import styles from './FeaturedProjectsSection.module.css';

/**
 * FeaturedProjectsSection - 각 프로젝트를 전폭 섹션으로 독립 노출
 */
export const FeaturedProjectsSection: React.FC = () => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    // 섹션이 뷰포트에 들어온 후 1.5초 뒤에 스크롤 인디케이터 표시
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !showScrollIndicator) {
          timer = setTimeout(() => {
            setShowScrollIndicator(true);
          }, 1500);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('featured-projects');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      if (section) {
        observer.unobserve(section);
      }
    };
  }, [showScrollIndicator]);

  const scrollToNext = () => {
    const nextSection = document.getElementById('cta');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
                  <img src={project.imageUrl} alt={project.title} />
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
                <TechStackList
                  technologies={project.tags}
                  maxVisible={3}
                  variant="default"
                  size="sm"
                  className={styles.techStack}
                />
              </div>
            </div>

            <div className={styles.description}>
              <p>{project.subtitle}</p>
            </div>
          </div>
          {/* 마지막 프로젝트에만 스크롤 인디케이터 표시 */}
          {index === projectsToDisplay.length - 1 && (
            <button
              className={`${styles.scrollIndicator} ${showScrollIndicator ? styles.show : ''}`}
              onClick={scrollToNext}
              aria-label="다음 섹션으로"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M7 13l5 5 5-5" />
                <path d="M7 6l5 5 5-5" />
              </svg>
            </button>
          )}
        </article>
      ))}
    </section>
  );
};
